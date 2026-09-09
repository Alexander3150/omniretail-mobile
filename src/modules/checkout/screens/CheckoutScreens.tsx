import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { DeliveryMethod, OrderStatus, PaymentMethodType } from "@/core";
import { useRepositories } from "@/infrastructure";
import { useSession } from "@/modules/auth";
import { useCart } from "@/modules/cart";
import { useInvoiceDownload } from "@/modules/invoice";
import { formatCurrency } from "@/shared";
import { colors, spacing, typography } from "@/theme";

import { calculateCheckoutTotals } from "../application/checkoutPricing";
import { placeOrder } from "../application/PlaceOrderService";
import { useCheckout } from "../context/CheckoutProvider";

export function CheckoutDeliveryScreen() {
  const { addressRepository, branchRepository } = useRepositories();
  const { customer, session } = useSession();
  const checkout = useCheckout();
  const [addresses, setAddresses] = useState<Awaited<ReturnType<typeof addressRepository.getByCustomer>>>([]);
  const [branches, setBranches] = useState<Awaited<ReturnType<typeof branchRepository.getActive>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (session) {
        const nextAddresses = await addressRepository.getByCustomer(session.tenantId, session.customerId);
        const nextBranches = await branchRepository.getActive(session.tenantId);
        setAddresses(nextAddresses);
        setBranches(nextBranches);
        const defaultAddress = nextAddresses.find((address) => address.isDefault);
        if (!checkout.addressId && defaultAddress) {
          checkout.setAddressId(defaultAddress.id);
        }
        if (!checkout.contactPhone.trim()) {
          checkout.setContactPhone(defaultAddress?.phone ?? customer?.phone ?? "");
        }
        if (!checkout.billingName.trim()) {
          checkout.setBillingName(customer?.name ?? "");
        }
        if (!checkout.pickupBranchId && nextBranches[0]) {
          checkout.setPickupBranchId(nextBranches[0].id);
        }
      }
      setIsLoading(false);
    }
    void load();
  }, [addressRepository, branchRepository, checkout, customer, session]);

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Entrega</Text>
      <View style={styles.row}>
        <Choice active={checkout.deliveryMethod === DeliveryMethod.HomeDelivery} label="Envio a casa" onPress={() => checkout.setDeliveryMethod(DeliveryMethod.HomeDelivery)} />
        <Choice active={checkout.deliveryMethod === DeliveryMethod.StorePickup} label="Retiro" onPress={() => checkout.setDeliveryMethod(DeliveryMethod.StorePickup)} />
      </View>
      {checkout.deliveryMethod === DeliveryMethod.HomeDelivery ? (
        <View style={styles.group}>
          {addresses.length === 0 ? <Pressable onPress={() => router.push("/(protected)/addresses/new")}><Text style={styles.link}>Crear direccion</Text></Pressable> : null}
          {addresses.map((address) => <Choice key={address.id} active={checkout.addressId === address.id} label={`${address.label}: ${address.addressLine}`} onPress={() => checkout.setAddressId(address.id)} />)}
        </View>
      ) : null}
      {checkout.deliveryMethod === DeliveryMethod.StorePickup ? (
        <View style={styles.group}>
          {branches.map((branch) => <Choice key={branch.id} active={checkout.pickupBranchId === branch.id} label={`${branch.name}: ${branch.address}`} onPress={() => checkout.setPickupBranchId(branch.id)} />)}
        </View>
      ) : null}
      <View style={styles.group}>
        <Field keyboardType="phone-pad" label="Telefono de contacto" onChangeText={checkout.setContactPhone} value={checkout.contactPhone} />
        <Field label="Nombre de facturacion" onChangeText={checkout.setBillingName} value={checkout.billingName} />
        <Field autoCapitalize="characters" label="NIT opcional" onChangeText={checkout.setNit} value={checkout.nit ?? ""} />
      </View>
      <Pressable onPress={() => router.push("/(protected)/checkout/payment")} style={styles.primaryButton}><Text style={styles.primaryText}>Continuar</Text></Pressable>
    </ScrollView>
  );
}

