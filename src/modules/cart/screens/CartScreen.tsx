import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { formatCurrency } from "@/shared";

import type { CartLine } from "../application/cartTotals";
import { useCart } from "../hooks/useCart";

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

export function CartScreen() {
  const {
    currency,
    error,
    isLoading,
    lines,
    reload,
    removeItem,
    totals,
    updateQuantity,
  } = useCart();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={palette.deepBlue} size="large" />
        <Text style={styles.loadingText}>Preparando tu carrito...</Text>
      </View>
    );
  }

  const totalProducts = lines.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <FlatList
      contentContainerStyle={[
        styles.content,
        lines.length === 0 ? styles.emptyContent : null,
      ]}
      data={lines}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <CartHeader totalProducts={totalProducts} />
      }
      ListEmptyComponent={
        <EmptyCart message={error} />
      }
      ListFooterComponent={
        lines.length > 0 ? (
          <View style={styles.footerContainer}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View>
                  <Text style={styles.summaryEyebrow}>
                    RESUMEN
                  </Text>

                  <Text style={styles.summaryTitle}>
                    Resumen de compra
                  </Text>
                </View>

                <View style={styles.summaryIcon}>
                  <Ionicons
                    color={palette.deepBlue}
                    name="receipt-outline"
                    size={22}
                  />
                </View>
              </View>

              <SummaryRow
                currency={currency}
                label="Precio de productos"
                value={totals.subtotalBeforeDiscount}
              />

              {totals.discount > 0 ? (
                <SummaryRow
                  currency={currency}
                  highlight
                  label="Ahorro por promociones"
                  value={-totals.discount}
                />
              ) : null}

              <SummaryRow
                currency={currency}
                label="Subtotal"
                value={totals.subtotal}
              />

              <View style={styles.shippingRow}>
                <View style={styles.shippingLabel}>
                  <Ionicons
                    color={palette.deepBlue}
                    name="car-outline"
                    size={18}
                  />

                  <Text style={styles.summaryLabel}>
                    Envío
                  </Text>
                </View>

                <Text style={styles.shippingPending}>
                  Se calcula después
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <View>
                  <Text style={styles.totalLabel}>
                    Total actual
                  </Text>

                  <Text style={styles.totalHint}>
                    Antes de costos de entrega
                  </Text>
                </View>

                <Text style={styles.totalPrice}>
                  {formatCurrency(totals.total, currency)}
                </Text>
              </View>

              {totals.discount > 0 ? (
                <View style={styles.savingsBadge}>
                  <Ionicons
                    color={palette.deepBlue}
                    name="pricetag"
                    size={15}
                  />

                  <Text style={styles.savingsText}>
                    Estás ahorrando{" "}
                    {formatCurrency(totals.discount, currency)}
                  </Text>
                </View>
              ) : null}

              <Pressable
                onPress={() =>
                  router.push("/(protected)/checkout/delivery")
                }
                style={({ pressed }) => [
                  styles.checkoutButton,
                  pressed ? styles.pressed : null,
                ]}
              >
                <View style={styles.checkoutButtonContent}>
                  <View>
                    <Text style={styles.checkoutButtonTitle}>
                      Continuar compra
                    </Text>

                    <Text style={styles.checkoutButtonSubtitle}>
                      Entrega y pago
                    </Text>
                  </View>

                  <View style={styles.checkoutArrow}>
                    <Ionicons
                      color={palette.deepBlue}
                      name="arrow-forward"
                      size={20}
                    />
                  </View>
                </View>
              </Pressable>

              <View style={styles.secureRow}>
                <Ionicons
                  color={palette.success}
                  name="shield-checkmark-outline"
                  size={15}
                />

                <Text style={styles.secureText}>
                  Compra segura y protegida
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() =>
                router.push("/(protected)/(tabs)/categories")
              }
              style={({ pressed }) => [
                styles.continueShopping,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons
                color={palette.deepBlue}
                name="arrow-back"
                size={17}
              />

              <Text style={styles.continueShoppingText}>
                Seguir comprando
              </Text>
            </Pressable>

            <Text style={styles.brandFooter}>
              FerrePharma · Ferretería & Farmacia
            </Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <CartProductCard
          currency={currency}
          item={item}
          onRemove={() => void removeItem(item.id)}
          onUpdateQuantity={(quantity) =>
            void updateQuantity(item.id, quantity)
          }
        />
      )}
    />
  );
}

