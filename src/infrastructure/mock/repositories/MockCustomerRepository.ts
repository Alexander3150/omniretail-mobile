import type { Customer, CustomerRepository, EntityId, UpdateCustomerProfileInput } from "@/core";

import type { MockDatabaseStore } from "../database";

export class MockCustomerRepository implements CustomerRepository {
  constructor(private readonly store: MockDatabaseStore) {}

  async getById(id: EntityId): Promise<Customer | null> {
    const database = await this.store.getState();
    return database.customers.find((customer) => customer.id === id) ?? null;
  }

  async getByUserId(userId: EntityId): Promise<Customer | null> {
    const database = await this.store.getState();
    return database.customers.find((customer) => customer.userId === userId) ?? null;
  }

  async updateProfile(customerId: EntityId, input: UpdateCustomerProfileInput): Promise<Customer> {
    let updated: Customer | null = null;
    await this.store.update((database) => {
      const customer = database.customers.find((item) => item.id === customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }
      Object.assign(customer, input, { updatedAt: new Date().toISOString() });
      updated = customer;
    });

    if (!updated) {
      throw new Error("Customer not found");
    }

    return updated;
  }
}
