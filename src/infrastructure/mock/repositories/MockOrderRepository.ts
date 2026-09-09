import { OrderStatus, type CreateOrderInput, type EntityId, type Order, type OrderItem, type OrderRepository, type OrderWithItems, type TenantId } from "@/core";

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

  async getItems(orderId: EntityId): Promise<OrderItem[]> {
    const database = await this.store.getState();
    return database.orderItems.filter((orderItem) => orderItem.orderId === orderId);
  }

  async getWithItems(orderId: EntityId): Promise<OrderWithItems | null> {
    const order = await this.getById(orderId);

    if (!order) {
      return null;
    }

    return {
      order,
      items: await this.getItems(orderId),
    };
  }

  async create(input: CreateOrderInput): Promise<Order> {
    const now = new Date().toISOString();
    const { items, ...orderInput } = input;
    const order: Order = { ...orderInput, id: createId("order"), createdAt: now };
    const orderItems: OrderItem[] = items.map((item) => ({ ...item, id: createId("order-item"), orderId: order.id }));

    await this.store.update((database) => {
      database.orders.push(order);
      database.orderItems.push(...orderItems);
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