export function CheckoutPaymentScreen() {
  const { customerPaymentMethodRepository } = useRepositories();
  const { session } = useSession();
  const checkout = useCheckout();
  const [methods, setMethods] = useState<Awaited<ReturnType<typeof customerPaymentMethodRepository.getByCustomer>>>([]);

  const loadMethods = useCallback(async () => {
    if (session) {
      const nextMethods = await customerPaymentMethodRepository.getByCustomer(session.tenantId, session.customerId);
      setMethods(nextMethods);
      checkout.setPaymentMethod(PaymentMethodType.Card);
      const selectedStillExists = nextMethods.some((method) => method.id === checkout.customerPaymentMethodId);
      const defaultMethod = nextMethods.find((method) => method.isDefault) ?? nextMethods[0];
      if ((!checkout.customerPaymentMethodId || !selectedStillExists) && defaultMethod) {
        checkout.setCustomerPaymentMethodId(defaultMethod.id);
      }
    }
  }, [checkout, customerPaymentMethodRepository, session]);

  useEffect(() => {
    const timeout = setTimeout(() => void loadMethods(), 0);
    return () => clearTimeout(timeout);
  }, [loadMethods]);

  useFocusEffect(
    useCallback(() => {
      void loadMethods();
    }, [loadMethods]),
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pago</Text>
      <Text style={styles.muted}>Pago simulado aprobado con tarjeta.</Text>
      {methods.length === 0 ? <Text>No hay tarjeta guardada. Se usara tarjeta demo segura.</Text> : null}
      {methods.map((method) => (
        <Pressable
          key={method.id}
          onPress={() => {
            checkout.setPaymentMethod(PaymentMethodType.Card);
            checkout.setCustomerPaymentMethodId(method.id);
          }}
          style={[styles.choice, checkout.customerPaymentMethodId === method.id ? styles.choiceActive : null]}
        >
          <Text style={styles.choiceText}>{method.brand ?? "Tarjeta"} terminada en {method.last4 ?? "demo"}</Text>
          <Text style={styles.muted}>Expira {formatExpiration(method.expirationMonth, method.expirationYear)}</Text>
        </Pressable>
      ))}
      <Pressable onPress={() => router.push({ pathname: "/(protected)/account/new-payment-method", params: { returnTo: "checkout" } })} style={styles.secondaryButton}>
        <Text>Agregar nueva tarjeta</Text>
      </Pressable>
      <Pressable onPress={() => router.push("/(protected)/checkout/review")} style={styles.primaryButton}><Text style={styles.primaryText}>Revisar pedido</Text></Pressable>
    </ScrollView>
  );
}

