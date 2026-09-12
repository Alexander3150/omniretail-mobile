import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { formatCurrency } from "@/shared";
import { colors, spacing, typography } from "@/theme";

import { calculatePrice } from "../application/pricing";
import { ProductCard } from "../components/ProductCard";
import { useCommerceCatalog } from "../hooks/useCommerceCatalog";

export function CategoriesScreen() {
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    params.categoryId,
  );
  const [query, setQuery] = useState("");

  const {
    addToCart,
    categories,
    currency,
    error,
    isLoading,
    products,
    toggleFavorite,
  } = useCommerceCatalog(selectedCategoryId, query);

  if (isLoading) {
    return (
      <View style={categoryStyles.loadingContainer}>
        <ActivityIndicator color={categoryPalette.deepBlue} size="large" />
        <Text style={categoryStyles.loadingText}>Preparando catálogo...</Text>
      </View>
    );
  }

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );

  return (
    <FlatList
      contentContainerStyle={categoryStyles.content}
      data={products}
      keyExtractor={(item) => item.product.id}
      ListHeaderComponent={
        <>
          <View style={categoryStyles.hero}>
            <View style={categoryStyles.decorationOne} />
            <View style={categoryStyles.decorationTwo} />

            <View style={categoryStyles.heroTop}>
              <View style={categoryStyles.heroText}>
                <Text style={categoryStyles.brand}>FERREPHARMA</Text>

                <Text style={categoryStyles.heroTitle}>Categorías</Text>
              </View>

              <View style={categoryStyles.heroIcon}>
                <Ionicons
                  color={categoryPalette.deepBlue}
                  name="grid-outline"
                  size={23}
                />
              </View>
            </View>

            <Text style={categoryStyles.heroDescription}>
              Encuentra productos para tu hogar, proyectos y cuidado diario.
            </Text>

            <View style={categoryStyles.searchBox}>
              <Ionicons
                color={categoryPalette.deepBlue}
                name="search-outline"
                size={20}
              />

              <TextInput
                onChangeText={setQuery}
                placeholder="¿Qué estás buscando?"
                placeholderTextColor={categoryPalette.muted}
                style={categoryStyles.searchInput}
                value={query}
              />

              {query.length > 0 ? (
                <Pressable
                  accessibilityLabel="Limpiar búsqueda"
                  onPress={() => setQuery("")}
                  style={categoryStyles.clearButton}
                >
                  <Ionicons
                    color={categoryPalette.deepBlue}
                    name="close"
                    size={17}
                  />
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={categoryStyles.catalogHeader}>
            <View style={categoryStyles.catalogTitleRow}>
              <View>
                <Text style={categoryStyles.eyebrow}>EXPLORA</Text>

                <Text style={categoryStyles.sectionTitle}>
                  Nuestro catálogo
                </Text>
              </View>

              <View style={categoryStyles.resultBadge}>
                <Text style={categoryStyles.resultNumber}>
                  {products.length}
                </Text>
                <Text style={categoryStyles.resultLabel}>productos</Text>
              </View>
            </View>

            {error ? (
              <View style={categoryStyles.errorBox}>
                <Ionicons
                  color={categoryPalette.danger}
                  name="alert-circle-outline"
                  size={17}
                />
                <Text style={categoryStyles.errorText}>{error}</Text>
              </View>
            ) : null}

            <ScrollView
              contentContainerStyle={categoryStyles.pillsContent}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={categoryStyles.pillsScroll}
            >
              <Pressable
                onPress={() => setSelectedCategoryId(undefined)}
                style={[
                  categoryStyles.categoryPill,
                  !selectedCategoryId ? categoryStyles.categorySelected : null,
                ]}
              >
                <Ionicons
                  color={
                    !selectedCategoryId
                      ? categoryPalette.white
                      : categoryPalette.deepBlue
                  }
                  name="apps-outline"
                  size={15}
                />

                <Text
                  style={[
                    categoryStyles.categoryText,
                    !selectedCategoryId
                      ? categoryStyles.categoryTextSelected
                      : null,
                  ]}
                >
                  Todas
                </Text>
              </Pressable>

              {categories.map((category) => {
                const selected = selectedCategoryId === category.id;

                return (
                  <Pressable
                    key={category.id}
                    onPress={() => setSelectedCategoryId(category.id)}
                    style={[
                      categoryStyles.categoryPill,
                      selected ? categoryStyles.categorySelected : null,
                    ]}
                  >
                    <Ionicons
                      color={
                        selected
                          ? categoryPalette.white
                          : categoryPalette.deepBlue
                      }
                      name="pricetag-outline"
                      size={14}
                    />

                    <Text
                      style={[
                        categoryStyles.categoryText,
                        selected ? categoryStyles.categoryTextSelected : null,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={categoryStyles.filterSummary}>
              <Ionicons
                color={categoryPalette.deepBlue}
                name="options-outline"
                size={16}
              />

              <Text style={categoryStyles.filterSummaryText}>
                {selectedCategory
                  ? `Mostrando ${selectedCategory.name}`
                  : "Mostrando todas las categorías"}
              </Text>
            </View>
          </View>
        </>
      }
      ListEmptyComponent={
        <View style={categoryStyles.emptyCard}>
          <View style={categoryStyles.emptyIcon}>
            <Ionicons
              color={categoryPalette.deepBlue}
              name="search-outline"
              size={35}
            />
          </View>

          <Text style={categoryStyles.emptyTitle}>
            No encontramos productos
          </Text>

          <Text style={categoryStyles.emptyDescription}>
            Prueba con otra búsqueda o selecciona una categoría diferente.
          </Text>

          <Pressable
            onPress={() => {
              setQuery("");
              setSelectedCategoryId(undefined);
            }}
            style={categoryStyles.resetButton}
          >
            <Text style={categoryStyles.resetButtonText}>
              Ver todo el catálogo
            </Text>
          </Pressable>
        </View>
      }
      renderItem={({ item }) => (
        <ProductCard
          currency={currency}
          item={item}
          onAddToCart={addToCart}
          onToggleFavorite={toggleFavorite}
        />
      )}
    />
  );
}

export function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, currency, isLoading, products, reload, toggleFavorite } =
    useCommerceCatalog();
  const productVm = products.find((item) => item.product.id === id);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

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

  const price = calculatePrice(
    productVm.product,
    productVm.price.promotion ? [productVm.price.promotion] : [],
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Image
        accessibilityLabel={productVm.primaryImage.altText}
        onError={() => setImageFailed(true)}
        source={
          imageFailed
            ? productVm.primaryImage.fallbackSource
            : productVm.primaryImage.source
        }
        style={styles.detailImage}
      />
      {productVm.images.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.mediaStrip}
        >
          {productVm.images.map((image) => (
            <Image
              accessibilityLabel={image.altText}
              key={image.media?.id ?? image.altText}
              source={image.source}
              style={styles.thumbnail}
            />
          ))}
        </ScrollView>
      ) : null}
      <Text style={styles.title}>{productVm.product.name}</Text>
      <Text style={styles.muted}>SKU {productVm.product.sku}</Text>
      <Text style={styles.body}>{productVm.product.description}</Text>
      <Text style={styles.price}>
        {formatCurrency(price.effectivePrice, currency)}
      </Text>
      {price.discount > 0 ? (
        <Text style={styles.muted}>
          Antes {formatCurrency(price.basePrice, currency)}. Descuento{" "}
          {formatCurrency(price.discount, currency)}
        </Text>
      ) : null}
      <Text style={styles.body}>
        {productVm.available
          ? `Disponible: ${productVm.availableQuantity}`
          : "No disponible"}
      </Text>
      <Text style={styles.sectionTitle}>Cantidad</Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
          style={styles.smallButton}
        >
          <Text>-</Text>
        </Pressable>
        <Text style={styles.body}>{quantity}</Text>
        <Pressable
          onPress={() =>
            setQuantity(Math.min(productVm.availableQuantity, quantity + 1))
          }
          style={styles.smallButton}
        >
          <Text>+</Text>
        </Pressable>
      </View>
      <Pressable onPress={handleFavorite} style={styles.secondaryButton}>
        <Text>
          {productVm.isFavorite ? "Quitar favorito" : "Agregar favorito"}
        </Text>
      </Pressable>
      <Pressable
        disabled={!productVm.available}
        onPress={handleAdd}
        style={[
          styles.primaryButton,
          !productVm.available ? styles.disabled : null,
        ]}
      >
        <Text style={styles.primaryText}>Agregar al carrito</Text>
      </Pressable>
      {message ? <Text style={styles.success}>{message}</Text> : null}
    </ScrollView>
  );
}

const categoryPalette = {
  deepBlue: "#3E668F",
  dreamyBlue: "#81A9EE",
  silkyLilac: "#AAB4E7",
  butterHoney: "#FFDB83",
  vanillaMilk: "#FFF2D0",
  white: "#FFFFFF",
  text: "#172033",
  muted: "#687286",
  border: "#DDE3EE",
  danger: "#B94343",
};

const categoryStyles = StyleSheet.create({
  content: {
    backgroundColor: categoryPalette.vanillaMilk,
    flexGrow: 1,
    paddingBottom: 32,
  },

  loadingContainer: {
    alignItems: "center",
    backgroundColor: categoryPalette.vanillaMilk,
    flex: 1,
    gap: 10,
    justifyContent: "center",
  },

  loadingText: {
    color: categoryPalette.deepBlue,
    fontSize: 12,
    fontWeight: "800",
  },

  hero: {
    backgroundColor: categoryPalette.deepBlue,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
    minHeight: 235,
    overflow: "hidden",
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 44,
  },

  decorationOne: {
    backgroundColor: categoryPalette.dreamyBlue,
    borderRadius: 120,
    height: 190,
    opacity: 0.17,
    position: "absolute",
    right: -55,
    top: -55,
    width: 190,
  },

  decorationTwo: {
    backgroundColor: categoryPalette.butterHoney,
    borderRadius: 60,
    bottom: -45,
    height: 115,
    opacity: 0.16,
    position: "absolute",
    right: 55,
    width: 115,
  },

  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  heroText: {
    flex: 1,
  },

  brand: {
    color: categoryPalette.butterHoney,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.8,
  },

  heroTitle: {
    color: categoryPalette.white,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 3,
  },

  heroIcon: {
    alignItems: "center",
    backgroundColor: categoryPalette.white,
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  heroDescription: {
    color: "#EAF1F8",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    maxWidth: "82%",
  },

  searchBox: {
    alignItems: "center",
    backgroundColor: categoryPalette.white,
    borderRadius: 15,
    flexDirection: "row",
    gap: 9,
    marginTop: 17,
    minHeight: 50,
    paddingHorizontal: 14,
  },

  searchInput: {
    color: categoryPalette.text,
    flex: 1,
    fontSize: 13,
    minHeight: 50,
  },

  clearButton: {
    alignItems: "center",
    backgroundColor: "#EEF3FB",
    borderRadius: 10,
    height: 30,
    justifyContent: "center",
    width: 30,
  },

  catalogHeader: {
    marginBottom: 12,
  },

  catalogTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  eyebrow: {
    color: categoryPalette.dreamyBlue,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  sectionTitle: {
    color: categoryPalette.text,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 2,
  },

  resultBadge: {
    alignItems: "center",
    backgroundColor: categoryPalette.butterHoney,
    borderRadius: 13,
    minWidth: 62,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  resultNumber: {
    color: categoryPalette.deepBlue,
    fontSize: 14,
    fontWeight: "900",
  },

  resultLabel: {
    color: categoryPalette.deepBlue,
    fontSize: 8,
    fontWeight: "700",
  },

  errorBox: {
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    flexDirection: "row",
    gap: 7,
    marginHorizontal: 18,
    marginTop: 12,
    padding: 11,
  },

  errorText: {
    color: categoryPalette.danger,
    flex: 1,
    fontSize: 11,
  },

  pillsScroll: {
    flexGrow: 0,
    marginTop: 15,
  },

  pillsContent: {
    paddingHorizontal: 18,
  },

  categoryPill: {
    alignItems: "center",
    backgroundColor: categoryPalette.white,
    borderColor: categoryPalette.silkyLilac,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    marginRight: 8,
    minHeight: 37,
    paddingHorizontal: 12,
  },

  categorySelected: {
    backgroundColor: categoryPalette.deepBlue,
    borderColor: categoryPalette.deepBlue,
  },

  categoryText: {
    color: categoryPalette.deepBlue,
    fontSize: 11,
    fontWeight: "800",
  },

  categoryTextSelected: {
    color: categoryPalette.white,
  },

  filterSummary: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginHorizontal: 19,
    marginTop: 13,
  },

  filterSummaryText: {
    color: categoryPalette.muted,
    fontSize: 10,
    fontWeight: "600",
  },

  emptyCard: {
    alignItems: "center",
    backgroundColor: categoryPalette.white,
    borderColor: categoryPalette.silkyLilac,
    borderRadius: 22,
    borderWidth: 1,
    marginHorizontal: 18,
    marginTop: 8,
    padding: 28,
  },

  emptyIcon: {
    alignItems: "center",
    backgroundColor: categoryPalette.butterHoney,
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    width: 68,
  },

  emptyTitle: {
    color: categoryPalette.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 17,
  },

  emptyDescription: {
    color: categoryPalette.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    textAlign: "center",
  },

  resetButton: {
    backgroundColor: categoryPalette.deepBlue,
    borderRadius: 12,
    marginTop: 17,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  resetButtonText: {
    color: categoryPalette.white,
    fontSize: 11,
    fontWeight: "900",
  },
});

const styles = StyleSheet.create({
  body: { color: colors.text, fontSize: typography.body },
  categoryPill: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categorySelected: { backgroundColor: colors.accent },
  categoryText: { color: colors.text },
  content: {
    backgroundColor: colors.background,
    gap: spacing.md,
    padding: spacing.md,
  },
  detailImage: {
    backgroundColor: colors.border,
    borderRadius: 8,
    height: 220,
    width: "100%",
  },
  disabled: { opacity: 0.45 },
  empty: { color: colors.textMuted, textAlign: "center" },
  error: { color: colors.danger },
  header: { gap: spacing.md },
  input: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  loading: { flex: 1 },
  mediaStrip: { flexGrow: 0 },
  muted: { color: colors.textMuted },
  price: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "700",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center",
  },
  primaryText: { color: colors.surface, fontWeight: "700" },
  row: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "700",
  },
  smallButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  success: { color: colors.success },
  thumbnail: {
    backgroundColor: colors.border,
    borderRadius: 8,
    height: 64,
    marginRight: spacing.sm,
    width: 64,
  },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "700" },
});
