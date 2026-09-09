import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { formatDateTime } from "@/shared";
import { colors, spacing, typography } from "@/theme";

import { useNotifications } from "../hooks/useNotifications";

export function NotificationsScreen() {
  const { isLoading, markAllAsRead, markAsRead, notifications, reload, unreadCount } = useNotifications();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={notifications}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={(
        <View style={styles.header}>
          <Text style={styles.title}>Notificaciones</Text>
          <Text style={styles.muted}>{unreadCount} sin leer</Text>
          {unreadCount > 0 ? (
            <Pressable onPress={markAllAsRead} style={styles.secondaryButton}>
              <Text style={styles.linkText}>Marcar todas como leidas</Text>
            </Pressable>
          ) : null}
        </View>
      )}
      ListEmptyComponent={<Text style={styles.muted}>No hay notificaciones.</Text>}
      renderItem={({ item }) => (
        <Pressable
          onPress={async () => {
            if (!item.readAt) {
              await markAsRead(item.id);
            }
            if (item.relatedOrderId) {
              router.push({ pathname: "/(protected)/orders/[id]", params: { id: item.relatedOrderId } });
            }
          }}
          style={[styles.panel, item.readAt ? null : styles.unreadPanel]}
        >
          <View style={styles.rowBetween}>
            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.badge}>{item.readAt ? "leida" : "nueva"}</Text>
          </View>
          <Text>{item.message}</Text>
          <Text style={styles.muted}>{item.type} - {formatDateTime(item.createdAt)}</Text>
          {!item.readAt ? (
            <Pressable onPress={() => void markAsRead(item.id)} style={styles.secondaryButton}>
              <Text style={styles.linkText}>Marcar como leida</Text>
            </Pressable>
          ) : null}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  badge: { color: colors.primary, fontSize: typography.caption, fontWeight: "700" },
  content: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  header: { gap: spacing.sm },
  linkText: { color: colors.primary, fontWeight: "700" },
  loading: { flex: 1 },
  muted: { color: colors.textMuted },
  name: { color: colors.text, flex: 1, fontWeight: "700" },
  panel: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.sm, padding: spacing.md },
  rowBetween: { alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" },
  secondaryButton: { alignItems: "center", borderColor: colors.border, borderRadius: 8, borderWidth: 1, minHeight: 40, justifyContent: "center", paddingHorizontal: spacing.md },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "700" },
  unreadPanel: { borderColor: colors.primary },
});
