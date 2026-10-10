import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

export const MARJYM_NOTIFICATION_CHANNEL = "marjym-general";

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

function getNotificationsModule() {
  if (isExpoGo || Platform.OS === "web") {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-notifications");
  } catch {
    return null;
  }
}

const Notifications = getNotificationsModule();

if (Notifications && Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function configureSystemNotifications() {
  if (isExpoGo || Platform.OS === "web") {
    return false;
  }

  const module = getNotificationsModule();
  if (!module) {
    return false;
  }

  if (Platform.OS === "android") {
    await module.setNotificationChannelAsync(
      MARJYM_NOTIFICATION_CHANNEL,
      {
        name: "Notificaciones MARJYM",
        description: "Pedidos, entregas y novedades de MARJYM",
        importance: module.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      },
    );
  }

  const currentPermissions = await module.getPermissionsAsync();

  if (currentPermissions.status === "granted") {
    return true;
  }

  const requestedPermissions = await module.requestPermissionsAsync();

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
  if (isExpoGo || Platform.OS === "web") {
    return false;
  }

  const module = getNotificationsModule();
  if (!module) {
    return false;
  }

  const granted = await configureSystemNotifications();

  if (!granted) {
    return false;
  }

  await module.scheduleNotificationAsync({
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
            type: module.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1,
            channelId: MARJYM_NOTIFICATION_CHANNEL,
          }
        : {
            type: module.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1,
          },
  });

  return true;
}
