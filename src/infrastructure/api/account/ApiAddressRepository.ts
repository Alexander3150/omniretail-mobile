import {
  AddressStatus,
  type Address,
  type AddressRepository,
  type CreateAddressInput,
  type EntityId,
  type TenantId,
  type UpdateAddressInput,
} from "@/core";

import type { ApiClient } from "../ApiClient";
import { ApiError } from "../ApiError";
import type { ApiAddressRequest, ApiAddressResponse } from "./types";

const BASE_PATH = "/me/addresses";

export class ApiAddressRepository implements AddressRepository {
  private addresses = new Map<EntityId, Address>();

  constructor(
    private readonly apiClient: ApiClient,
    // El backend exige destinatario; si el formulario no lo trae se usa el nombre del cliente.
    private readonly getDefaultRecipientName: () => string | undefined,
  ) {}

  async getByCustomer(
    _tenantId: TenantId,
    _customerId: EntityId,
  ): Promise<Address[]> {
    const response = await this.apiClient.get<ApiAddressResponse[]>(BASE_PATH);
    const addresses = response.map(toAddress);

    this.addresses = new Map(addresses.map((address) => [address.id, address]));
    return addresses;
  }

  async getById(id: EntityId): Promise<Address | null> {
    if (!this.addresses.has(id)) {
      // No existe GET /me/addresses/{id}: se refresca la lista del cliente autenticado.
      await this.getByCustomer("", "");
    }

    return this.addresses.get(id) ?? null;
  }

  async create(input: CreateAddressInput): Promise<Address> {
    const created = toAddress(
      await this.apiClient.post<ApiAddressResponse>(
        BASE_PATH,
        this.toRequest(input),
      ),
    );

    const address = input.isDefault && !created.isDefault
      ? await this.setDefault(created.customerId, created.id)
      : created;

    this.addresses.set(address.id, address);
    return address;
  }

  async update(id: EntityId, input: UpdateAddressInput): Promise<Address> {
    const current = await this.getById(id);

    if (!current) {
      throw new ApiError("La dirección no existe.", {
        status: 404,
        code: "ADDRESS_NOT_FOUND",
      });
    }

    // PUT reemplaza la dirección completa: se combinan los cambios con el estado actual.
    const address = toAddress(
      await this.apiClient.put<ApiAddressResponse>(
        `${BASE_PATH}/${encodeURIComponent(id)}`,
        this.toRequest({ ...current, ...input }),
      ),
    );

    this.addresses.set(address.id, address);
    return address;
  }

  async archive(id: EntityId): Promise<void> {
    await this.apiClient.delete<void>(`${BASE_PATH}/${encodeURIComponent(id)}`);
    this.addresses.delete(id);
  }

  async setDefault(
    _customerId: EntityId,
    addressId: EntityId,
  ): Promise<Address> {
    const address = toAddress(
      await this.apiClient.put<ApiAddressResponse>(
        `${BASE_PATH}/${encodeURIComponent(addressId)}/default`,
      ),
    );

    for (const [id, current] of this.addresses) {
      this.addresses.set(id, { ...current, isDefault: id === address.id });
    }
    this.addresses.set(address.id, address);
    return address;
  }

  private toRequest(
    input: Omit<Address, "id" | "createdAt" | "updatedAt" | "tenantId" | "customerId" | "isDefault">,
  ): ApiAddressRequest {
    return {
      label: input.label.trim(),
      recipientName:
        input.recipientName?.trim() ||
        this.getDefaultRecipientName()?.trim() ||
        "",
      line1: input.addressLine.trim(),
      line2: emptyToNull(input.addressLine2),
      city: input.municipality?.trim() ?? "",
      stateOrDepartment: input.department?.trim() ?? "",
      country: "Guatemala",
      references: emptyToNull(input.references),
    };
  }
}

function toAddress(response: ApiAddressResponse): Address {
  return {
    id: response.id,
    tenantId: response.tenantId,
    customerId: response.customerId,
    label: response.label,
    recipientName: response.recipientName,
    addressLine: response.line1,
    addressLine2: response.line2 ?? undefined,
    municipality: response.city,
    department: response.stateOrDepartment,
    references: response.references ?? undefined,
    isDefault: response.isDefault,
    status: AddressStatus.Active,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  };
}

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
