import type { CreatePaymentInput, EntityId, Payment, PaymentRepository } from "@/core";

import type { MockDatabaseStore } from "../database";
import { createId } from "../utils/createId";

export class MockPaymentRepository implements PaymentRepository {
  constructor(private readonly store: MockDatabaseStore) {}

  async getByOrder(orderId: EntityId): Promise<Payment[]> {
    const database = await this.store.getState();
    return database.payments.filter((payment) => payment.orderId === orderId);
  }

  async create(input: CreatePaymentInput): Promise<Payment> {
    const now = new Date().toISOString();
    const payment: Payment = { ...input, id: createId("payment"), createdAt: now, updatedAt: now };
    await this.store.update((database) => {
      database.payments.push(payment);
    });
    return payment;
  }
}
