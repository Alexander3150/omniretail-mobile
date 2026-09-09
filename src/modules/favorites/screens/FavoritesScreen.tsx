import { ActivityIndicator, FlatList, StyleSheet, Text } from "react-native";

import { ProductCard } from "@/modules/catalog";
import { colors, spacing, typography } from "@/theme";

import { useFavorites } from "../hooks/useFavorites";

export function FavoritesScreen() {
  const { addToCart, currency, isLoading, items, toggleFavorite } = useFavorites();

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.product.id}
      ListHeaderComponent={<Text style={styles.title}>Favoritos</Text>}
      ListEmptyComponent={<Text style={styles.empty}>No tienes favoritos todavia.</Text>}
      renderItem={({ item }) => <ProductCard currency={currency} item={item} onAddToCart={() => addToCart(item.product)} onToggleFavorite={toggleFavorite} />}
    />
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  empty: { color: colors.textMuted, textAlign: "center" },
  loading: { flex: 1 },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "700" },
});
