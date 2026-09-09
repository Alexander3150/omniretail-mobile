import type { CustomerPaymentMethod } from "../entities";
import type { EntityId, TenantId } from "../types";

export type CreateCustomerPaymentMethodInput = Omit<CustomerPaymentMethod, "id" | "status">;

export interface CustomerPaymentMethodRepository {
  getByCustomer(tenantId: TenantId, customerId: EntityId): Promise<CustomerPaymentMethod[]>;
  create(input: CreateCustomerPaymentMethodInput): Promise<CustomerPaymentMethod>;
  setDefault(customerId: EntityId, paymentMethodId: EntityId): Promise<CustomerPaymentMethod>;
  archive(paymentMethodId: EntityId): Promise<void>;
}
