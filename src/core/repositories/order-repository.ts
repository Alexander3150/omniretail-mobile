import type { Order, OrderItem } from "../entities";
import type { OrderStatus } from "../enums";
import type { EntityId, TenantId } from "../types";

export type CreateOrderInput = Omit<Order, "id" | "createdAt" | "confirmedAt" | "preparingAt" | "shippedAt"> & {
  items: Omit<OrderItem, "id" | "orderId">[];
};

export interface OrderRepository {
  getByCustomer(tenantId: TenantId, customerId: EntityId): Promise<Order[]>;
  getById(id: EntityId): Promise<Order | null>;
  getByNumber(tenantId: TenantId, number: string): Promise<Order | null>;
  create(input: CreateOrderInput): Promise<Order>;
  updateStatus(id: EntityId, status: OrderStatus): Promise<Order>;
}
