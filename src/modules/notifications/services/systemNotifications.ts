import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const MARJYM_NOTIFICATION_CHANNEL = "marjym-general";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function configureSystemNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(
      MARJYM_NOTIFICATION_CHANNEL,
      {
        name: "Notificaciones MARJYM",
        description: "Pedidos, entregas y novedades de MARJYM",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      },
    );
  }

  const currentPermissions = await Notifications.getPermissionsAsync();

  if (currentPermissions.status === "granted") {
    return true;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync();

  return requestedPermissions.status === "granted";
}

export async function showSystemNotification({
  title,
  body,
  orderId,
}: {
  title: string;
  body: string;
  orderId?: string;
}) {
  const granted = await configureSystemNotifications();

  if (!granted) {
    return false;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default",
      data: {
        orderId: orderId ?? "",
      },
    },
    trigger:
      Platform.OS === "android"
        ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1,
            channelId: MARJYM_NOTIFICATION_CHANNEL,
          }
        : {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1,
          },
  });

  return true;
}