function CartHeader({
  totalProducts,
}: {
  totalProducts: number;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerDecorationOne} />
      <View style={styles.headerDecorationTwo} />

      <View style={styles.headerTop}>
        <View>
          <Text style={styles.brand}>FERREPHARMA</Text>
          <Text style={styles.title}>Mi carrito</Text>
        </View>

        <View style={styles.cartIcon}>
          <Ionicons
            color={palette.deepBlue}
            name="cart"
            size={24}
          />

          {totalProducts > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {totalProducts > 99 ? "99+" : totalProducts}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <Text style={styles.headerDescription}>
        Revisa tus productos antes de continuar con tu compra.
      </Text>

      {totalProducts > 0 ? (
        <View style={styles.productCountBadge}>
          <Ionicons
            color={palette.deepBlue}
            name="bag-handle-outline"
            size={15}
          />

          <Text style={styles.productCountText}>
            {totalProducts}{" "}
            {totalProducts === 1 ? "producto" : "productos"} en tu carrito
          </Text>
        </View>
      ) : null}
    </View>
  );
}

type CartProductCardProps = {
  currency: string;
  item: CartLine;
  onRemove(): void;
  onUpdateQuantity(quantity: number): void;
};

function CartProductCard({
  currency,
  item,
  onRemove,
  onUpdateQuantity,
}: CartProductCardProps) {
  const hasDiscount =
    item.unitPrice > item.effectiveUnitPrice;

  return (
    <View style={styles.productCard}>
      <View style={styles.productTop}>
        <CartLineImage item={item} />

        <View style={styles.productInfo}>
          <View style={styles.productNameRow}>
            <View style={styles.productNameContainer}>
              <Text
                numberOfLines={2}
                style={styles.productName}
              >
                {item.productName}
              </Text>

              <Text style={styles.sku}>
                SKU {item.sku}
              </Text>
            </View>

            <Pressable
              accessibilityLabel={`Eliminar ${item.productName}`}
              onPress={onRemove}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons
                color={palette.danger}
                name="trash-outline"
                size={19}
              />
            </Pressable>
          </View>

          <View style={styles.priceArea}>
            <View>
              {hasDiscount ? (
                <Text style={styles.oldPrice}>
                  {formatCurrency(item.unitPrice, currency)}
                </Text>
              ) : null}

              <Text style={styles.unitPrice}>
                {formatCurrency(
                  item.effectiveUnitPrice,
                  currency,
                )}
              </Text>

              <Text style={styles.unitLabel}>
                por unidad
              </Text>
            </View>

            {hasDiscount ? (
              <View style={styles.offerBadge}>
                <Ionicons
                  color={palette.deepBlue}
                  name="flash"
                  size={13}
                />

                <Text style={styles.offerText}>
                  Oferta
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.productDivider} />

      <View style={styles.productBottom}>
        <View style={styles.quantityControl}>
          <Pressable
            accessibilityLabel="Disminuir cantidad"
            onPress={() =>
              onUpdateQuantity(item.quantity - 1)
            }
            style={({ pressed }) => [
              styles.quantityButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons
              color={palette.deepBlue}
              name="remove"
              size={19}
            />
          </Pressable>

          <View style={styles.quantityValue}>
            <Text style={styles.quantityText}>
              {item.quantity}
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Aumentar cantidad"
            onPress={() =>
              onUpdateQuantity(item.quantity + 1)
            }
            style={({ pressed }) => [
              styles.quantityButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons
              color={palette.deepBlue}
              name="add"
              size={19}
            />
          </Pressable>
        </View>

        <View style={styles.lineTotal}>
          <Text style={styles.lineTotalLabel}>
            Subtotal
          </Text>

          <Text style={styles.lineTotalPrice}>
            {formatCurrency(item.lineSubtotal, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function SummaryRow({
  currency,
  highlight,
  label,
  value,
}: {
  currency: string;
  highlight?: boolean;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>

      <Text
        style={[
          styles.summaryValue,
          highlight ? styles.summaryDiscount : null,
        ]}
      >
        {formatCurrency(value, currency)}
      </Text>
    </View>
  );
}

function EmptyCart({
  message,
}: {
  message: string | null;
}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconOuter}>
        <View style={styles.emptyIconInner}>
          <Ionicons
            color={palette.deepBlue}
            name="cart-outline"
            size={44}
          />
        </View>
      </View>

      <Text style={styles.emptyTitle}>
        Tu carrito está esperando
      </Text>

      <Text style={styles.emptyDescription}>
        {message ??
          "Agrega productos que te gusten y aparecerán aquí listos para comprar."}
      </Text>

      <Pressable
        onPress={() =>
          router.push("/(protected)/(tabs)/categories")
        }
        style={({ pressed }) => [
          styles.exploreButton,
          pressed ? styles.pressed : null,
        ]}
      >
        <Ionicons
          color={palette.white}
          name="storefront-outline"
          size={19}
        />

        <Text style={styles.exploreButtonText}>
          Explorar productos
        </Text>
      </Pressable>
    </View>
  );
}

function CartLineImage({
  item,
}: {
  item: CartLine;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!item.image) {
    return (
      <View
        accessibilityLabel={item.productName}
        style={styles.imagePlaceholder}
      >
        <Ionicons
          color={palette.dreamyBlue}
          name="cube-outline"
          size={30}
        />
      </View>
    );
  }

  return (
    <View style={styles.imageContainer}>
      <Image
        accessibilityLabel={item.image.altText}
        onError={() => setImageFailed(true)}
        resizeMode="contain"
        source={
          imageFailed
            ? item.image.fallbackSource
            : item.image.source
        }
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: palette.vanillaMilk,
    flexGrow: 1,
    paddingBottom: 34,
  },

  emptyContent: {
    flexGrow: 1,
  },

  loadingContainer: {
    alignItems: "center",
    backgroundColor: palette.vanillaMilk,
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },

  loadingText: {
    color: palette.deepBlue,
    fontSize: 13,
    fontWeight: "700",
  },

  header: {
    backgroundColor: palette.deepBlue,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 18,
    minHeight: 212,
    overflow: "hidden",
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 44,
  },

  headerDecorationOne: {
    backgroundColor: palette.dreamyBlue,
    borderRadius: 100,
    height: 180,
    opacity: 0.18,
    position: "absolute",
    right: -55,
    top: -70,
    width: 180,
  },

  headerDecorationTwo: {
    backgroundColor: palette.butterHoney,
    borderRadius: 55,
    bottom: -48,
    height: 105,
    opacity: 0.18,
    position: "absolute",
    right: 65,
    width: 105,
  },

  headerTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  brand: {
    color: palette.butterHoney,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.7,
  },

  title: {
    color: palette.white,
    fontSize: 29,
    fontWeight: "900",
    marginTop: 2,
  },

  cartIcon: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  cartBadge: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderColor: palette.white,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 20,
    minWidth: 20,
    paddingHorizontal: 4,
    position: "absolute",
    right: -4,
    top: -5,
  },

  cartBadgeText: {
    color: palette.deepBlue,
    fontSize: 9,
    fontWeight: "900",
  },

  headerDescription: {
    color: "#EAF1F8",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 15,
    maxWidth: "80%",
  },

  productCountBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: palette.butterHoney,
    borderRadius: 18,
    flexDirection: "row",
    gap: 6,
    marginTop: 13,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  productCountText: {
    color: palette.deepBlue,
    fontSize: 11,
    fontWeight: "800",
  },

  productCard: {
    backgroundColor: palette.white,
    borderColor: palette.silkyLilac,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 13,
    marginHorizontal: 16,
    padding: 14,
    shadowColor: "#172033",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  productTop: {
    flexDirection: "row",
  },

  imageContainer: {
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    borderColor: "#E8ECF2",
    borderRadius: 15,
    borderWidth: 1,
    height: 94,
    justifyContent: "center",
    marginRight: 13,
    overflow: "hidden",
    width: 94,
  },

  image: {
    height: "100%",
    width: "100%",
  },

  imagePlaceholder: {
    alignItems: "center",
    backgroundColor: "#EEF3FB",
    borderRadius: 15,
    height: 94,
    justifyContent: "center",
    marginRight: 13,
    width: 94,
  },

  productInfo: {
    flex: 1,
  },

  productNameRow: {
    flexDirection: "row",
  },

  productNameContainer: {
    flex: 1,
    paddingRight: 7,
  },

  productName: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },

  sku: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 4,
  },

  deleteButton: {
    alignItems: "center",
    backgroundColor: "#FFF2F2",
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },

  priceArea: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  oldPrice: {
    color: palette.muted,
    fontSize: 11,
    textDecorationLine: "line-through",
  },

  unitPrice: {
    color: palette.deepBlue,
    fontSize: 17,
    fontWeight: "900",
  },

  unitLabel: {
    color: palette.muted,
    fontSize: 9,
    marginTop: 1,
  },

  offerBadge: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 10,
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  offerText: {
    color: palette.deepBlue,
    fontSize: 9,
    fontWeight: "900",
  },

  productDivider: {
    backgroundColor: "#E9EDF3",
    height: 1,
    marginVertical: 13,
  },

  productBottom: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  quantityControl: {
    alignItems: "center",
    backgroundColor: "#F4F7FA",
    borderRadius: 12,
    flexDirection: "row",
    padding: 3,
  },

  quantityButton: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 9,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },

  quantityValue: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 39,
  },

  quantityText: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "900",
  },

  lineTotal: {
    alignItems: "flex-end",
  },

  lineTotalLabel: {
    color: palette.muted,
    fontSize: 10,
  },

  lineTotalPrice: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },

  footerContainer: {
    marginTop: 6,
  },

  summaryCard: {
    backgroundColor: palette.white,
    borderColor: palette.silkyLilac,
    borderRadius: 21,
    borderWidth: 1,
    marginHorizontal: 16,
    padding: 18,
    shadowColor: "#172033",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  summaryHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  summaryEyebrow: {
    color: palette.dreamyBlue,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  summaryTitle: {
    color: palette.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 2,
  },

  summaryIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3FB",
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  summaryLabel: {
    color: palette.muted,
    fontSize: 13,
  },

  summaryValue: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "800",
  },

  summaryDiscount: {
    color: palette.success,
  },

  shippingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  shippingLabel: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },

  shippingPending: {
    color: palette.deepBlue,
    fontSize: 11,
    fontWeight: "800",
  },

  divider: {
    backgroundColor: "#E5EAF0",
    height: 1,
    marginBottom: 15,
    marginTop: 3,
  },

  totalRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  totalLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900",
  },

  totalHint: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 2,
  },

  totalPrice: {
    color: palette.deepBlue,
    fontSize: 22,
    fontWeight: "900",
  },

  savingsBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: palette.butterHoney,
    borderRadius: 11,
    flexDirection: "row",
    gap: 5,
    marginTop: 14,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  savingsText: {
    color: palette.deepBlue,
    fontSize: 10,
    fontWeight: "900",
  },

  checkoutButton: {
    backgroundColor: palette.deepBlue,
    borderRadius: 15,
    marginTop: 18,
    minHeight: 62,
    paddingHorizontal: 17,
    justifyContent: "center",
  },

  checkoutButtonContent: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  checkoutButtonTitle: {
    color: palette.white,
    fontSize: 15,
    fontWeight: "900",
  },

  checkoutButtonSubtitle: {
    color: "#DCE9F4",
    fontSize: 10,
    marginTop: 2,
  },

  checkoutArrow: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },

  secureRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    marginTop: 11,
  },

  secureText: {
    color: palette.success,
    fontSize: 10,
    fontWeight: "700",
  },

  continueShopping: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 18,
    padding: 8,
  },

  continueShoppingText: {
    color: palette.deepBlue,
    fontSize: 13,
    fontWeight: "800",
  },

  brandFooter: {
    color: palette.deepBlue,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 8,
    opacity: 0.6,
    textAlign: "center",
  },

  emptyCard: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.silkyLilac,
    borderRadius: 24,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 22,
    paddingHorizontal: 24,
    paddingVertical: 34,
    shadowColor: "#172033",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  emptyIconOuter: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 48,
    height: 96,
    justifyContent: "center",
    width: 96,
  },

  emptyIconInner: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 37,
    height: 74,
    justifyContent: "center",
    width: 74,
  },

  emptyTitle: {
    color: palette.text,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 21,
    textAlign: "center",
  },

  emptyDescription: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },

  exploreButton: {
    alignItems: "center",
    backgroundColor: palette.deepBlue,
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 22,
    minHeight: 51,
    paddingHorizontal: 22,
  },

  exploreButtonText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: "900",
  },

  pressed: {
    opacity: 0.72,
  },
});
