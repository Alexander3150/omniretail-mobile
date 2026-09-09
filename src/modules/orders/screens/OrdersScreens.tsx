import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useRepositories } from "@/infrastructure";
import { formatCurrency } from "@/shared";
import { colors, spacing, typography } from "@/theme";

import { useOrders } from "../hooks/useOrders";

export function OrdersScreen() {
  const { currency, isLoading, orders } = useOrders();

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
          <Text>Estado: {item.status}</Text>
          <Text>{formatCurrency(item.total, currency)}</Text>
        </Pressable>
      )}
    />
  );
}

export function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { businessConfigRepository, orderRepository } = useRepositories();
  const [order, setOrder] = useState<Awaited<ReturnType<typeof orderRepository.getById>>>(null);
  const [items, setItems] = useState<Awaited<ReturnType<typeof orderRepository.getItems>>>([]);
  const [currency, setCurrency] = useState("GTQ");

  useEffect(() => {
    async function load() {
      setCurrency((await businessConfigRepository.getCurrent()).currency);
      const orderWithItems = await orderRepository.getWithItems(id);
      setOrder(orderWithItems?.order ?? null);
      setItems(orderWithItems?.items ?? []);
    }
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [businessConfigRepository, id, orderRepository]);

  if (!order) {
    return (
      <View style={styles.content}>
        <Text style={styles.title}>Pedido no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{order.number}</Text>
      <Text>Estado: {order.status}</Text>
      <Text>Entrega: {order.deliveryMethod}</Text>
      {items.map((item) => <Text key={item.id}>{item.productNameSnapshot} x {item.quantity}: {formatCurrency(item.subtotal, currency)}</Text>)}
      <Text>Subtotal: {formatCurrency(order.subtotal, currency)}</Text>
      <Text>Descuento: {formatCurrency(order.discount, currency)}</Text>
      <Text>Envio: {formatCurrency(order.shippingCost, currency)}</Text>
      <Text style={styles.name}>Total: {formatCurrency(order.total, currency)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  loading: { flex: 1 },
  muted: { color: colors.textMuted },
  name: { color: colors.text, fontWeight: "700" },
  panel: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.sm, padding: spacing.md },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "700" },
});
