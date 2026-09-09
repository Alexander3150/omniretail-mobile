import { AddressStatus, type Address, type AddressRepository, type CreateAddressInput, type EntityId, type TenantId, type UpdateAddressInput } from "@/core";

import type { MockDatabaseStore } from "../database";
import { createId } from "../utils/createId";

export class MockAddressRepository implements AddressRepository {
  constructor(private readonly store: MockDatabaseStore) {}

  async getByCustomer(tenantId: TenantId, customerId: EntityId): Promise<Address[]> {
    const database = await this.store.getState();
    return database.addresses.filter((address) => address.tenantId === tenantId && address.customerId === customerId && address.status !== AddressStatus.Archived);
  }

  async getById(id: EntityId): Promise<Address | null> {
    const database = await this.store.getState();
    return database.addresses.find((address) => address.id === id && address.status !== AddressStatus.Archived) ?? null;
  }

  async create(input: CreateAddressInput): Promise<Address> {
    const now = new Date().toISOString();
    const address: Address = { ...input, id: createId("address"), createdAt: now, updatedAt: now };
    await this.store.update((database) => {
      if (address.isDefault) {
        database.addresses.forEach((item) => {
          if (item.customerId === address.customerId) {
            item.isDefault = false;
          }
        });
      }
      database.addresses.push(address);
    });
    return address;
  }

  async update(id: EntityId, input: UpdateAddressInput): Promise<Address> {
    let updated: Address | null = null;
    await this.store.update((database) => {
      const address = database.addresses.find((item) => item.id === id);
      if (!address) {
        throw new Error("Address not found");
      }
      Object.assign(address, input, { updatedAt: new Date().toISOString() });
      updated = address;
    });

    if (!updated) {
      throw new Error("Address not found");
    }

    return updated;
  }

  async archive(id: EntityId): Promise<void> {
    await this.store.update((database) => {
      const address = database.addresses.find((item) => item.id === id);
      if (address) {
        address.status = AddressStatus.Archived;
        address.updatedAt = new Date().toISOString();
      }
    });
  }

  async setDefault(customerId: EntityId, addressId: EntityId): Promise<Address> {
    let updated: Address | null = null;
    await this.store.update((database) => {
      database.addresses.forEach((address) => {
        if (address.customerId === customerId) {
          address.isDefault = address.id === addressId;
          address.updatedAt = new Date().toISOString();
          if (address.id === addressId) {
            updated = address;
          }
        }
      });
    });

    if (!updated) {
      throw new Error("Address not found");
    }

    return updated;
  }
}
