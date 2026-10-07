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
  silkyLilac: "#AAB4E7",
  butterHoney: "#FFDB83",
  vanillaMilk: "#FFF2D0",
  white: "#FFFFFF",
  text: "#172033",
  muted: "#687286",
  border: "#DDE3EE",
};

export function NotificationsScreen() {
  const {
    isLoading,
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
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={notifications}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <View style={styles.hero}>
            <View style={styles.heroCircleLarge} />
            <View style={styles.heroCircleSmall} />

            <View style={styles.heroTop}>
              <Pressable accessibilityLabel="Regresar" onPress={() => router.back()} style={styles.backButton}>
                <Ionicons color={palette.deepBlue} name="arrow-back" size={20} />
              </Pressable>
              <View style={styles.heroText}>
                <Text style={styles.brand}>FERREPHARMA</Text>
                <Text style={styles.heroTitle}>Notificaciones</Text>
              </View>

              <View style={styles.heroIcon}>
                <Ionicons
                  color={palette.deepBlue}
                  name="notifications-outline"
                  size={24}
                />

                {unreadCount > 0 ? (
                  <View style={styles.heroCount}>
                    <Text style={styles.heroCountText}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Text style={styles.heroSubtitle}>
              Mantente al día con tus pedidos y novedades.
            </Text>

            <View style={styles.heroBadge}>
              <Ionicons
                color={palette.deepBlue}
                name={
                  unreadCount > 0
                    ? "mail-unread-outline"
                    : "mail-open-outline"
                }
                size={15}
              />

              <Text style={styles.heroBadgeText}>
                {unreadCount}{" "}
                {unreadCount === 1
                  ? "notificación sin leer"
                  : "notificaciones sin leer"}
              </Text>
            </View>
          </View>

          {notifications.length > 0 ? (
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Actividad reciente</Text>
                <Text style={styles.sectionSubtitle}>
                  Tus avisos de FERREPHARMA
                </Text>
              </View>

              <View style={styles.sectionIcon}>
                <Ionicons
                  color={palette.deepBlue}
                  name="time-outline"
                  size={20}
                />
              </View>
            </View>
          ) : null}
        </>
      }
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              color={palette.deepBlue}
              name="notifications-off-outline"
              size={34}
            />
          </View>

          <Text style={styles.emptyTitle}>Todo al día</Text>

          <Text style={styles.emptyText}>
            No tienes notificaciones por el momento. Aquí aparecerán los avisos
            relacionados con tus compras.
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
                  item.type === "orderConfirmed"
                    ? "bag-check-outline"
                    : "notifications-outline"
                }
                size={23}
              />
            </View>

            <View style={styles.notificationBody}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>{item.title}</Text>

                <View
                  style={[
                    styles.statusBadge,
                    unread ? styles.statusBadgeUnread : null,
                  ]}
                >
                  {unread ? <View style={styles.unreadDot} /> : null}

                  <Text style={styles.statusText}>
                    {unread ? "Nueva" : "Leída"}
                  </Text>
                </View>
              </View>

              <Text style={styles.message}>{item.message}</Text>

              <View style={styles.metaRow}>
                <Ionicons
                  color={palette.muted}
                  name="time-outline"
                  size={14}
                />
                <Text style={styles.dateText}>
                  {formatDateTime(item.createdAt)}
                </Text>
              </View>

              {unread ? (
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    void markAsRead(item.id);
                  }}
                  style={({ pressed }) => [
                    styles.readButton,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Ionicons
                    color={palette.deepBlue}
                    name="checkmark"
                    size={16}
                  />
                  <Text style={styles.readButtonText}>
                    Marcar como leída
                  </Text>
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
    backgroundColor: palette.vanillaMilk,
    flexGrow: 1,
    paddingBottom: 34,
  },

  loading: {
    alignItems: "center",
    backgroundColor: palette.vanillaMilk,
    flex: 1,
    justifyContent: "center",
  },

  hero: {
    backgroundColor: palette.deepBlue,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
    minHeight: 212,
    overflow: "hidden",
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 44,
  },

  heroCircleLarge: {
    backgroundColor: palette.dreamyBlue,
    borderRadius: 110,
    height: 185,
    opacity: 0.17,
    position: "absolute",
    right: -55,
    top: -65,
    width: 185,
  },

  heroCircleSmall: {
    backgroundColor: palette.butterHoney,
    borderRadius: 55,
    bottom: -46,
    height: 105,
    opacity: 0.17,
    position: "absolute",
    right: 62,
    width: 105,
  },

  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  backButton: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  heroIcon: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    position: "relative",
    width: 46,
  },

  heroDot: {
    backgroundColor: palette.butterHoney,
    borderColor: palette.white,
    borderRadius: 6,
    borderWidth: 2,
    height: 12,
    position: "absolute",
    right: 8,
    top: 7,
    width: 12,
  },

  brand: {
    color: palette.butterHoney,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.7,
  },

  heroTitle: {
    color: palette.white,
    fontSize: 29,
    fontWeight: "900",
    marginTop: 2,
  },

  heroText: {
    flex: 1,
  },

  heroCount: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderColor: palette.white,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 20,
    minWidth: 20,
    paddingHorizontal: 4,
    position: "absolute",
    right: -4,
    top: -5,
  },

  heroCountText: {
    color: palette.deepBlue,
    fontSize: 9,
    fontWeight: "900",
  },

  heroBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: palette.butterHoney,
    borderRadius: 18,
    flexDirection: "row",
    gap: 6,
    marginTop: 13,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  heroBadgeText: {
    color: palette.deepBlue,
    fontSize: 10,
    fontWeight: "800",
  },

  heroSubtitle: {
    color: "#EAF1F8",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 15,
    maxWidth: "82%",
  },

  counterCard: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 18,
    flexDirection: "row",
    marginTop: 20,
    padding: 13,
  },

  counterIcon: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  counterText: {
    flex: 1,
    marginLeft: 11,
  },

  counterNumber: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900",
  },

  counterLabel: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 1,
  },

  markAllButton: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 11,
    flexDirection: "row",
    gap: 4,
    minHeight: 36,
    paddingHorizontal: 10,
  },

  markAllText: {
    color: palette.deepBlue,
    fontSize: 9,
    fontWeight: "900",
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 14,
    paddingHorizontal: 18,
    paddingTop: 22,
  },

  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 3,
  },

  sectionIcon: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  notificationCard: {
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 11,
    marginHorizontal: 18,
    padding: 14,
  },

  unreadCard: {
    borderColor: palette.butterHoney,
    borderWidth: 1.5,
  },

  notificationIcon: {
    alignItems: "center",
    backgroundColor: "#E7E8F8",
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  notificationIconUnread: {
    backgroundColor: palette.butterHoney,
  },

  notificationBody: {
    flex: 1,
  },

  notificationHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },

  notificationTitle: {
    color: palette.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
  },

  statusBadge: {
    alignItems: "center",
    backgroundColor: "#EEF1F5",
    borderRadius: 9,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  statusBadgeUnread: {
    backgroundColor: "#FFF0BF",
  },

  statusText: {
    color: palette.deepBlue,
    fontSize: 8,
    fontWeight: "900",
  },

  unreadDot: {
    backgroundColor: palette.deepBlue,
    borderRadius: 3,
    height: 6,
    width: 6,
  },

  message: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 9,
  },

  dateText: {
    color: palette.muted,
    fontSize: 10,
  },

  readButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EEF4FB",
    borderRadius: 10,
    flexDirection: "row",
    gap: 4,
    marginTop: 10,
    minHeight: 32,
    paddingHorizontal: 10,
  },

  readButtonText: {
    color: palette.deepBlue,
    fontSize: 9,
    fontWeight: "900",
  },

  emptyCard: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.silkyLilac,
    borderRadius: 22,
    borderWidth: 1,
    marginHorizontal: 18,
    marginTop: 24,
    padding: 30,
  },

  emptyIcon: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    width: 68,
  },

  emptyTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 16,
  },

  emptyText: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.76,
  },
});
