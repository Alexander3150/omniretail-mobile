import type { Notification } from "../entities";
import type { EntityId, TenantId } from "../types";

export type CreateNotificationInput = Omit<Notification, "id" | "createdAt" | "readAt">;

export interface NotificationRepository {
  getByCustomer(tenantId: TenantId, customerId: EntityId): Promise<Notification[]>;
  getUnreadCount(tenantId: TenantId, customerId: EntityId): Promise<number>;
  markAsRead(id: EntityId): Promise<Notification>;
  markAllAsRead(tenantId: TenantId, customerId: EntityId): Promise<void>;
  create(input: CreateNotificationInput): Promise<Notification>;
}
