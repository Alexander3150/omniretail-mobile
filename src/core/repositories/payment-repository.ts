import type { Payment } from "../entities";
import type { EntityId } from "../types";

export type CreatePaymentInput = Omit<Payment, "id" | "createdAt" | "updatedAt">;

export interface PaymentRepository {
  getByOrder(orderId: EntityId): Promise<Payment[]>;
  create(input: CreatePaymentInput): Promise<Payment>;
}
