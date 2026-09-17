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
    return (
      <View style={detailStyles.loading}>
        <ActivityIndicator color={detailPalette.deepBlue} size="large" />
        <Text style={detailStyles.loadingText}>Cargando pedido...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={detailStyles.notFound}>
        <View style={detailStyles.notFoundIcon}>
          <Ionicons
            color={detailPalette.deepBlue}
            name="receipt-outline"
            size={34}
          />
        </View>

        <Text style={detailStyles.notFoundTitle}>Pedido no encontrado</Text>

        <Text style={detailStyles.notFoundText}>
          No pudimos encontrar este pedido para tu cuenta.
        </Text>

        <Pressable
          onPress={() => router.back()}
          style={detailStyles.notFoundButton}
        >
          <Text style={detailStyles.notFoundButtonText}>Regresar</Text>
        </Pressable>
      </View>
    );
  }

  const statusPresentation = getOrderStatusPresentation(order.status);

  return (
    <ScrollView
      contentContainerStyle={detailStyles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={detailStyles.hero}>
        <View style={detailStyles.decorationOne} />
        <View style={detailStyles.decorationTwo} />

        <View style={detailStyles.heroTop}>
          <Pressable
            hitSlop={10}
            onPress={() => router.back()}
            style={({ pressed }) => [
              detailStyles.backButton,
              pressed ? detailStyles.pressed : null,
            ]}
          >
            <Ionicons
              color={detailPalette.deepBlue}
              name="arrow-back"
              size={20}
            />
          </Pressable>

          <View style={detailStyles.heroIcon}>
            <Ionicons
              color={detailPalette.deepBlue}
              name="receipt-outline"
              size={23}
            />
          </View>
        </View>

        <Text style={detailStyles.brand}>FERREPHARMA</Text>
        <Text style={detailStyles.heroTitle}>Detalle del pedido</Text>

        <Text style={detailStyles.heroSubtitle}>
          Consulta el estado, entrega y resumen de tu compra.
        </Text>
      </View>

      <View style={detailStyles.body}>
        <View style={detailStyles.orderCard}>
          <View style={detailStyles.orderHeading}>
            <View style={detailStyles.orderNumberArea}>
              <Text style={detailStyles.eyebrow}>NÚMERO DE PEDIDO</Text>

              <Text style={detailStyles.orderNumber}>{order.number}</Text>
            </View>

            <View
              style={[
                detailStyles.statusBadge,
                {
                  backgroundColor: statusPresentation.background,
                },
              ]}
            >
              <Ionicons
                color={statusPresentation.color}
                name={statusPresentation.icon}
                size={14}
              />

              <Text
                style={[
                  detailStyles.statusText,
                  { color: statusPresentation.color },
                ]}
              >
                {statusPresentation.label}
              </Text>
            </View>
          </View>

          <View style={detailStyles.dateRow}>
            <Ionicons
              color={detailPalette.muted}
              name="calendar-outline"
              size={14}
            />

            <Text style={detailStyles.dateText}>
              Creado: {formatDateTime(order.createdAt)}
            </Text>
          </View>

          <View style={detailStyles.orderActions}>
            {canAdvance ? (
              <Pressable
                onPress={advanceForDemo}
                style={({ pressed }) => [
                  detailStyles.demoButton,
                  pressed ? detailStyles.pressed : null,
                ]}
              >
                <Ionicons
                  color={detailPalette.deepBlue}
                  name="play-forward-outline"
                  size={16}
                />

                <Text style={detailStyles.demoButtonText}>
                  Avanzar estado (Demo)
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              disabled={isGenerating}
              onPress={() => void downloadInvoice(order)}
              style={({ pressed }) => [
                detailStyles.invoiceButton,
                isGenerating ? detailStyles.disabled : null,
                pressed && !isGenerating ? detailStyles.pressed : null,
              ]}
            >
              {isGenerating ? (
                <ActivityIndicator color={detailPalette.white} size="small" />
              ) : (
                <Ionicons
                  color={detailPalette.white}
                  name="download-outline"
                  size={16}
                />
              )}

              <Text style={detailStyles.invoiceButtonText}>
                {isGenerating ? "Generando..." : "Descargar factura"}
              </Text>
            </Pressable>
          </View>

          {invoiceError ? (
            <View style={detailStyles.errorBox}>
              <Ionicons
                color={detailPalette.danger}
                name="alert-circle-outline"
                size={17}
              />

              <Text style={detailStyles.errorText}>{invoiceError}</Text>
            </View>
          ) : null}
        </View>

        <DetailSection
          icon="navigate-outline"
          subtitle="Revisa el progreso de tu compra"
          title="Seguimiento"
        >
          <View style={detailStyles.timeline}>
            {tracking.map((step, index) => {
              const completed = step.state === "completed";
              const current = step.state === "current";

              return (
                <View key={step.key} style={detailStyles.timelineRow}>
                  <View style={detailStyles.timelineRail}>
                    <View
                      style={[
                        detailStyles.timelineDot,
                        completed ? detailStyles.timelineDotComplete : null,
                        current ? detailStyles.timelineDotCurrent : null,
                      ]}
                    >
                      <Ionicons
                        color={
                          completed || current
                            ? detailPalette.white
                            : detailPalette.muted
                        }
                        name={
                          completed
                            ? "checkmark"
                            : current
                              ? "ellipse"
                              : "time-outline"
                        }
                        size={completed ? 13 : 10}
                      />
                    </View>

                    {index < tracking.length - 1 ? (
                      <View
                        style={[
                          detailStyles.timelineLine,
                          completed ? detailStyles.timelineLineComplete : null,
                        ]}
                      />
                    ) : null}
                  </View>

                  <View style={detailStyles.timelineContent}>
                    <View style={detailStyles.timelineHeading}>
                      <Text style={detailStyles.timelineLabel}>
                        {step.label}
                      </Text>

                      {current ? (
                        <View style={detailStyles.currentBadge}>
                          <Text style={detailStyles.currentBadgeText}>
                            ACTUAL
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={detailStyles.timelineDate}>
                      {formatDateTime(step.date)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </DetailSection>

        <DetailSection
          icon="cube-outline"
          subtitle={`${items.length} ${
            items.length === 1 ? "artículo" : "artículos"
          } en esta compra`}
          title="Artículos"
        >
          <View style={detailStyles.itemsList}>
            {items.map((item) => (
              <View key={item.id} style={detailStyles.itemRow}>
                <View style={detailStyles.itemIcon}>
                  <Ionicons
                    color={detailPalette.deepBlue}
                    name="cube-outline"
                    size={17}
                  />
                </View>

                <View style={detailStyles.flex}>
                  <Text style={detailStyles.itemName}>
                    {item.productNameSnapshot}
                  </Text>

                  <Text style={detailStyles.itemSku}>
                    {item.skuSnapshot ?? "SKU demo"}
                  </Text>

                  <View style={detailStyles.quantityRow}>
                    <Text style={detailStyles.quantityLabel}>Cantidad</Text>

                    <View style={detailStyles.quantityBadge}>
                      <Text style={detailStyles.quantityBadgeText}>
                        {item.quantity}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={detailStyles.itemPrice}>
                  {formatCurrency(item.subtotal, currency)}
                </Text>
              </View>
            ))}
          </View>
        </DetailSection>

        <DetailSection
          icon={
            order.deliveryMethod === DeliveryMethod.HomeDelivery
              ? "home-outline"
              : "storefront-outline"
          }
          subtitle={
            order.deliveryMethod === DeliveryMethod.HomeDelivery
              ? "Envío a domicilio"
              : "Retiro en tienda"
          }
          title="Entrega"
        >
          {order.deliveryMethod === DeliveryMethod.HomeDelivery &&
          order.deliveryAddressSnapshot ? (
            <View style={detailStyles.infoBox}>
              <DetailInfoRow
                icon="location-outline"
                label={order.deliveryAddressSnapshot.label ?? "Dirección"}
                value={order.deliveryAddressSnapshot.addressLine}
              />

              {[
                order.deliveryAddressSnapshot.municipality,
                order.deliveryAddressSnapshot.department,
              ]
                .filter(Boolean)
                .join(", ") ? (
                <DetailInfoRow
                  icon="map-outline"
                  label="Ubicación"
                  value={[
                    order.deliveryAddressSnapshot.municipality,
                    order.deliveryAddressSnapshot.department,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
              ) : null}

              {order.deliveryAddressSnapshot.phone ? (
                <DetailInfoRow
                  icon="call-outline"
                  label="Teléfono"
                  value={order.deliveryAddressSnapshot.phone}
                />
              ) : null}
            </View>
          ) : null}

          {order.deliveryMethod === DeliveryMethod.StorePickup ? (
            <View style={detailStyles.infoBox}>
              <DetailInfoRow
                icon="storefront-outline"
                label={branch?.name ?? "Sucursal"}
                value={branch?.address ?? "Dirección no disponible"}
              />

              {branch?.openingHours ? (
                <DetailInfoRow
                  icon="time-outline"
                  label="Horario"
                  value={branch.openingHours}
                />
              ) : null}
            </View>
          ) : null}
        </DetailSection>

        <View style={detailStyles.twoColumn}>
          <View style={detailStyles.compactCard}>
            <View style={detailStyles.compactIcon}>
              <Ionicons
                color={detailPalette.deepBlue}
                name="person-outline"
                size={17}
              />
            </View>

            <Text style={detailStyles.compactTitle}>Contacto</Text>

            <Text style={detailStyles.compactValue}>
              {order.contactSnapshot?.name ?? "Cliente"}
            </Text>

            {order.contactSnapshot?.email ? (
              <Text numberOfLines={1} style={detailStyles.compactMuted}>
                {order.contactSnapshot.email}
              </Text>
            ) : null}

            <Text style={detailStyles.compactMuted}>
              {order.contactSnapshot?.phone ?? "No registrado"}
            </Text>
          </View>

          <View style={detailStyles.compactCard}>
            <View style={detailStyles.compactIcon}>
              <Ionicons
                color={detailPalette.deepBlue}
                name="document-text-outline"
                size={17}
              />
            </View>

            <Text style={detailStyles.compactTitle}>Facturación</Text>

            <Text style={detailStyles.compactValue}>
              {order.billingSnapshot?.name ??
                order.contactSnapshot?.name ??
                "Consumidor final"}
            </Text>

            <Text style={detailStyles.compactMuted}>
              NIT: {order.billingSnapshot?.nit?.trim() || "CF"}
            </Text>
          </View>
        </View>

        <DetailSection
          icon="card-outline"
          subtitle={`Estado: ${order.paymentStatus ?? "pendiente"}`}
          title="Pago"
        >
          {payments.length === 0 ? (
            <View style={detailStyles.emptyPayment}>
              <Ionicons
                color={detailPalette.muted}
                name="card-outline"
                size={18}
              />

              <Text style={detailStyles.emptyPaymentText}>
                Sin pago registrado.
              </Text>
            </View>
          ) : null}

          {payments.map((payment) => (
            <View key={payment.id} style={detailStyles.paymentRow}>
              <View style={detailStyles.paymentIcon}>
                <Ionicons
                  color={detailPalette.deepBlue}
                  name="card-outline"
                  size={17}
                />
              </View>

              <View style={detailStyles.flex}>
                <Text style={detailStyles.paymentName}>
                  {payment.cardBrandSnapshot ?? String(payment.method)}
                  {payment.cardLast4Snapshot
                    ? ` •••• ${payment.cardLast4Snapshot}`
                    : ""}
                </Text>

                <Text style={detailStyles.paymentStatus}>
                  {String(payment.status)}
                  {payment.reference ? ` · ${payment.reference}` : ""}
                </Text>
              </View>

              <Text style={detailStyles.paymentAmount}>
                {formatCurrency(payment.amount, currency)}
              </Text>
            </View>
          ))}
        </DetailSection>

        <View style={detailStyles.totalCard}>
          <View style={detailStyles.totalHeader}>
            <View style={detailStyles.totalIcon}>
              <Ionicons
                color={detailPalette.deepBlue}
                name="receipt-outline"
                size={18}
              />
            </View>

            <Text style={detailStyles.totalTitle}>Resumen de compra</Text>
          </View>

          <DetailPriceRow
            label="Subtotal"
            value={formatCurrency(order.subtotal, currency)}
          />

          <DetailPriceRow
            label="Descuento"
            value={formatCurrency(order.discount, currency)}
          />

          <DetailPriceRow
            label="Envío"
            value={formatCurrency(order.shippingCost, currency)}
          />

          <View style={detailStyles.totalDivider} />

          <View style={detailStyles.grandTotalRow}>
            <Text style={detailStyles.grandTotalLabel}>Total</Text>

            <Text style={detailStyles.grandTotalValue}>
              {formatCurrency(order.total, currency)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function DetailSection({
  children,
  icon,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={detailStyles.sectionCard}>
      <View style={detailStyles.sectionHeader}>
        <View style={detailStyles.sectionIcon}>
          <Ionicons color={detailPalette.deepBlue} name={icon} size={18} />
        </View>

        <View style={detailStyles.flex}>
          <Text style={detailStyles.sectionTitle}>{title}</Text>

          <Text style={detailStyles.sectionSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={detailStyles.sectionDivider} />

      {children}
    </View>
  );
}

function DetailInfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={detailStyles.infoRow}>
      <View style={detailStyles.infoIcon}>
        <Ionicons color={detailPalette.deepBlue} name={icon} size={15} />
      </View>

      <View style={detailStyles.flex}>
        <Text style={detailStyles.infoLabel}>{label}</Text>
        <Text style={detailStyles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function DetailPriceRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={detailStyles.priceRow}>
      <Text style={detailStyles.priceLabel}>{label}</Text>
      <Text style={detailStyles.priceValue}>{value}</Text>
    </View>
  );
}

const detailPalette = {
  deepBlue: "#3E668F",
  dreamyBlue: "#81A9EE",
  silkyLilac: "#AAB4E7",
  butterHoney: "#FFDB83",
  vanillaMilk: "#FFF2D0",
  white: "#FFFFFF",
  text: "#172033",
  muted: "#687286",
  border: "#DDE3EE",
  danger: "#C2413B",
  success: "#1E8E5A",
};

const detailStyles = StyleSheet.create({
  content: {
    backgroundColor: detailPalette.vanillaMilk,
    flexGrow: 1,
    paddingBottom: 32,
  },

  hero: {
    backgroundColor: detailPalette.deepBlue,
    borderBottomLeftRadius: 27,
    borderBottomRightRadius: 27,
    minHeight: 218,
    overflow: "hidden",
    paddingBottom: 25,
    paddingHorizontal: 18,
    paddingTop: 48,
  },

  decorationOne: {
    backgroundColor: detailPalette.dreamyBlue,
    borderRadius: 100,
    height: 180,
    opacity: 0.16,
    position: "absolute",
    right: -55,
    top: -65,
    width: 180,
  },

  decorationTwo: {
    backgroundColor: detailPalette.butterHoney,
    borderRadius: 60,
    bottom: -48,
    height: 110,
    opacity: 0.14,
    position: "absolute",
    right: 55,
    width: 110,
  },

  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  backButton: {
    alignItems: "center",
    backgroundColor: detailPalette.white,
    borderRadius: 18,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  heroIcon: {
    alignItems: "center",
    backgroundColor: detailPalette.butterHoney,
    borderRadius: 20,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  brand: {
    color: detailPalette.butterHoney,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginTop: 18,
  },

  heroTitle: {
    color: detailPalette.white,
    fontSize: 25,
    fontWeight: "900",
    marginTop: 2,
  },

  heroSubtitle: {
    color: "#EAF1F8",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
    maxWidth: "88%",
  },

  body: {
    gap: 11,
    marginTop: -10,
    paddingHorizontal: 12,
  },

  flex: {
    flex: 1,
  },

  orderCard: {
    backgroundColor: detailPalette.white,
    borderColor: detailPalette.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 13,
  },

  orderHeading: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },

  orderNumberArea: {
    flex: 1,
  },

  eyebrow: {
    color: detailPalette.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  orderNumber: {
    color: detailPalette.deepBlue,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },

  statusBadge: {
    alignItems: "center",
    borderRadius: 11,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "900",
  },

  dateRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },

  dateText: {
    color: detailPalette.muted,
    fontSize: 9,
  },

  orderActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  demoButton: {
    alignItems: "center",
    backgroundColor: detailPalette.butterHoney,
    borderRadius: 11,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    minHeight: 39,
    paddingHorizontal: 11,
  },

  demoButtonText: {
    color: detailPalette.deepBlue,
    fontSize: 9,
    fontWeight: "900",
  },

  invoiceButton: {
    alignItems: "center",
    backgroundColor: detailPalette.deepBlue,
    borderRadius: 11,
    flexDirection: "row",
    flexGrow: 1,
    gap: 5,
    justifyContent: "center",
    minHeight: 39,
    paddingHorizontal: 11,
  },

  invoiceButtonText: {
    color: detailPalette.white,
    fontSize: 9,
    fontWeight: "900",
  },

  errorBox: {
    alignItems: "center",
    backgroundColor: "#FFF2F1",
    borderRadius: 10,
    flexDirection: "row",
    gap: 6,
    padding: 8,
  },

  errorText: {
    color: detailPalette.danger,
    flex: 1,
    fontSize: 9,
    fontWeight: "700",
  },

  sectionCard: {
    backgroundColor: detailPalette.white,
    borderColor: detailPalette.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },

  sectionIcon: {
    alignItems: "center",
    backgroundColor: detailPalette.butterHoney,
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },

  sectionTitle: {
    color: detailPalette.text,
    fontSize: 12,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: detailPalette.muted,
    fontSize: 8,
    marginTop: 2,
  },

  sectionDivider: {
    backgroundColor: "#EDF0F4",
    height: 1,
    marginVertical: 11,
  },

  timeline: {
    gap: 0,
  },

  timelineRow: {
    flexDirection: "row",
    minHeight: 57,
  },

  timelineRail: {
    alignItems: "center",
    marginRight: 10,
    width: 24,
  },

  timelineDot: {
    alignItems: "center",
    backgroundColor: "#E6EAF0",
    borderRadius: 11,
    height: 22,
    justifyContent: "center",
    width: 22,
  },

  timelineDotComplete: {
    backgroundColor: detailPalette.success,
  },

  timelineDotCurrent: {
    backgroundColor: detailPalette.deepBlue,
  },

  timelineLine: {
    backgroundColor: "#DDE3EA",
    flex: 1,
    marginVertical: 3,
    width: 2,
  },

  timelineLineComplete: {
    backgroundColor: detailPalette.success,
  },

  timelineContent: {
    flex: 1,
    paddingBottom: 12,
  },

  timelineHeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },

  timelineLabel: {
    color: detailPalette.text,
    fontSize: 10,
    fontWeight: "900",
  },

  timelineDate: {
    color: detailPalette.muted,
    fontSize: 8,
    marginTop: 3,
  },

  currentBadge: {
    backgroundColor: "#EAF2FF",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  currentBadgeText: {
    color: detailPalette.deepBlue,
    fontSize: 7,
    fontWeight: "900",
  },

  itemsList: {
    gap: 8,
  },

  itemRow: {
    alignItems: "center",
    backgroundColor: "#FAFBFC",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    padding: 9,
  },

  itemIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 9,
    height: 34,
    justifyContent: "center",
    width: 34,
  },

  itemName: {
    color: detailPalette.text,
    fontSize: 10,
    fontWeight: "900",
  },

  itemSku: {
    color: detailPalette.muted,
    fontSize: 8,
    marginTop: 2,
  },

  quantityRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 4,
  },

  quantityLabel: {
    color: detailPalette.muted,
    fontSize: 8,
  },

  quantityBadge: {
    backgroundColor: detailPalette.butterHoney,
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  quantityBadgeText: {
    color: detailPalette.deepBlue,
    fontSize: 8,
    fontWeight: "900",
  },

  itemPrice: {
    color: detailPalette.deepBlue,
    fontSize: 10,
    fontWeight: "900",
  },

  infoBox: {
    gap: 8,
  },

  infoRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },

  infoIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 8,
    height: 29,
    justifyContent: "center",
    width: 29,
  },

  infoLabel: {
    color: detailPalette.text,
    fontSize: 9,
    fontWeight: "900",
  },

  infoValue: {
    color: detailPalette.muted,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 2,
  },

  twoColumn: {
    flexDirection: "row",
    gap: 8,
  },

  compactCard: {
    backgroundColor: detailPalette.white,
    borderColor: detailPalette.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 135,
    padding: 11,
  },

  compactIcon: {
    alignItems: "center",
    backgroundColor: detailPalette.butterHoney,
    borderRadius: 9,
    height: 32,
    justifyContent: "center",
    width: 32,
  },

  compactTitle: {
    color: detailPalette.text,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 8,
  },

  compactValue: {
    color: detailPalette.text,
    fontSize: 9,
    fontWeight: "700",
    marginTop: 5,
  },

  compactMuted: {
    color: detailPalette.muted,
    fontSize: 8,
    marginTop: 3,
  },

  emptyPayment: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },

  emptyPaymentText: {
    color: detailPalette.muted,
    fontSize: 9,
  },

  paymentRow: {
    alignItems: "center",
    backgroundColor: "#FAFBFC",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    padding: 9,
  },

  paymentIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 9,
    height: 34,
    justifyContent: "center",
    width: 34,
  },

  paymentName: {
    color: detailPalette.text,
    fontSize: 9,
    fontWeight: "900",
  },

  paymentStatus: {
    color: detailPalette.muted,
    fontSize: 8,
    marginTop: 2,
  },

  paymentAmount: {
    color: detailPalette.deepBlue,
    fontSize: 10,
    fontWeight: "900",
  },

  totalCard: {
    backgroundColor: detailPalette.deepBlue,
    borderRadius: 18,
    gap: 8,
    padding: 14,
  },

  totalHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 3,
  },

  totalIcon: {
    alignItems: "center",
    backgroundColor: detailPalette.butterHoney,
    borderRadius: 9,
    height: 32,
    justifyContent: "center",
    width: 32,
  },

  totalTitle: {
    color: detailPalette.white,
    fontSize: 12,
    fontWeight: "900",
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  priceLabel: {
    color: "#D8E4ED",
    fontSize: 9,
  },

  priceValue: {
    color: detailPalette.white,
    fontSize: 9,
    fontWeight: "800",
  },

  totalDivider: {
    backgroundColor: "rgba(255,255,255,0.18)",
    height: 1,
    marginVertical: 2,
  },

  grandTotalRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  grandTotalLabel: {
    color: detailPalette.white,
    fontSize: 13,
    fontWeight: "900",
  },

  grandTotalValue: {
    color: detailPalette.butterHoney,
    fontSize: 19,
    fontWeight: "900",
  },

  loading: {
    alignItems: "center",
    backgroundColor: detailPalette.vanillaMilk,
    flex: 1,
    gap: 10,
    justifyContent: "center",
  },

  loadingText: {
    color: detailPalette.deepBlue,
    fontSize: 11,
    fontWeight: "800",
  },

  notFound: {
    alignItems: "center",
    backgroundColor: detailPalette.vanillaMilk,
    flex: 1,
    justifyContent: "center",
    padding: 25,
  },

  notFoundIcon: {
    alignItems: "center",
    backgroundColor: detailPalette.butterHoney,
    borderRadius: 35,
    height: 70,
    justifyContent: "center",
    width: 70,
  },

  notFoundTitle: {
    color: detailPalette.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 16,
  },

  notFoundText: {
    color: detailPalette.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 6,
    textAlign: "center",
  },

  notFoundButton: {
    backgroundColor: detailPalette.deepBlue,
    borderRadius: 12,
    marginTop: 17,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },

  notFoundButtonText: {
    color: detailPalette.white,
    fontSize: 10,
    fontWeight: "900",
  },

  disabled: {
    opacity: 0.55,
  },

  pressed: {
    opacity: 0.76,
  },
});

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
