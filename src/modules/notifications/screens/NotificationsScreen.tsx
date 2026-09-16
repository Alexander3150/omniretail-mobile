import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { formatDateTime } from "@/shared";

import { useNotifications } from "../hooks/useNotifications";

const palette = {
  deepBlue: "#3E668F",
  dreamyBlue: "#81A9EE",
  honey: "#FFDB83",
  cream: "#FFF2D0",
  white: "#FFFFFF",
  text: "#172033",
  muted: "#687286",
  border: "#DDE3EE",
};

export function NotificationsScreen() {
  const {
    isLoading,
    markAllAsRead,
    markAsRead,
    notifications,
    reload,
    unreadCount,
  } = useNotifications();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={palette.deepBlue} size="large" />
        <Text style={styles.loadingText}>
          Cargando notificaciones...
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={notifications}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <View style={styles.hero}>
            <View style={styles.bubbleOne} />
            <View style={styles.bubbleTwo} />

            <View style={styles.heroRow}>
              <View style={styles.heroCopy}>
                <Text style={styles.brand}>FERREPHARMA</Text>
                <Text style={styles.heroTitle}>Notificaciones</Text>
                <Text style={styles.heroSubtitle}>
                  Mantente al día con tus pedidos y novedades.
                </Text>
              </View>

              <View style={styles.heroIcon}>
                <Ionicons
                  color={palette.deepBlue}
                  name="notifications-outline"
                  size={22}
                />
              </View>
            </View>
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryIcon}>
              <Ionicons
                color={palette.deepBlue}
                name={
                  unreadCount > 0
                    ? "mail-unread-outline"
                    : "checkmark-circle-outline"
                }
                size={20}
              />
            </View>

            <View style={styles.summaryCopy}>
              <Text style={styles.summaryTitle}>
                {unreadCount > 0
                  ? `${unreadCount} sin leer`
                  : "Todo al día"}
              </Text>
              <Text style={styles.summaryText}>
                {unreadCount > 0
                  ? "Tienes novedades pendientes de revisar"
                  : "No tienes notificaciones pendientes"}
              </Text>
            </View>

            {unreadCount > 0 ? (
              <Pressable
                onPress={() => void markAllAsRead()}
                style={({ pressed }) => [
                  styles.readAllButton,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Ionicons
                  color={palette.deepBlue}
                  name="checkmark-done"
                  size={17}
                />
              </Pressable>
            ) : null}
          </View>

          {notifications.length > 0 ? (
            <Text style={styles.sectionTitle}>Actividad reciente</Text>
          ) : null}
        </>
      }
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              color={palette.deepBlue}
              name="notifications-off-outline"
              size={30}
            />
          </View>
          <Text style={styles.emptyTitle}>Sin notificaciones</Text>
          <Text style={styles.emptyText}>
            Aquí aparecerán las actualizaciones importantes de tu
            cuenta y tus pedidos.
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const unread = !item.readAt;

        return (
          <Pressable
            onPress={async () => {
              if (unread) {
                await markAsRead(item.id);
              }

              if (item.relatedOrderId) {
                router.push({
                  pathname: "/(protected)/orders/[id]",
                  params: { id: item.relatedOrderId },
                });
              }
            }}
            style={({ pressed }) => [
              styles.notificationCard,
              unread ? styles.unreadCard : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <View
              style={[
                styles.notificationIcon,
                unread ? styles.notificationIconUnread : null,
              ]}
            >
              <Ionicons
                color={palette.deepBlue}
                name={
                  item.relatedOrderId
                    ? "bag-handle-outline"
                    : "notifications-outline"
                }
                size={20}
              />
            </View>

            <View style={styles.notificationBody}>
              <View style={styles.titleRow}>
                <Text style={styles.notificationTitle}>
                  {item.title}
                </Text>

                {unread ? <View style={styles.unreadDot} /> : null}
              </View>

              <Text style={styles.message}>{item.message}</Text>

              <View style={styles.metaRow}>
                <Ionicons
                  color={palette.muted}
                  name="time-outline"
                  size={12}
                />
                <Text style={styles.meta}>
                  {formatDateTime(item.createdAt)}
                </Text>

                {item.relatedOrderId ? (
                  <>
                    <Text style={styles.metaSeparator}>•</Text>
                    <Text style={styles.orderLink}>Ver pedido</Text>
                  </>
                ) : null}
              </View>

              {unread ? (
                <Pressable
                  onPress={() => void markAsRead(item.id)}
                  style={styles.markButton}
                >
                  <Ionicons
                    color={palette.deepBlue}
                    name="checkmark"
                    size={14}
                  />
                  <Text style={styles.markText}>Marcar como leída</Text>
                </Pressable>
              ) : null}
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 28,
  },
  hero: {
    backgroundColor: palette.deepBlue,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    minHeight: 148,
    overflow: "hidden",
    paddingBottom: 20,
    paddingHorizontal: 18,
    paddingTop: 30,
  },
  bubbleOne: {
    backgroundColor: palette.dreamyBlue,
    borderRadius: 90,
    height: 155,
    opacity: 0.16,
    position: "absolute",
    right: -48,
    top: -58,
    width: 155,
  },
  bubbleTwo: {
    backgroundColor: palette.honey,
    borderRadius: 55,
    bottom: -45,
    height: 100,
    opacity: 0.13,
    position: "absolute",
    right: 60,
    width: 100,
  },
  heroRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroCopy: { flex: 1, paddingRight: 12 },
  brand: {
    color: palette.honey,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: palette.white,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 3,
  },
  heroSubtitle: {
    color: "#EAF1F8",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  summary: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    marginHorizontal: 12,
    marginTop: 10,
    padding: 11,
  },
  summaryIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 10,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  summaryCopy: { flex: 1 },
  summaryTitle: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "900",
  },
  summaryText: {
    color: palette.muted,
    fontSize: 9,
    marginTop: 2,
  },
  readAllButton: {
    alignItems: "center",
    backgroundColor: palette.honey,
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "900",
    marginHorizontal: 14,
    marginTop: 14,
  },
  notificationCard: {
    alignItems: "flex-start",
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 12,
    marginTop: 9,
    padding: 12,
  },
  unreadCard: {
    borderColor: palette.dreamyBlue,
  },
  notificationIcon: {
    alignItems: "center",
    backgroundColor: "#F1F3F6",
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  notificationIconUnread: {
    backgroundColor: "#E6EEF8",
  },
  notificationBody: { flex: 1 },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  notificationTitle: {
    color: palette.text,
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
  },
  unreadDot: {
    backgroundColor: palette.dreamyBlue,
    borderRadius: 5,
    height: 8,
    width: 8,
  },
  message: {
    color: palette.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 7,
  },
  meta: {
    color: palette.muted,
    fontSize: 9,
  },
  metaSeparator: {
    color: palette.muted,
    fontSize: 9,
  },
  orderLink: {
    color: palette.deepBlue,
    fontSize: 9,
    fontWeight: "900",
  },
  markButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EEF3F8",
    borderRadius: 9,
    flexDirection: "row",
    gap: 4,
    marginTop: 8,
    minHeight: 30,
    paddingHorizontal: 8,
  },
  markText: {
    color: palette.deepBlue,
    fontSize: 9,
    fontWeight: "900",
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: 12,
    marginTop: 12,
    padding: 25,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 10,
  },
  emptyText: {
    color: palette.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
    textAlign: "center",
  },
  loading: {
    alignItems: "center",
    backgroundColor: palette.cream,
    flex: 1,
    gap: 10,
    justifyContent: "center",
  },
  loadingText: {
    color: palette.deepBlue,
    fontSize: 11,
    fontWeight: "800",
  },
  pressed: { opacity: 0.76 },
});
