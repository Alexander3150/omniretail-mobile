import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { formatCurrency } from "@/shared";
import { colors, spacing, typography } from "@/theme";

import { calculatePrice } from "../application/pricing";
import { ProductCard } from "../components/ProductCard";
import { useCommerceCatalog } from "../hooks/useCommerceCatalog";

export function CategoriesScreen() {
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const [selectedCategoryId, setSelectedCategoryId] = useState(params.categoryId);
  const [query, setQuery] = useState("");
  const { addToCart, categories, currency, error, isLoading, products, toggleFavorite } = useCommerceCatalog(selectedCategoryId, query);

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
          <Text style={styles.title}>Categorias</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput onChangeText={setQuery} placeholder="Buscar producto" placeholderTextColor={colors.textMuted} style={styles.input} value={query} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable onPress={() => setSelectedCategoryId(undefined)} style={styles.categoryPill}>
              <Text style={styles.categoryText}>Todas</Text>
            </Pressable>
            {categories.map((category) => (
              <Pressable key={category.id} onPress={() => setSelectedCategoryId(category.id)} style={[styles.categoryPill, selectedCategoryId === category.id ? styles.categorySelected : null]}>
                <Text style={styles.categoryText}>{category.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No hay productos en esta categoria.</Text>}
      renderItem={({ item }) => <ProductCard currency={currency} item={item} onAddToCart={addToCart} onToggleFavorite={toggleFavorite} />}
    />
  );
}

export function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, currency, isLoading, products, reload, toggleFavorite } = useCommerceCatalog();
  const productVm = products.find((item) => item.product.id === id);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAdd() {
    if (!productVm || quantity <= 0) {
      return;
    }

    for (let index = 0; index < quantity; index += 1) {
      await addToCart(productVm.product.id);
    }
    setMessage("Producto agregado al carrito.");
  }

  async function handleFavorite() {
    if (!productVm) {
      return;
    }
    await toggleFavorite(productVm.product.id);
    await reload();
  }

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }

  if (!productVm) {
    return (
      <View style={styles.content}>
        <Text style={styles.title}>Producto no encontrado</Text>
      </View>
    );
  }

  const price = calculatePrice(productVm.product, productVm.price.promotion ? [productVm.price.promotion] : []);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{productVm.product.name}</Text>
      <Text style={styles.muted}>SKU {productVm.product.sku}</Text>
      <Text style={styles.body}>{productVm.product.description}</Text>
      <Text style={styles.price}>{formatCurrency(price.effectivePrice, currency)}</Text>
      {price.discount > 0 ? <Text style={styles.muted}>Antes {formatCurrency(price.basePrice, currency)}. Descuento {formatCurrency(price.discount, currency)}</Text> : null}
      <Text style={styles.body}>{productVm.available ? `Disponible: ${productVm.availableQuantity}` : "No disponible"}</Text>
      <Text style={styles.sectionTitle}>Cantidad</Text>
      <View style={styles.row}>
        <Pressable onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.smallButton}>
          <Text>-</Text>
        </Pressable>
        <Text style={styles.body}>{quantity}</Text>
        <Pressable onPress={() => setQuantity(Math.min(productVm.availableQuantity, quantity + 1))} style={styles.smallButton}>
          <Text>+</Text>
        </Pressable>
      </View>
      <Pressable onPress={handleFavorite} style={styles.secondaryButton}>
        <Text>{productVm.isFavorite ? "Quitar favorito" : "Agregar favorito"}</Text>
      </Pressable>
      <Pressable disabled={!productVm.available} onPress={handleAdd} style={[styles.primaryButton, !productVm.available ? styles.disabled : null]}>
        <Text style={styles.primaryText}>Agregar al carrito</Text>
      </Pressable>
      {message ? <Text style={styles.success}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { color: colors.text, fontSize: typography.body },
  categoryPill: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, marginRight: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  categorySelected: { backgroundColor: colors.accent },
  categoryText: { color: colors.text },
  content: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  disabled: { opacity: 0.45 },
  empty: { color: colors.textMuted, textAlign: "center" },
  error: { color: colors.danger },
  header: { gap: spacing.md },
  input: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, color: colors.text, minHeight: 44, paddingHorizontal: spacing.md },
  loading: { flex: 1 },
  muted: { color: colors.textMuted },
  price: { color: colors.text, fontSize: typography.subtitle, fontWeight: "700" },
  primaryButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 8, minHeight: 48, justifyContent: "center" },
  primaryText: { color: colors.surface, fontWeight: "700" },
  row: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  secondaryButton: { alignItems: "center", borderColor: colors.border, borderRadius: 8, borderWidth: 1, minHeight: 44, justifyContent: "center" },
  sectionTitle: { color: colors.text, fontSize: typography.subtitle, fontWeight: "700" },
  smallButton: { alignItems: "center", borderColor: colors.border, borderRadius: 8, borderWidth: 1, height: 40, justifyContent: "center", width: 40 },
  success: { color: colors.success },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "700" },
});
