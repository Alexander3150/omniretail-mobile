import type { CreateNotificationInput, EntityId, Notification, NotificationRepository, TenantId } from "@/core";

import type { MockDatabaseStore } from "../database";
import { createId } from "../utils/createId";

export class MockNotificationRepository implements NotificationRepository {
  constructor(private readonly store: MockDatabaseStore) {}

  async getByCustomer(tenantId: TenantId, customerId: EntityId): Promise<Notification[]> {
    const database = await this.store.getState();
    return database.notifications
      .filter((notification) => notification.tenantId === tenantId && notification.customerId === customerId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async getUnreadCount(tenantId: TenantId, customerId: EntityId): Promise<number> {
    const notifications = await this.getByCustomer(tenantId, customerId);
    return notifications.filter((notification) => !notification.readAt).length;
  }

  async markAsRead(id: EntityId): Promise<Notification> {
    let updated: Notification | null = null;
    await this.store.update((database) => {
      const notification = database.notifications.find((item) => item.id === id);
      if (!notification) {
        throw new Error("Notification not found");
      }
      notification.readAt = notification.readAt ?? new Date().toISOString();
      updated = notification;
    });

    if (!updated) {
      throw new Error("Notification not found");
    }

    return updated;
  }

  async markAllAsRead(tenantId: TenantId, customerId: EntityId): Promise<void> {
    await this.store.update((database) => {
      const timestamp = new Date().toISOString();
      database.notifications.forEach((notification) => {
        if (notification.tenantId === tenantId && notification.customerId === customerId && !notification.readAt) {
          notification.readAt = timestamp;
        }
      });
    });
  }

  async create(input: CreateNotificationInput): Promise<Notification> {
    const notification: Notification = { ...input, id: createId("notification"), createdAt: new Date().toISOString() };
    await this.store.update((database) => {
      database.notifications.push(notification);
    });
    return notification;
  }
}
