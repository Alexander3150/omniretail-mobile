import {
  CustomerStatus,
  type Customer,
  type CustomerRepository,
  type EntityId,
  type UpdateCustomerProfileInput,
} from "@/core";

import type { ApiCurrentSessionResponse } from "./types";

export class ApiCustomerRepository implements CustomerRepository {
  private currentCustomer: Customer | null = null;

  setCurrentSession(snapshot: ApiCurrentSessionResponse): Customer {
    const customerId = snapshot.user.customerId;

    if (!customerId) {
      throw new Error("La sesión no contiene un cliente.");
    }

    const customer: Customer = {
      id: customerId,
      tenantId: snapshot.tenant.id,
      userId: snapshot.user.id,
      name: snapshot.user.name,
      email: snapshot.user.email,
      phone: snapshot.user.phone ?? undefined,
      status: CustomerStatus.Active,
      createdAt: snapshot.user.createdAt,
      updatedAt: snapshot.user.updatedAt,
    };

    this.currentCustomer = customer;
    return customer;
  }

  clearCurrentCustomer(): void {
    this.currentCustomer = null;
  }

  async getById(id: EntityId): Promise<Customer | null> {
    return this.currentCustomer?.id === id
      ? this.currentCustomer
      : null;
  }

  async getByUserId(userId: EntityId): Promise<Customer | null> {
    return this.currentCustomer?.userId === userId
      ? this.currentCustomer
      : null;
  }

  async updateProfile(
    _customerId: EntityId,
    _input: UpdateCustomerProfileInput,
  ): Promise<Customer> {
    throw new Error(
      "La edición del perfil todavía no está disponible.",
    );
  }
}