export function CheckoutReviewScreen() {
  const repositories = useRepositories();
  const { session } = useSession();
  const checkout = useCheckout();
  const { currency, lines, reload } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [deliveryLabel, setDeliveryLabel] = useState("Pendiente");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totals = calculateCheckoutTotals(lines, checkout.deliveryMethod);

  useEffect(() => {
    async function loadDeliveryLabel() {
      if (checkout.deliveryMethod === DeliveryMethod.HomeDelivery && checkout.addressId) {
        const address = await repositories.addressRepository.getById(checkout.addressId);
        setDeliveryLabel(address ? `${address.label}: ${address.addressLine}` : "Direccion pendiente");
      } else if (checkout.deliveryMethod === DeliveryMethod.StorePickup && checkout.pickupBranchId) {
        const branch = await repositories.branchRepository.getById(checkout.pickupBranchId);
        setDeliveryLabel(branch ? `${branch.name}: ${branch.address}` : "Sucursal pendiente");
      } else {
        setDeliveryLabel("Pendiente");
      }
    }
    const timeout = setTimeout(() => void loadDeliveryLabel(), 0);
    return () => clearTimeout(timeout);
  }, [checkout.addressId, checkout.deliveryMethod, checkout.pickupBranchId, repositories.addressRepository, repositories.branchRepository]);

  async function confirm() {
    if (!session) {
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      if (!checkout.contactPhone.trim() || !checkout.billingName.trim()) {
        throw new Error("Contact and billing required");
      }
      const result = await placeOrder(repositories, session, checkout);
      checkout.setLastOrderId(result.order.id);
      checkout.resetCheckout();
      await reload();
      router.replace({ pathname: "/(protected)/checkout/success", params: { orderId: result.order.id } });
    } catch {
      setError("Completa entrega, pago y carrito antes de confirmar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Revisar pedido</Text>
      {lines.map((line) => <Text key={line.id}>{line.productName} x {line.quantity}: {formatCurrency(line.lineSubtotal, currency)}</Text>)}
      <Text>Entrega: {checkout.deliveryMethod ?? "pendiente"}</Text>
      <Text>{deliveryLabel}</Text>
      <Text>Telefono: {checkout.contactPhone || "pendiente"}</Text>
      <Text>Facturacion: {checkout.billingName || "pendiente"}</Text>
      <Text>NIT: {checkout.nit?.trim() || "CF"}</Text>
      <Text>Pago: tarjeta</Text>
      <Text>Subtotal: {formatCurrency(totals.subtotal, currency)}</Text>
      <Text>Descuento: {formatCurrency(totals.discount, currency)}</Text>
      <Text>Envio: {formatCurrency(totals.shippingCost, currency)}</Text>
      <Text style={styles.total}>Total: {formatCurrency(totals.total, currency)}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable disabled={isSubmitting} onPress={confirm} style={styles.primaryButton}><Text style={styles.primaryText}>{isSubmitting ? "Confirmando..." : "Confirmar pedido"}</Text></Pressable>
    </ScrollView>
  );
}

export function CheckoutSuccessScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { orderRepository, businessConfigRepository } = useRepositories();
  const { downloadInvoice, error: invoiceError, isGenerating } = useInvoiceDownload();
  const [order, setOrder] = useState<Awaited<ReturnType<typeof orderRepository.getById>>>(null);
  const [currency, setCurrency] = useState("GTQ");

  useEffect(() => {
    async function load() {
      setCurrency((await businessConfigRepository.getCurrent()).currency);
      if (orderId) {
        setOrder(await orderRepository.getById(orderId));
      }
    }
    void load();
  }, [businessConfigRepository, orderId, orderRepository]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pedido confirmado</Text>
      <Text>Numero: {order?.number ?? "Pedido creado"}</Text>
      <Text>Estado: {order?.status ?? OrderStatus.Confirmed}</Text>
      <Text style={styles.total}>Total: {formatCurrency(order?.total ?? 0, currency)}</Text>
      <Pressable onPress={() => router.push({ pathname: "/(protected)/orders/[id]", params: { id: order?.id ?? "" } })} style={styles.secondaryButton}><Text>Ver pedido</Text></Pressable>
      <Pressable disabled={!order || isGenerating} onPress={() => order ? void downloadInvoice(order) : undefined} style={[styles.secondaryButton, !order || isGenerating ? styles.disabled : null]}>
        <Text>{isGenerating ? "Generando factura..." : "Descargar factura"}</Text>
      </Pressable>
      {invoiceError ? <Text style={styles.error}>{invoiceError}</Text> : null}
      <Pressable onPress={() => router.replace("/(protected)/(tabs)")} style={styles.primaryButton}><Text style={styles.primaryText}>Volver al inicio</Text></Pressable>
    </ScrollView>
  );
}

function Choice({ active, label, onPress }: { active: boolean; label: string; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, active ? styles.choiceActive : null]}>
      <Text style={styles.choiceText}>{label}</Text>
    </Pressable>
  );
}

function Field({
  autoCapitalize,
  keyboardType = "default",
  label,
  onChangeText,
  value,
}: {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "phone-pad";
  label: string;
  onChangeText(value: string): void;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput autoCapitalize={autoCapitalize} keyboardType={keyboardType} onChangeText={onChangeText} placeholder={label} placeholderTextColor={colors.textMuted} style={styles.input} value={value} />
    </View>
  );
}

function formatExpiration(month?: number, year?: number): string {
  if (!month || !year) {
    return "demo";
  }

  return `${month.toString().padStart(2, "0")}/${year}`;
}

const styles = StyleSheet.create({
  choice: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, padding: spacing.md },
  choiceActive: { backgroundColor: colors.accent },
  choiceText: { color: colors.text },
  content: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  disabled: { opacity: 0.7 },
  error: { color: colors.danger },
  field: { gap: spacing.xs },
  group: { gap: spacing.sm },
  input: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, color: colors.text, minHeight: 44, paddingHorizontal: spacing.md },
  label: { color: colors.text, fontSize: typography.caption, fontWeight: "700" },
  link: { color: colors.primary },
  loading: { flex: 1 },
  muted: { color: colors.textMuted },
  primaryButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 8, minHeight: 48, justifyContent: "center" },
  primaryText: { color: colors.surface, fontWeight: "700" },
  row: { flexDirection: "row", gap: spacing.sm },
  secondaryButton: { alignItems: "center", borderColor: colors.border, borderRadius: 8, borderWidth: 1, minHeight: 44, justifyContent: "center" },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "700" },
  total: { fontSize: typography.subtitle, fontWeight: "700" },
});
