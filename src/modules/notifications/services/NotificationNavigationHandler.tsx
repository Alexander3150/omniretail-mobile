import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";

function openNotificationOrder(
  response: Notifications.NotificationResponse,
) {
  const orderId =
    response.notification.request.content.data?.orderId;

  if (typeof orderId !== "string" || !orderId.trim()) {
    return;
  }

  router.push({
    pathname: "/(protected)/orders/[id]",
    params: { id: orderId },
  });
}

export function NotificationNavigationHandler() {
  useEffect(() => {
    const subscription =
      Notifications.addNotificationResponseReceivedListener(
        openNotificationOrder,
      );

    void Notifications.getLastNotificationResponseAsync().then(
      (response) => {
        if (response) {
          openNotificationOrder(response);
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
}
