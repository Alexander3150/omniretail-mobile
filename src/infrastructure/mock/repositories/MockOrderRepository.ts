import { OrderStatus, type CreateOrderInput, type EntityId, type Order, type OrderRepository, type TenantId } from "@/core";

import type { MockDatabaseStore } from "../database";
import { createId } from "../utils/createId";

export class MockOrderRepository implements OrderRepository {
  constructor(private readonly store: MockDatabaseStore) {}

  async getByCustomer(tenantId: TenantId, customerId: EntityId): Promise<Order[]> {
    const database = await this.store.getState();
    return database.orders.filter((order) => order.tenantId === tenantId && order.customerId === customerId);
  }

  async getById(id: EntityId): Promise<Order | null> {
    const database = await this.store.getState();
    return database.orders.find((order) => order.id === id) ?? null;
  }

  async getByNumber(tenantId: TenantId, number: string): Promise<Order | null> {
    const database = await this.store.getState();
    return database.orders.find((order) => order.tenantId === tenantId && order.number === number) ?? null;
  }

  async create(input: CreateOrderInput): Promise<Order> {
    const now = new Date().toISOString();
    const order: Order = { ...input, id: createId("order"), createdAt: now };
    await this.store.update((database) => {
      database.orders.push(order);
      input.items.forEach((item) => {
        database.orderItems.push({ ...item, id: createId("order-item"), orderId: order.id });
      });
    });
    return order;
  }

  async updateStatus(id: EntityId, status: OrderStatus): Promise<Order> {
    let updated: Order | null = null;
    await this.store.update((database) => {
      const order = database.orders.find((item) => item.id === id);
      if (!order) {
        throw new Error("Order not found");
      }
      order.status = status;
      const timestamp = new Date().toISOString();
      if (status === OrderStatus.Confirmed) {
        order.confirmedAt = timestamp;
      }
      if (status === OrderStatus.Preparing) {
        order.preparingAt = timestamp;
      }
      if (status === OrderStatus.Shipped) {
        order.shippedAt = timestamp;
      }
      updated = order;
    });

    if (!updated) {
      throw new Error("Order not found");
    }

    return updated;
  }
}
