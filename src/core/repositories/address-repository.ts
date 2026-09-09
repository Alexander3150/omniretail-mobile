import type { Address } from "../entities";
import type { EntityId, TenantId } from "../types";

export type CreateAddressInput = Omit<Address, "id" | "createdAt" | "updatedAt">;

export type UpdateAddressInput = Partial<Omit<Address, "id" | "tenantId" | "customerId" | "createdAt" | "updatedAt">>;

export interface AddressRepository {
  getByCustomer(tenantId: TenantId, customerId: EntityId): Promise<Address[]>;
  getById(id: EntityId): Promise<Address | null>;
  create(input: CreateAddressInput): Promise<Address>;
  update(id: EntityId, input: UpdateAddressInput): Promise<Address>;
  archive(id: EntityId): Promise<void>;
  setDefault(customerId: EntityId, addressId: EntityId): Promise<Address>;
}
