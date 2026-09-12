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
import { colors, radius, spacing, typography } from "@/theme";

export function HomeScreen() {
  const { customer } = useSession();
  const [query, setQuery] = useState("");
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerListRef =
    useRef<FlatList<(typeof homeBanners)[number]>>(null);

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
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
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
        <View style={styles.header}>
          <View style={styles.welcomeRow}>
            <View style={styles.welcomeText}>
              <Text style={styles.greeting}>
                Hola, {customer?.name ?? "cliente"}
              </Text>
              <Text style={styles.businessName}>{businessName}</Text>
            </View>

            <Link asChild href="/(protected)/notifications">
              <Pressable style={styles.notificationButton}>
                <Text style={styles.notificationIcon}>🔔</Text>
              </Pressable>
            </Link>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>⌕</Text>

            <TextInput
              onChangeText={setQuery}
              placeholder="Buscar productos o SKU"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={query}
              returnKeyType="search"
            />

            {query.length > 0 ? (
              <Pressable onPress={() => setQuery("")} style={styles.clearButton}>
                <Text style={styles.clearText}>×</Text>
              </Pressable>
            ) : null}
          </View>

          {!query.trim() ? (
            <>
              <View>
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
                  renderItem={({ item }) => (
                    <View style={[styles.promoCard, { width: BANNER_WIDTH }]}>
                      <View style={styles.promoContent}>
                        <Text style={styles.promoLabel}>{item.label}</Text>

                        <Text style={styles.promoTitle}>
                          {item.title}
                        </Text>

                        <Text style={styles.promoDescription}>
                          {item.description}
                        </Text>

                        <Link asChild href={item.href}>
                          <Pressable style={styles.promoButton}>
                            <Text style={styles.promoButtonText}>
                              {item.buttonLabel}
                            </Text>
                          </Pressable>
                        </Link>
                      </View>

                      <View style={styles.promoGraphic}>
                        <Text style={styles.promoGraphicIcon}>
                          {item.icon}
                        </Text>
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

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categorías</Text>

                <Link asChild href="/(protected)/(tabs)/categories">
                  <Pressable>
                    <Text style={styles.seeAll}>Ver todas</Text>
                  </Pressable>
                </Link>
              </View>

              <FlatList
                data={categories}
                horizontal
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.categoriesContent}
                renderItem={({ item }) => (
                  <Link
                    asChild
                    href={{
                      pathname: "/(protected)/(tabs)/categories",
                      params: { categoryId: item.id },
                    }}
                  >
                    <Pressable style={styles.categoryCard}>
                      <View style={styles.categoryIconContainer}>
                        <Text style={styles.categoryIcon}>
                          {getCategoryIcon(item.name)}
                        </Text>
                      </View>

                      <Text
                        numberOfLines={2}
                        style={styles.categoryText}
                      >
                        {item.name}
                      </Text>
                    </Pressable>
                  </Link>
                )}
                showsHorizontalScrollIndicator={false}
              />
            </>
          ) : null}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                {query.trim() ? "Resultados" : "Productos destacados"}
              </Text>

              <Text style={styles.sectionSubtitle}>
                {products.length}{" "}
                {products.length === 1 ? "producto" : "productos"}
              </Text>
            </View>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔎</Text>
          <Text style={styles.emptyTitle}>No encontramos productos</Text>
          <Text style={styles.empty}>
            Intenta buscar con otro nombre o código SKU.
          </Text>

          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery("")}
              style={styles.emptyButton}
            >
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
const BANNER_WIDTH = SCREEN_WIDTH - spacing.md * 2;

const homeBanners = [
  {
    id: "catalog",
    label: "OMNIRETAIL",
    title: "Todo lo que necesitas en un solo lugar",
    description:
      "Explora nuestro catálogo y encuentra productos para tu día a día.",
    buttonLabel: "Ver categorías",
    icon: "🛍️",
    href: "/(protected)/(tabs)/categories" as const,
  },
  {
    id: "tools",
    label: "HERRAMIENTAS",
    title: "Equipa tus proyectos",
    description:
      "Encuentra herramientas y artículos para reparaciones y trabajos en casa.",
    buttonLabel: "Explorar",
    icon: "🛠️",
    href: {
      pathname: "/(protected)/(tabs)/categories",
      params: { categoryId: "category-tools" },
    } as const,
  },
  {
    id: "orders",
    label: "TUS COMPRAS",
    title: "Consulta tus pedidos fácilmente",
    description:
      "Revisa tus compras y consulta el estado de tus pedidos desde la aplicación.",
    buttonLabel: "Ver pedidos",
    icon: "📦",
    href: "/(protected)/(tabs)/orders" as const,
  },
];

function getCategoryIcon(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("herramient")) {
    return "🛠️";
  }

  if (normalized.includes("hogar")) {
    return "🏠";
  }

  if (normalized.includes("personal")) {
    return "🧴";
  }

  if (normalized.includes("farmacia")) {
    return "➕";
  }

  if (normalized.includes("papeler")) {
    return "✏️";
  }

  if (normalized.includes("despensa")) {
    return "🛒";
  }

  return "📦";
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
  },

  loadingText: {
    color: colors.textMuted,
    fontSize: typography.body,
  },

  content: {
    backgroundColor: colors.background,
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },

  header: {
    gap: spacing.lg,
  },

  welcomeRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  welcomeText: {
    flex: 1,
  },

  greeting: {
    color: colors.textMuted,
    fontSize: typography.body,
  },

  businessName: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "800",
    marginTop: spacing.xs,
  },

  notificationButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },

  notificationIcon: {
    fontSize: 20,
  },

  errorBox: {
    backgroundColor: colors.surface,
    borderColor: colors.danger,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },

  error: {
    color: colors.danger,
  },

  searchContainer: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },

  searchIcon: {
    color: colors.textMuted,
    fontSize: 24,
    marginRight: spacing.sm,
  },

  input: {
    color: colors.text,
    flex: 1,
    fontSize: typography.body,
    minHeight: 50,
  },

  clearButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },

  clearText: {
    color: colors.textMuted,
    fontSize: 28,
  },

  promoCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    flexDirection: "row",
    minHeight: 190,
    overflow: "hidden",
    padding: spacing.lg,
  },

  promoContent: {
    flex: 1,
    justifyContent: "center",
  },

  promoLabel: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },

  promoTitle: {
    color: colors.surface,
    fontSize: typography.subtitle,
    fontWeight: "800",
    lineHeight: 26,
  },

  promoDescription: {
    color: colors.surface,
    fontSize: typography.caption,
    lineHeight: 19,
    marginTop: spacing.sm,
    opacity: 0.9,
  },

  promoButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    justifyContent: "center",
    marginTop: spacing.md,
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },

  promoButtonText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "800",
  },

  promoGraphic: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: spacing.md,
  },

  promoGraphicIcon: {
    fontSize: 56,
  },

  pagination: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    marginTop: spacing.sm,
  },

  paginationDot: {
    backgroundColor: colors.border,
    borderRadius: 4,
    height: 7,
    width: 7,
  },

  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 22,
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },

  seeAll: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "700",
  },

  categoriesContent: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },

  categoryCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 108,
    padding: spacing.sm,
    width: 100,
  },

  categoryIconContainer: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    marginBottom: spacing.sm,
    width: 44,
  },

  categoryIcon: {
    fontSize: 21,
  },

  categoryText: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "700",
    textAlign: "center",
  },

  emptyContainer: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.xl,
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "800",
  },

  empty: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: "center",
  },

  emptyButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },

  emptyButtonText: {
    color: colors.surface,
    fontWeight: "700",
  },
});
