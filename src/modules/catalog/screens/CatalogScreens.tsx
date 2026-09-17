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

import { calculatePrice } from "../application/pricing";
import { ProductCard } from "../components/ProductCard";
import { useCommerceCatalog } from "../hooks/useCommerceCatalog";

export function CategoriesScreen() {
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    params.categoryId,
  );
  const [query, setQuery] = useState("");

  const { addToCart, categories, currency, error, isLoading, products } =
    useCommerceCatalog(selectedCategoryId, query);

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
        <ProductCard currency={currency} item={item} onAddToCart={addToCart} />
      )}
    />
  );
}

export function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, currency, isLoading, products } = useCommerceCatalog();
  const productVm = products.find((item) => item.product.id === id);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  async function handleAdd() {
    if (!productVm || quantity <= 0 || !productVm.available) {
      return;
    }

    for (let index = 0; index < quantity; index += 1) {
      await addToCart(productVm.product.id);
    }

    setMessage(
      quantity === 1
        ? "Producto agregado al carrito."
        : `${quantity} productos agregados al carrito.`,
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingIcon}>
          <Ionicons
            color={productPalette.deepBlue}
            name="bag-handle-outline"
            size={28}
          />
        </View>

        <ActivityIndicator color={productPalette.deepBlue} size="large" />

        <Text style={styles.loadingText}>Preparando producto...</Text>
      </View>
    );
  }

  if (!productVm) {
    return (
      <View style={styles.notFoundScreen}>
        <View style={styles.notFoundIcon}>
          <Ionicons
            color={productPalette.deepBlue}
            name="cube-outline"
            size={38}
          />
        </View>

        <Text style={styles.notFoundTitle}>Producto no encontrado</Text>

        <Text style={styles.notFoundText}>
          No pudimos encontrar la información de este producto.
        </Text>
      </View>
    );
  }

  const price = calculatePrice(
    productVm.product,
    productVm.price.promotion ? [productVm.price.promotion] : [],
  );

  const selectedImage =
    productVm.images[selectedImageIndex] ?? productVm.primaryImage;

  const discountPercentage =
    price.discount > 0 && price.basePrice > 0
      ? Math.round((price.discount / price.basePrice) * 100)
      : 0;

  const canDecrease = quantity > 1;
  const canIncrease =
    productVm.available && quantity < productVm.availableQuantity;

  return (
    <ScrollView
      contentContainerStyle={styles.productContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.productHero}>
        <View style={styles.heroBubbleOne} />
        <View style={styles.heroBubbleTwo} />

        <View style={styles.productHeroTop}>
          <View>
            <Text style={styles.productEyebrow}>FERREPHARMA</Text>
            <Text style={styles.productHeroTitle}>Detalle del producto</Text>
          </View>

          <View style={styles.productHeroIcon}>
            <Ionicons
              color={productPalette.deepBlue}
              name="cube-outline"
              size={23}
            />
          </View>
        </View>

        <Text style={styles.productHeroSubtitle}>
          Todo lo que necesitas saber antes de agregarlo a tu compra.
        </Text>
      </View>

      <View style={styles.productBody}>
        <View style={styles.imageCard}>
          <View style={styles.imageTopRow}>
            <View
              style={[
                styles.availabilityBadge,
                !productVm.available ? styles.availabilityBadgeOut : null,
              ]}
            >
              <View
                style={[
                  styles.availabilityDot,
                  !productVm.available ? styles.availabilityDotOut : null,
                ]}
              />

              <Text
                style={[
                  styles.availabilityText,
                  !productVm.available ? styles.availabilityTextOut : null,
                ]}
              >
                {productVm.available ? "Disponible" : "Agotado"}
              </Text>
            </View>

            {discountPercentage > 0 ? (
              <View style={styles.discountBadge}>
                <Ionicons
                  color={productPalette.deepBlue}
                  name="pricetag"
                  size={13}
                />
                <Text style={styles.discountBadgeText}>
                  -{discountPercentage}%
                </Text>
              </View>
            ) : null}
          </View>

          <Image
            accessibilityLabel={selectedImage.altText}
            onError={() => setImageFailed(true)}
            resizeMode="contain"
            source={
              imageFailed
                ? productVm.primaryImage.fallbackSource
                : selectedImage.source
            }
            style={styles.productImage}
          />
        </View>

        {productVm.images.length > 1 ? (
          <ScrollView
            contentContainerStyle={styles.thumbnailContent}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.mediaStrip}
          >
            {productVm.images.map((image, index) => {
              const selected = index === selectedImageIndex;

              return (
                <Pressable
                  accessibilityLabel={`Ver imagen ${index + 1} de ${productVm.product.name}`}
                  key={image.media?.id ?? `${image.altText}-${index}`}
                  onPress={() => {
                    setSelectedImageIndex(index);
                    setImageFailed(false);
                  }}
                  style={[
                    styles.thumbnailButton,
                    selected ? styles.thumbnailButtonSelected : null,
                  ]}
                >
                  <Image
                    accessibilityLabel={image.altText}
                    resizeMode="contain"
                    source={image.source}
                    style={styles.thumbnail}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        <View style={styles.productInfoCard}>
          <View style={styles.skuRow}>
            <View style={styles.skuBadge}>
              <Ionicons
                color={productPalette.deepBlue}
                name="barcode-outline"
                size={14}
              />
              <Text style={styles.skuText}>SKU {productVm.product.sku}</Text>
            </View>
          </View>

          <Text style={styles.productName}>{productVm.product.name}</Text>

          <View style={styles.priceSection}>
            <Text style={styles.productPrice}>
              {formatCurrency(price.effectivePrice, currency)}
            </Text>

            {price.discount > 0 ? (
              <View style={styles.oldPriceRow}>
                <Text style={styles.oldPrice}>
                  {formatCurrency(price.basePrice, currency)}
                </Text>

                <View style={styles.savingsPill}>
                  <Text style={styles.savingsText}>
                    Ahorras {formatCurrency(price.discount, currency)}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.priceCaption}>Precio actual</Text>
            )}
          </View>
        </View>

        <View style={styles.descriptionCard}>
          <View style={styles.cardHeadingRow}>
            <View style={styles.cardHeadingIcon}>
              <Ionicons
                color={productPalette.deepBlue}
                name="document-text-outline"
                size={19}
              />
            </View>

            <View style={styles.cardHeadingText}>
              <Text style={styles.cardTitle}>Descripción</Text>
              <Text style={styles.cardSubtitle}>
                Información del producto
              </Text>
            </View>
          </View>

          <Text style={styles.descriptionText}>
            {productVm.product.description}
          </Text>
        </View>

        <View style={styles.purchaseCard}>
          <View style={styles.purchaseHeader}>
            <View>
              <Text style={styles.cardTitle}>Elige la cantidad</Text>
              <Text style={styles.cardSubtitle}>
                Selecciona cuánto deseas agregar
              </Text>
            </View>

            <View style={styles.quantityIcon}>
              <Ionicons
                color={productPalette.deepBlue}
                name="basket-outline"
                size={20}
              />
            </View>
          </View>

          <View style={styles.quantityRow}>
            <Pressable
              accessibilityLabel="Disminuir cantidad"
              disabled={!canDecrease}
              onPress={() => {
                setQuantity((current) => Math.max(1, current - 1));
                setMessage(null);
              }}
              style={({ pressed }) => [
                styles.quantityButton,
                !canDecrease ? styles.quantityButtonDisabled : null,
                pressed && canDecrease ? styles.pressed : null,
              ]}
            >
              <Ionicons
                color={
                  canDecrease
                    ? productPalette.deepBlue
                    : productPalette.muted
                }
                name="remove"
                size={22}
              />
            </Pressable>

            <View style={styles.quantityValue}>
              <Text style={styles.quantityNumber}>{quantity}</Text>
              <Text style={styles.quantityLabel}>
                {quantity === 1 ? "unidad" : "unidades"}
              </Text>
            </View>

            <Pressable
              accessibilityLabel="Aumentar cantidad"
              disabled={!canIncrease}
              onPress={() => {
                setQuantity((current) =>
                  Math.min(productVm.availableQuantity, current + 1),
                );
                setMessage(null);
              }}
              style={({ pressed }) => [
                styles.quantityButton,
                !canIncrease ? styles.quantityButtonDisabled : null,
                pressed && canIncrease ? styles.pressed : null,
              ]}
            >
              <Ionicons
                color={
                  canIncrease
                    ? productPalette.deepBlue
                    : productPalette.muted
                }
                name="add"
                size={22}
              />
            </Pressable>
          </View>

          <View style={styles.purchaseDivider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total estimado</Text>
              <Text style={styles.totalCaption}>
                {quantity} {quantity === 1 ? "producto" : "productos"}
              </Text>
            </View>

            <Text style={styles.totalPrice}>
              {formatCurrency(price.effectivePrice * quantity, currency)}
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Agregar al carrito"
            disabled={!productVm.available}
            onPress={handleAdd}
            style={({ pressed }) => [
              styles.addButton,
              !productVm.available ? styles.addButtonDisabled : null,
              pressed && productVm.available ? styles.addButtonPressed : null,
            ]}
          >
            <View style={styles.addButtonIcon}>
              <Ionicons
                color={productPalette.deepBlue}
                name="cart-outline"
                size={20}
              />
            </View>

            <Text style={styles.addButtonText}>
              {productVm.available ? "Agregar al carrito" : "Producto agotado"}
            </Text>

            {productVm.available ? (
              <Ionicons
                color={productPalette.white}
                name="arrow-forward"
                size={19}
              />
            ) : null}
          </Pressable>

          {message ? (
            <View style={styles.successMessage}>
              <View style={styles.successIcon}>
                <Ionicons
                  color={productPalette.success}
                  name="checkmark"
                  size={16}
                />
              </View>

              <Text style={styles.successText}>{message}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.serviceStrip}>
          <View style={styles.serviceItem}>
            <Ionicons
              color={productPalette.deepBlue}
              name="shield-checkmark-outline"
              size={20}
            />
            <Text style={styles.serviceText}>Compra segura</Text>
          </View>

          <View style={styles.serviceSeparator} />

          <View style={styles.serviceItem}>
            <Ionicons
              color={productPalette.deepBlue}
              name="bag-check-outline"
              size={20}
            />
            <Text style={styles.serviceText}>Compra fácil</Text>
          </View>
        </View>
      </View>
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
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
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
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  heroDescription: {
    color: "#EAF1F8",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    maxWidth: "90%",
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
    fontSize: 18,
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

const productPalette = {
  deepBlue: "#3E668F",
  dreamyBlue: "#81A9EE",
  silkyLilac: "#AAB4E7",
  butterHoney: "#FFDB83",
  vanillaMilk: "#FFF2D0",
  white: "#FFFFFF",
  text: "#172033",
  muted: "#687286",
  border: "#DDE3EE",
  success: "#2E7D5A",
  danger: "#B94343",
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
  },

  loadingScreen: {
    alignItems: "center",
    backgroundColor: productPalette.vanillaMilk,
    flex: 1,
    gap: 14,
    justifyContent: "center",
  },

  loadingIcon: {
    alignItems: "center",
    backgroundColor: productPalette.white,
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    width: 52,
  },

  loadingText: {
    color: productPalette.deepBlue,
    fontSize: 13,
    fontWeight: "800",
  },

  notFoundScreen: {
    alignItems: "center",
    backgroundColor: productPalette.vanillaMilk,
    flex: 1,
    justifyContent: "center",
    padding: 28,
  },

  notFoundIcon: {
    alignItems: "center",
    backgroundColor: productPalette.white,
    borderRadius: 36,
    height: 72,
    justifyContent: "center",
    marginBottom: 18,
    width: 72,
  },

  notFoundTitle: {
    color: productPalette.text,
    fontSize: 23,
    fontWeight: "900",
  },

  notFoundText: {
    color: productPalette.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },

  productContent: {
    backgroundColor: productPalette.vanillaMilk,
    flexGrow: 1,
    paddingBottom: 34,
  },

  productHero: {
    backgroundColor: productPalette.deepBlue,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    minHeight: 132,
    overflow: "hidden",
    paddingBottom: 16,
    paddingHorizontal: 18,
    paddingTop: 30,
  },

  heroBubbleOne: {
    backgroundColor: productPalette.dreamyBlue,
    borderRadius: 100,
    height: 180,
    opacity: 0.15,
    position: "absolute",
    right: -60,
    top: -70,
    width: 180,
  },

  heroBubbleTwo: {
    backgroundColor: productPalette.butterHoney,
    borderRadius: 70,
    bottom: -60,
    height: 130,
    opacity: 0.14,
    position: "absolute",
    right: 65,
    width: 130,
  },

  productHeroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  productEyebrow: {
    color: productPalette.butterHoney,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  productHeroTitle: {
    color: productPalette.white,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
  },

  productHeroSubtitle: {
    color: "#EAF1F8",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    maxWidth: "90%",
  },

  productHeroIcon: {
    alignItems: "center",
    backgroundColor: productPalette.white,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  productBody: {
    gap: 9,
    marginTop: -8,
    paddingHorizontal: 12,
  },

  imageCard: {
    backgroundColor: productPalette.white,
    borderColor: "#E5E9F0",
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 184,
    overflow: "hidden",
    padding: 10,
  },

  imageTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },

  availabilityBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EAF6EF",
    borderRadius: 14,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  availabilityBadgeOut: {
    backgroundColor: "#FCECEC",
  },

  availabilityDot: {
    backgroundColor: productPalette.success,
    borderRadius: 4,
    height: 8,
    width: 8,
  },

  availabilityDotOut: {
    backgroundColor: productPalette.danger,
  },

  availabilityText: {
    color: productPalette.success,
    fontSize: 11,
    fontWeight: "900",
  },

  availabilityTextOut: {
    color: productPalette.danger,
  },

  discountBadge: {
    alignItems: "center",
    backgroundColor: productPalette.butterHoney,
    borderRadius: 20,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  discountBadgeText: {
    color: productPalette.deepBlue,
    fontSize: 11,
    fontWeight: "900",
  },

  productImage: {
    alignSelf: "center",
    height: 145,
    marginTop: -2,
    width: "92%",
  },

  mediaStrip: {
    flexGrow: 0,
  },

  thumbnailContent: {
    gap: 9,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },

  thumbnailButton: {
    alignItems: "center",
    backgroundColor: productPalette.white,
    borderColor: productPalette.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 70,
    justifyContent: "center",
    overflow: "hidden",
    width: 70,
  },

  thumbnailButtonSelected: {
    borderColor: productPalette.deepBlue,
    borderWidth: 2,
  },

  thumbnail: {
    height: 58,
    width: 58,
  },

  productInfoCard: {
    backgroundColor: productPalette.white,
    borderColor: "#E5E9F0",
    borderRadius: 17,
    borderWidth: 1,
    padding: 12,
  },

  skuRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 6,
  },

  skuBadge: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 9,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  skuText: {
    color: productPalette.deepBlue,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  productName: {
    color: productPalette.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 22,
  },

  priceSection: {
    borderTopColor: "#EEF1F5",
    borderTopWidth: 1,
    marginTop: 6,
    paddingTop: 6,
  },

  productPrice: {
    color: productPalette.deepBlue,
    fontSize: 23,
    fontWeight: "900",
  },

  oldPriceRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 7,
  },

  oldPrice: {
    color: productPalette.muted,
    fontSize: 13,
    textDecorationLine: "line-through",
  },

  savingsPill: {
    backgroundColor: "#FFF4D6",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  savingsText: {
    color: productPalette.deepBlue,
    fontSize: 10,
    fontWeight: "800",
  },

  priceCaption: {
    color: productPalette.muted,
    fontSize: 11,
    marginTop: 4,
  },

  descriptionCard: {
    backgroundColor: productPalette.white,
    borderColor: "#E5E9F0",
    borderRadius: 17,
    borderWidth: 1,
    padding: 12,
  },

  cardHeadingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  cardHeadingIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 8,
    height: 28,
    justifyContent: "center",
    width: 28,
  },

  cardHeadingText: {
    flex: 1,
  },

  cardTitle: {
    color: productPalette.text,
    fontSize: 15,
    fontWeight: "900",
  },

  cardSubtitle: {
    color: productPalette.muted,
    fontSize: 11,
    marginTop: 2,
  },

  descriptionText: {
    color: productPalette.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
  },

  purchaseCard: {
    backgroundColor: productPalette.white,
    borderColor: "#E5E9F0",
    borderRadius: 17,
    borderWidth: 1,
    padding: 12,
  },

  purchaseHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  quantityIcon: {
    alignItems: "center",
    backgroundColor: "#FFF4D6",
    borderRadius: 8,
    height: 28,
    justifyContent: "center",
    width: 28,
  },

  quantityRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },

  quantityButton: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderColor: "#DCE4ED",
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  quantityButtonDisabled: {
    opacity: 0.4,
  },

  quantityValue: {
    alignItems: "center",
    minWidth: 70,
  },

  quantityNumber: {
    color: productPalette.text,
    fontSize: 18,
    fontWeight: "900",
  },

  quantityLabel: {
    color: productPalette.muted,
    fontSize: 10,
    marginTop: 1,
  },

  purchaseDivider: {
    backgroundColor: "#EEF1F5",
    height: 1,
    marginVertical: 7,
  },

  totalRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  totalLabel: {
    color: productPalette.text,
    fontSize: 13,
    fontWeight: "800",
  },

  totalCaption: {
    color: productPalette.muted,
    fontSize: 10,
    marginTop: 2,
  },

  totalPrice: {
    color: productPalette.deepBlue,
    fontSize: 18,
    fontWeight: "900",
  },

  addButton: {
    alignItems: "center",
    backgroundColor: productPalette.deepBlue,
    borderRadius: 14,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 8,
    minHeight: 46,
    paddingHorizontal: 12,
  },

  addButtonDisabled: {
    backgroundColor: productPalette.silkyLilac,
  },

  addButtonPressed: {
    opacity: 0.86,
  },

  addButtonIcon: {
    alignItems: "center",
    backgroundColor: productPalette.butterHoney,
    borderRadius: 8,
    height: 28,
    justifyContent: "center",
    width: 28,
  },

  addButtonText: {
    color: productPalette.white,
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },

  successMessage: {
    alignItems: "center",
    backgroundColor: "#EAF6EF",
    borderRadius: 13,
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  successIcon: {
    alignItems: "center",
    backgroundColor: productPalette.white,
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    width: 24,
  },

  successText: {
    color: productPalette.success,
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
  },

  serviceStrip: {
    alignItems: "center",
    backgroundColor: "#E8EEF7",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  serviceItem: {
    alignItems: "center",
    flex: 1,
    gap: 6,
  },

  serviceSeparator: {
    backgroundColor: "#CAD4E0",
    height: 30,
    width: 1,
  },

  serviceText: {
    color: productPalette.deepBlue,
    fontSize: 10,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.72,
  },
});

