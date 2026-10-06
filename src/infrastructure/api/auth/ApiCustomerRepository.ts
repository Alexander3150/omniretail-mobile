import {
  CustomerStatus,
  type Customer,
  type CustomerRepository,
  type EntityId,
  type UpdateCustomerProfileInput,
} from "@/core";

import type { ApiClient } from "../ApiClient";
import type {
  ApiCustomerProfileResponse,
  ApiUpdateCustomerProfileRequest,
} from "../account/types";
import type { ApiCurrentSessionResponse } from "./types";

export class ApiCustomerRepository implements CustomerRepository {
  private currentCustomer: Customer | null = null;

  // Getter perezoso: el cliente HTTP depende de este repositorio para limpiar la sesión en 401.
  constructor(private readonly getApiClient?: () => ApiClient) {}

  getCurrentCustomer(): Customer | null {
    return this.currentCustomer;
  }

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
    input: UpdateCustomerProfileInput,
  ): Promise<Customer> {
    const apiClient = this.getApiClient?.();

    if (!apiClient) {
      throw new Error("El cliente HTTP no está configurado.");
    }

    // PUT reemplaza nombre y teléfono; el correo no es editable desde el perfil.
    const request: ApiUpdateCustomerProfileRequest = {
      name: input.name?.trim() || this.currentCustomer?.name || "",
      phone:
        input.phone !== undefined
          ? input.phone.trim() || null
          : null,
    };

    const response = await apiClient.put<ApiCustomerProfileResponse>(
      "/me/profile",
      request,
    );

    const customer: Customer = {
      id: response.id,
      tenantId: response.tenantId,
      userId: response.userId,
      name: response.name,
      email: response.email,
      phone: response.phone ?? undefined,
      status: CustomerStatus.Active,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };

    this.currentCustomer = customer;
    return customer;
  }
}
