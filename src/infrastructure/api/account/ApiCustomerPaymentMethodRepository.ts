import {
  CustomerPaymentMethodStatus,
  type CreateCustomerPaymentMethodInput,
  type CustomerPaymentMethod,
  type CustomerPaymentMethodRepository,
  type EntityId,
  type TenantId,
} from "@/core";

import type { ApiClient } from "../ApiClient";
import type {
  ApiCreatePaymentMethodRequest,
  ApiPaymentMethodResponse,
} from "./types";

const BASE_PATH = "/me/payment-methods";

/**
 * Tarjetas guardadas del cliente. El backend solo almacena metadatos
 * (marca, banco, últimos 4 dígitos, vencimiento); nunca el número completo ni el CVV.
 */
export class ApiCustomerPaymentMethodRepository
  implements CustomerPaymentMethodRepository
{
  constructor(private readonly apiClient: ApiClient) {}

  async getByCustomer(
    _tenantId: TenantId,
    _customerId: EntityId,
  ): Promise<CustomerPaymentMethod[]> {
    const response =
      await this.apiClient.get<ApiPaymentMethodResponse[]>(BASE_PATH);

    return response.map(toPaymentMethod);
  }

  async create(
    input: CreateCustomerPaymentMethodInput,
  ): Promise<CustomerPaymentMethod> {
    const request: ApiCreatePaymentMethodRequest = {
      brand: input.brand ?? "",
      issuingBank: input.issuingBank ?? "",
      last4: input.last4 ?? "",
      expirationMonth: input.expirationMonth ?? 0,
      expirationYear: input.expirationYear ?? 0,
      cardholderName: input.cardholderName?.trim() || null,
    };

    const created = toPaymentMethod(
      await this.apiClient.post<ApiPaymentMethodResponse>(BASE_PATH, request),
    );

    return input.isDefault && !created.isDefault
      ? this.setDefault(created.customerId, created.id)
      : created;
  }

  async setDefault(
    _customerId: EntityId,
    paymentMethodId: EntityId,
  ): Promise<CustomerPaymentMethod> {
    return toPaymentMethod(
      await this.apiClient.put<ApiPaymentMethodResponse>(
        `${BASE_PATH}/${encodeURIComponent(paymentMethodId)}/default`,
      ),
    );
  }

  async archive(paymentMethodId: EntityId): Promise<void> {
    await this.apiClient.delete<void>(
      `${BASE_PATH}/${encodeURIComponent(paymentMethodId)}`,
    );
  }
}

function toPaymentMethod(
  response: ApiPaymentMethodResponse,
): CustomerPaymentMethod {
  return {
    id: response.id,
    tenantId: response.tenantId,
    customerId: response.customerId,
    brand: response.brand,
    issuingBank: response.issuingBank,
    last4: response.last4,
    expirationMonth: response.expirationMonth,
    expirationYear: response.expirationYear,
    cardholderName: response.cardholderName ?? undefined,
    isDefault: response.isDefault,
    status:
      response.status?.toLowerCase() === "archived"
        ? CustomerPaymentMethodStatus.Archived
        : CustomerPaymentMethodStatus.Active,
  };
}
