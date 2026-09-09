import { useCallback, useEffect, useState } from "react";

import type { Notification } from "@/core";
import { useRepositories } from "@/infrastructure";
import { useSession } from "@/modules/auth";

export function useNotifications() {
  const { notificationRepository } = useRepositories();
  const { session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    setNotifications(await notificationRepository.getByCustomer(session.tenantId, session.customerId));
    setUnreadCount(await notificationRepository.getUnreadCount(session.tenantId, session.customerId));
    setIsLoading(false);
  }, [notificationRepository, session]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      await notificationRepository.markAsRead(notificationId);
      await load();
    },
    [load, notificationRepository],
  );

  const markAllAsRead = useCallback(async () => {
    if (!session) {
      return;
    }
    await notificationRepository.markAllAsRead(session.tenantId, session.customerId);
    await load();
  }, [load, notificationRepository, session]);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  return { isLoading, markAllAsRead, markAsRead, notifications, reload: load, unreadCount };
}
