import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { DeliveryMethod, OrderStatus, PaymentMethodType } from "@/core";
import { useRepositories } from "@/infrastructure";
import { useSession } from "@/modules/auth";
import { useCart } from "@/modules/cart";
import { formatCurrency } from "@/shared";
import { colors, spacing, typography } from "@/theme";

import { calculateCheckoutTotals } from "../application/checkoutPricing";
import { placeOrder } from "../application/PlaceOrderService";
import { useCheckout } from "../context/CheckoutProvider";

export function CheckoutDeliveryScreen() {
  const { addressRepository, branchRepository } = useRepositories();
  const { session } = useSession();
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
        if (!checkout.pickupBranchId && nextBranches[0]) {
          checkout.setPickupBranchId(nextBranches[0].id);
        }
      }
      setIsLoading(false);
    }
    void load();
  }, [addressRepository, branchRepository, checkout, session]);

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
      <Pressable onPress={() => router.push("/(protected)/checkout/payment")} style={styles.primaryButton}><Text style={styles.primaryText}>Continuar</Text></Pressable>
    </ScrollView>
  );
}

export function CheckoutPaymentScreen() {
  const { customerPaymentMethodRepository } = useRepositories();
  const { session } = useSession();
  const checkout = useCheckout();
  const [methods, setMethods] = useState<Awaited<ReturnType<typeof customerPaymentMethodRepository.getByCustomer>>>([]);

  useEffect(() => {
    async function load() {
      if (session) {
        const nextMethods = await customerPaymentMethodRepository.getByCustomer(session.tenantId, session.customerId);
        setMethods(nextMethods);
        if (!checkout.paymentMethod) {
          checkout.setPaymentMethod(PaymentMethodType.Card);
        }
        if (!checkout.customerPaymentMethodId && nextMethods[0]) {
          checkout.setCustomerPaymentMethodId(nextMethods[0].id);
        }
      }
    }
    void load();
  }, [checkout, customerPaymentMethodRepository, session]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pago</Text>
      <Choice active={checkout.paymentMethod === PaymentMethodType.Card} label="Tarjeta guardada" onPress={() => checkout.setPaymentMethod(PaymentMethodType.Card)} />
      {methods.map((method) => <Choice key={method.id} active={checkout.customerPaymentMethodId === method.id} label={`${method.brand ?? "Tarjeta"} terminada en ${method.last4 ?? "demo"}`} onPress={() => checkout.setCustomerPaymentMethodId(method.id)} />)}
      <Choice active={checkout.paymentMethod === PaymentMethodType.BankTransfer} label="Transferencia bancaria demo" onPress={() => checkout.setPaymentMethod(PaymentMethodType.BankTransfer)} />
      <Choice active={checkout.paymentMethod === PaymentMethodType.CashOnDelivery} label="Pago contra entrega demo" onPress={() => checkout.setPaymentMethod(PaymentMethodType.CashOnDelivery)} />
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
      <Text>Pago: {checkout.paymentMethod ?? "pendiente"}</Text>
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

const styles = StyleSheet.create({
  choice: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, padding: spacing.md },
  choiceActive: { backgroundColor: colors.accent },
  choiceText: { color: colors.text },
  content: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  error: { color: colors.danger },
  group: { gap: spacing.sm },
  link: { color: colors.primary },
  loading: { flex: 1 },
  primaryButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 8, minHeight: 48, justifyContent: "center" },
  primaryText: { color: colors.surface, fontWeight: "700" },
  row: { flexDirection: "row", gap: spacing.sm },
  secondaryButton: { alignItems: "center", borderColor: colors.border, borderRadius: 8, borderWidth: 1, minHeight: 44, justifyContent: "center" },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "700" },
  total: { fontSize: typography.subtitle, fontWeight: "700" },
});
