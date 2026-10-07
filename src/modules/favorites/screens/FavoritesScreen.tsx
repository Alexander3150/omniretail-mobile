import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { ProductCard } from "@/modules/catalog";
import { CartToast, useCartToast } from "@/shared";
import { colors, spacing, typography } from "@/theme";

import { useFavorites } from "../hooks/useFavorites";

export function FavoritesScreen() {
  const { addToCart, currency, isLoading, items, reload } = useFavorites();
  const { cartToastMessage, showCartToast } = useCartToast();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }

  return (
    <View style={styles.screen}>
      <FlatList
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.product.id}
      ListHeaderComponent={<Text style={styles.title}>Favoritos</Text>}
      ListEmptyComponent={<Text style={styles.empty}>No tienes favoritos todavia.</Text>}
      renderItem={({ item }) => <ProductCard currency={currency} item={item} onAddToCart={addToCart} onCartNotice={showCartToast} />}
      />
      <CartToast message={cartToastMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  content: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  empty: { color: colors.textMuted, textAlign: "center" },
  loading: { flex: 1 },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "700" },
});
