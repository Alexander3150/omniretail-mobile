import {
  CartStatus,
  CustomerStatus,
  UserStatus,
  type AuthRepository,
  type AuthResult,
  type ChangePasswordInput,
  type Customer,
  type LoginInput,
  type PasswordResetRequestInput,
  type PasswordResetVerificationInput,
  type RegisterCustomerInput,
  type ResetPasswordInput,
  type Session,
  type User,
} from "@/core";

import type { SessionStorage } from "../../storage";
import type { MockCredentialStore } from "../auth";
import type { MockDatabaseStore } from "../database";
import { createId } from "../utils/createId";

export class MockAuthRepository implements AuthRepository {
  constructor(
    private readonly store: MockDatabaseStore,
    private readonly credentialStore: MockCredentialStore,
    private readonly sessionStorage: SessionStorage,
  ) {}

  async login(input: LoginInput): Promise<AuthResult> {
    const credential = await this.credentialStore.findByEmail(input.email);
    const validPassword = await this.credentialStore.verifyPassword(input.email, input.password);

    if (!credential || !validPassword) {
      throw new Error("Invalid credentials");
    }

    const database = await this.store.getState();
    const user = database.users.find((item) => item.id === credential.userId && item.status === UserStatus.Active);
    const customer = database.customers.find((item) => item.userId === credential.userId && item.status === CustomerStatus.Active);

    if (!user || !customer) {
      throw new Error("Customer account not found");
    }

    const session = createSession(user, customer);
    await this.sessionStorage.saveSession(session);
    return { user, customer, session };
  }

  async registerCustomer(input: RegisterCustomerInput): Promise<AuthResult> {
    const normalizedEmail = input.email.toLowerCase();
    const now = new Date().toISOString();
    let user: User;
    let customer: Customer;

    await this.store.update((database) => {
      const emailExists = database.users.some((item) => item.email.toLowerCase() === normalizedEmail);
      if (emailExists) {
        throw new Error("Email already registered");
      }

      user = {
        id: createId("user"),
        email: normalizedEmail,
        status: UserStatus.Active,
        createdAt: now,
        updatedAt: now,
      };
      customer = {
        id: createId("customer"),
        tenantId: input.tenantId,
        userId: user.id,
        name: input.name,
        email: normalizedEmail,
        phone: input.phone,
        status: CustomerStatus.Active,
        createdAt: now,
        updatedAt: now,
      };
      database.users.push(user);
      database.customers.push(customer);
      database.carts.push({
        id: createId("cart"),
        tenantId: input.tenantId,
        customerId: customer.id,
        status: CartStatus.Active,
        createdAt: now,
        updatedAt: now,
      });
    });

    await this.credentialStore.upsertCredential(user!.id, normalizedEmail, input.password);
    const session = createSession(user!, customer!);
    await this.sessionStorage.saveSession(session);
    return { user: user!, customer: customer!, session };
  }

  async logout(): Promise<void> {
    await this.sessionStorage.clearSession();
  }

  async getCurrentSession(): Promise<Session | null> {
    return this.sessionStorage.getCurrentSession();
  }

  async changePassword(input: ChangePasswordInput): Promise<void> {
    const changed = await this.credentialStore.changePassword(input.userId, input.currentPassword, input.newPassword);
    if (!changed) {
      throw new Error("Invalid current password");
    }
  }

  async requestPasswordReset(input: PasswordResetRequestInput): Promise<void> {
    await this.credentialStore.requestReset(input.email);
  }

  async verifyPasswordResetCode(input: PasswordResetVerificationInput): Promise<boolean> {
    return this.credentialStore.verifyResetCode(input.email, input.code);
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const reset = await this.credentialStore.resetPassword(input.email, input.code, input.newPassword);
    if (!reset) {
      throw new Error("Invalid reset code");
    }
  }
}

function createSession(user: User, customer: Customer): Session {
  return {
    id: createId("session"),
    userId: user.id,
    customerId: customer.id,
    tenantId: customer.tenantId,
    createdAt: new Date().toISOString(),
  };
}
