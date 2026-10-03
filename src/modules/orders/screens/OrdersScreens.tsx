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
        <ActivityIndicator
          color={orderPalette.deepBlue}
          size="large"
        />
        <Text style={detailStyles.loadingText}>
          Cargando pedido...
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={detailStyles.notFound}>
        <View style={detailStyles.notFoundIcon}>
          <Ionicons
            color={orderPalette.deepBlue}
            name="receipt-outline"
            size={34}
          />
        </View>

        <Text style={detailStyles.notFoundTitle}>
          Pedido no encontrado
        </Text>

        <Text style={detailStyles.notFoundText}>
          No pudimos encontrar este pedido para tu cuenta.
        </Text>

        <Pressable
          onPress={() => router.back()}
          style={detailStyles.primaryButton}
        >
          <Text style={detailStyles.primaryButtonText}>
            Regresar
          </Text>
        </Pressable>
      </View>
    );
  }

  const statusPresentation =
    getOrderStatusPresentation(order.status);

  const deliveryLabel =
    order.deliveryMethod === DeliveryMethod.HomeDelivery
      ? "Envío a domicilio"
      : "Retiro en tienda";

  return (
    <ScrollView contentContainerStyle={detailStyles.content}>
      <View style={detailStyles.hero}>
        <View style={detailStyles.decorationOne} />
        <View style={detailStyles.decorationTwo} />

        <View style={detailStyles.heroTop}>
          <View style={detailStyles.heroTitleArea}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                detailStyles.backButton,
                pressed ? detailStyles.pressed : null,
              ]}
            >
              <Ionicons
                color={orderPalette.white}
                name="arrow-back"
                size={19}
              />
            </Pressable>

            <View style={detailStyles.heroHeading}>
              <Text style={detailStyles.brand}>
                FERREPHARMA
              </Text>

              <Text style={detailStyles.heroTitle}>
                Detalle del pedido
              </Text>
            </View>
          </View>

          <View style={detailStyles.heroIcon}>
            <Ionicons
              color={orderPalette.deepBlue}
              name="bag-check-outline"
              size={24}
            />
          </View>
        </View>

        <Text style={detailStyles.heroDescription}>
          Consulta los productos, entrega y pago de tu compra.
        </Text>

        <View style={detailStyles.orderNumberBadge}>
          <Ionicons
            color={orderPalette.deepBlue}
            name="receipt-outline"
            size={14}
          />

          <Text style={detailStyles.orderNumberBadgeText}>
            {order.number}
          </Text>
        </View>
      </View>

      <View style={detailStyles.orderSummaryCard}>
        <View style={detailStyles.summaryTop}>
          <View style={detailStyles.summaryHeading}>
            <Text style={detailStyles.eyebrow}>
              RESUMEN
            </Text>

            <Text style={detailStyles.summaryTitle}>
              Tu pedido
            </Text>
          </View>

          <View
            style={[
              detailStyles.statusBadge,
              {
                backgroundColor:
                  statusPresentation.background,
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

        <View style={detailStyles.summaryDivider} />

        <View style={detailStyles.summaryRow}>
          <View style={detailStyles.summaryIcon}>
            <Ionicons
              color={orderPalette.deepBlue}
              name="calendar-outline"
              size={18}
            />
          </View>

          <View style={detailStyles.flex}>
            <Text style={detailStyles.label}>
              FECHA DEL PEDIDO
            </Text>

            <Text style={detailStyles.value}>
              {formatDateTime(order.createdAt)}
            </Text>
          </View>
        </View>

        <View style={detailStyles.summaryDivider} />

        <View style={detailStyles.totalRow}>
          <View>
            <Text style={detailStyles.label}>
              TOTAL DEL PEDIDO
            </Text>

            <Text style={detailStyles.totalHint}>
              {items.length}{" "}
              {items.length === 1 ? "artículo" : "artículos"}
            </Text>
          </View>

          <Text style={detailStyles.bigTotal}>
            {formatCurrency(order.total, currency)}
          </Text>
        </View>

        {canAdvance ? (
          <Pressable
            onPress={advanceForDemo}
            style={({ pressed }) => [
              detailStyles.demoButton,
              pressed ? detailStyles.pressed : null,
            ]}
          >
            <Ionicons
              color={orderPalette.deepBlue}
              name="play-forward-outline"
              size={17}
            />

            <Text style={detailStyles.demoButtonText}>
              Avanzar estado (Demo)
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={detailStyles.section}>
        <View style={detailStyles.sectionHeader}>
          <View>
            <Text style={detailStyles.eyebrow}>
              SEGUIMIENTO
            </Text>

            <Text style={detailStyles.sectionTitle}>
              Estado de tu compra
            </Text>
          </View>

          <View style={detailStyles.sectionIcon}>
            <Ionicons
              color={orderPalette.deepBlue}
              name="navigate-outline"
              size={20}
            />
          </View>
        </View>

        <View style={detailStyles.card}>
          {tracking.map((step, index) => {
            const isLast = index === tracking.length - 1;

            return (
              <View
                key={step.key}
                style={detailStyles.timelineItem}
              >
                <View style={detailStyles.timelineSide}>
                  <View
                    style={[
                      detailStyles.timelineDot,
                      step.state === "completed"
                        ? detailStyles.timelineDotCompleted
                        : step.state === "current"
                          ? detailStyles.timelineDotCurrent
                          : detailStyles.timelineDotPending,
                    ]}
                  >
                    <Ionicons
                      color={
                        step.state === "pending"
                          ? orderPalette.muted
                          : orderPalette.white
                      }
                      name={
                        step.state === "completed"
                          ? "checkmark"
                          : step.state === "current"
                            ? "ellipse"
                            : "time-outline"
                      }
                      size={12}
                    />
                  </View>

                  {!isLast ? (
                    <View style={detailStyles.timelineLine} />
                  ) : null}
                </View>

                <View style={detailStyles.timelineContent}>
                  <Text style={detailStyles.timelineLabel}>
                    {step.label}
                  </Text>

                  <Text style={detailStyles.timelineDate}>
                    {formatDateTime(step.date)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={detailStyles.section}>
        <View style={detailStyles.sectionHeader}>
          <View>
            <Text style={detailStyles.eyebrow}>
              PRODUCTOS
            </Text>

            <Text style={detailStyles.sectionTitle}>
              Artículos comprados
            </Text>
          </View>

          <View style={detailStyles.sectionIcon}>
            <Ionicons
              color={orderPalette.deepBlue}
              name="cube-outline"
              size={20}
            />
          </View>
        </View>

        <View style={detailStyles.card}>
          {items.map((item, index) => (
            <View key={item.id}>
              <View style={detailStyles.productRow}>
                <View style={detailStyles.productIcon}>
                  <Ionicons
                    color={orderPalette.deepBlue}
                    name="cube-outline"
                    size={20}
                  />
                </View>

                <View style={detailStyles.flex}>
                  <Text style={detailStyles.productName}>
                    {item.productNameSnapshot}
                  </Text>

                  <Text style={detailStyles.productSku}>
                    {item.skuSnapshot ?? "SKU demo"}
                  </Text>

                  <Text style={detailStyles.productQuantity}>
                    Cantidad: {item.quantity}
                  </Text>
                </View>

                <Text style={detailStyles.productTotal}>
                  {formatCurrency(
                    item.subtotal,
                    currency,
                  )}
                </Text>
              </View>

              {index < items.length - 1 ? (
                <View style={detailStyles.summaryDivider} />
              ) : null}
            </View>
          ))}
        </View>
      </View>

      <View style={detailStyles.section}>
        <View style={detailStyles.sectionHeader}>
          <View>
            <Text style={detailStyles.eyebrow}>
              ENTREGA
            </Text>

            <Text style={detailStyles.sectionTitle}>
              Datos de entrega
            </Text>
          </View>

          <View style={detailStyles.sectionIcon}>
            <Ionicons
              color={orderPalette.deepBlue}
              name={
                order.deliveryMethod ===
                DeliveryMethod.HomeDelivery
                  ? "car-outline"
                  : "storefront-outline"
              }
              size={20}
            />
          </View>
        </View>

        <View style={detailStyles.card}>
          <View style={detailStyles.detailRow}>
            <View style={detailStyles.detailIcon}>
              <Ionicons
                color={orderPalette.deepBlue}
                name={
                  order.deliveryMethod ===
                  DeliveryMethod.HomeDelivery
                    ? "home-outline"
                    : "storefront-outline"
                }
                size={19}
              />
            </View>

            <View style={detailStyles.flex}>
              <Text style={detailStyles.label}>
                MÉTODO
              </Text>

              <Text style={detailStyles.value}>
                {deliveryLabel}
              </Text>
            </View>
          </View>

          {order.deliveryMethod ===
            DeliveryMethod.HomeDelivery &&
          order.deliveryAddressSnapshot ? (
            <>
              <View style={detailStyles.summaryDivider} />

              <View style={detailStyles.detailRow}>
                <View style={detailStyles.detailIcon}>
                  <Ionicons
                    color={orderPalette.deepBlue}
                    name="location-outline"
                    size={19}
                  />
                </View>

                <View style={detailStyles.flex}>
                  <Text style={detailStyles.label}>
                    DIRECCIÓN
                  </Text>

                  <Text style={detailStyles.value}>
                    {order.deliveryAddressSnapshot.label ??
                      "Dirección"}
                  </Text>

                  <Text style={detailStyles.secondaryValue}>
                    {
                      order.deliveryAddressSnapshot
                        .addressLine
                    }
                  </Text>

                  <Text style={detailStyles.secondaryValue}>
                    {[
                      order.deliveryAddressSnapshot
                        .municipality,
                      order.deliveryAddressSnapshot
                        .department,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>

                  {order.deliveryAddressSnapshot.phone ? (
                    <Text
                      style={detailStyles.secondaryValue}
                    >
                      {
                        order.deliveryAddressSnapshot
                          .phone
                      }
                    </Text>
                  ) : null}
                </View>
              </View>
            </>
          ) : null}

          {order.deliveryMethod ===
          DeliveryMethod.StorePickup ? (
            <>
              <View style={detailStyles.summaryDivider} />

              <View style={detailStyles.detailRow}>
                <View style={detailStyles.detailIcon}>
                  <Ionicons
                    color={orderPalette.deepBlue}
                    name="business-outline"
                    size={19}
                  />
                </View>

                <View style={detailStyles.flex}>
                  <Text style={detailStyles.label}>
                    SUCURSAL
                  </Text>

                  <Text style={detailStyles.value}>
                    {branch?.name ?? "Sucursal"}
                  </Text>

                  <Text style={detailStyles.secondaryValue}>
                    {branch?.address ??
                      "Dirección no disponible"}
                  </Text>

                  {branch?.openingHours ? (
                    <Text
                      style={detailStyles.secondaryValue}
                    >
                      {branch.openingHours}
                    </Text>
                  ) : null}
                </View>
              </View>
            </>
          ) : null}
        </View>
      </View>

      <View style={detailStyles.twoColumnSection}>
        <View style={detailStyles.halfCard}>
          <View style={detailStyles.smallCardIcon}>
            <Ionicons
              color={orderPalette.deepBlue}
              name="person-outline"
              size={19}
            />
          </View>

          <Text style={detailStyles.label}>CONTACTO</Text>

          <Text style={detailStyles.value}>
            {order.contactSnapshot?.name ?? "Cliente"}
          </Text>

          {order.contactSnapshot?.email ? (
            <Text style={detailStyles.secondaryValue}>
              {order.contactSnapshot.email}
            </Text>
          ) : null}

          <Text style={detailStyles.secondaryValue}>
            {order.contactSnapshot?.phone ??
              "Teléfono no registrado"}
          </Text>
        </View>

        <View style={detailStyles.halfCard}>
          <View style={detailStyles.smallCardIcon}>
            <Ionicons
              color={orderPalette.deepBlue}
              name="document-text-outline"
              size={19}
            />
          </View>

          <Text style={detailStyles.label}>
            FACTURACIÓN
          </Text>

          <Text style={detailStyles.value}>
            {order.billingSnapshot?.name ??
              order.contactSnapshot?.name ??
              "Consumidor final"}
          </Text>

          <Text style={detailStyles.secondaryValue}>
            NIT:{" "}
            {order.billingSnapshot?.nit?.trim() ||
              "CF"}
          </Text>
        </View>
      </View>

      <View style={detailStyles.section}>
        <View style={detailStyles.sectionHeader}>
          <View>
            <Text style={detailStyles.eyebrow}>
              PAGO
            </Text>

            <Text style={detailStyles.sectionTitle}>
              Información del pago
            </Text>
          </View>

          <View style={detailStyles.sectionIcon}>
            <Ionicons
              color={orderPalette.deepBlue}
              name="card-outline"
              size={20}
            />
          </View>
        </View>

        <View style={detailStyles.card}>
          {payments.length === 0 ? (
            <Text style={detailStyles.secondaryValue}>
              Sin pago registrado.
            </Text>
          ) : (
            payments.map((payment, index) => (
              <View key={payment.id}>
                <View style={detailStyles.paymentRow}>
                  <View style={detailStyles.detailIcon}>
                    <Ionicons
                      color={orderPalette.deepBlue}
                      name="card-outline"
                      size={19}
                    />
                  </View>

                  <View style={detailStyles.flex}>
                    <Text style={detailStyles.value}>
                      {payment.cardBrandSnapshot ??
                        payment.method}
                      {payment.cardLast4Snapshot
                        ? ` •••• ${payment.cardLast4Snapshot}`
                        : ""}
                    </Text>

                    <Text
                      style={detailStyles.secondaryValue}
                    >
                      Estado: {payment.status}
                    </Text>

                    {payment.reference ? (
                      <Text
                        style={
                          detailStyles.secondaryValue
                        }
                      >
                        Ref: {payment.reference}
                      </Text>
                    ) : null}
                  </View>

                  <Text
                    style={detailStyles.paymentAmount}
                  >
                    {formatCurrency(
                      payment.amount,
                      currency,
                    )}
                  </Text>
                </View>

                {index < payments.length - 1 ? (
                  <View
                    style={detailStyles.summaryDivider}
                  />
                ) : null}
              </View>
            ))
          )}
        </View>
      </View>

      <View style={detailStyles.totalCard}>
        <Text style={detailStyles.totalCardTitle}>
          Resumen de compra
        </Text>

        <View style={detailStyles.priceRow}>
          <Text style={detailStyles.priceLabel}>
            Subtotal
          </Text>

          <Text style={detailStyles.priceValue}>
            {formatCurrency(order.subtotal, currency)}
          </Text>
        </View>

        <View style={detailStyles.priceRow}>
          <Text style={detailStyles.priceLabel}>
            Descuento
          </Text>

          <Text style={detailStyles.priceValue}>
            {formatCurrency(order.discount, currency)}
          </Text>
        </View>

        <View style={detailStyles.priceRow}>
          <Text style={detailStyles.priceLabel}>
            Envío
          </Text>

          <Text style={detailStyles.priceValue}>
            {formatCurrency(
              order.shippingCost,
              currency,
            )}
          </Text>
        </View>

        <View style={detailStyles.totalDivider} />

        <View style={detailStyles.priceRow}>
          <Text style={detailStyles.finalTotalLabel}>
            Total
          </Text>

          <Text style={detailStyles.finalTotal}>
            {formatCurrency(order.total, currency)}
          </Text>
        </View>
      </View>

      <Pressable
        disabled={isGenerating}
        onPress={() => void downloadInvoice(order)}
        style={({ pressed }) => [
          detailStyles.invoiceButton,
          isGenerating ? detailStyles.disabled : null,
          pressed && !isGenerating
            ? detailStyles.pressed
            : null,
        ]}
      >
        <View style={detailStyles.invoiceIcon}>
          {isGenerating ? (
            <ActivityIndicator
              color={orderPalette.deepBlue}
              size="small"
            />
          ) : (
            <Ionicons
              color={orderPalette.deepBlue}
              name="download-outline"
              size={21}
            />
          )}
        </View>

        <View style={detailStyles.flex}>
          <Text style={detailStyles.invoiceTitle}>
            {isGenerating
              ? "Generando factura..."
              : "Descargar factura"}
          </Text>

          <Text style={detailStyles.invoiceSubtitle}>
            Documento PDF de tu compra
          </Text>
        </View>

        {!isGenerating ? (
          <Ionicons
            color={orderPalette.white}
            name="chevron-forward"
            size={20}
          />
        ) : null}
      </Pressable>

      {invoiceError ? (
        <Text style={detailStyles.error}>
          {invoiceError}
        </Text>
      ) : null}

      <View style={detailStyles.secureRow}>
        <Ionicons
          color="#247A52"
          name="shield-checkmark-outline"
          size={14}
        />

        <Text style={detailStyles.secureText}>
          Información guardada de forma segura
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

const detailStyles = StyleSheet.create({
  content: {
    backgroundColor: orderPalette.vanillaMilk,
    flexGrow: 1,
    paddingBottom: 36,
  },

  loading: {
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

  notFound: {
    alignItems: "center",
    backgroundColor: orderPalette.vanillaMilk,
    flex: 1,
    justifyContent: "center",
    padding: 28,
  },

  notFoundIcon: {
    alignItems: "center",
    backgroundColor: orderPalette.white,
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    width: 64,
  },

  notFoundTitle: {
    color: orderPalette.text,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 16,
  },

  notFoundText: {
    color: orderPalette.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    textAlign: "center",
  },

  hero: {
    backgroundColor: orderPalette.deepBlue,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 18,
    minHeight: 218,
    overflow: "hidden",
    paddingBottom: 22,
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

  heroTitleArea: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
    paddingRight: 10,
  },

  heroHeading: {
    flex: 1,
  },

  backButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },

  heroIcon: {
    alignItems: "center",
    backgroundColor: orderPalette.white,
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  brand: {
    color: orderPalette.butterHoney,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.7,
  },

  heroTitle: {
    color: orderPalette.white,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 2,
  },

  heroDescription: {
    color: "#EAF1F8",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 15,
    maxWidth: "82%",
  },

  orderNumberBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: orderPalette.butterHoney,
    borderRadius: 18,
    flexDirection: "row",
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  orderNumberBadgeText: {
    color: orderPalette.deepBlue,
    fontSize: 11,
    fontWeight: "900",
  },

  orderSummaryCard: {
    backgroundColor: orderPalette.white,
    borderColor: orderPalette.silkyLilac,
    borderRadius: 21,
    borderWidth: 1,
    marginHorizontal: 16,
    padding: 18,
  },

  summaryTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  summaryHeading: {
    flex: 1,
  },

  eyebrow: {
    color: orderPalette.dreamyBlue,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
  },

  summaryTitle: {
    color: orderPalette.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 2,
  },

  statusBadge: {
    alignItems: "center",
    borderRadius: 13,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "900",
  },

  summaryDivider: {
    backgroundColor: "#E5EAF0",
    height: 1,
    marginVertical: 14,
  },

  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
  },

  summaryIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3FB",
    borderRadius: 11,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  flex: {
    flex: 1,
  },

  label: {
    color: orderPalette.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  value: {
    color: orderPalette.text,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 3,
  },

  secondaryValue: {
    color: orderPalette.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  totalRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  totalHint: {
    color: orderPalette.muted,
    fontSize: 10,
    marginTop: 3,
  },

  bigTotal: {
    color: orderPalette.deepBlue,
    fontSize: 23,
    fontWeight: "900",
  },

  demoButton: {
    alignItems: "center",
    backgroundColor: "#FFF4D8",
    borderRadius: 12,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 11,
  },

  demoButtonText: {
    color: orderPalette.deepBlue,
    fontSize: 11,
    fontWeight: "900",
  },

  section: {
    marginHorizontal: 16,
    marginTop: 20,
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    color: orderPalette.text,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 1,
  },

  sectionIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3FB",
    borderRadius: 11,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  card: {
    backgroundColor: orderPalette.white,
    borderColor: orderPalette.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },

  timelineItem: {
    flexDirection: "row",
    minHeight: 58,
  },

  timelineSide: {
    alignItems: "center",
    marginRight: 12,
    width: 24,
  },

  timelineDot: {
    alignItems: "center",
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    width: 24,
  },

  timelineDotCompleted: {
    backgroundColor: "#247A52",
  },

  timelineDotCurrent: {
    backgroundColor: orderPalette.deepBlue,
  },

  timelineDotPending: {
    backgroundColor: "#E8ECF1",
  },

  timelineLine: {
    backgroundColor: "#DDE3EE",
    flex: 1,
    marginVertical: 3,
    width: 2,
  },

  timelineContent: {
    flex: 1,
    paddingBottom: 16,
    paddingTop: 2,
  },

  timelineLabel: {
    color: orderPalette.text,
    fontSize: 13,
    fontWeight: "900",
  },

  timelineDate: {
    color: orderPalette.muted,
    fontSize: 10,
    marginTop: 4,
  },

  productRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
  },

  productIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3FB",
    borderRadius: 12,
    height: 43,
    justifyContent: "center",
    width: 43,
  },

  productName: {
    color: orderPalette.text,
    fontSize: 12,
    fontWeight: "900",
  },

  productSku: {
    color: orderPalette.muted,
    fontSize: 9,
    marginTop: 2,
  },

  productQuantity: {
    color: orderPalette.deepBlue,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
  },

  productTotal: {
    color: orderPalette.deepBlue,
    fontSize: 13,
    fontWeight: "900",
  },

  detailRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 11,
  },

  detailIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3FB",
    borderRadius: 11,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  twoColumnSection: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 20,
  },

  halfCard: {
    backgroundColor: orderPalette.white,
    borderColor: orderPalette.border,
    borderRadius: 17,
    borderWidth: 1,
    flex: 1,
    minHeight: 150,
    padding: 14,
  },

  smallCardIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3FB",
    borderRadius: 10,
    height: 37,
    justifyContent: "center",
    marginBottom: 11,
    width: 37,
  },

  paymentRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
  },

  paymentAmount: {
    color: orderPalette.deepBlue,
    fontSize: 13,
    fontWeight: "900",
  },

  totalCard: {
    backgroundColor: "#F1F0FF",
    borderColor: orderPalette.silkyLilac,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 18,
  },

  totalCardTitle: {
    color: orderPalette.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 14,
  },

  priceRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },

  priceLabel: {
    color: orderPalette.muted,
    fontSize: 11,
  },

  priceValue: {
    color: orderPalette.text,
    fontSize: 11,
    fontWeight: "800",
  },

  totalDivider: {
    backgroundColor: orderPalette.silkyLilac,
    height: 1,
    marginVertical: 11,
  },

  finalTotalLabel: {
    color: orderPalette.text,
    fontSize: 14,
    fontWeight: "900",
  },

  finalTotal: {
    color: orderPalette.deepBlue,
    fontSize: 22,
    fontWeight: "900",
  },

  invoiceButton: {
    alignItems: "center",
    backgroundColor: orderPalette.deepBlue,
    borderRadius: 16,
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 18,
    minHeight: 66,
    paddingHorizontal: 15,
  },

  invoiceIcon: {
    alignItems: "center",
    backgroundColor: orderPalette.butterHoney,
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    marginRight: 11,
    width: 42,
  },

  invoiceTitle: {
    color: orderPalette.white,
    fontSize: 13,
    fontWeight: "900",
  },

  invoiceSubtitle: {
    color: "#DCE9F4",
    fontSize: 9,
    marginTop: 3,
  },

  secureRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    marginTop: 12,
  },

  secureText: {
    color: "#247A52",
    fontSize: 10,
    fontWeight: "700",
  },

  primaryButton: {
    backgroundColor: orderPalette.deepBlue,
    borderRadius: 14,
    marginTop: 18,
    paddingHorizontal: 28,
    paddingVertical: 13,
  },

  primaryButtonText: {
    color: orderPalette.white,
    fontSize: 12,
    fontWeight: "900",
  },

  error: {
    color: "#C84646",
    fontSize: 11,
    fontWeight: "700",
    marginHorizontal: 16,
    marginTop: 10,
    textAlign: "center",
  },

  disabled: {
    opacity: 0.5,
  },

  pressed: {
    opacity: 0.72,
  },
});
