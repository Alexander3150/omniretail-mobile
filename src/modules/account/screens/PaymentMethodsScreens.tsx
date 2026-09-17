import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSession } from "@/modules/auth";

import {
  buildSafePaymentMethodInput,
  type CardFormState,
  validateCardForm,
} from "../application/cardValidation";
import { usePaymentMethods } from "../hooks/usePaymentMethods";

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
};

const initialCardForm: CardFormState = {
  cardNumber: "",
  cardholderName: "",
  expirationMonth: "",
  expirationYear: "",
  cvv: "",
};

const demoCardForm: CardFormState = {
  cardNumber: "4111 1111 1111 1111",
  cardholderName: "Cliente Demo",
  expirationMonth: "12",
  expirationYear: "30",
  cvv: "123",
};

export function PaymentMethodsScreen() {
  const { archive, isLoading, methods, reload, setDefault } =
    usePaymentMethods();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  if (isLoading) {
    return <LoadingScreen text="Cargando métodos de pago..." />;
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={methods}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <Hero
            icon="card-outline"
            subtitle="Administra las tarjetas que utilizas para realizar tus compras."
            title="Métodos de pago"
          />

          <View style={styles.body}>
            <Pressable
              onPress={() =>
                router.push("/(protected)/account/new-payment-method")
              }
              style={({ pressed }) => [
                styles.primaryAction,
                pressed ? styles.pressed : null,
              ]}
            >
              <View style={styles.yellowIcon}>
                <Ionicons color={palette.deepBlue} name="add" size={20} />
              </View>

              <View style={styles.actionCopy}>
                <Text style={styles.primaryActionTitle}>
                  Agregar tarjeta
                </Text>
                <Text style={styles.primaryActionSubtitle}>
                  Registra un nuevo método de pago
                </Text>
              </View>

              <Ionicons
                color={palette.white}
                name="chevron-forward"
                size={18}
              />
            </Pressable>

            {methods.length > 0 ? (
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Tarjetas guardadas
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    {methods.length}{" "}
                    {methods.length === 1 ? "tarjeta" : "tarjetas"}
                  </Text>
                </View>

                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{methods.length}</Text>
                </View>
              </View>
            ) : null}
          </View>
        </>
      }
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              color={palette.deepBlue}
              name="card-outline"
              size={29}
            />
          </View>
          <Text style={styles.emptyTitle}>No hay tarjetas guardadas</Text>
          <Text style={styles.emptyText}>
            Agrega una tarjeta para agilizar tus próximas compras.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.paymentCard}>
          <View style={styles.cardDecorationOne} />
          <View style={styles.cardDecorationTwo} />

          <View style={styles.cardTop}>
            <View style={styles.chip}>
              <View style={styles.chipLine} />
              <View style={styles.chipLine} />
            </View>

            {item.isDefault ? (
              <View style={styles.defaultBadge}>
                <Ionicons name="star" size={11} color={palette.deepBlue} />
                <Text style={styles.defaultBadgeText}>Principal</Text>
              </View>
            ) : (
              <Ionicons
                color="#DCE7F1"
                name="card-outline"
                size={25}
              />
            )}
          </View>

          <Text style={styles.cardNumber}>
            •••• •••• •••• {item.last4 ?? "demo"}
          </Text>

          <View style={styles.cardInfoRow}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardInfoLabel}>TITULAR</Text>
              <Text numberOfLines={1} style={styles.cardInfoValue}>
                {item.cardholderName ?? "Titular demo"}
              </Text>
            </View>

            <View>
              <Text style={styles.cardInfoLabel}>EXPIRA</Text>
              <Text style={styles.cardInfoValue}>
                {formatExpiration(
                  item.expirationMonth,
                  item.expirationYear,
                )}
              </Text>
            </View>

            <View>
              <Text style={styles.cardBrand}>
                {item.brand ?? "Tarjeta"}
              </Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            {!item.isDefault ? (
              <Pressable
                onPress={() => void setDefault(item.id)}
                style={({ pressed }) => [
                  styles.lightAction,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Ionicons
                  color={palette.deepBlue}
                  name="star-outline"
                  size={15}
                />
                <Text style={styles.lightActionText}>Principal</Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => void archive(item.id)}
              style={({ pressed }) => [
                styles.deleteAction,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons
                color={palette.danger}
                name="trash-outline"
                size={15}
              />
              <Text style={styles.deleteText}>Eliminar</Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}

export function NewPaymentMethodScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { session } = useSession();
  const { create, methods } = usePaymentMethods();
  const [form, setForm] = useState<CardFormState>(initialCardForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function save() {
    if (!session) {
      return;
    }

    const validationError = validateCardForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await create(
        buildSafePaymentMethodInput(
          form,
          session,
          methods.length === 0,
        ),
      );

      router.replace(
        returnTo === "checkout"
          ? "/(protected)/checkout/payment"
          : "/(protected)/account/payment-methods",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.formContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Hero
        icon="card-outline"
        subtitle="Agrega los datos de tu tarjeta para utilizarla en tus compras."
        title="Agregar tarjeta"
      />

      <View style={styles.formBody}>
        <View style={styles.demoCard}>
          <View style={styles.demoHeader}>
            <View style={styles.demoIcon}>
              <Ionicons
                color={palette.deepBlue}
                name="flask-outline"
                size={19}
              />
            </View>

            <View style={styles.actionCopy}>
              <Text style={styles.demoTitle}>Tarjeta de demostración</Text>
              <Text style={styles.demoSubtitle}>
                Puedes utilizarla para probar el flujo de pago.
              </Text>
            </View>
          </View>

          <Text style={styles.demoNumber}>
            4111 1111 1111 1111
          </Text>
          <Text style={styles.demoDetails}>
            Vence 12/30 · CVV 123
          </Text>

          <Pressable
            onPress={() => setForm(demoCardForm)}
            style={({ pressed }) => [
              styles.demoButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons
              color={palette.deepBlue}
              name="sparkles-outline"
              size={16}
            />
            <Text style={styles.demoButtonText}>
              Usar tarjeta demo
            </Text>
          </Pressable>
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

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Datos de la tarjeta</Text>
          <Text style={styles.formSubtitle}>
            Completa la información solicitada
          </Text>

          <Field
            icon="card-outline"
            keyboardType="number-pad"
            label="Número de tarjeta"
            onChangeText={(cardNumber) =>
              setForm((current) => ({ ...current, cardNumber }))
            }
            value={form.cardNumber}
          />

          <Field
            icon="person-outline"
            label="Titular"
            onChangeText={(cardholderName) =>
              setForm((current) => ({
                ...current,
                cardholderName,
              }))
            }
            value={form.cardholderName}
          />

          <View style={styles.fieldRow}>
            <Field
              keyboardType="number-pad"
              label="Mes"
              onChangeText={(expirationMonth) =>
                setForm((current) => ({
                  ...current,
                  expirationMonth,
                }))
              }
              value={form.expirationMonth}
            />

            <Field
              keyboardType="number-pad"
              label="Año"
              onChangeText={(expirationYear) =>
                setForm((current) => ({
                  ...current,
                  expirationYear,
                }))
              }
              value={form.expirationYear}
            />

            <Field
              keyboardType="number-pad"
              label="CVV"
              onChangeText={(cvv) =>
                setForm((current) => ({ ...current, cvv }))
              }
              secureTextEntry
              value={form.cvv}
            />
          </View>
        </View>

        <Pressable
          disabled={isSubmitting}
          onPress={save}
          style={({ pressed }) => [
            styles.saveButton,
            isSubmitting ? styles.disabled : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <View style={styles.yellowIcon}>
            <Ionicons
              color={palette.deepBlue}
              name="shield-checkmark-outline"
              size={18}
            />
          </View>

          <Text style={styles.saveButtonText}>
            {isSubmitting ? "Guardando..." : "Guardar tarjeta"}
          </Text>

          <Ionicons
            color={palette.white}
            name="arrow-forward"
            size={18}
          />
        </Pressable>

        <View style={styles.securityNote}>
          <Ionicons
            color={palette.deepBlue}
            name="lock-closed-outline"
            size={16}
          />
          <Text style={styles.securityNoteText}>
            La aplicación guarda únicamente la información segura
            necesaria para identificar tu método de pago.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function Hero({
  icon,
  subtitle,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroBubbleOne} />
      <View style={styles.heroBubbleTwo} />

      <View style={styles.heroRow}>
        <View style={styles.heroCopy}>
          <Text style={styles.brand}>FERREPHARMA</Text>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </View>

        <View style={styles.heroIcon}>
          <Ionicons color={palette.deepBlue} name={icon} size={22} />
        </View>
      </View>
    </View>
  );
}

function Field({
  icon,
  keyboardType = "default",
  label,
  onChangeText,
  secureTextEntry,
  value,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  keyboardType?: "default" | "number-pad";
  label: string;
  onChangeText(value: string): void;
  secureTextEntry?: boolean;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.inputShell}>
        {icon ? (
          <Ionicons
            color={palette.muted}
            name={icon}
            size={16}
          />
        ) : null}

        <TextInput
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={label}
          placeholderTextColor="#8A94A3"
          secureTextEntry={secureTextEntry}
          style={styles.input}
          value={value}
        />
      </View>
    </View>
  );
}

function LoadingScreen({ text }: { text: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={palette.deepBlue} size="large" />
      <Text style={styles.loadingText}>{text}</Text>
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
  content: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 28,
  },
  formContent: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 28,
  },
  body: {
    gap: 10,
    paddingHorizontal: 12,
  },
  formBody: {
    gap: 10,
    marginTop: -8,
    paddingHorizontal: 12,
  },
  hero: {
    backgroundColor: palette.deepBlue,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    minHeight: 148,
    overflow: "hidden",
    paddingBottom: 20,
    paddingHorizontal: 18,
    paddingTop: 30,
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
    justifyContent: "space-between",
  },
  heroCopy: {
    flex: 1,
    paddingRight: 12,
  },
  brand: {
    color: palette.honey,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: palette.white,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 3,
  },
  heroSubtitle: {
    color: "#EAF1F8",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: palette.deepBlue,
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
    minHeight: 58,
    paddingHorizontal: 12,
  },
  yellowIcon: {
    alignItems: "center",
    backgroundColor: palette.honey,
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  actionCopy: { flex: 1 },
  primaryActionTitle: {
    color: palette.white,
    fontSize: 13,
    fontWeight: "900",
  },
  primaryActionSubtitle: {
    color: "#DDE8F2",
    fontSize: 10,
    marginTop: 2,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 2,
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: "#E7EDF5",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    minWidth: 28,
  },
  countText: {
    color: palette.deepBlue,
    fontSize: 11,
    fontWeight: "900",
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: 12,
    marginTop: 10,
    padding: 25,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 10,
  },
  emptyText: {
    color: palette.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
    textAlign: "center",
  },
  paymentCard: {
    backgroundColor: palette.deepBlue,
    borderRadius: 19,
    marginHorizontal: 12,
    marginTop: 10,
    overflow: "hidden",
    padding: 16,
  },
  cardDecorationOne: {
    backgroundColor: palette.dreamyBlue,
    borderRadius: 80,
    height: 145,
    opacity: 0.15,
    position: "absolute",
    right: -55,
    top: -65,
    width: 145,
  },
  cardDecorationTwo: {
    backgroundColor: palette.lilac,
    borderRadius: 60,
    bottom: -55,
    height: 115,
    opacity: 0.12,
    left: 25,
    position: "absolute",
    width: 115,
  },
  cardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chip: {
    backgroundColor: palette.honey,
    borderRadius: 6,
    gap: 3,
    height: 26,
    justifyContent: "center",
    paddingHorizontal: 5,
    width: 36,
  },
  chipLine: {
    backgroundColor: "#D4AE54",
    height: 1,
    width: "100%",
  },
  defaultBadge: {
    alignItems: "center",
    backgroundColor: palette.honey,
    borderRadius: 12,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  defaultBadgeText: {
    color: palette.deepBlue,
    fontSize: 9,
    fontWeight: "900",
  },
  cardNumber: {
    color: palette.white,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 22,
  },
  cardInfoRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  cardInfo: { flex: 1 },
  cardInfoLabel: {
    color: "#C9D8E5",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  cardInfoValue: {
    color: palette.white,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },
  cardBrand: {
    color: palette.honey,
    fontSize: 12,
    fontWeight: "900",
  },
  cardActions: {
    borderTopColor: "rgba(255,255,255,0.16)",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 7,
    marginTop: 15,
    paddingTop: 11,
  },
  lightAction: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 10,
    flexDirection: "row",
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  lightActionText: {
    color: palette.deepBlue,
    fontSize: 10,
    fontWeight: "900",
  },
  deleteAction: {
    alignItems: "center",
    backgroundColor: "#FCEEEE",
    borderRadius: 10,
    flexDirection: "row",
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  deleteText: {
    color: palette.danger,
    fontSize: 10,
    fontWeight: "900",
  },
  demoCard: {
    backgroundColor: palette.white,
    borderColor: palette.lilac,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  demoHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  demoIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  demoTitle: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "900",
  },
  demoSubtitle: {
    color: palette.muted,
    fontSize: 9,
    marginTop: 2,
  },
  demoNumber: {
    color: palette.deepBlue,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 13,
  },
  demoDetails: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 4,
  },
  demoButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EEF3F8",
    borderRadius: 10,
    flexDirection: "row",
    gap: 6,
    marginTop: 11,
    minHeight: 35,
    paddingHorizontal: 10,
  },
  demoButtonText: {
    color: palette.deepBlue,
    fontSize: 10,
    fontWeight: "900",
  },
  formCard: {
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 11,
    padding: 14,
  },
  formTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "900",
  },
  formSubtitle: {
    color: palette.muted,
    fontSize: 10,
    marginTop: -7,
  },
  field: {
    flex: 1,
    gap: 5,
  },
  fieldLabel: {
    color: palette.text,
    fontSize: 10,
    fontWeight: "800",
  },
  fieldRow: {
    flexDirection: "row",
    gap: 7,
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
  saveButton: {
    alignItems: "center",
    backgroundColor: palette.deepBlue,
    borderRadius: 15,
    flexDirection: "row",
    gap: 9,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  saveButtonText: {
    color: palette.white,
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  securityNote: {
    alignItems: "flex-start",
    backgroundColor: "#EEF3F8",
    borderRadius: 13,
    flexDirection: "row",
    gap: 8,
    padding: 11,
  },
  securityNoteText: {
    color: palette.muted,
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
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
    fontSize: 10,
    fontWeight: "700",
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
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.76 },
});
