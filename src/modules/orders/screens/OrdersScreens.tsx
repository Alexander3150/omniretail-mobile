import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { demoConfig } from "@/config";
import { DeliveryMethod, OrderStatus } from "@/core";
import { formatCurrency, formatDateTime } from "@/shared";
import { colors, spacing, typography } from "@/theme";

import { useOrder, useOrders, useOrderTracking } from "../hooks/useOrders";

export function OrdersScreen() {
  const { currency, isLoading, orders, reload } = useOrders();

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
      data={orders}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={<Text style={styles.title}>Pedidos</Text>}
      ListEmptyComponent={<Text style={styles.muted}>No hay pedidos.</Text>}
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push({ pathname: "/(protected)/orders/[id]", params: { id: item.id } })} style={styles.panel}>
          <Text style={styles.name}>{item.number}</Text>
          <Text style={styles.badge}>Estado: {item.status}</Text>
          <Text style={styles.muted}>{formatDateTime(item.createdAt)}</Text>
          <Text>{item.itemCount} articulos</Text>
          <Text style={styles.total}>{formatCurrency(item.total, currency)}</Text>
        </Pressable>
      )}
    />
  );
}

export function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { advanceForDemo, branch, currency, isLoading, items, order, payments } = useOrder(id);
  const tracking = useOrderTracking(order);
  const canAdvance = demoConfig.enableOrderStatusControls && (order?.status === OrderStatus.Confirmed || order?.status === OrderStatus.Preparing);

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }

  if (!order) {
    return (
      <View style={styles.content}>
        <Text style={styles.title}>Pedido no encontrado</Text>
        <Text style={styles.muted}>No pudimos encontrar este pedido para tu cuenta.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.panel}>
        <Text style={styles.title}>{order.number}</Text>
        <Text style={styles.badge}>Estado: {order.status}</Text>
        <Text style={styles.muted}>Creado: {formatDateTime(order.createdAt)}</Text>
        {canAdvance ? (
          <Pressable onPress={advanceForDemo} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Avanzar estado (Demo)</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Seguimiento</Text>
        {tracking.map((step) => (
          <View key={step.key} style={styles.timelineRow}>
            <Text style={styles.timelineState}>{step.state}</Text>
            <View style={styles.flex}>
              <Text style={styles.name}>{step.label}</Text>
              <Text style={styles.muted}>{formatDateTime(step.date)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Articulos</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.flex}>
              <Text style={styles.name}>{item.productNameSnapshot}</Text>
              <Text style={styles.muted}>{item.skuSnapshot ?? "SKU demo"}</Text>
              <Text>Cantidad: {item.quantity}</Text>
            </View>
            <Text>{formatCurrency(item.subtotal, currency)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Entrega</Text>
        <Text>{order.deliveryMethod === DeliveryMethod.HomeDelivery ? "Envio a domicilio" : "Retiro en tienda"}</Text>
        {order.deliveryMethod === DeliveryMethod.HomeDelivery && order.deliveryAddressSnapshot ? (
          <>
            <Text style={styles.name}>{order.deliveryAddressSnapshot.label ?? "Direccion"}</Text>
            <Text>{order.deliveryAddressSnapshot.addressLine}</Text>
            <Text style={styles.muted}>{[order.deliveryAddressSnapshot.municipality, order.deliveryAddressSnapshot.department].filter(Boolean).join(", ")}</Text>
            {order.deliveryAddressSnapshot.phone ? <Text style={styles.muted}>{order.deliveryAddressSnapshot.phone}</Text> : null}
          </>
        ) : null}
        {order.deliveryMethod === DeliveryMethod.StorePickup ? (
          <>
            <Text style={styles.name}>{branch?.name ?? "Sucursal"}</Text>
            <Text>{branch?.address ?? "Direccion no disponible"}</Text>
            {branch?.openingHours ? <Text style={styles.muted}>{branch.openingHours}</Text> : null}
          </>
        ) : null}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Pago</Text>
        <Text>Estado: {order.paymentStatus ?? "pendiente"}</Text>
        {payments.length === 0 ? <Text style={styles.muted}>Sin pago registrado.</Text> : null}
        {payments.map((payment) => (
          <Text key={payment.id}>
            {payment.method} - {payment.status} - {formatCurrency(payment.amount, currency)}
            {payment.reference ? ` (${payment.reference})` : ""}
          </Text>
        ))}
      </View>

      <View style={styles.panel}>
        <Text>Subtotal: {formatCurrency(order.subtotal, currency)}</Text>
        <Text>Descuento: {formatCurrency(order.discount, currency)}</Text>
        <Text>Envio: {formatCurrency(order.shippingCost, currency)}</Text>
        <Text style={styles.total}>Total: {formatCurrency(order.total, currency)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  badge: { color: colors.primary, fontWeight: "700" },
  content: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  flex: { flex: 1 },
  itemRow: { borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: spacing.md, paddingTop: spacing.sm },
  loading: { flex: 1 },
  muted: { color: colors.textMuted },
  name: { color: colors.text, fontWeight: "700" },
  panel: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.sm, padding: spacing.md },
  primaryButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 8, minHeight: 44, justifyContent: "center", marginTop: spacing.sm },
  primaryText: { color: colors.surface, fontWeight: "700" },
  sectionTitle: { color: colors.text, fontSize: typography.subtitle, fontWeight: "700" },
  timelineRow: { flexDirection: "row", gap: spacing.md },
  timelineState: { color: colors.primary, fontSize: typography.caption, fontWeight: "700", minWidth: 80 },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "700" },
  total: { color: colors.text, fontSize: typography.subtitle, fontWeight: "700" },
});
