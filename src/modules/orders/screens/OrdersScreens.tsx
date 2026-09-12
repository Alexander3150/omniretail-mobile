import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { demoConfig } from "@/config";
import { DeliveryMethod, OrderStatus } from "@/core";
import { useInvoiceDownload } from "@/modules/invoice";
import { formatCurrency, formatDateTime } from "@/shared";
import { colors, spacing, typography } from "@/theme";

import { useOrder, useOrders, useOrderTracking } from "../hooks/useOrders";

export function OrdersScreen() {
  const { currency, isLoading, orders, reload } = useOrders();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  if (isLoading) {
    return (
      <View style={orderStyles.loadingContainer}>
        <ActivityIndicator color={orderPalette.deepBlue} size="large" />
        <Text style={orderStyles.loadingText}>Cargando tus pedidos...</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={orderStyles.content}
      data={orders}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <View style={orderStyles.hero}>
            <View style={orderStyles.decorationOne} />
            <View style={orderStyles.decorationTwo} />

            <View style={orderStyles.heroTop}>
              <View style={orderStyles.heroText}>
                <Text style={orderStyles.brand}>FERREPHARMA</Text>

                <Text style={orderStyles.heroTitle}>Mis pedidos</Text>
              </View>

              <View style={orderStyles.heroIcon}>
                <Ionicons
                  color={orderPalette.deepBlue}
                  name="receipt-outline"
                  size={24}
                />

                {orders.length > 0 ? (
                  <View style={orderStyles.orderCount}>
                    <Text style={orderStyles.orderCountText}>
                      {orders.length > 99 ? "99+" : orders.length}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Text style={orderStyles.heroDescription}>
              Consulta tus compras y revisa el estado de cada pedido en un solo
              lugar.
            </Text>

            {orders.length > 0 ? (
              <View style={orderStyles.heroBadge}>
                <Ionicons
                  color={orderPalette.deepBlue}
                  name="bag-check-outline"
                  size={15}
                />

                <Text style={orderStyles.heroBadgeText}>
                  {orders.length}{" "}
                  {orders.length === 1
                    ? "pedido registrado"
                    : "pedidos registrados"}
                </Text>
              </View>
            ) : null}
          </View>

          {orders.length > 0 ? (
            <View style={orderStyles.sectionHeader}>
              <View>
                <Text style={orderStyles.eyebrow}>HISTORIAL</Text>

                <Text style={orderStyles.sectionTitle}>Compras recientes</Text>
              </View>

              <View style={orderStyles.sectionIcon}>
                <Ionicons
                  color={orderPalette.deepBlue}
                  name="time-outline"
                  size={19}
                />
              </View>
            </View>
          ) : null}
        </>
      }
      ListEmptyComponent={
        <View style={orderStyles.emptyCard}>
          <View style={orderStyles.emptyIconOuter}>
            <View style={orderStyles.emptyIconInner}>
              <Ionicons
                color={orderPalette.deepBlue}
                name="receipt-outline"
                size={40}
              />
            </View>
          </View>

          <Text style={orderStyles.emptyTitle}>Aún no tienes pedidos</Text>

          <Text style={orderStyles.emptyDescription}>
            Cuando realices una compra, podrás consultar aquí sus productos,
            total y estado de entrega.
          </Text>

          <Pressable
            onPress={() => router.push("/(protected)/(tabs)/categories")}
            style={({ pressed }) => [
              orderStyles.exploreButton,
              pressed ? orderStyles.pressed : null,
            ]}
          >
            <Ionicons
              color={orderPalette.white}
              name="storefront-outline"
              size={18}
            />

            <Text style={orderStyles.exploreButtonText}>
              Explorar productos
            </Text>
          </Pressable>
        </View>
      }
      renderItem={({ item }) => {
        const statusPresentation = getOrderStatusPresentation(item.status);

        return (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(protected)/orders/[id]",
                params: { id: item.id },
              })
            }
            style={({ pressed }) => [
              orderStyles.orderCard,
              pressed ? orderStyles.pressed : null,
            ]}
          >
            <View style={orderStyles.cardTop}>
              <View style={orderStyles.orderIcon}>
                <Ionicons
                  color={orderPalette.deepBlue}
                  name="bag-handle-outline"
                  size={22}
                />
              </View>

              <View style={orderStyles.orderHeading}>
                <Text style={orderStyles.orderNumber}>{item.number}</Text>

                <View style={orderStyles.dateRow}>
                  <Ionicons
                    color={orderPalette.muted}
                    name="calendar-outline"
                    size={12}
                  />

                  <Text style={orderStyles.dateText}>
                    {formatDateTime(item.createdAt)}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  orderStyles.statusBadge,
                  {
                    backgroundColor: statusPresentation.background,
                  },
                ]}
              >
                <Ionicons
                  color={statusPresentation.color}
                  name={statusPresentation.icon}
                  size={13}
                />

                <Text
                  style={[
                    orderStyles.statusText,
                    { color: statusPresentation.color },
                  ]}
                >
                  {statusPresentation.label}
                </Text>
              </View>
            </View>

            <View style={orderStyles.divider} />

            <View style={orderStyles.cardInfo}>
              <View style={orderStyles.infoItem}>
                <Text style={orderStyles.infoLabel}>PRODUCTOS</Text>

                <View style={orderStyles.infoValueRow}>
                  <Ionicons
                    color={orderPalette.dreamyBlue}
                    name="cube-outline"
                    size={15}
                  />

                  <Text style={orderStyles.infoValue}>
                    {item.itemCount}{" "}
                    {item.itemCount === 1 ? "artículo" : "artículos"}
                  </Text>
                </View>
              </View>

              <View style={orderStyles.infoDivider} />

              <View style={orderStyles.totalArea}>
                <Text style={orderStyles.infoLabel}>TOTAL</Text>

                <Text style={orderStyles.total}>
                  {formatCurrency(item.total, currency)}
                </Text>
              </View>
            </View>

            <View style={orderStyles.cardFooter}>
              <Text style={orderStyles.detailText}>Ver detalle del pedido</Text>

              <View style={orderStyles.arrowButton}>
                <Ionicons
                  color={orderPalette.deepBlue}
                  name="arrow-forward"
                  size={17}
                />
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

type OrderStatusPresentation = {
  background: string;
  color: string;
  icon:
    | "checkmark-circle-outline"
    | "construct-outline"
    | "car-outline"
    | "time-outline";
  label: string;
};

function getOrderStatusPresentation(
  status: OrderStatus,
): OrderStatusPresentation {
  if (status === OrderStatus.Shipped) {
    return {
      background: "#EAF2FF",
      color: "#3E668F",
      icon: "car-outline",
      label: "Enviado",
    };
  }

  if (status === OrderStatus.Preparing) {
    return {
      background: "#FFF4D8",
      color: "#8A6815",
      icon: "construct-outline",
      label: "Preparando",
    };
  }

  if (status === OrderStatus.Confirmed) {
    return {
      background: "#E9F7EF",
      color: "#247A52",
      icon: "checkmark-circle-outline",
      label: "Confirmado",
    };
  }

  return {
    background: "#EEF1F5",
    color: "#687286",
    icon: "time-outline",
    label: String(status),
  };
}

export function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    advanceForDemo,
    branch,
    currency,
    isLoading,
    items,
    order,
    payments,
  } = useOrder(id);
  const {
    downloadInvoice,
    error: invoiceError,
    isGenerating,
  } = useInvoiceDownload();
  const tracking = useOrderTracking(order);
  const canAdvance =
    demoConfig.enableOrderStatusControls &&
    (order?.status === OrderStatus.Confirmed ||
      order?.status === OrderStatus.Preparing);

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }

  if (!order) {
    return (
      <View style={styles.content}>
        <Text style={styles.title}>Pedido no encontrado</Text>
        <Text style={styles.muted}>
          No pudimos encontrar este pedido para tu cuenta.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.panel}>
        <Text style={styles.title}>{order.number}</Text>
        <Text style={styles.badge}>Estado: {order.status}</Text>
        <Text style={styles.muted}>
          Creado: {formatDateTime(order.createdAt)}
        </Text>
        {canAdvance ? (
          <Pressable onPress={advanceForDemo} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Avanzar estado (Demo)</Text>
          </Pressable>
        ) : null}
        <Pressable
          disabled={isGenerating}
          onPress={() => void downloadInvoice(order)}
          style={[
            styles.secondaryButton,
            isGenerating ? styles.disabled : null,
          ]}
        >
          <Text>
            {isGenerating ? "Generando factura..." : "Descargar factura"}
          </Text>
        </Pressable>
        {invoiceError ? <Text style={styles.error}>{invoiceError}</Text> : null}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Seguimiento</Text>
        {tracking.map((step) => (
          <View key={step.key} style={styles.timelineRow}>
            <Text style={styles.timelineState}>{step.state}</Text>
            <View style={styles.flex}>
              <Text style={styles.name}>{step.label}</Text>
              <Text style={styles.muted}>{formatDateTime(step.date)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Articulos</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.flex}>
              <Text style={styles.name}>{item.productNameSnapshot}</Text>
              <Text style={styles.muted}>{item.skuSnapshot ?? "SKU demo"}</Text>
              <Text>Cantidad: {item.quantity}</Text>
            </View>
            <Text>{formatCurrency(item.subtotal, currency)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Entrega</Text>
        <Text>
          {order.deliveryMethod === DeliveryMethod.HomeDelivery
            ? "Envio a domicilio"
            : "Retiro en tienda"}
        </Text>
        {order.deliveryMethod === DeliveryMethod.HomeDelivery &&
        order.deliveryAddressSnapshot ? (
          <>
            <Text style={styles.name}>
              {order.deliveryAddressSnapshot.label ?? "Direccion"}
            </Text>
            <Text>{order.deliveryAddressSnapshot.addressLine}</Text>
            <Text style={styles.muted}>
              {[
                order.deliveryAddressSnapshot.municipality,
                order.deliveryAddressSnapshot.department,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>
            {order.deliveryAddressSnapshot.phone ? (
              <Text style={styles.muted}>
                {order.deliveryAddressSnapshot.phone}
              </Text>
            ) : null}
          </>
        ) : null}
        {order.deliveryMethod === DeliveryMethod.StorePickup ? (
          <>
            <Text style={styles.name}>{branch?.name ?? "Sucursal"}</Text>
            <Text>{branch?.address ?? "Direccion no disponible"}</Text>
            {branch?.openingHours ? (
              <Text style={styles.muted}>{branch.openingHours}</Text>
            ) : null}
          </>
        ) : null}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Contacto</Text>
        <Text>{order.contactSnapshot?.name ?? "Cliente"}</Text>
        {order.contactSnapshot?.email ? (
          <Text style={styles.muted}>{order.contactSnapshot.email}</Text>
        ) : null}
        <Text>Telefono: {order.contactSnapshot?.phone ?? "No registrado"}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Facturacion</Text>
        <Text>
          {order.billingSnapshot?.name ??
            order.contactSnapshot?.name ??
            "Consumidor final"}
        </Text>
        <Text>NIT: {order.billingSnapshot?.nit?.trim() || "CF"}</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Pago</Text>
        <Text>Estado: {order.paymentStatus ?? "pendiente"}</Text>
        {payments.length === 0 ? (
          <Text style={styles.muted}>Sin pago registrado.</Text>
        ) : null}
        {payments.map((payment) => (
          <Text key={payment.id}>
            {payment.method} - {payment.status} -{" "}
            {formatCurrency(payment.amount, currency)}
            {payment.cardBrandSnapshot || payment.cardLast4Snapshot
              ? ` - ${payment.cardBrandSnapshot ?? "Tarjeta"} ${payment.cardLast4Snapshot ?? ""}`
              : ""}
            {payment.reference ? ` (${payment.reference})` : ""}
          </Text>
        ))}
      </View>

      <View style={styles.panel}>
        <Text>Subtotal: {formatCurrency(order.subtotal, currency)}</Text>
        <Text>Descuento: {formatCurrency(order.discount, currency)}</Text>
        <Text>Envio: {formatCurrency(order.shippingCost, currency)}</Text>
        <Text style={styles.total}>
          Total: {formatCurrency(order.total, currency)}
        </Text>
      </View>
    </ScrollView>
  );
}

const orderPalette = {
  deepBlue: "#3E668F",
  dreamyBlue: "#81A9EE",
  silkyLilac: "#AAB4E7",
  butterHoney: "#FFDB83",
  vanillaMilk: "#FFF2D0",
  white: "#FFFFFF",
  text: "#172033",
  muted: "#687286",
  border: "#DDE3EE",
};

const orderStyles = StyleSheet.create({
  content: {
    backgroundColor: orderPalette.vanillaMilk,
    flexGrow: 1,
    paddingBottom: 34,
  },

  loadingContainer: {
    alignItems: "center",
    backgroundColor: orderPalette.vanillaMilk,
    flex: 1,
    gap: 10,
    justifyContent: "center",
  },

  loadingText: {
    color: orderPalette.deepBlue,
    fontSize: 12,
    fontWeight: "800",
  },

  hero: {
    backgroundColor: orderPalette.deepBlue,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
    minHeight: 212,
    overflow: "hidden",
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 44,
  },

  decorationOne: {
    backgroundColor: orderPalette.dreamyBlue,
    borderRadius: 110,
    height: 185,
    opacity: 0.17,
    position: "absolute",
    right: -55,
    top: -65,
    width: 185,
  },

  decorationTwo: {
    backgroundColor: orderPalette.butterHoney,
    borderRadius: 55,
    bottom: -46,
    height: 105,
    opacity: 0.17,
    position: "absolute",
    right: 62,
    width: 105,
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
    color: orderPalette.butterHoney,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.7,
  },

  heroTitle: {
    color: orderPalette.white,
    fontSize: 29,
    fontWeight: "900",
    marginTop: 2,
  },

  heroIcon: {
    alignItems: "center",
    backgroundColor: orderPalette.white,
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  orderCount: {
    alignItems: "center",
    backgroundColor: orderPalette.butterHoney,
    borderColor: orderPalette.white,
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

  orderCountText: {
    color: orderPalette.deepBlue,
    fontSize: 9,
    fontWeight: "900",
  },

  heroDescription: {
    color: "#EAF1F8",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 15,
    maxWidth: "82%",
  },

  heroBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: orderPalette.butterHoney,
    borderRadius: 18,
    flexDirection: "row",
    gap: 6,
    marginTop: 13,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  heroBadgeText: {
    color: orderPalette.deepBlue,
    fontSize: 10,
    fontWeight: "800",
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 18,
  },

  eyebrow: {
    color: orderPalette.dreamyBlue,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  sectionTitle: {
    color: orderPalette.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2,
  },

  sectionIcon: {
    alignItems: "center",
    backgroundColor: orderPalette.butterHoney,
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  orderCard: {
    backgroundColor: orderPalette.white,
    borderColor: orderPalette.silkyLilac,
    borderRadius: 21,
    borderWidth: 1,
    marginBottom: 13,
    marginHorizontal: 16,
    padding: 15,
    shadowColor: "#172033",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  cardTop: {
    alignItems: "center",
    flexDirection: "row",
  },

  orderIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3FB",
    borderRadius: 13,
    height: 44,
    justifyContent: "center",
    marginRight: 11,
    width: 44,
  },

  orderHeading: {
    flex: 1,
  },

  orderNumber: {
    color: orderPalette.text,
    fontSize: 15,
    fontWeight: "900",
  },

  dateRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },

  dateText: {
    color: orderPalette.muted,
    fontSize: 9,
  },

  statusBadge: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 4,
    marginLeft: 7,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "900",
  },

  divider: {
    backgroundColor: "#E8ECF2",
    height: 1,
    marginVertical: 13,
  },

  cardInfo: {
    alignItems: "center",
    flexDirection: "row",
  },

  infoItem: {
    flex: 1,
  },

  infoLabel: {
    color: orderPalette.muted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  infoValueRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 5,
  },

  infoValue: {
    color: orderPalette.text,
    fontSize: 12,
    fontWeight: "800",
  },

  infoDivider: {
    backgroundColor: "#E8ECF2",
    height: 34,
    marginHorizontal: 16,
    width: 1,
  },

  totalArea: {
    alignItems: "flex-end",
  },

  total: {
    color: orderPalette.deepBlue,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 3,
  },

  cardFooter: {
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 13,
    minHeight: 43,
    paddingHorizontal: 12,
  },

  detailText: {
    color: orderPalette.deepBlue,
    fontSize: 10,
    fontWeight: "800",
  },

  arrowButton: {
    alignItems: "center",
    backgroundColor: orderPalette.butterHoney,
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },

  emptyCard: {
    alignItems: "center",
    backgroundColor: orderPalette.white,
    borderColor: orderPalette.silkyLilac,
    borderRadius: 24,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 10,
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
    backgroundColor: orderPalette.butterHoney,
    borderRadius: 46,
    height: 92,
    justifyContent: "center",
    width: 92,
  },

  emptyIconInner: {
    alignItems: "center",
    backgroundColor: orderPalette.white,
    borderRadius: 35,
    height: 70,
    justifyContent: "center",
    width: 70,
  },

  emptyTitle: {
    color: orderPalette.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 20,
    textAlign: "center",
  },

  emptyDescription: {
    color: orderPalette.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
    textAlign: "center",
  },

  exploreButton: {
    alignItems: "center",
    backgroundColor: orderPalette.deepBlue,
    borderRadius: 13,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: 21,
    minHeight: 48,
    paddingHorizontal: 20,
  },

  exploreButtonText: {
    color: orderPalette.white,
    fontSize: 12,
    fontWeight: "900",
  },

  pressed: {
    opacity: 0.76,
  },
});

const styles = StyleSheet.create({
  badge: { color: colors.primary, fontWeight: "700" },
  content: {
    backgroundColor: colors.background,
    gap: spacing.md,
    padding: spacing.md,
  },
  disabled: { opacity: 0.7 },
  error: { color: colors.danger },
  flex: { flex: 1 },
  itemRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  loading: { flex: 1 },
  muted: { color: colors.textMuted },
  name: { color: colors.text, fontWeight: "700" },
  panel: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  primaryText: { color: colors.surface, fontWeight: "700" },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "700",
  },
  timelineRow: { flexDirection: "row", gap: spacing.md },
  timelineState: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "700",
    minWidth: 80,
  },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "700" },
  total: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "700",
  },
});
