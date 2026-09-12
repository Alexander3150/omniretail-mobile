import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSession } from "@/modules/auth";
import { ProductCard, useCommerceCatalog } from "@/modules/catalog";

const palette = {
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
  success: "#247A52",
};

export function HomeScreen() {
  const { customer } = useSession();
  const [query, setQuery] = useState("");
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerListRef = useRef<FlatList<(typeof homeBanners)[number]>>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((current) => {
        const next = (current + 1) % homeBanners.length;

        bannerListRef.current?.scrollToIndex({
          animated: true,
          index: next,
        });

        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const {
    addToCart,
    businessName,
    categories,
    currency,
    error,
    isLoading,
    products,
    toggleFavorite,
  } = useCommerceCatalog(undefined, query);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={palette.deepBlue} size="large" />
        <Text style={styles.loadingText}>Preparando FerrePharma...</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={products}
      keyExtractor={(item) => item.product.id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <View style={styles.hero}>
            <View style={styles.heroDecorationOne} />
            <View style={styles.heroDecorationTwo} />

            <View style={styles.welcomeRow}>
              <View style={styles.welcomeText}>
                <Text style={styles.brand}>FERREPHARMA</Text>

                <Text style={styles.greeting}>
                  Hola, {customer?.name ?? "cliente"}
                </Text>

                <View style={styles.businessRow}>
                  <Ionicons
                    color={palette.butterHoney}
                    name="storefront-outline"
                    size={14}
                  />
                  <Text style={styles.businessName}>{businessName}</Text>
                </View>
              </View>

              <Link asChild href="/(protected)/notifications">
                <Pressable
                  style={({ pressed }) => [
                    styles.notificationButton,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Ionicons
                    color={palette.deepBlue}
                    name="notifications-outline"
                    size={22}
                  />

                  <View style={styles.notificationDot} />
                </Pressable>
              </Link>
            </View>

            <Text style={styles.heroDescription}>
              Todo lo que necesitas, más cerca de ti.
            </Text>

            <View style={styles.searchContainer}>
              <Ionicons
                color={palette.deepBlue}
                name="search-outline"
                size={20}
              />

              <TextInput
                onChangeText={setQuery}
                placeholder="Buscar productos o SKU"
                placeholderTextColor={palette.muted}
                returnKeyType="search"
                style={styles.input}
                value={query}
              />

              {query.length > 0 ? (
                <Pressable
                  onPress={() => setQuery("")}
                  style={styles.clearButton}
                >
                  <Ionicons color={palette.deepBlue} name="close" size={18} />
                </Pressable>
              ) : (
                <View style={styles.searchAction}>
                  <Ionicons
                    color={palette.white}
                    name="options-outline"
                    size={15}
                  />
                </View>
              )}
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons
                  color={palette.danger}
                  name="alert-circle-outline"
                  size={17}
                />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}
          </View>

          {!query.trim() ? (
            <>
              <View style={styles.carouselSection}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.eyebrow}>PARA TI</Text>
                    <Text style={styles.sectionTitle}>
                      Descubre FerrePharma
                    </Text>
                  </View>

                  <View style={styles.sparkleIcon}>
                    <Ionicons
                      color={palette.deepBlue}
                      name="sparkles-outline"
                      size={18}
                    />
                  </View>
                </View>

                <FlatList
                  ref={bannerListRef}
                  data={homeBanners}
                  horizontal
                  keyExtractor={(item) => item.id}
                  onMomentumScrollEnd={(event) => {
                    const index = Math.round(
                      event.nativeEvent.contentOffset.x / BANNER_WIDTH,
                    );
                    setActiveBanner(index);
                  }}
                  getItemLayout={(_, index) => ({
                    index,
                    length: BANNER_WIDTH,
                    offset: BANNER_WIDTH * index,
                  })}
                  pagingEnabled
                  renderItem={({ item, index }) => (
                    <View style={[styles.bannerOuter, { width: BANNER_WIDTH }]}>
                      <View
                        style={[
                          styles.promoCard,
                          index === 1 ? styles.promoCardLight : null,
                        ]}
                      >
                        <View style={styles.bannerCircleOne} />
                        <View style={styles.bannerCircleTwo} />

                        <View style={styles.promoContent}>
                          <View style={styles.promoLabelRow}>
                            <Ionicons
                              color={
                                index === 1
                                  ? palette.deepBlue
                                  : palette.butterHoney
                              }
                              name={item.smallIcon}
                              size={13}
                            />

                            <Text
                              style={[
                                styles.promoLabel,
                                index === 1 ? styles.promoLabelLight : null,
                              ]}
                            >
                              {item.label}
                            </Text>
                          </View>

                          <Text
                            style={[
                              styles.promoTitle,
                              index === 1 ? styles.promoTitleLight : null,
                            ]}
                          >
                            {item.title}
                          </Text>

                          <Text
                            style={[
                              styles.promoDescription,
                              index === 1 ? styles.promoDescriptionLight : null,
                            ]}
                          >
                            {item.description}
                          </Text>

                          <Link asChild href={item.href}>
                            <Pressable
                              style={({ pressed }) => [
                                styles.promoButton,
                                index === 1 ? styles.promoButtonLight : null,
                                pressed ? styles.pressed : null,
                              ]}
                            >
                              <Text style={styles.promoButtonText}>
                                {item.buttonLabel}
                              </Text>

                              <Ionicons
                                color={palette.deepBlue}
                                name="arrow-forward"
                                size={14}
                              />
                            </Pressable>
                          </Link>
                        </View>

                        <View style={styles.promoGraphic}>
                          <View
                            style={[
                              styles.promoGraphicCircle,
                              index === 1
                                ? styles.promoGraphicCircleLight
                                : null,
                            ]}
                          >
                            <Ionicons
                              color={
                                index === 1 ? palette.deepBlue : palette.white
                              }
                              name={item.icon}
                              size={42}
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={BANNER_WIDTH}
                  decelerationRate="fast"
                />

                <View style={styles.pagination}>
                  {homeBanners.map((banner, index) => (
                    <View
                      key={banner.id}
                      style={[
                        styles.paginationDot,
                        index === activeBanner
                          ? styles.paginationDotActive
                          : null,
                      ]}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.categoriesSection}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.eyebrow}>EXPLORA</Text>
                    <Text style={styles.sectionTitle}>Categorías</Text>
                  </View>

                  <Link asChild href="/(protected)/(tabs)/categories">
                    <Pressable style={styles.seeAllButton}>
                      <Text style={styles.seeAll}>Ver todas</Text>
                      <Ionicons
                        color={palette.deepBlue}
                        name="chevron-forward"
                        size={15}
                      />
                    </Pressable>
                  </Link>
                </View>

                <FlatList
                  data={categories}
                  horizontal
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.categoriesContent}
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => (
                    <View style={styles.categorySeparator} />
                  )}
                  renderItem={({ item, index }) => (
                    <Link
                      asChild
                      href={{
                        pathname: "/(protected)/(tabs)/categories",
                        params: { categoryId: item.id },
                      }}
                    >
                      <Pressable
                        style={({ pressed }) => [
                          styles.categoryItem,
                          pressed ? styles.pressed : null,
                        ]}
                      >
                        <View style={styles.categoryCenter}>
                          <View
                            style={[
                              styles.categoryIconContainer,
                              index % 3 === 1 ? styles.categoryIconBlue : null,
                              index % 3 === 2 ? styles.categoryIconLilac : null,
                            ]}
                          >
                            <Ionicons
                              color={palette.deepBlue}
                              name={getCategoryIcon(item.name)}
                              size={25}
                            />
                          </View>

                          <View style={styles.categoryLabelContainer}>
                            <Text numberOfLines={2} style={styles.categoryText}>
                              {item.name}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    </Link>
                  )}
                />
              </View>
            </>
          ) : null}

          <View style={styles.productsHeader}>
            <View>
              <Text style={styles.eyebrow}>
                {query.trim() ? "BÚSQUEDA" : "SELECCIÓN"}
              </Text>

              <Text style={styles.sectionTitle}>
                {query.trim() ? "Resultados" : "Productos destacados"}
              </Text>

              <Text style={styles.sectionSubtitle}>
                {products.length}{" "}
                {products.length === 1
                  ? "producto disponible"
                  : "productos disponibles"}
              </Text>
            </View>

            <View style={styles.productsIcon}>
              <Ionicons
                color={palette.deepBlue}
                name={query.trim() ? "search-outline" : "star-outline"}
                size={19}
              />
            </View>
          </View>
        </>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              color={palette.deepBlue}
              name="search-outline"
              size={37}
            />
          </View>

          <Text style={styles.emptyTitle}>No encontramos productos</Text>

          <Text style={styles.empty}>
            Intenta buscar con otro nombre o código SKU.
          </Text>

          {query.length > 0 ? (
            <Pressable onPress={() => setQuery("")} style={styles.emptyButton}>
              <Ionicons
                color={palette.white}
                name="refresh-outline"
                size={16}
              />
              <Text style={styles.emptyButtonText}>Limpiar búsqueda</Text>
            </Pressable>
          ) : null}
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

const SCREEN_WIDTH = Dimensions.get("window").width;
const BANNER_WIDTH = SCREEN_WIDTH - 32;

type HomeIconName = "storefront-outline" | "hammer-outline" | "receipt-outline";

type HomeSmallIconName =
  "sparkles-outline" | "construct-outline" | "bag-check-outline";

const homeBanners: {
  id: string;
  label: string;
  title: string;
  description: string;
  buttonLabel: string;
  icon: HomeIconName;
  smallIcon: HomeSmallIconName;
  href:
    | "/(protected)/(tabs)/categories"
    | "/(protected)/(tabs)/orders"
    | {
        pathname: "/(protected)/(tabs)/categories";
        params: { categoryId: string };
      };
}[] = [
  {
    id: "catalog",
    label: "FERREPHARMA",
    title: "Todo lo que necesitas en un solo lugar",
    description:
      "Explora nuestro catálogo y encuentra productos para tu día a día.",
    buttonLabel: "Ver categorías",
    icon: "storefront-outline",
    smallIcon: "sparkles-outline",
    href: "/(protected)/(tabs)/categories",
  },
  {
    id: "tools",
    label: "HERRAMIENTAS",
    title: "Equipa tus proyectos",
    description:
      "Herramientas y artículos para reparaciones y trabajos en casa.",
    buttonLabel: "Explorar",
    icon: "hammer-outline",
    smallIcon: "construct-outline",
    href: {
      pathname: "/(protected)/(tabs)/categories",
      params: { categoryId: "category-tools" },
    },
  },
  {
    id: "orders",
    label: "TUS COMPRAS",
    title: "Consulta tus pedidos fácilmente",
    description: "Revisa tus compras y consulta el estado de tus pedidos.",
    buttonLabel: "Ver pedidos",
    icon: "receipt-outline",
    smallIcon: "bag-check-outline",
    href: "/(protected)/(tabs)/orders",
  },
];

function getCategoryIcon(
  name: string,
):
  | "hammer-outline"
  | "home-outline"
  | "body-outline"
  | "medkit-outline"
  | "pencil-outline"
  | "basket-outline"
  | "cube-outline" {
  const normalized = name.toLowerCase();

  if (normalized.includes("herramient")) {
    return "hammer-outline";
  }

  if (normalized.includes("hogar")) {
    return "home-outline";
  }

  if (normalized.includes("personal")) {
    return "body-outline";
  }

  if (normalized.includes("farmacia")) {
    return "medkit-outline";
  }

  if (normalized.includes("papeler")) {
    return "pencil-outline";
  }

  if (normalized.includes("despensa")) {
    return "basket-outline";
  }

  return "cube-outline";
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: "center",
    backgroundColor: palette.vanillaMilk,
    flex: 1,
    gap: 10,
    justifyContent: "center",
  },

  loadingText: {
    color: palette.deepBlue,
    fontSize: 12,
    fontWeight: "800",
  },

  content: {
    backgroundColor: palette.vanillaMilk,
    flexGrow: 1,
    paddingBottom: 34,
  },

  hero: {
    backgroundColor: palette.deepBlue,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 22,
    minHeight: 245,
    overflow: "hidden",
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 44,
  },

  heroDecorationOne: {
    backgroundColor: palette.dreamyBlue,
    borderRadius: 110,
    height: 190,
    opacity: 0.17,
    position: "absolute",
    right: -60,
    top: -60,
    width: 190,
  },

  heroDecorationTwo: {
    backgroundColor: palette.butterHoney,
    borderRadius: 60,
    bottom: -55,
    height: 120,
    opacity: 0.16,
    position: "absolute",
    right: 55,
    width: 120,
  },

  welcomeRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  welcomeText: {
    flex: 1,
    paddingRight: 12,
  },

  brand: {
    color: palette.butterHoney,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.8,
  },

  greeting: {
    color: palette.white,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 3,
  },

  businessRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 5,
  },

  businessName: {
    color: "#EAF1F8",
    fontSize: 11,
    fontWeight: "700",
  },

  notificationButton: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    position: "relative",
    width: 46,
  },

  notificationDot: {
    backgroundColor: palette.butterHoney,
    borderColor: palette.white,
    borderRadius: 6,
    borderWidth: 2,
    height: 11,
    position: "absolute",
    right: 7,
    top: 6,
    width: 11,
  },

  heroDescription: {
    color: "#EAF1F8",
    fontSize: 12,
    marginTop: 14,
  },

  searchContainer: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 15,
    flexDirection: "row",
    gap: 9,
    marginTop: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },

  input: {
    color: palette.text,
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

  searchAction: {
    alignItems: "center",
    backgroundColor: palette.deepBlue,
    borderRadius: 10,
    height: 30,
    justifyContent: "center",
    width: 30,
  },

  errorBox: {
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    borderRadius: 11,
    flexDirection: "row",
    gap: 7,
    marginTop: 10,
    padding: 9,
  },

  error: {
    color: palette.danger,
    flex: 1,
    fontSize: 10,
  },

  carouselSection: {
    marginBottom: 25,
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 13,
    paddingHorizontal: 18,
  },

  eyebrow: {
    color: palette.dreamyBlue,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  sectionTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2,
  },

  sparkleIcon: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  bannerOuter: {
    paddingHorizontal: 16,
  },

  promoCard: {
    backgroundColor: palette.deepBlue,
    borderRadius: 23,
    flexDirection: "row",
    minHeight: 205,
    overflow: "hidden",
    padding: 19,
  },

  promoCardLight: {
    backgroundColor: palette.dreamyBlue,
  },

  bannerCircleOne: {
    backgroundColor: palette.white,
    borderRadius: 70,
    height: 140,
    opacity: 0.08,
    position: "absolute",
    right: -30,
    top: -35,
    width: 140,
  },

  bannerCircleTwo: {
    backgroundColor: palette.butterHoney,
    borderRadius: 50,
    bottom: -45,
    height: 100,
    opacity: 0.15,
    position: "absolute",
    right: 60,
    width: 100,
  },

  promoContent: {
    flex: 1,
    justifyContent: "center",
    zIndex: 2,
  },

  promoLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginBottom: 7,
  },

  promoLabel: {
    color: palette.butterHoney,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  promoLabelLight: {
    color: palette.deepBlue,
  },

  promoTitle: {
    color: palette.white,
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 24,
    maxWidth: 210,
  },

  promoTitleLight: {
    color: palette.deepBlue,
  },

  promoDescription: {
    color: "#EAF1F8",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 6,
    maxWidth: 205,
  },

  promoDescriptionLight: {
    color: "#294B6D",
  },

  promoButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: palette.butterHoney,
    borderRadius: 11,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 36,
    paddingHorizontal: 12,
  },

  promoButtonLight: {
    backgroundColor: palette.white,
  },

  promoButtonText: {
    color: palette.deepBlue,
    fontSize: 9,
    fontWeight: "900",
  },

  promoGraphic: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 7,
    width: 82,
    zIndex: 2,
  },

  promoGraphicCircle: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.20)",
    borderRadius: 37,
    borderWidth: 1,
    height: 74,
    justifyContent: "center",
    width: 74,
  },

  promoGraphicCircleLight: {
    backgroundColor: "rgba(255,255,255,0.42)",
    borderColor: "rgba(255,255,255,0.60)",
  },

  pagination: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 10,
  },

  paginationDot: {
    backgroundColor: palette.silkyLilac,
    borderRadius: 4,
    height: 6,
    width: 6,
  },

  paginationDotActive: {
    backgroundColor: palette.deepBlue,
    width: 23,
  },

  categoriesSection: {
    marginBottom: 26,
  },

  seeAllButton: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.silkyLilac,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  seeAll: {
    color: palette.deepBlue,
    fontSize: 9,
    fontWeight: "900",
  },

  categoriesContent: {
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingRight: 20,
  },

  categorySeparator: {
    width: 4,
  },

  categoryItem: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: 64,
  },

  categoryCenter: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: 64,
  },

  categoryIconContainer: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#172033",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    width: 52,
    elevation: 1,
  },

  categoryLabelContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: 28,
    width: 64,
  },

  categoryText: {
    color: palette.text,
    fontSize: 9,
    fontWeight: "800",
    lineHeight: 12,
    paddingHorizontal: 0,
    textAlign: "center",
    width: 64,
  },

  categoryIconBlue: {
    backgroundColor: "#DDEBFF",
  },

  categoryIconLilac: {
    backgroundColor: "#E7E8F8",
  },

  productsHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 18,
  },

  sectionSubtitle: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 4,
  },

  productsIcon: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  emptyContainer: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.silkyLilac,
    borderRadius: 22,
    borderWidth: 1,
    marginHorizontal: 18,
    marginTop: 4,
    padding: 28,
  },

  emptyIcon: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    width: 68,
  },

  emptyTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 17,
  },

  empty: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    textAlign: "center",
  },

  emptyButton: {
    alignItems: "center",
    backgroundColor: palette.deepBlue,
    borderRadius: 12,
    flexDirection: "row",
    gap: 6,
    marginTop: 17,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },

  emptyButtonText: {
    color: palette.white,
    fontSize: 10,
    fontWeight: "900",
  },

  pressed: {
    opacity: 0.76,
  },
});
