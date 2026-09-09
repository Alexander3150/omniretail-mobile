import type { Customer } from "../entities";
import type { EntityId } from "../types";

export type UpdateCustomerProfileInput = {
  name?: string;
  email?: string;
  phone?: string;
};

export interface CustomerRepository {
  getById(id: EntityId): Promise<Customer | null>;
  getByUserId(userId: EntityId): Promise<Customer | null>;
  updateProfile(customerId: EntityId, input: UpdateCustomerProfileInput): Promise<Customer>;
}
