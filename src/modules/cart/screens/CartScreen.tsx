import { router } from "expo-router";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { formatCurrency } from "@/shared";
import { colors, spacing, typography } from "@/theme";

import { useCart } from "../hooks/useCart";

export function CartScreen() {
  const { currency, error, isLoading, lines, removeItem, totals, updateQuantity } = useCart();

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={lines}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={<Text style={styles.title}>Carrito</Text>}
      ListEmptyComponent={<Text style={styles.empty}>{error ?? "Tu carrito esta vacio."}</Text>}
      ListFooterComponent={
        lines.length > 0 ? (
          <View style={styles.totals}>
            <Text>Subtotal: {formatCurrency(totals.subtotal, currency)}</Text>
            <Text>Descuento: {formatCurrency(totals.discount, currency)}</Text>
            <Text style={styles.total}>Total: {formatCurrency(totals.total, currency)}</Text>
            <Pressable onPress={() => router.push("/(protected)/checkout/delivery")} style={styles.primaryButton}>
              <Text style={styles.primaryText}>Continuar al checkout</Text>
            </Pressable>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <View style={styles.line}>
          <Image source={{ uri: item.imageUrl ?? "" }} style={styles.image} />
          <View style={styles.lineBody}>
            <Text style={styles.name}>{item.productName}</Text>
            <Text style={styles.muted}>SKU {item.sku}</Text>
            <Text>{formatCurrency(item.effectiveUnitPrice, currency)} x {item.quantity}</Text>
            <Text style={styles.name}>{formatCurrency(item.lineSubtotal, currency)}</Text>
            <View style={styles.row}>
              <Pressable onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.smallButton}><Text>-</Text></Pressable>
              <Text>{item.quantity}</Text>
              <Pressable onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.smallButton}><Text>+</Text></Pressable>
              <Pressable onPress={() => removeItem(item.id)}><Text style={styles.remove}>Eliminar</Text></Pressable>
            </View>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  empty: { color: colors.textMuted, textAlign: "center" },
  image: { backgroundColor: colors.border, borderRadius: 8, height: 70, width: 70 },
  line: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, flexDirection: "row", gap: spacing.md, padding: spacing.md },
  lineBody: { flex: 1, gap: spacing.xs },
  loading: { flex: 1 },
  muted: { color: colors.textMuted },
  name: { color: colors.text, fontWeight: "700" },
  primaryButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 8, minHeight: 48, justifyContent: "center", marginTop: spacing.md },
  primaryText: { color: colors.surface, fontWeight: "700" },
  remove: { color: colors.danger },
  row: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  smallButton: { alignItems: "center", borderColor: colors.border, borderRadius: 8, borderWidth: 1, height: 36, justifyContent: "center", width: 36 },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "700" },
  total: { fontSize: typography.subtitle, fontWeight: "700" },
  totals: { borderTopColor: colors.border, borderTopWidth: 1, gap: spacing.sm, paddingTop: spacing.md },
});
