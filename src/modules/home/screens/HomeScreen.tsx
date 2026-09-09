import { Link } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useSession } from "@/modules/auth";
import { ProductCard, useCommerceCatalog } from "@/modules/catalog";
import { colors, spacing, typography } from "@/theme";

export function HomeScreen() {
  const { customer } = useSession();
  const [query, setQuery] = useState("");
  const { addToCart, businessName, categories, currency, error, isLoading, products, toggleFavorite } = useCommerceCatalog(undefined, query);

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={products}
      keyExtractor={(item) => item.product.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>{businessName}</Text>
          <Text style={styles.subtitle}>Hola, {customer?.name ?? "cliente"}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput onChangeText={setQuery} placeholder="Buscar por nombre o SKU" placeholderTextColor={colors.textMuted} style={styles.input} value={query} />
          <FlatList
            data={categories}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Link asChild href={{ pathname: "/(protected)/(tabs)/categories", params: { categoryId: item.id } }}>
                <Pressable style={styles.categoryPill}>
                  <Text style={styles.categoryText}>{item.name}</Text>
                </Pressable>
              </Link>
            )}
            showsHorizontalScrollIndicator={false}
          />
          <Text style={styles.sectionTitle}>Productos</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No hay productos para mostrar.</Text>}
      renderItem={({ item }) => <ProductCard currency={currency} item={item} onAddToCart={addToCart} onToggleFavorite={toggleFavorite} />}
    />
  );
}

const styles = StyleSheet.create({
  categoryPill: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, marginRight: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  categoryText: { color: colors.text },
  content: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  empty: { color: colors.textMuted, textAlign: "center" },
  error: { color: colors.danger },
  header: { gap: spacing.md },
  input: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, color: colors.text, minHeight: 44, paddingHorizontal: spacing.md },
  loading: { flex: 1 },
  sectionTitle: { color: colors.text, fontSize: typography.subtitle, fontWeight: "700" },
  subtitle: { color: colors.textMuted, fontSize: typography.body },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "700" },
});
