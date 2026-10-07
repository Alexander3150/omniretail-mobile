import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ApiError, getErrorMessage, useRepositories } from "@/infrastructure";
import { GUATEMALA_DEPARTMENTS, getGuatemalaMunicipalities } from "@/config";
import { useSession } from "@/modules/auth";
import { useCart } from "@/modules/cart";
import { formatCurrency, OptionPicker } from "@/shared";
import { colors, typography } from "@/theme";

import {
  getApiCheckoutReceipt,
  placeApiOrder,
} from "../application/PlaceApiOrderService";
import { useCheckout } from "../context/CheckoutProvider";

type CheckoutHeroProps = {
  badge: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
};

function CheckoutHero({
  badge,
  description,
  icon,
  title,
}: CheckoutHeroProps) {
  return (
    <View style={styles.checkoutHero}>
      <View style={styles.checkoutHeroDecorationOne} />
      <View style={styles.checkoutHeroDecorationTwo} />

      <View style={styles.checkoutHeroTop}>
        <View style={styles.checkoutHeroTitleArea}>
          <Pressable
            accessibilityLabel="Regresar"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.checkoutBackButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons color="#FFFFFF" name="arrow-back" size={20} />
          </Pressable>

          <View style={styles.checkoutHeading}>
            <Text style={styles.checkoutBrand}>FERREPHARMA</Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.checkoutHeroTitle}
            >
              {title}
            </Text>
          </View>
        </View>

        <View style={styles.checkoutHeroIcon}>
          <Ionicons color="#3E668F" name={icon} size={24} />
        </View>
      </View>

      <Text style={styles.checkoutHeroDescription}>{description}</Text>

      <View style={styles.checkoutStepBadge}>
        <Ionicons
          color="#3E668F"
          name="checkmark-circle-outline"
          size={15}
        />
        <Text style={styles.checkoutStepText}>{badge}</Text>
      </View>
    </View>
  );
}

