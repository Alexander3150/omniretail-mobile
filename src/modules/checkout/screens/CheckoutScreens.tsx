import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  DeliveryMethod,
  OrderStatus,
  PaymentMethodType,
} from "@/core";
import { useRepositories } from "@/infrastructure";
import { useSession } from "@/modules/auth";
import { useCart } from "@/modules/cart";
import { useInvoiceDownload } from "@/modules/invoice";
import { formatCurrency } from "@/shared";

import { calculateCheckoutTotals } from "../application/checkoutPricing";
import { placeOrder } from "../application/PlaceOrderService";
import { useCheckout } from "../context/CheckoutProvider";

const palette = {
  deepBlue: "#3E668F",
  dreamyBlue: "#81A9EE",
  lilac: "#AAB4E7",
  honey: "#FFDB83",
  cream: "#FFF2D0",
  white: "#FFFFFF",
  text: "#172033",
  muted: "#687286",
  border: "#DDE3EE",
  danger: "#B94343",
  success: "#247A52",
};

export function CheckoutDeliveryScreen() {
  const { addressRepository, branchRepository } = useRepositories();
  const { customer, session } = useSession();
  const checkout = useCheckout();

  const [addresses, setAddresses] = useState<
    Awaited<ReturnType<typeof addressRepository.getByCustomer>>
  >([]);

  const [branches, setBranches] = useState<
    Awaited<ReturnType<typeof branchRepository.getActive>>
  >([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (session) {
        const nextAddresses =
          await addressRepository.getByCustomer(
            session.tenantId,
            session.customerId,
          );

        const nextBranches =
          await branchRepository.getActive(session.tenantId);

        setAddresses(nextAddresses);
        setBranches(nextBranches);

        const defaultAddress = nextAddresses.find(
          (address) => address.isDefault,
        );

        if (!checkout.addressId && defaultAddress) {
          checkout.setAddressId(defaultAddress.id);
        }

        if (!checkout.contactPhone.trim()) {
          checkout.setContactPhone(
            defaultAddress?.phone ?? customer?.phone ?? "",
          );
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
  }, [
    addressRepository,
    branchRepository,
    checkout,
    customer,
    session,
  ]);

  if (isLoading) {
    return <CheckoutLoading text="Preparando tu entrega..." />;
  }

  const homeDelivery =
    checkout.deliveryMethod === DeliveryMethod.HomeDelivery;

  const storePickup =
    checkout.deliveryMethod === DeliveryMethod.StorePickup;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <CheckoutHero
        icon="location-outline"
        step="PASO 1 DE 3"
        subtitle="Elige cómo quieres recibir tu compra."
        title="Entrega"
      />

      <View style={styles.body}>
        <View style={styles.stepBar}>
          <View style={styles.stepActive} />
          <View style={styles.stepInactive} />
          <View style={styles.stepInactive} />
        </View>

        <SectionHeader
          subtitle="Selecciona la opción que prefieras"
          title="Método de entrega"
        />

        <View style={styles.deliveryRow}>
          <OptionCard
            active={homeDelivery}
            icon="home-outline"
            label="Envío a casa"
            onPress={() =>
              checkout.setDeliveryMethod(
                DeliveryMethod.HomeDelivery,
              )
            }
            subtitle="Recibe tu compra en tu dirección"
          />

          <OptionCard
            active={storePickup}
            icon="storefront-outline"
            label="Retiro"
            onPress={() =>
              checkout.setDeliveryMethod(
                DeliveryMethod.StorePickup,
              )
            }
            subtitle="Recoge en una sucursal"
          />
        </View>

        {homeDelivery ? (
          <View style={styles.sectionCard}>
            <View style={styles.cardHeading}>
              <View style={styles.smallIcon}>
                <Ionicons
                  color={palette.deepBlue}
                  name="location-outline"
                  size={17}
                />
              </View>

              <View style={styles.flex}>
                <Text style={styles.cardTitle}>
                  Dirección de entrega
                </Text>
                <Text style={styles.cardSubtitle}>
                  Selecciona dónde deseas recibir tu pedido
                </Text>
              </View>
            </View>

            {addresses.length === 0 ? (
              <Pressable
                onPress={() =>
                  router.push("/(protected)/addresses/new")
                }
                style={({ pressed }) => [
                  styles.createAddress,
                  pressed ? styles.pressed : null,
                ]}
              >
                <View style={styles.addCircle}>
                  <Ionicons
                    color={palette.deepBlue}
                    name="add"
                    size={17}
                  />
                </View>

                <View style={styles.flex}>
                  <Text style={styles.createAddressTitle}>
                    Crear dirección
                  </Text>
                  <Text style={styles.createAddressText}>
                    Necesitas una dirección para continuar
                  </Text>
                </View>

                <Ionicons
                  color={palette.deepBlue}
                  name="chevron-forward"
                  size={17}
                />
              </Pressable>
            ) : (
              <View style={styles.optionsList}>
                {addresses.map((address) => (
                  <SelectionRow
                    active={checkout.addressId === address.id}
                    icon="home-outline"
                    key={address.id}
                    label={address.label}
                    onPress={() =>
                      checkout.setAddressId(address.id)
                    }
                    subtitle={address.addressLine}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}

        {storePickup ? (
          <View style={styles.sectionCard}>
            <View style={styles.cardHeading}>
              <View style={styles.smallIcon}>
                <Ionicons
                  color={palette.deepBlue}
                  name="storefront-outline"
                  size={17}
                />
              </View>

              <View style={styles.flex}>
                <Text style={styles.cardTitle}>
                  Sucursal de retiro
                </Text>
                <Text style={styles.cardSubtitle}>
                  Elige dónde recogerás tu compra
                </Text>
              </View>
            </View>

            <View style={styles.optionsList}>
              {branches.map((branch) => (
                <SelectionRow
                  active={
                    checkout.pickupBranchId === branch.id
                  }
                  icon="storefront-outline"
                  key={branch.id}
                  label={branch.name}
                  onPress={() =>
                    checkout.setPickupBranchId(branch.id)
                  }
                  subtitle={branch.address}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <View style={styles.cardHeading}>
            <View style={styles.smallIcon}>
              <Ionicons
                color={palette.deepBlue}
                name="person-outline"
                size={17}
              />
            </View>

            <View style={styles.flex}>
              <Text style={styles.cardTitle}>
                Datos de contacto y facturación
              </Text>
              <Text style={styles.cardSubtitle}>
                Información necesaria para completar tu compra
              </Text>
            </View>
          </View>

          <CheckoutField
            icon="call-outline"
            keyboardType="phone-pad"
            label="Teléfono de contacto"
            onChangeText={checkout.setContactPhone}
            value={checkout.contactPhone}
          />

          <CheckoutField
            icon="person-outline"
            label="Nombre de facturación"
            onChangeText={checkout.setBillingName}
            value={checkout.billingName}
          />

          <CheckoutField
            autoCapitalize="characters"
            icon="document-text-outline"
            label="NIT opcional"
            onChangeText={checkout.setNit}
            value={checkout.nit ?? ""}
          />
        </View>

        <PrimaryButton
          icon="arrow-forward"
          label="Continuar al pago"
          onPress={() =>
            router.push("/(protected)/checkout/payment")
          }
        />
      </View>
    </ScrollView>
  );
}

export function CheckoutPaymentScreen() {
  const { customerPaymentMethodRepository } = useRepositories();
  const { session } = useSession();
  const checkout = useCheckout();

  const [methods, setMethods] = useState<
    Awaited<
      ReturnType<
        typeof customerPaymentMethodRepository.getByCustomer
      >
    >
  >([]);

  const loadMethods = useCallback(async () => {
    if (session) {
      const nextMethods =
        await customerPaymentMethodRepository.getByCustomer(
          session.tenantId,
          session.customerId,
        );

      setMethods(nextMethods);
      checkout.setPaymentMethod(PaymentMethodType.Card);

      const selectedStillExists = nextMethods.some(
        (method) =>
          method.id === checkout.customerPaymentMethodId,
      );

      const defaultMethod =
        nextMethods.find((method) => method.isDefault) ??
        nextMethods[0];

      if (
        (!checkout.customerPaymentMethodId ||
          !selectedStillExists) &&
        defaultMethod
      ) {
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
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <CheckoutHero
        icon="card-outline"
        step="PASO 2 DE 3"
        subtitle="Selecciona la tarjeta que utilizarás."
        title="Pago"
      />

      <View style={styles.body}>
        <View style={styles.stepBar}>
          <View style={styles.stepComplete} />
          <View style={styles.stepActive} />
          <View style={styles.stepInactive} />
        </View>

        <View style={styles.secureBanner}>
          <View style={styles.secureIcon}>
            <Ionicons
              color={palette.success}
              name="shield-checkmark-outline"
              size={19}
            />
          </View>

          <View style={styles.flex}>
            <Text style={styles.secureTitle}>
              Pago seguro
            </Text>
            <Text style={styles.secureText}>
              Pago simulado aprobado con tarjeta.
            </Text>
          </View>
        </View>

        <SectionHeader
          subtitle="Elige el método para esta compra"
          title="Tarjeta de pago"
        />

        {methods.length === 0 ? (
          <View style={styles.demoPaymentCard}>
            <View style={styles.cardHeading}>
              <View style={styles.smallIcon}>
                <Ionicons
                  color={palette.deepBlue}
                  name="flask-outline"
                  size={17}
                />
              </View>

              <View style={styles.flex}>
                <Text style={styles.cardTitle}>
                  Tarjeta demo segura
                </Text>
                <Text style={styles.cardSubtitle}>
                  No tienes tarjetas guardadas; utilizaremos la
                  tarjeta de demostración.
                </Text>
              </View>
            </View>

            <Text style={styles.demoNumber}>
              •••• •••• •••• demo
            </Text>
          </View>
        ) : (
          <View style={styles.optionsList}>
            {methods.map((method) => {
              const active =
                checkout.customerPaymentMethodId === method.id;

              return (
                <Pressable
                  key={method.id}
                  onPress={() => {
                    checkout.setPaymentMethod(
                      PaymentMethodType.Card,
                    );
                    checkout.setCustomerPaymentMethodId(
                      method.id,
                    );
                  }}
                  style={({ pressed }) => [
                    styles.creditCard,
                    active ? styles.creditCardActive : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <View style={styles.creditCardTop}>
                    <View style={styles.cardChip}>
                      <View style={styles.chipLine} />
                      <View style={styles.chipLine} />
                    </View>

                    {active ? (
                      <View style={styles.selectedBadge}>
                        <Ionicons
                          color={palette.deepBlue}
                          name="checkmark"
                          size={12}
                        />
                        <Text style={styles.selectedBadgeText}>
                          Seleccionada
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.creditNumber}>
                    •••• •••• •••• {method.last4 ?? "demo"}
                  </Text>

                  <View style={styles.creditBottom}>
                    <View>
                      <Text style={styles.creditLabel}>
                        TARJETA
                      </Text>
                      <Text style={styles.creditValue}>
                        {method.brand ?? "Tarjeta"}
                      </Text>
                    </View>

                    <View>
                      <Text style={styles.creditLabel}>
                        EXPIRA
                      </Text>
                      <Text style={styles.creditValue}>
                        {formatExpiration(
                          method.expirationMonth,
                          method.expirationYear,
                        )}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable
          onPress={() =>
            router.push({
              pathname:
                "/(protected)/account/new-payment-method",
              params: { returnTo: "checkout" },
            })
          }
          style={({ pressed }) => [
            styles.addPaymentButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <View style={styles.addCircle}>
            <Ionicons
              color={palette.deepBlue}
              name="add"
              size={17}
            />
          </View>

          <View style={styles.flex}>
            <Text style={styles.addPaymentTitle}>
              Agregar nueva tarjeta
            </Text>
            <Text style={styles.addPaymentText}>
              Registra otro método de pago
            </Text>
          </View>

          <Ionicons
            color={palette.deepBlue}
            name="chevron-forward"
            size={17}
          />
        </Pressable>

        <PrimaryButton
          icon="arrow-forward"
          label="Revisar pedido"
          onPress={() =>
            router.push("/(protected)/checkout/review")
          }
        />
      </View>
    </ScrollView>
  );
}

export function CheckoutReviewScreen() {
  const repositories = useRepositories();
  const { session } = useSession();
  const checkout = useCheckout();
  const { currency, lines, reload } = useCart();

  const [error, setError] = useState<string | null>(null);
  const [deliveryLabel, setDeliveryLabel] =
    useState("Pendiente");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totals = calculateCheckoutTotals(
    lines,
    checkout.deliveryMethod,
  );

  useEffect(() => {
    async function loadDeliveryLabel() {
      if (
        checkout.deliveryMethod ===
          DeliveryMethod.HomeDelivery &&
        checkout.addressId
      ) {
        const address =
          await repositories.addressRepository.getById(
            checkout.addressId,
          );

        setDeliveryLabel(
          address
            ? `${address.label}: ${address.addressLine}`
            : "Dirección pendiente",
        );
      } else if (
        checkout.deliveryMethod === DeliveryMethod.StorePickup &&
        checkout.pickupBranchId
      ) {
        const branch =
          await repositories.branchRepository.getById(
            checkout.pickupBranchId,
          );

        setDeliveryLabel(
          branch
            ? `${branch.name}: ${branch.address}`
            : "Sucursal pendiente",
        );
      } else {
        setDeliveryLabel("Pendiente");
      }
    }

    const timeout = setTimeout(
      () => void loadDeliveryLabel(),
      0,
    );

    return () => clearTimeout(timeout);
  }, [
    checkout.addressId,
    checkout.deliveryMethod,
    checkout.pickupBranchId,
    repositories.addressRepository,
    repositories.branchRepository,
  ]);

  async function confirm() {
    if (!session) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      if (
        !checkout.contactPhone.trim() ||
        !checkout.billingName.trim()
      ) {
        throw new Error("Contact and billing required");
      }

      const result = await placeOrder(
        repositories,
        session,
        checkout,
      );

      checkout.setLastOrderId(result.order.id);
      checkout.resetCheckout();
      await reload();

      router.replace({
        pathname: "/(protected)/checkout/success",
        params: { orderId: result.order.id },
      });
    } catch {
      setError(
        "Completa entrega, pago y carrito antes de confirmar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <CheckoutHero
        icon="receipt-outline"
        step="PASO 3 DE 3"
        subtitle="Comprueba que todo esté correcto antes de confirmar."
        title="Revisar pedido"
      />

      <View style={styles.body}>
        <View style={styles.stepBar}>
          <View style={styles.stepComplete} />
          <View style={styles.stepComplete} />
          <View style={styles.stepActive} />
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.cardHeading}>
            <View style={styles.smallIcon}>
              <Ionicons
                color={palette.deepBlue}
                name="bag-handle-outline"
                size={17}
              />
            </View>

            <View style={styles.flex}>
              <Text style={styles.cardTitle}>
                Productos
              </Text>
              <Text style={styles.cardSubtitle}>
                {lines.length}{" "}
                {lines.length === 1
                  ? "producto"
                  : "productos"}{" "}
                en tu pedido
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {lines.map((line) => (
            <View key={line.id} style={styles.productLine}>
              <View style={styles.quantityBadge}>
                <Text style={styles.quantityText}>
                  {line.quantity}
                </Text>
              </View>

              <Text
                numberOfLines={2}
                style={styles.productName}
              >
                {line.productName}
              </Text>

              <Text style={styles.productPrice}>
                {formatCurrency(
                  line.lineSubtotal,
                  currency,
                )}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>
            Entrega y facturación
          </Text>

          <SummaryRow
            icon="navigate-outline"
            label="Método"
            value={deliveryMethodLabel(
              checkout.deliveryMethod,
            )}
          />

          <SummaryRow
            icon="location-outline"
            label="Destino"
            value={deliveryLabel}
          />

          <SummaryRow
            icon="call-outline"
            label="Teléfono"
            value={checkout.contactPhone || "Pendiente"}
          />

          <SummaryRow
            icon="person-outline"
            label="Facturación"
            value={checkout.billingName || "Pendiente"}
          />

          <SummaryRow
            icon="document-text-outline"
            label="NIT"
            value={checkout.nit?.trim() || "CF"}
          />

          <SummaryRow
            icon="card-outline"
            label="Pago"
            value="Tarjeta"
          />
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalTitle}>
            Resumen de compra
          </Text>

          <PriceRow
            label="Subtotal"
            value={formatCurrency(
              totals.subtotal,
              currency,
            )}
          />

          <PriceRow
            label="Descuento"
            value={formatCurrency(
              totals.discount,
              currency,
            )}
          />

          <PriceRow
            label="Envío"
            value={formatCurrency(
              totals.shippingCost,
              currency,
            )}
          />

          <View style={styles.totalDivider} />

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>
              Total
            </Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(totals.total, currency)}
            </Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons
              color={palette.danger}
              name="alert-circle-outline"
              size={18}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <PrimaryButton
          disabled={isSubmitting}
          icon="checkmark-circle-outline"
          label={
            isSubmitting
              ? "Confirmando..."
              : "Confirmar pedido"
          }
          onPress={confirm}
        />

        <View style={styles.checkoutNote}>
          <Ionicons
            color={palette.deepBlue}
            name="shield-checkmark-outline"
            size={16}
          />
          <Text style={styles.checkoutNoteText}>
            Revisa los datos antes de confirmar tu compra.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

export function CheckoutSuccessScreen() {
  const { orderId } =
    useLocalSearchParams<{ orderId?: string }>();

  const {
    orderRepository,
    businessConfigRepository,
  } = useRepositories();

  const {
    downloadInvoice,
    error: invoiceError,
    isGenerating,
  } = useInvoiceDownload();

  const [order, setOrder] = useState<
    Awaited<ReturnType<typeof orderRepository.getById>>
  >(null);

  const [currency, setCurrency] = useState("GTQ");

  useEffect(() => {
    async function load() {
      setCurrency(
        (await businessConfigRepository.getCurrent()).currency,
      );

      if (orderId) {
        setOrder(await orderRepository.getById(orderId));
      }
    }

    void load();
  }, [
    businessConfigRepository,
    orderId,
    orderRepository,
  ]);

  return (
    <ScrollView
      contentContainerStyle={styles.successContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.successHero}>
        <View style={styles.successBubbleOne} />
        <View style={styles.successBubbleTwo} />

        <View style={styles.successIconOuter}>
          <View style={styles.successIconInner}>
            <Ionicons
              color={palette.deepBlue}
              name="checkmark"
              size={35}
            />
          </View>
        </View>

        <Text style={styles.successBrand}>
          FERREPHARMA
        </Text>
        <Text style={styles.successTitle}>
          ¡Pedido confirmado!
        </Text>
        <Text style={styles.successSubtitle}>
          Tu compra fue registrada correctamente.
        </Text>
      </View>

      <View style={styles.successBody}>
        <View style={styles.orderNumberCard}>
          <Text style={styles.orderNumberLabel}>
            NÚMERO DE PEDIDO
          </Text>
          <Text style={styles.orderNumber}>
            {order?.number ?? "Pedido creado"}
          </Text>

          <View style={styles.confirmedBadge}>
            <View style={styles.successDot} />
            <Text style={styles.confirmedText}>
              {order?.status ?? OrderStatus.Confirmed}
            </Text>
          </View>
        </View>

        <View style={styles.successTotalCard}>
          <Text style={styles.successTotalLabel}>
            Total de la compra
          </Text>
          <Text style={styles.successTotalValue}>
            {formatCurrency(
              order?.total ?? 0,
              currency,
            )}
          </Text>
        </View>

        <Pressable
          disabled={!order}
          onPress={() => {
            if (!order) {
              return;
            }

            router.push({
              pathname: "/(protected)/orders/[id]",
              params: { id: order.id },
            });
          }}
          style={({ pressed }) => [
            styles.successAction,
            !order ? styles.disabled : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <View style={styles.actionIcon}>
            <Ionicons
              color={palette.deepBlue}
              name="bag-handle-outline"
              size={18}
            />
          </View>

          <View style={styles.flex}>
            <Text style={styles.successActionTitle}>
              Ver pedido
            </Text>
            <Text style={styles.successActionText}>
              Consulta los detalles y seguimiento
            </Text>
          </View>

          <Ionicons
            color={palette.deepBlue}
            name="chevron-forward"
            size={17}
          />
        </Pressable>

        <Pressable
          disabled={!order || isGenerating}
          onPress={() =>
            order
              ? void downloadInvoice(order)
              : undefined
          }
          style={({ pressed }) => [
            styles.successAction,
            !order || isGenerating
              ? styles.disabled
              : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <View style={styles.actionIcon}>
            <Ionicons
              color={palette.deepBlue}
              name="download-outline"
              size={18}
            />
          </View>

          <View style={styles.flex}>
            <Text style={styles.successActionTitle}>
              {isGenerating
                ? "Generando factura..."
                : "Descargar factura"}
            </Text>
            <Text style={styles.successActionText}>
              Guarda el comprobante de tu compra
            </Text>
          </View>

          <Ionicons
            color={palette.deepBlue}
            name="chevron-forward"
            size={17}
          />
        </Pressable>

        {invoiceError ? (
          <View style={styles.errorBox}>
            <Ionicons
              color={palette.danger}
              name="alert-circle-outline"
              size={18}
            />
            <Text style={styles.errorText}>
              {invoiceError}
            </Text>
          </View>
        ) : null}

        <PrimaryButton
          icon="home-outline"
          label="Volver al inicio"
          onPress={() =>
            router.replace("/(protected)/(tabs)")
          }
        />

        <View style={styles.thankYou}>
          <Ionicons
            color={palette.deepBlue}
            name="heart-outline"
            size={16}
          />
          <Text style={styles.thankYouText}>
            Gracias por comprar en FERREPHARMA
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function CheckoutHero({
  icon,
  step,
  subtitle,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  step: string;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroBubbleOne} />
      <View style={styles.heroBubbleTwo} />

      <View style={styles.heroRow}>
        <View style={styles.flex}>
          <Text style={styles.brand}>FERREPHARMA</Text>
          <Text style={styles.stepLabel}>{step}</Text>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>
            {subtitle}
          </Text>
        </View>

        <View style={styles.heroIcon}>
          <Ionicons
            color={palette.deepBlue}
            name={icon}
            size={23}
          />
        </View>
      </View>
    </View>
  );
}

function SectionHeader({
  subtitle,
  title,
}: {
  subtitle: string;
  title: string;
}) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

function OptionCard({
  active,
  icon,
  label,
  onPress,
  subtitle,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress(): void;
  subtitle: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        active ? styles.optionCardActive : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View
        style={[
          styles.optionIcon,
          active ? styles.optionIconActive : null,
        ]}
      >
        <Ionicons
          color={palette.deepBlue}
          name={icon}
          size={21}
        />
      </View>

      <Text style={styles.optionTitle}>{label}</Text>
      <Text style={styles.optionSubtitle}>
        {subtitle}
      </Text>

      <View
        style={[
          styles.radio,
          active ? styles.radioActive : null,
        ]}
      >
        {active ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

function SelectionRow({
  active,
  icon,
  label,
  onPress,
  subtitle,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress(): void;
  subtitle: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.selectionRow,
        active ? styles.selectionRowActive : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.selectionIcon}>
        <Ionicons
          color={palette.deepBlue}
          name={icon}
          size={17}
        />
      </View>

      <View style={styles.flex}>
        <Text style={styles.selectionTitle}>
          {label}
        </Text>
        <Text
          numberOfLines={2}
          style={styles.selectionSubtitle}
        >
          {subtitle}
        </Text>
      </View>

      <View
        style={[
          styles.radio,
          active ? styles.radioActive : null,
        ]}
      >
        {active ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

function CheckoutField({
  autoCapitalize,
  icon,
  keyboardType = "default",
  label,
  onChangeText,
  value,
}: {
  autoCapitalize?:
    | "none"
    | "sentences"
    | "words"
    | "characters";
  icon: keyof typeof Ionicons.glyphMap;
  keyboardType?: "default" | "phone-pad";
  label: string;
  onChangeText(value: string): void;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.inputShell}>
        <Ionicons
          color={palette.muted}
          name={icon}
          size={16}
        />

        <TextInput
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={label}
          placeholderTextColor="#8A94A3"
          style={styles.input}
          value={value}
        />
      </View>
    </View>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryIcon}>
        <Ionicons
          color={palette.deepBlue}
          name={icon}
          size={15}
        />
      </View>

      <View style={styles.flex}>
        <Text style={styles.summaryLabel}>
          {label}
        </Text>
        <Text style={styles.summaryValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function PriceRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.priceRow}>
      <Text style={styles.priceLabel}>{label}</Text>
      <Text style={styles.priceValue}>{value}</Text>
    </View>
  );
}

function PrimaryButton({
  disabled,
  icon,
  label,
  onPress,
}: {
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress(): void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <View style={styles.primaryIcon}>
        <Ionicons
          color={palette.deepBlue}
          name={icon}
          size={18}
        />
      </View>

      <Text style={styles.primaryText}>{label}</Text>

      <Ionicons
        color={palette.white}
        name="chevron-forward"
        size={17}
      />
    </Pressable>
  );
}

function CheckoutLoading({ text }: { text: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator
        color={palette.deepBlue}
        size="large"
      />
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
}

function formatExpiration(
  month?: number,
  year?: number,
): string {
  if (!month || !year) {
    return "demo";
  }

  return `${month.toString().padStart(2, "0")}/${year}`;
}

function deliveryMethodLabel(
  method: DeliveryMethod | null | undefined,
): string {
  if (method === DeliveryMethod.HomeDelivery) {
    return "Envío a casa";
  }

  if (method === DeliveryMethod.StorePickup) {
    return "Retiro en sucursal";
  }

  return "Pendiente";
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 28,
  },
  body: {
    gap: 11,
    marginTop: -8,
    paddingHorizontal: 12,
  },
  flex: {
    flex: 1,
  },
  hero: {
    backgroundColor: palette.deepBlue,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    minHeight: 158,
    overflow: "hidden",
    paddingBottom: 22,
    paddingHorizontal: 18,
    paddingTop: 48,
  },
  heroBubbleOne: {
    backgroundColor: palette.dreamyBlue,
    borderRadius: 90,
    height: 155,
    opacity: 0.16,
    position: "absolute",
    right: -48,
    top: -58,
    width: 155,
  },
  heroBubbleTwo: {
    backgroundColor: palette.honey,
    borderRadius: 55,
    bottom: -45,
    height: 100,
    opacity: 0.13,
    position: "absolute",
    right: 60,
    width: 100,
  },
  heroRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  brand: {
    color: palette.honey,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  stepLabel: {
    color: "#C9D8E5",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 6,
  },
  heroTitle: {
    color: palette.white,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 2,
  },
  heroSubtitle: {
    color: "#EAF1F8",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 20,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  stepBar: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 2,
  },
  stepActive: {
    backgroundColor: palette.deepBlue,
    borderRadius: 3,
    flex: 1,
    height: 5,
  },
  stepComplete: {
    backgroundColor: palette.dreamyBlue,
    borderRadius: 3,
    flex: 1,
    height: 5,
  },
  stepInactive: {
    backgroundColor: "#D8DEE6",
    borderRadius: 3,
    flex: 1,
    height: 5,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: palette.muted,
    fontSize: 9,
    marginTop: 2,
  },
  deliveryRow: {
    flexDirection: "row",
    gap: 8,
  },
  optionCard: {
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 145,
    padding: 12,
  },
  optionCardActive: {
    backgroundColor: "#F5F8FC",
    borderColor: palette.deepBlue,
    borderWidth: 1.5,
  },
  optionIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 11,
    height: 39,
    justifyContent: "center",
    width: 39,
  },
  optionIconActive: {
    backgroundColor: palette.honey,
  },
  optionTitle: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 10,
  },
  optionSubtitle: {
    color: palette.muted,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 3,
    paddingRight: 15,
  },
  radio: {
    alignItems: "center",
    borderColor: "#B8C1CD",
    borderRadius: 9,
    borderWidth: 1.5,
    bottom: 10,
    height: 18,
    justifyContent: "center",
    position: "absolute",
    right: 10,
    width: 18,
  },
  radioActive: {
    borderColor: palette.deepBlue,
  },
  radioDot: {
    backgroundColor: palette.deepBlue,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  sectionCard: {
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 17,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  cardHeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  smallIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 10,
    height: 35,
    justifyContent: "center",
    width: 35,
  },
  cardTitle: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "900",
  },
  cardSubtitle: {
    color: palette.muted,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 2,
  },
  createAddress: {
    alignItems: "center",
    backgroundColor: "#F5F8FC",
    borderColor: palette.lilac,
    borderRadius: 13,
    borderStyle: "dashed",
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 10,
  },
  addCircle: {
    alignItems: "center",
    backgroundColor: palette.honey,
    borderRadius: 9,
    height: 31,
    justifyContent: "center",
    width: 31,
  },
  createAddressTitle: {
    color: palette.deepBlue,
    fontSize: 10,
    fontWeight: "900",
  },
  createAddressText: {
    color: palette.muted,
    fontSize: 8,
    marginTop: 2,
  },
  optionsList: {
    gap: 7,
  },
  selectionRow: {
    alignItems: "center",
    backgroundColor: "#FAFBFC",
    borderColor: palette.border,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 58,
    padding: 9,
    paddingRight: 38,
  },
  selectionRowActive: {
    backgroundColor: "#F1F6FB",
    borderColor: palette.deepBlue,
  },
  selectionIcon: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 9,
    height: 33,
    justifyContent: "center",
    width: 33,
  },
  selectionTitle: {
    color: palette.text,
    fontSize: 10,
    fontWeight: "900",
  },
  selectionSubtitle: {
    color: palette.muted,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 2,
  },
  field: {
    gap: 5,
  },
  fieldLabel: {
    color: palette.text,
    fontSize: 10,
    fontWeight: "800",
  },
  inputShell: {
    alignItems: "center",
    backgroundColor: "#FAFBFC",
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 44,
    paddingHorizontal: 10,
  },
  input: {
    color: palette.text,
    flex: 1,
    fontSize: 11,
    minHeight: 42,
    paddingVertical: 0,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: palette.deepBlue,
    borderRadius: 15,
    flexDirection: "row",
    gap: 9,
    minHeight: 51,
    paddingHorizontal: 11,
  },
  primaryIcon: {
    alignItems: "center",
    backgroundColor: palette.honey,
    borderRadius: 9,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  primaryText: {
    color: palette.white,
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  secureBanner: {
    alignItems: "center",
    backgroundColor: "#EAF5EF",
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    padding: 10,
  },
  secureIcon: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 9,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  secureTitle: {
    color: palette.success,
    fontSize: 10,
    fontWeight: "900",
  },
  secureText: {
    color: "#4E6E5E",
    fontSize: 9,
    marginTop: 2,
  },
  demoPaymentCard: {
    backgroundColor: palette.white,
    borderColor: palette.lilac,
    borderRadius: 17,
    borderWidth: 1,
    padding: 12,
  },
  demoNumber: {
    color: palette.deepBlue,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 14,
  },
  creditCard: {
    backgroundColor: palette.deepBlue,
    borderColor: palette.deepBlue,
    borderRadius: 17,
    borderWidth: 2,
    minHeight: 145,
    overflow: "hidden",
    padding: 14,
  },
  creditCardActive: {
    borderColor: palette.honey,
  },
  creditCardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardChip: {
    backgroundColor: palette.honey,
    borderRadius: 6,
    gap: 3,
    height: 25,
    justifyContent: "center",
    paddingHorizontal: 5,
    width: 35,
  },
  chipLine: {
    backgroundColor: "#D2AD54",
    height: 1,
  },
  selectedBadge: {
    alignItems: "center",
    backgroundColor: palette.honey,
    borderRadius: 10,
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  selectedBadgeText: {
    color: palette.deepBlue,
    fontSize: 8,
    fontWeight: "900",
  },
  creditNumber: {
    color: palette.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 20,
  },
  creditBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  creditLabel: {
    color: "#C9D8E5",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  creditValue: {
    color: palette.white,
    fontSize: 9,
    fontWeight: "800",
    marginTop: 3,
  },
  addPaymentButton: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 56,
    padding: 10,
  },
  addPaymentTitle: {
    color: palette.text,
    fontSize: 10,
    fontWeight: "900",
  },
  addPaymentText: {
    color: palette.muted,
    fontSize: 8,
    marginTop: 2,
  },
  divider: {
    backgroundColor: "#EDF0F4",
    height: 1,
  },
  productLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    minHeight: 37,
  },
  quantityBadge: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 8,
    height: 27,
    justifyContent: "center",
    width: 27,
  },
  quantityText: {
    color: palette.deepBlue,
    fontSize: 9,
    fontWeight: "900",
  },
  productName: {
    color: palette.text,
    flex: 1,
    fontSize: 10,
    fontWeight: "700",
  },
  productPrice: {
    color: palette.deepBlue,
    fontSize: 10,
    fontWeight: "900",
  },
  summaryRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
  summaryIcon: {
    alignItems: "center",
    backgroundColor: "#F1F4F7",
    borderRadius: 8,
    height: 29,
    justifyContent: "center",
    width: 29,
  },
  summaryLabel: {
    color: palette.muted,
    fontSize: 8,
    fontWeight: "800",
  },
  summaryValue: {
    color: palette.text,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  totalCard: {
    backgroundColor: palette.deepBlue,
    borderRadius: 17,
    gap: 8,
    padding: 14,
  },
  totalTitle: {
    color: palette.white,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 3,
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
    color: palette.white,
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
    color: palette.white,
    fontSize: 13,
    fontWeight: "900",
  },
  grandTotalValue: {
    color: palette.honey,
    fontSize: 18,
    fontWeight: "900",
  },
  errorBox: {
    alignItems: "center",
    backgroundColor: "#FCEEEE",
    borderRadius: 12,
    flexDirection: "row",
    gap: 7,
    padding: 10,
  },
  errorText: {
    color: palette.danger,
    flex: 1,
    fontSize: 9,
    fontWeight: "700",
  },
  checkoutNote: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 12,
    flexDirection: "row",
    gap: 7,
    padding: 10,
  },
  checkoutNoteText: {
    color: palette.muted,
    flex: 1,
    fontSize: 9,
  },
  successContent: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 28,
  },
  successHero: {
    alignItems: "center",
    backgroundColor: palette.deepBlue,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    minHeight: 250,
    overflow: "hidden",
    paddingBottom: 27,
    paddingHorizontal: 20,
    paddingTop: 52,
  },
  successBubbleOne: {
    backgroundColor: palette.dreamyBlue,
    borderRadius: 100,
    height: 180,
    opacity: 0.15,
    position: "absolute",
    right: -60,
    top: -70,
    width: 180,
  },
  successBubbleTwo: {
    backgroundColor: palette.honey,
    borderRadius: 80,
    bottom: -65,
    height: 150,
    left: -45,
    opacity: 0.12,
    position: "absolute",
    width: 150,
  },
  successIconOuter: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 42,
    height: 84,
    justifyContent: "center",
    width: 84,
  },
  successIconInner: {
    alignItems: "center",
    backgroundColor: palette.honey,
    borderRadius: 31,
    height: 62,
    justifyContent: "center",
    width: 62,
  },
  successBrand: {
    color: palette.honey,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginTop: 14,
  },
  successTitle: {
    color: palette.white,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 4,
  },
  successSubtitle: {
    color: "#E4EDF4",
    fontSize: 10,
    marginTop: 5,
  },
  successBody: {
    gap: 9,
    marginTop: -13,
    paddingHorizontal: 12,
  },
  orderNumberCard: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 17,
    borderWidth: 1,
    padding: 14,
  },
  orderNumberLabel: {
    color: palette.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  orderNumber: {
    color: palette.deepBlue,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 4,
  },
  confirmedBadge: {
    alignItems: "center",
    backgroundColor: "#EAF5EF",
    borderRadius: 10,
    flexDirection: "row",
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  successDot: {
    backgroundColor: palette.success,
    borderRadius: 4,
    height: 6,
    width: 6,
  },
  confirmedText: {
    color: palette.success,
    fontSize: 8,
    fontWeight: "900",
  },
  successTotalCard: {
    alignItems: "center",
    backgroundColor: palette.deepBlue,
    borderRadius: 16,
    padding: 13,
  },
  successTotalLabel: {
    color: "#D8E4ED",
    fontSize: 9,
  },
  successTotalValue: {
    color: palette.honey,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2,
  },
  successAction: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 58,
    padding: 10,
  },
  actionIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 10,
    height: 37,
    justifyContent: "center",
    width: 37,
  },
  successActionTitle: {
    color: palette.text,
    fontSize: 10,
    fontWeight: "900",
  },
  successActionText: {
    color: palette.muted,
    fontSize: 8,
    marginTop: 2,
  },
  thankYou: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    marginTop: 2,
  },
  thankYouText: {
    color: palette.deepBlue,
    fontSize: 9,
    fontWeight: "800",
  },
  loading: {
    alignItems: "center",
    backgroundColor: palette.cream,
    flex: 1,
    gap: 10,
    justifyContent: "center",
  },
  loadingText: {
    color: palette.deepBlue,
    fontSize: 11,
    fontWeight: "800",
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.76,
  },
});
