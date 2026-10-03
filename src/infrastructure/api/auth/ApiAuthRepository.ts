import {
  UserStatus,
  type AuthRepository,
  type AuthResult,
  type ChangePasswordInput,
  type LoginInput,
  type PasswordResetRequestInput,
  type PasswordResetVerificationInput,
  type RegisterCustomerInput,
  type ResetPasswordInput,
  type Session,
  type User,
} from "@/core";

import { ApiError } from "../ApiError";
import type { ApiClient } from "../ApiClient";
import type { SessionStorage } from "../../storage";
import { ApiCustomerRepository } from "./ApiCustomerRepository";
import { ApiTokenStorage } from "./ApiTokenStorage";
import type {
  ApiCurrentSessionResponse,
  ApiLoginResponse,
} from "./types";

export class ApiAuthRepository implements AuthRepository {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly tokenStorage: ApiTokenStorage,
    private readonly sessionStorage: SessionStorage,
    private readonly customerRepository: ApiCustomerRepository,
    private readonly tenantSlug: string,
  ) {}

  async login(input: LoginInput): Promise<AuthResult> {
    try {
      const response =
        await this.apiClient.post<ApiLoginResponse>(
          "/auth/login",
          {
            email: input.email.trim(),
            password: input.password,
            tenantSlug: this.tenantSlug,
            expectedUserType: "customer",
          },
        );

      await this.tokenStorage.saveToken(response.token);

      try {
        return await this.restoreFromBackend();
      } catch (error) {
        await this.clearLocalSession();
        throw error;
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await this.clearLocalSession();
      }

      throw error;
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    const token = await this.tokenStorage.getToken();

    if (!token) {
      await this.sessionStorage.clearSession();
      this.customerRepository.clearCurrentCustomer();
      return null;
    }

    try {
      const result = await this.restoreFromBackend();
      return result.session;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await this.clearLocalSession();
        return null;
      }

      throw error;
    }
  }

  async logout(): Promise<void> {
    const token = await this.tokenStorage.getToken();

    try {
      if (token) {
        await this.apiClient.post<void>("/auth/logout");
      }
    } finally {
      await this.clearLocalSession();
    }
  }

  async registerCustomer(
    _input: RegisterCustomerInput,
  ): Promise<AuthResult> {
    throw new Error(
      "El registro todavía no está disponible.",
    );
  }

  async changePassword(
    _input: ChangePasswordInput,
  ): Promise<void> {
    throw new Error(
      "El cambio de contraseña todavía no está disponible.",
    );
  }

  async requestPasswordReset(
    _input: PasswordResetRequestInput,
  ): Promise<void> {
    throw new Error(
      "La recuperación de contraseña todavía no está disponible.",
    );
  }

  async verifyPasswordResetCode(
    _input: PasswordResetVerificationInput,
  ): Promise<boolean> {
    throw new Error(
      "La recuperación de contraseña todavía no está disponible.",
    );
  }

  async resetPassword(
    _input: ResetPasswordInput,
  ): Promise<void> {
    throw new Error(
      "La recuperación de contraseña todavía no está disponible.",
    );
  }

  private async restoreFromBackend(): Promise<AuthResult> {
    const snapshot =
      await this.apiClient.get<ApiCurrentSessionResponse>(
        "/auth/me",
      );

    if (
      snapshot.user.type !== "customer" ||
      !snapshot.user.customerId
    ) {
      throw new ApiError(
        "La sesión no corresponde a un cliente.",
        {
          status: 403,
          code: "CUSTOMER_SESSION_REQUIRED",
        },
      );
    }

    const customer =
      this.customerRepository.setCurrentSession(snapshot);

    const user: User = {
      id: snapshot.user.id,
      email: snapshot.user.email,
      status: UserStatus.Active,
      createdAt: snapshot.user.createdAt,
      updatedAt: snapshot.user.updatedAt,
    };

    const session: Session = {
      id: snapshot.session.id,
      userId: snapshot.user.id,
      customerId: snapshot.user.customerId,
      tenantId: snapshot.tenant.id,
      createdAt: snapshot.session.createdAt,
      expiresAt: snapshot.session.expiresAt,
    };

    await this.sessionStorage.saveSession(session);

    return {
      user,
      customer,
      session,
    };
  }

  private async clearLocalSession(): Promise<void> {
    await this.tokenStorage.clearToken();
    await this.sessionStorage.clearSession();
    this.customerRepository.clearCurrentCustomer();
  }
}