export function ApiCheckoutDeliveryScreen() {
  const { customer, session } = useSession();
  const checkout = useCheckout();
  const [error, setError] = useState<string | null>(null);
  const hasPrefilledContact = useRef(false);

  useEffect(() => {
    if (hasPrefilledContact.current || !customer) return;
    hasPrefilledContact.current = true;
    if (customer?.name) checkout.setFullName(customer.name);
    if (customer?.email) checkout.setEmail(customer.email);
    if (customer?.phone) checkout.setContactPhone(customer.phone);
  }, [checkout, customer]);

  // Precarga la dirección predeterminada de /me/addresses si el formulario está vacío.
  const { addressRepository } = useRepositories();
  const hasPrefilledAddress = useRef(false);

  useEffect(() => {
    if (!session || hasPrefilledAddress.current || checkout.addressLine1.trim()) {
      return;
    }

    hasPrefilledAddress.current = true;

    addressRepository
      .getByCustomer(session.tenantId, session.customerId)
      .then((addresses) => {
        const address =
          addresses.find((item) => item.isDefault) ?? addresses[0];

        // Los setters usan actualizaciones funcionales: es seguro aunque `checkout` cambie.
        if (!address) {
          return;
        }

        checkout.setAddressLine1(address.addressLine);
        checkout.setAddressLine2(address.addressLine2 ?? "");
        checkout.setCity(address.municipality ?? "");
        checkout.setDepartment(address.department ?? "");
        checkout.setReferences(address.references ?? "");
      })
      .catch((loadError) => {
        console.warn("No se pudo precargar la dirección guardada:", loadError);
      });
  }, [addressRepository, checkout, session]);

  function continueToPayment() {
    setError(null);

    if (!checkout.fullName.trim()) {
      setError("Ingresa el nombre completo.");
      return;
    }

    if (!checkout.email.trim()) {
      setError("Ingresa el correo electrónico.");
      return;
    }

    if (!/^[0-9]{8}$/.test(checkout.contactPhone.trim())) {
      setError("El teléfono debe tener 8 dígitos.");
      return;
    }

    if (!checkout.addressLine1.trim()) {
      setError("Ingresa la dirección de entrega.");
      return;
    }

    if (!checkout.department.trim() || !checkout.city.trim()) {
      setError("Selecciona el departamento y el municipio.");
      return;
    }

    router.push("/(protected)/checkout/payment");
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <CheckoutHero
        badge="1 de 3 · Entrega"
        description="Indica dónde quieres recibir tu pedido."
        icon="car-outline"
        title="Entrega"
      />

      <View style={styles.checkoutSection}>
        <View style={styles.deliveryType}>
          <View style={styles.optionIcon}>
            <Ionicons
              color="#3E668F"
              name="home-outline"
              size={22}
            />
          </View>

          <View style={styles.optionContent}>
            <Text style={styles.sectionTitle}>Envío a domicilio</Text>
            <Text style={styles.muted}>
              Tu pedido será enviado a la dirección indicada.
            </Text>
          </View>

          <View style={styles.activeCheck}>
            <Ionicons color="#FFFFFF" name="checkmark" size={14} />
          </View>
        </View>
      </View>

      <View style={styles.checkoutSection}>
        <Text style={styles.sectionTitle}>Datos de entrega</Text>
        <Text style={styles.sectionDescription}>
          Completa la información para entregar tu compra.
        </Text>

        <View style={styles.group}>
        <Field
          label="Nombre completo"
          onChangeText={checkout.setFullName}
          value={checkout.fullName}
        />

        <Field
          autoCapitalize="none"
          keyboardType="email-address"
          label="Correo electrónico"
          onChangeText={checkout.setEmail}
          value={checkout.email}
        />

        <Field
          keyboardType="phone-pad"
          label="Teléfono"
          maxLength={8}
          onChangeText={(value) =>
            checkout.setContactPhone(value.replace(/\D/g, "").slice(0, 8))
          }
          value={checkout.contactPhone}
        />

        <Field
          label="Dirección"
          onChangeText={checkout.setAddressLine1}
          value={checkout.addressLine1}
        />

        <Field
          label="Complemento de dirección (opcional)"
          onChangeText={checkout.setAddressLine2}
          value={checkout.addressLine2}
        />

        <OptionPicker
          label="Departamento"
          onChange={(department) => {
            checkout.setDepartment(department);
            if (!getGuatemalaMunicipalities(department).includes(checkout.city)) {
              checkout.setCity("");
            }
          }}
          options={GUATEMALA_DEPARTMENTS}
          value={checkout.department}
        />

        <OptionPicker
          emptyText="Selecciona primero un departamento."
          label="Municipio"
          onChange={checkout.setCity}
          options={getGuatemalaMunicipalities(checkout.department)}
          value={checkout.city}
        />

        <Field
          label="Referencias (opcional)"
          onChangeText={checkout.setReferences}
          value={checkout.references}
        />
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable onPress={continueToPayment} style={styles.primaryButton}>
        <Text style={styles.primaryText}>Continuar</Text>
      </Pressable>
    </ScrollView>
  );
}

export function ApiCheckoutPaymentScreen() {
  const checkout = useCheckout();
  const { session } = useSession();
  const { customerPaymentMethodRepository } = useRepositories();
  const [error, setError] = useState<string | null>(null);
  const hasPrefilledCard = useRef(false);

  // Precarga titular y últimos 4 dígitos de la tarjeta predeterminada de /me/payment-methods.
  useEffect(() => {
    if (
      !session ||
      hasPrefilledCard.current ||
      checkout.cardLastFour.trim()
    ) {
      return;
    }

    hasPrefilledCard.current = true;

    customerPaymentMethodRepository
      .getByCustomer(session.tenantId, session.customerId)
      .then((methods) => {
        const method = methods.find((item) => item.isDefault) ?? methods[0];

        if (!method?.last4) {
          return;
        }

        checkout.setCardLastFour(method.last4);
        if (method.cardholderName && !checkout.cardholderName.trim()) {
          checkout.setCardholderName(method.cardholderName);
        }
      })
      .catch((loadError) => {
        console.warn("No se pudo precargar la tarjeta guardada:", loadError);
      });
  }, [checkout, customerPaymentMethodRepository, session]);

  function continueToReview() {
    setError(null);

    if (!checkout.cardholderName.trim()) {
      setError("Ingresa el nombre del titular.");
      return;
    }

    if (!/^[0-9]{4}$/.test(checkout.cardLastFour.trim())) {
      setError("Ingresa únicamente los últimos 4 dígitos.");
      return;
    }

    router.push("/(protected)/checkout/review");
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <CheckoutHero
        badge="2 de 3 · Pago"
        description="Completa los datos permitidos para simular el pago."
        icon="card-outline"
        title="Pago"
      />

      <View style={styles.checkoutSection}>
        <View style={styles.paymentType}>
          <View style={styles.optionIcon}>
            <Ionicons color="#3E668F" name="card-outline" size={22} />
          </View>

          <View style={styles.optionContent}>
            <Text style={styles.sectionTitle}>Tarjeta</Text>
            <Text style={styles.muted}>
              Pago simulado. MARJYM solo solicita los últimos 4 dígitos.
            </Text>
          </View>

          <View style={styles.activeCheck}>
            <Ionicons color="#FFFFFF" name="checkmark" size={14} />
          </View>
        </View>
      </View>

      <View style={styles.checkoutSection}>
        <Text style={styles.sectionTitle}>Datos de la tarjeta</Text>
        <Text style={styles.sectionDescription}>
          No solicitamos número completo ni código de seguridad.
        </Text>

        <View style={styles.group}>
        <Field
          label="Nombre del titular"
          onChangeText={checkout.setCardholderName}
          value={checkout.cardholderName}
        />

        <Field
          keyboardType="number-pad"
          label="Últimos 4 dígitos"
          maxLength={4}
          onChangeText={(value) =>
            checkout.setCardLastFour(value.replace(/\D/g, "").slice(0, 4))
          }
          value={checkout.cardLastFour}
        />
        </View>
      </View>

      <View style={styles.securityBox}>
        <Ionicons
          color="#3E668F"
          name="shield-checkmark-outline"
          size={21}
        />
        <View style={styles.securityContent}>
          <Text style={styles.securityTitle}>Pago de demostración</Text>
          <Text style={styles.muted}>
            MARJYM no almacena el número completo de tu tarjeta ni CVV.
          </Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable onPress={continueToReview} style={styles.primaryButton}>
        <Text style={styles.primaryText}>Revisar pedido</Text>
      </Pressable>
    </ScrollView>
  );
}

