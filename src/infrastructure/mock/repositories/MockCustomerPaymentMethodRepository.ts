import { CustomerPaymentMethodStatus, type CreateCustomerPaymentMethodInput, type CustomerPaymentMethod, type CustomerPaymentMethodRepository, type EntityId, type TenantId } from "@/core";

import type { MockDatabaseStore } from "../database";
import { createId } from "../utils/createId";

export class MockCustomerPaymentMethodRepository implements CustomerPaymentMethodRepository {
  constructor(private readonly store: MockDatabaseStore) {}

  async getByCustomer(tenantId: TenantId, customerId: EntityId): Promise<CustomerPaymentMethod[]> {
    const database = await this.store.getState();
    return database.customerPaymentMethods.filter(
      (method) => method.tenantId === tenantId && method.customerId === customerId && method.status !== CustomerPaymentMethodStatus.Archived,
    );
  }

  async create(input: CreateCustomerPaymentMethodInput): Promise<CustomerPaymentMethod> {
    const method: CustomerPaymentMethod = { ...input, id: createId("payment-method"), status: CustomerPaymentMethodStatus.Active };
    await this.store.update((database) => {
      if (method.isDefault) {
        database.customerPaymentMethods.forEach((item) => {
          if (item.customerId === method.customerId) {
            item.isDefault = false;
          }
        });
      }
      database.customerPaymentMethods.push(method);
    });
    return method;
  }

  async setDefault(customerId: EntityId, paymentMethodId: EntityId): Promise<CustomerPaymentMethod> {
    let updated: CustomerPaymentMethod | null = null;
    await this.store.update((database) => {
      database.customerPaymentMethods.forEach((method) => {
        if (method.customerId === customerId) {
          method.isDefault = method.id === paymentMethodId;
          if (method.id === paymentMethodId) {
            updated = method;
          }
        }
      });
    });
    if (!updated) {
      throw new Error("Payment method not found");
    }
    return updated;
  }

  async archive(paymentMethodId: EntityId): Promise<void> {
    await this.store.update((database) => {
      const method = database.customerPaymentMethods.find((item) => item.id === paymentMethodId);
      if (method) {
        method.status = CustomerPaymentMethodStatus.Archived;
        method.isDefault = false;
      }
    });
  }
}
