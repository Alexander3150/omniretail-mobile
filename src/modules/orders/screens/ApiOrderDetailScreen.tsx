import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useRepositories } from "@/infrastructure";
import {
  ApiCheckoutStorage,
  type ApiCheckoutReceipt,
} from "@/infrastructure/api/checkout";
import { useApiOrderTracking } from "@/modules/orders/hooks/useApiOrderTracking";
import { useOrderReceiptDownload } from "@/modules/orders/hooks/useOrderReceiptDownload";
import { formatCurrency, formatDateTime } from "@/shared";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const palette = {
  deepBlue: "#3E668F",
  dreamyBlue: "#81A9EE",
  butterHoney: "#FFDB83",
  vanillaMilk: "#FFF2D0",
  white: "#FFFFFF",
  text: "#172033",
  muted: "#687286",
  border: "#DDE3EE",
};

export function ApiOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { apiCustomerOrderService } = useRepositories();
  const [receipt, setReceipt] = useState<ApiCheckoutReceipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {
    downloadReceipt,
    error: receiptError,
    isGenerating: isGeneratingReceipt,
  } = useOrderReceiptDownload();

  const {
    errorCode: trackingErrorCode,
    isLoading: isTrackingLoading,
    presentationStatus,
    reload: reloadTracking,
    tracking,
  } = useApiOrderTracking(receipt?.trackingToken);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const key = id?.startsWith("api:")
        ? id.slice(4)
        : id;

      if (!key) {
        if (mounted) {
          setIsLoading(false);
        }
        return;
      }

      // El historial usa el id del backend; los recibos guardados al confirmar usan el número de pedido.
      let result: ApiCheckoutReceipt | null = null;

      if (UUID_PATTERN.test(key)) {
        try {
          result = await apiCustomerOrderService.getReceipt(key);
        } catch (error) {
          console.warn("No se pudo cargar el pedido:", error);
        }
      } else {
        result = await new ApiCheckoutStorage().getReceipt(key);
      }

      if (mounted) {
        setReceipt(result);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [apiCustomerOrderService, id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={palette.deepBlue} size="large" />
        <Text style={styles.loadingText}>Cargando pedido...</Text>
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={styles.center}>
        <View style={styles.notFoundIcon}>
          <Ionicons
            color={palette.deepBlue}
            name="receipt-outline"
            size={34}
          />
        </View>

        <Text style={styles.notFoundTitle}>Pedido no encontrado</Text>

        <Text style={styles.notFoundText}>
          No pudimos encontrar el recibo de este pedido.
        </Text>

        <Pressable onPress={() => router.back()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Regresar</Text>
        </Pressable>
      </View>
    );
  }

  const itemCount = receipt.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const currentStatus =
    presentationStatus ?? normalizeReceiptStatus(receipt.orderStatus);

  const statusPresentation = getTrackingStatusPresentation(currentStatus);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.decorationOne} />
        <View style={styles.decorationTwo} />

        <View style={styles.heroTop}>
          <View style={styles.heroTitleArea}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons
                color={palette.white}
                name="arrow-back"
                size={19}
              />
            </Pressable>

            <View style={styles.flex}>
              <Text style={styles.brand}>FERREPHARMA</Text>
              <Text style={styles.heroTitle}>Detalle del pedido</Text>
            </View>
          </View>

          <View style={styles.heroIcon}>
            <Ionicons
              color={palette.deepBlue}
              name="bag-check-outline"
              size={24}
            />
          </View>
        </View>

        <Text style={styles.heroDescription}>
          Consulta la información confirmada de tu compra.
        </Text>

        <View style={styles.orderNumberBadge}>
          <Ionicons
            color={palette.deepBlue}
            name="receipt-outline"
            size={14}
          />
          <Text style={styles.orderNumberBadgeText}>
            {receipt.orderNumber}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.eyebrow}>RESUMEN</Text>
            <Text style={styles.sectionTitle}>Tu pedido</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusPresentation.background },
            ]}
          >
            <Ionicons
              color={statusPresentation.color}
              name={statusPresentation.icon}
              size={14}
            />
            <Text
              style={[
                styles.statusText,
                { color: statusPresentation.color },
              ]}
            >
              {statusPresentation.label}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <InfoRow
          icon="calendar-outline"
          label="FECHA DEL PEDIDO"
          value={formatDateTime(receipt.savedAt)}
        />

        <View style={styles.divider} />

        <InfoRow
          icon="card-outline"
          label="ESTADO DEL PAGO"
          value={receipt.paymentStatus}
        />

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <View>
            <Text style={styles.label}>TOTAL DEL PEDIDO</Text>
            <Text style={styles.hint}>
              {itemCount} {itemCount === 1 ? "artículo" : "artículos"}
            </Text>
          </View>

          <Text style={styles.total}>
            {formatCurrency(receipt.total, "GTQ")}
          </Text>
        </View>
      </View>

      <View style={styles.receiptSection}>
        <Pressable
          disabled={isGeneratingReceipt}
          onPress={() => void downloadReceipt(receipt)}
          style={({ pressed }) => [
            styles.receiptButton,
            pressed ? styles.pressed : null,
            isGeneratingReceipt ? styles.receiptButtonDisabled : null,
          ]}
        >
          {isGeneratingReceipt ? (
            <ActivityIndicator color={palette.white} size="small" />
          ) : (
            <Ionicons color={palette.white} name="download-outline" size={19} />
          )}
          <Text style={styles.receiptButtonText}>
            {isGeneratingReceipt ? "Generando comprobante..." : "Descargar comprobante"}
          </Text>
        </Pressable>

        {receiptError ? <Text style={styles.receiptError}>{receiptError}</Text> : null}
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.eyebrow}>PRODUCTOS</Text>
          <Text style={styles.sectionTitle}>Artículos comprados</Text>
        </View>

        <View style={styles.sectionIcon}>
          <Ionicons
            color={palette.deepBlue}
            name="cube-outline"
            size={20}
          />
        </View>
      </View>

      <View style={styles.card}>
        {receipt.items.map((item, index) => (
          <View key={`${item.sku}-${index}`}>
            <View style={styles.productRow}>
              <View style={styles.productIcon}>
                <Ionicons
                  color={palette.deepBlue}
                  name="cube-outline"
                  size={20}
                />
              </View>

              <View style={styles.flex}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productSku}>{item.sku}</Text>
                <Text style={styles.productQuantity}>
                  Cantidad: {item.quantity}
                </Text>
                <Text style={styles.unitPrice}>
                  Unitario: {formatCurrency(item.unitPrice, "GTQ")}
                </Text>
              </View>

              <Text style={styles.productTotal}>
                {formatCurrency(item.subtotal, "GTQ")}
              </Text>
            </View>

            {index < receipt.items.length - 1 ? (
              <View style={styles.divider} />
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.eyebrow}>ENTREGA</Text>
          <Text style={styles.sectionTitle}>Información del pedido</Text>
        </View>

        <View style={styles.sectionIcon}>
          <Ionicons
            color={palette.deepBlue}
            name="home-outline"
            size={20}
          />
        </View>
      </View>

      <View style={styles.card}>
        <InfoRow
          icon="home-outline"
          label="MÉTODO"
          value="Envío a domicilio"
        />

        <View style={styles.divider} />

        <InfoRow
          icon="shield-checkmark-outline"
          label="RESERVA DE INVENTARIO"
          value={
            receipt.hasInventoryReservations
              ? "Confirmada"
              : "No indicada"
          }
        />

        <View style={styles.divider} />

        <InfoRow
          icon="mail-outline"
          label="CONFIRMACIÓN"
          value={
            receipt.confirmationEmailSent
              ? "Correo enviado"
              : "Pedido registrado"
          }
        />
      </View>

      {receipt.trackingToken ? (
        <View style={styles.trackingCard}>
          <View style={styles.trackingHeader}>
            <View style={styles.trackingHeaderLeft}>
              <View style={styles.trackingIcon}>
                <Ionicons
                  color={palette.deepBlue}
                  name="navigate-outline"
                  size={21}
                />
              </View>

              <View style={styles.flex}>
                <Text style={styles.eyebrow}>SEGUIMIENTO</Text>
                <Text style={styles.sectionTitle}>Estado de tu pedido</Text>
              </View>
            </View>

            <Pressable
              disabled={isTrackingLoading}
              onPress={() => void reloadTracking()}
              style={({ pressed }) => [
                styles.refreshButton,
                pressed ? styles.pressed : null,
                isTrackingLoading ? styles.refreshButtonDisabled : null,
              ]}
            >
              {isTrackingLoading ? (
                <ActivityIndicator color={palette.deepBlue} size="small" />
              ) : (
                <Ionicons
                  color={palette.deepBlue}
                  name="refresh-outline"
                  size={19}
                />
              )}
            </Pressable>
          </View>

          {tracking ? (
            <>
              <View style={styles.trackingCurrent}>
                <View
                  style={[
                    styles.trackingStatusIcon,
                    { backgroundColor: statusPresentation.background },
                  ]}
                >
                  <Ionicons
                    color={statusPresentation.color}
                    name={statusPresentation.icon}
                    size={24}
                  />
                </View>

                <View style={styles.flex}>
                  <Text style={styles.trackingCurrentLabel}>
                    ESTADO ACTUAL
                  </Text>
                  <Text style={styles.trackingCurrentTitle}>
                    {statusPresentation.label}
                  </Text>
                  <Text style={styles.trackingCurrentText}>
                    {statusPresentation.description}
                  </Text>
                </View>
              </View>

              <View style={styles.trackingDivider} />

              <View style={styles.trackingServerRow}>
                <Ionicons
                  color={palette.deepBlue}
                  name="cloud-done-outline"
                  size={17}
                />
                <Text style={styles.trackingServerText}>
                  Estado actualizado desde FERREPHARMA
                </Text>
              </View>

              <View style={styles.trackingServerRow}>
                <Ionicons
                  color={palette.deepBlue}
                  name="receipt-outline"
                  size={17}
                />
                <Text style={styles.trackingServerText}>
                  Pedido {tracking.orderNumber}
                </Text>
              </View>
            </>
          ) : isTrackingLoading ? (
            <View style={styles.trackingLoading}>
              <ActivityIndicator color={palette.deepBlue} size="small" />
              <Text style={styles.trackingLoadingText}>
                Consultando el estado actual...
              </Text>
            </View>
          ) : (
            <View style={styles.trackingFallback}>
              <Ionicons
                color={palette.deepBlue}
                name={
                  trackingErrorCode === "ORDER_TRACKING_NOT_FOUND"
                    ? "search-outline"
                    : "cloud-offline-outline"
                }
                size={22}
              />

              <View style={styles.flex}>
                <Text style={styles.noticeTitle}>
                  {trackingErrorCode === "ORDER_TRACKING_NOT_FOUND"
                    ? "Seguimiento no disponible"
                    : "No pudimos actualizar el seguimiento"}
                </Text>

                <Text style={styles.noticeText}>
                  {trackingErrorCode === "ORDER_TRACKING_NOT_FOUND"
                    ? "No encontramos información pública de seguimiento para este pedido."
                    : "Conservamos la información guardada de tu pedido. Puedes intentar actualizar nuevamente."}
                </Text>
              </View>
            </View>
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

type TrackingPresentationStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

type TrackingStatusPresentation = {
  label: string;
  description: string;
  color: string;
  background: string;
  icon: keyof typeof Ionicons.glyphMap;
};

function normalizeReceiptStatus(status: string): TrackingPresentationStatus {
  switch (status) {
    case "pending":
      return "pending";
    case "preparing":
      return "preparing";
    case "sent":
    case "shipped":
      return "shipped";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    default:
      return "confirmed";
  }
}

function getTrackingStatusPresentation(
  status: TrackingPresentationStatus,
): TrackingStatusPresentation {
  switch (status) {
    case "pending":
      return {
        label: "Pendiente",
        description: "Tu pedido fue recibido y está pendiente de confirmación.",
        color: "#8A641A",
        background: "#FFF4D6",
        icon: "time-outline",
      };

    case "preparing":
      return {
        label: "Preparando",
        description: "FERREPHARMA está preparando tu pedido.",
        color: "#35669A",
        background: "#EAF3FC",
        icon: "cube-outline",
      };

    case "shipped":
      return {
        label: "Enviado",
        description: "Tu pedido ya fue despachado.",
        color: "#5A55A5",
        background: "#EFEEFF",
        icon: "navigate-outline",
      };

    case "delivered":
      return {
        label: "Entregado",
        description: "El pedido aparece como entregado.",
        color: "#247A52",
        background: "#E9F7EF",
        icon: "checkmark-circle-outline",
      };

    case "cancelled":
      return {
        label: "Cancelado",
        description: "El pedido aparece como cancelado.",
        color: "#A33E3E",
        background: "#FDECEC",
        icon: "close-circle-outline",
      };

    case "confirmed":
    default:
      return {
        label: "Confirmado",
        description: "Tu pedido fue confirmado correctamente.",
        color: "#247A52",
        background: "#E9F7EF",
        icon: "checkmark-circle-outline",
      };
  }
}

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons color={palette.deepBlue} name={icon} size={19} />
      </View>

      <View style={styles.flex}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: palette.vanillaMilk,
    flexGrow: 1,
    paddingBottom: 34,
  },
  center: {
    alignItems: "center",
    backgroundColor: palette.vanillaMilk,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    color: palette.muted,
    marginTop: 12,
  },
  hero: {
    backgroundColor: palette.deepBlue,
    overflow: "hidden",
    paddingBottom: 26,
    paddingHorizontal: 20,
    paddingTop: 52,
  },
  decorationOne: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 90,
    height: 150,
    position: "absolute",
    right: -55,
    top: -50,
    width: 150,
  },
  decorationTwo: {
    backgroundColor: "rgba(255,219,131,0.12)",
    borderRadius: 70,
    bottom: -55,
    height: 130,
    left: -45,
    position: "absolute",
    width: 130,
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroTitleArea: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
  },
  backButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    marginRight: 12,
    width: 36,
  },
  brand: {
    color: palette.butterHoney,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: palette.white,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    marginLeft: 12,
    width: 50,
  },
  heroDescription: {
    color: "#EEF4FB",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 18,
  },
  orderNumberBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: palette.butterHoney,
    borderRadius: 20,
    flexDirection: "row",
    gap: 7,
    marginTop: 15,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  orderNumberBadgeText: {
    color: palette.deepBlue,
    fontSize: 12,
    fontWeight: "800",
  },
  card: {
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 22,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
  },
  receiptSection: {
    marginHorizontal: 16,
    marginTop: 18,
  },
  receiptButton: {
    alignItems: "center",
    backgroundColor: palette.deepBlue,
    borderRadius: 14,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  receiptButtonDisabled: {
    opacity: 0.65,
  },
  receiptButtonText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: "800",
  },
  receiptError: {
    color: "#A33E3E",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  sectionHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: palette.deepBlue,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 19,
    fontWeight: "800",
    marginTop: 3,
  },
  statusBadge: {
    alignItems: "center",
    backgroundColor: "#E9F7EF",
    borderRadius: 18,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusText: {
    color: "#247A52",
    fontSize: 12,
    fontWeight: "800",
  },
  divider: {
    backgroundColor: palette.border,
    height: 1,
    marginVertical: 15,
  },
  infoRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  infoIcon: {
    alignItems: "center",
    backgroundColor: "#EEF4FB",
    borderRadius: 18,
    height: 38,
    justifyContent: "center",
    marginRight: 12,
    width: 38,
  },
  label: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  value: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 3,
  },
  totalRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  hint: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 4,
  },
  total: {
    color: palette.deepBlue,
    fontSize: 23,
    fontWeight: "900",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginTop: 24,
  },
  sectionIcon: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  productRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  productIcon: {
    alignItems: "center",
    backgroundColor: "#EEF4FB",
    borderRadius: 20,
    height: 42,
    justifyContent: "center",
    marginRight: 12,
    width: 42,
  },
  productName: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "800",
  },
  productSku: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 2,
  },
  productQuantity: {
    color: palette.text,
    fontSize: 12,
    marginTop: 5,
  },
  unitPrice: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 2,
  },
  productTotal: {
    color: palette.deepBlue,
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },
  trackingCard: {
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 22,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 18,
    padding: 18,
  },
  trackingHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trackingHeaderLeft: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
  },
  trackingIcon: {
    alignItems: "center",
    backgroundColor: "#EEF4FB",
    borderRadius: 20,
    height: 42,
    justifyContent: "center",
    marginRight: 12,
    width: 42,
  },
  refreshButton: {
    alignItems: "center",
    backgroundColor: "#EEF4FB",
    borderRadius: 18,
    height: 38,
    justifyContent: "center",
    marginLeft: 10,
    width: 38,
  },
  refreshButtonDisabled: {
    opacity: 0.65,
  },
  trackingCurrent: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 20,
  },
  trackingStatusIcon: {
    alignItems: "center",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    marginRight: 14,
    width: 50,
  },
  trackingCurrentLabel: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  trackingCurrentTitle: {
    color: palette.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 2,
  },
  trackingCurrentText: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  trackingDivider: {
    backgroundColor: palette.border,
    height: 1,
    marginVertical: 16,
  },
  trackingServerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 7,
  },
  trackingServerText: {
    color: palette.muted,
    flex: 1,
    fontSize: 12,
  },
  trackingLoading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    paddingVertical: 12,
  },
  trackingLoadingText: {
    color: palette.muted,
    fontSize: 12,
  },
  trackingFallback: {
    alignItems: "flex-start",
    backgroundColor: "#EEF4FB",
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
    padding: 14,
  },
  notice: {
    backgroundColor: "#EEF4FB",
    borderColor: palette.dreamyBlue,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
  },
  noticeTitle: {
    color: palette.deepBlue,
    fontSize: 14,
    fontWeight: "800",
  },
  noticeText: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  notFoundIcon: {
    alignItems: "center",
    backgroundColor: "#EEF4FB",
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  notFoundTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 16,
  },
  notFoundText: {
    color: palette.muted,
    marginTop: 7,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: palette.deepBlue,
    borderRadius: 14,
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: palette.white,
    fontWeight: "800",
  },
  flex: {
    flex: 1,
  },
  pressed: {
    opacity: 0.75,
  },
});