export function ApiCheckoutReviewScreen() {
  const repositories = useRepositories();
  const { session } = useSession();
  const checkout = useCheckout();
  const { currency, lines, totals, reload } = useCart();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function confirm() {
    if (!session || isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await placeApiOrder(
        repositories,
        session,
        checkout,
      );

      const orderNumber = result.receipt.orderNumber;

      checkout.resetCheckout();
      await reload();

      router.replace({
        pathname: "/(protected)/checkout/success",
        params: { orderNumber },
      });
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(formatApiCheckoutError(caught));
      } else if (caught instanceof Error) {
        setError(caught.message);
      } else {
        setError("No se pudo confirmar el pedido.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <CheckoutHero
        badge="3 de 3 · Revisión"
        description="Comprueba los datos antes de confirmar tu compra."
        icon="receipt-outline"
        title="Revisar pedido"
      />

      <View style={styles.checkoutSection}>
        <Text style={styles.sectionTitle}>Productos</Text>
        {lines.map((line) => (
          <View key={line.id} style={styles.reviewProduct}>
            <View style={styles.reviewProductInfo}>
              <Text style={styles.reviewName}>{line.productName}</Text>
              <Text style={styles.muted}>Cantidad: {line.quantity}</Text>
            </View>
            <Text style={styles.reviewPrice}>
              {formatCurrency(line.lineSubtotal, currency)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.checkoutSection}>
        <Text style={styles.sectionTitle}>Entrega</Text>
        <Text>{checkout.fullName}</Text>
        <Text>{checkout.addressLine1}</Text>
        {checkout.addressLine2 ? <Text>{checkout.addressLine2}</Text> : null}
        <Text>
          {checkout.city}
          {checkout.department ? `, ${checkout.department}` : ""}
        </Text>
        <Text>{checkout.contactPhone}</Text>
        <Text>{checkout.email}</Text>
      </View>

      <View style={styles.checkoutSection}>
        <Text style={styles.sectionTitle}>Pago</Text>
        <Text>Tarjeta terminada en {checkout.cardLastFour}</Text>
        <Text>Titular: {checkout.cardholderName}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total estimado</Text>
          <Text style={styles.total}>
            {formatCurrency(totals.total, currency)}
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.serverNotice}>
          <Ionicons
            color="#3E668F"
            name="information-circle-outline"
            size={19}
          />
          <Text style={styles.serverNoticeText}>
            El total definitivo será calculado por el servidor al confirmar.
          </Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        disabled={isSubmitting || lines.length === 0}
        onPress={() => void confirm()}
        style={[
          styles.primaryButton,
          isSubmitting || lines.length === 0 ? styles.disabled : null,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.primaryText}>Confirmar pedido</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

export function ApiCheckoutSuccessScreen() {
  const { orderNumber } =
    useLocalSearchParams<{ orderNumber?: string }>();

  const [receipt, setReceipt] =
    useState<Awaited<ReturnType<typeof getApiCheckoutReceipt>>>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (orderNumber) {
          setReceipt(await getApiCheckoutReceipt(orderNumber));
        }
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [orderNumber]);

  if (isLoading) {
    return (
      <ActivityIndicator
        color={colors.primary}
        style={styles.loading}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.successHero}>
        <View style={styles.successDecorationOne} />
        <View style={styles.successDecorationTwo} />

        <Text style={styles.checkoutBrand}>FERREPHARMA</Text>

        <View style={styles.successIcon}>
          <Ionicons
            color="#3E668F"
            name="checkmark"
            size={34}
          />
        </View>

        <Text style={styles.successTitle}>¡Pedido confirmado!</Text>
        <Text style={styles.successDescription}>
          Tu compra fue registrada correctamente.
        </Text>

        {receipt ? (
          <View style={styles.successBadge}>
            <Text style={styles.successBadgeText}>
              {receipt.orderNumber}
            </Text>
          </View>
        ) : null}
      </View>

      {receipt ? (
        <>
          <View style={styles.checkoutSection}>
            <Text style={styles.sectionTitle}>Resumen del pedido</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estado</Text>
              <Text style={styles.detailValue}>{receipt.orderStatus}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pago</Text>
              <Text style={styles.detailValue}>{receipt.paymentStatus}</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.total}>
                {formatCurrency(receipt.total, "GTQ")}
              </Text>
            </View>
          </View>

          <View style={styles.checkoutSection}>
            <Text style={styles.sectionTitle}>Productos</Text>
            {receipt.items.map((item) => (
              <View
                key={`${item.sku}-${item.name}`}
                style={styles.reviewLine}
              >
                <Text style={styles.reviewName}>
                  {item.name} x {item.quantity}
                </Text>
                <Text>
                  {formatCurrency(item.subtotal, "GTQ")}
                </Text>
              </View>
            ))}
          </View>

          {receipt.guestTrackingEnabled ? (
            <View style={styles.trackingNotice}>
              <Ionicons
                color="#3E668F"
                name="location-outline"
                size={20}
              />
              <Text style={styles.trackingNoticeText}>
                El seguimiento de este pedido está disponible.
              </Text>
            </View>
          ) : null}
        </>
      ) : (
        <Text style={styles.error}>
          No se encontró el recibo local del pedido.
        </Text>
      )}

      <Pressable
        onPress={() => router.replace("/(protected)/(tabs)")}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryText}>Volver al inicio</Text>
      </Pressable>
    </ScrollView>
  );
}

function formatApiCheckoutError(error: ApiError): string {
  return getErrorMessage(
    error,
    "No se pudo confirmar el pedido. Intenta nuevamente.",
  );
}

function Field({
  autoCapitalize,
  keyboardType = "default",
  label,
  maxLength,
  onChangeText,
  value,
}: {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?:
    | "default"
    | "email-address"
    | "phone-pad"
    | "number-pad";
  label: string;
  maxLength?: number;
  onChangeText(value: string): void;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        maxLength={maxLength}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  activeCheck: {
    alignItems: "center",
    backgroundColor: "#3E668F",
    borderRadius: 11,
    height: 22,
    justifyContent: "center",
    width: 22,
  },

  checkoutBackButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },

  checkoutBrand: {
    color: "#FFDB83",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  checkoutHeading: {
    flex: 1,
  },

  checkoutHero: {
    backgroundColor: "#3E668F",
    minHeight: 218,
    overflow: "hidden",
    paddingBottom: 22,
    paddingHorizontal: 20,
    paddingTop: 44,
  },

  checkoutHeroDecorationOne: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 70,
    height: 140,
    position: "absolute",
    right: -35,
    top: -35,
    width: 140,
  },

  checkoutHeroDecorationTwo: {
    backgroundColor: "rgba(255,219,131,0.10)",
    borderRadius: 55,
    bottom: -55,
    height: 110,
    left: -25,
    position: "absolute",
    width: 110,
  },

  checkoutHeroDescription: {
    color: "#EAF1F8",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 15,
    maxWidth: "82%",
  },

  checkoutHeroIcon: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },

  checkoutHeroTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
    marginTop: 2,
  },

  checkoutHeroTitleArea: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
    paddingRight: 10,
  },

  checkoutHeroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  checkoutSection: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE3EE",
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    marginHorizontal: 18,
    padding: 16,
  },

  checkoutStepBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFDB83",
    borderRadius: 18,
    flexDirection: "row",
    gap: 5,
    marginTop: 15,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  checkoutStepText: {
    color: "#3E668F",
    fontSize: 12,
    fontWeight: "900",
  },

  content: {
    backgroundColor: "#FFF2D0",
    flexGrow: 1,
    gap: 16,
    paddingBottom: 32,
  },

  deliveryType: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },

  detailLabel: {
    color: "#687286",
  },

  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  detailValue: {
    color: "#172033",
    fontWeight: "800",
  },

  disabled: {
    opacity: 0.6,
  },

  error: {
    color: colors.danger,
    fontWeight: "700",
    marginHorizontal: 18,
  },

  field: {
    gap: 6,
  },

  group: {
    gap: 12,
  },

  input: {
    backgroundColor: "#FAFBFD",
    borderColor: "#DDE3EE",
    borderRadius: 12,
    borderWidth: 1,
    color: "#172033",
    minHeight: 48,
    paddingHorizontal: 14,
  },

  label: {
    color: "#3E668F",
    fontSize: typography.caption,
    fontWeight: "800",
  },

  loading: {
    flex: 1,
  },

  muted: {
    color: "#687286",
    lineHeight: 19,
  },

  optionContent: {
    flex: 1,
    gap: 4,
  },

  optionIcon: {
    alignItems: "center",
    backgroundColor: "#FFF2D0",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  paymentType: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },

  pressed: {
    opacity: 0.75,
  },

  primaryButton: {
    alignItems: "center",
    backgroundColor: "#3E668F",
    borderRadius: 15,
    justifyContent: "center",
    marginHorizontal: 18,
    minHeight: 56,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  reviewLine: {
    alignItems: "center",
    borderBottomColor: "#DDE3EE",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  reviewName: {
    color: "#172033",
    flex: 1,
    fontWeight: "800",
  },

  reviewPrice: {
    color: "#172033",
    fontWeight: "800",
  },

  reviewProduct: {
    alignItems: "center",
    borderBottomColor: "#DDE3EE",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  reviewProductInfo: {
    flex: 1,
    gap: 4,
  },

  sectionDescription: {
    color: "#687286",
    fontSize: 13,
    lineHeight: 19,
  },

  sectionTitle: {
    color: "#3E668F",
    fontSize: 17,
    fontWeight: "900",
  },

  securityBox: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE3EE",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 18,
    padding: 15,
  },

  securityContent: {
    flex: 1,
    gap: 3,
  },

  securityTitle: {
    color: "#172033",
    fontWeight: "800",
  },

  serverNotice: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },

  serverNoticeText: {
    color: "#687286",
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  successBadge: {
    alignSelf: "center",
    backgroundColor: "#FFDB83",
    borderRadius: 18,
    marginTop: 16,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },

  successBadgeText: {
    color: "#3E668F",
    fontWeight: "900",
  },

  successDecorationOne: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 80,
    height: 160,
    position: "absolute",
    right: -50,
    top: -50,
    width: 160,
  },

  successDecorationTwo: {
    backgroundColor: "rgba(255,219,131,0.10)",
    borderRadius: 60,
    bottom: -65,
    height: 120,
    left: -35,
    position: "absolute",
    width: 120,
  },

  successDescription: {
    color: "#EAF1F8",
    fontSize: 13,
    marginTop: 7,
    textAlign: "center",
  },

  successHero: {
    alignItems: "center",
    backgroundColor: "#3E668F",
    overflow: "hidden",
    paddingBottom: 27,
    paddingHorizontal: 20,
    paddingTop: 44,
  },

  successIcon: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    marginTop: 14,
    width: 68,
  },

  successTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
    marginTop: 13,
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE3EE",
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    marginHorizontal: 18,
    padding: 16,
  },

  summaryDivider: {
    backgroundColor: "#DDE3EE",
    height: 1,
  },

  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  total: {
    color: "#3E668F",
    fontSize: 20,
    fontWeight: "900",
  },

  totalLabel: {
    color: "#172033",
    fontSize: 16,
    fontWeight: "900",
  },

  trackingNotice: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE3EE",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 18,
    padding: 15,
  },

  trackingNoticeText: {
    color: "#172033",
    flex: 1,
    fontWeight: "700",
  },
});
