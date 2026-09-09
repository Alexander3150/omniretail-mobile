import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";

import { formatCurrency } from "@/shared";
import { colors, radius, spacing, typography } from "@/theme";

import type { ProductCardViewModel } from "../application/productViewModels";

type ProductCardProps = {
  item: ProductCardViewModel;
  currency: string;
  onAddToCart(productId: string): Promise<void> | void;
  onToggleFavorite(productId: string): Promise<void> | void;
};

export function ProductCard({ currency, item, onAddToCart, onToggleFavorite }: ProductCardProps) {
  const canAdd = item.available && item.availableQuantity > 0;

  function handleToggleFavorite(event: GestureResponderEvent) {
    event.stopPropagation();
    void onToggleFavorite(item.product.id);
  }

  function handleAddToCart(event: GestureResponderEvent) {
    event.stopPropagation();
    void onAddToCart(item.product.id);
  }

  return (
    <Pressable onPress={() => router.push({ pathname: "/(protected)/products/[id]", params: { id: item.product.id } })} style={styles.card}>
      <Image source={{ uri: item.primaryImage?.url ?? "" }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.header}>
          <Text numberOfLines={2} style={styles.name}>
            {item.product.name}
          </Text>
          <Pressable onPress={handleToggleFavorite} style={styles.iconButton}>
            <Text style={styles.favorite}>{item.isFavorite ? "♥" : "♡"}</Text>
          </Pressable>
        </View>
        <Text style={styles.muted}>{item.available ? `Disponible: ${item.availableQuantity}` : "No disponible"}</Text>
        <View style={styles.priceRow}>
          {item.price.discount > 0 ? <Text style={styles.oldPrice}>{formatCurrency(item.price.basePrice, currency)}</Text> : null}
          <Text style={styles.price}>{formatCurrency(item.price.effectivePrice, currency)}</Text>
        </View>
        <Pressable disabled={!canAdd} onPress={handleAddToCart} style={[styles.button, !canAdd ? styles.buttonDisabled : null]}>
          <Text style={styles.buttonText}>Agregar</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, gap: spacing.xs },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radius.md, minHeight: 40, justifyContent: "center" },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: colors.surface, fontWeight: "700" },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: "row", gap: spacing.md, padding: spacing.md },
  favorite: { color: colors.danger, fontSize: 24 },
  header: { alignItems: "flex-start", flexDirection: "row", gap: spacing.sm, justifyContent: "space-between" },
  iconButton: { minHeight: 32, minWidth: 32 },
  image: { backgroundColor: colors.border, borderRadius: radius.sm, height: 76, width: 76 },
  muted: { color: colors.textMuted, fontSize: typography.caption },
  name: { color: colors.text, flex: 1, fontSize: typography.body, fontWeight: "700" },
  oldPrice: { color: colors.textMuted, textDecorationLine: "line-through" },
  price: { color: colors.text, fontSize: typography.body, fontWeight: "700" },
  priceRow: { alignItems: "baseline", flexDirection: "row", gap: spacing.sm },
});
