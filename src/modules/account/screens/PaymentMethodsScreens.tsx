import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { GUATEMALA_BANKS } from "@/config";
import { getErrorMessage } from "@/infrastructure";
import { useSession } from "@/modules/auth";
import { OptionPicker } from "@/shared";
import { colors, radius, spacing, typography } from "@/theme";

import { buildSafePaymentMethodInput, detectCardBrand, type CardFormState, validateCardForm } from "../application/cardValidation";
import { usePaymentMethods } from "../hooks/usePaymentMethods";

const initialCardForm: CardFormState = {
  cardNumber: "",
  issuingBank: "",
  cardholderName: "",
  expirationMonth: "",
  expirationYear: "",
  cvv: "",
};

export function PaymentMethodsScreen() {
  const { archive, isLoading, methods, reload, setDefault } = usePaymentMethods();
  const [error, setError] = useState<string | null>(null);

  async function runAction(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    }
  }

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={methods}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={(
        <View style={styles.header}>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>MI CUENTA</Text>
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.title}>Métodos de pago</Text>
                <Text style={styles.heroDescription}>Tus tarjetas para compras más rápidas.</Text>
              </View>
              <View style={styles.heroIcon}><Ionicons color={colors.primary} name="card-outline" size={24} /></View>
            </View>
          </View>
          <Pressable onPress={() => router.push("/(protected)/account/new-payment-method")} style={styles.primaryButton}>
            <Ionicons color={colors.surface} name="add" size={18} />
            <Text style={styles.primaryText}>Nueva tarjeta</Text>
          </Pressable>
          {error ? <Text style={styles.remove}>{error}</Text> : null}
        </View>
      )}
      ListEmptyComponent={<View style={styles.emptyCard}><View style={styles.emptyIcon}><Ionicons color={colors.primary} name="card-outline" size={28} /></View><Text style={styles.emptyTitle}>Aún no tienes tarjetas guardadas</Text><Text style={styles.emptyText}>Usa el botón “Nueva tarjeta” de arriba para agregar una.</Text></View>}
      renderItem={({ item }) => (
        <View style={styles.panel}>
          <View style={styles.cardTop}><View style={styles.cardIcon}><Ionicons color={colors.primary} name="card-outline" size={21} /></View><View style={styles.cardText}><Text style={styles.name}>{item.brand ?? "Tarjeta"} ·•••• {item.last4 ?? "demo"}</Text>
          {item.issuingBank ? <Text style={styles.muted}>{item.issuingBank}</Text> : null}
          </View>{item.isDefault ? <View style={styles.defaultBadge}><Text style={styles.defaultText}>Principal</Text></View> : null}</View>
          <Text style={styles.muted}>Vence {formatExpiration(item.expirationMonth, item.expirationYear)}</Text>
          <Text>{item.cardholderName ?? "Titular demo"}</Text>
          <View style={styles.row}>
            {!item.isDefault ? (
              <Pressable onPress={() => void runAction(() => setDefault(item.id))} style={styles.secondaryButton}>
                <Text style={styles.linkText}>Predeterminada</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={() => void runAction(() => archive(item.id))} style={styles.secondaryButton}>
              <Text style={styles.remove}>Eliminar</Text>
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
  const cardBrand = detectCardBrand(form.cardNumber);

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
      await create(buildSafePaymentMethodInput(form, session, methods.length === 0));
      router.replace(returnTo === "checkout" ? "/(protected)/checkout/payment" : "/(protected)/account/payment-methods");
    } catch (saveError) {
      setError(getErrorMessage(saveError, "No se pudo guardar la tarjeta."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.formHero}><Text style={styles.eyebrow}>FERREPHARMA</Text><Text style={styles.title}>Nueva tarjeta</Text><Text style={styles.heroDescription}>Agrega una tarjeta de forma segura.</Text></View>
      <View style={styles.formCard}><Text style={styles.formTitle}>Datos de la tarjeta</Text>
      {error ? <Text style={styles.remove}>{error}</Text> : null}
      <Field keyboardType="number-pad" label="Numero de tarjeta" maxLength={23} onChangeText={(cardNumber) => setForm((current) => ({ ...current, cardNumber: formatCardNumber(cardNumber) }))} value={form.cardNumber} />
      <View style={styles.brandNotice}><Text style={styles.brandNoticeLabel}>Marca detectada</Text><Text style={styles.brandNoticeValue}>{cardBrand === "Unknown" ? "Pendiente" : cardBrand}</Text></View>
      <OptionPicker label="Banco emisor" onChange={(issuingBank) => setForm((current) => ({ ...current, issuingBank }))} options={GUATEMALA_BANKS} value={form.issuingBank} />
      <Field label="Titular" onChangeText={(cardholderName) => setForm((current) => ({ ...current, cardholderName }))} value={form.cardholderName} />
      <View style={styles.row}>
        <Field keyboardType="number-pad" label="Mes" onChangeText={(expirationMonth) => setForm((current) => ({ ...current, expirationMonth }))} value={form.expirationMonth} />
        <Field keyboardType="number-pad" label="Ano" onChangeText={(expirationYear) => setForm((current) => ({ ...current, expirationYear }))} value={form.expirationYear} />
      </View>
      <Field keyboardType="number-pad" label="CVV" onChangeText={(cvv) => setForm((current) => ({ ...current, cvv }))} secureTextEntry value={form.cvv} />
      <View style={styles.securityBox}><Ionicons color={colors.success} name="shield-checkmark-outline" size={20} /><Text style={styles.securityText}>Nunca mostramos el número completo ni el CVV después de guardar.</Text></View>
      <Pressable disabled={isSubmitting} onPress={save} style={[styles.primaryButton, isSubmitting ? styles.disabled : null]}>
        <Text style={styles.primaryText}>{isSubmitting ? "Guardando..." : "Guardar tarjeta"}</Text>
      </Pressable>
      </View></ScrollView>
  );
}

function Field({
  keyboardType = "default",
  label,
  maxLength,
  onChangeText,
  secureTextEntry,
  value,
}: {
  keyboardType?: "default" | "number-pad";
  label: string;
  maxLength?: number;
  onChangeText(value: string): void;
  secureTextEntry?: boolean;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput keyboardType={keyboardType} maxLength={maxLength} onChangeText={onChangeText} placeholder={label} placeholderTextColor={colors.textMuted} secureTextEntry={secureTextEntry} style={styles.input} value={value} />
    </View>
  );
}

function formatExpiration(month?: number, year?: number): string {
  if (!month || !year) {
    return "No indicada";
  }

  return `${month.toString().padStart(2, "0")}/${year}`;
}

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

const styles = StyleSheet.create({
  content: { backgroundColor: "#FFF2D0", flexGrow: 1, gap: spacing.md, paddingBottom: spacing.xl },
  disabled: { opacity: 0.7 },
  field: { flex: 1, gap: spacing.xs },
  header: { gap: spacing.md },
  hero: { backgroundColor: colors.primary, borderBottomLeftRadius: 26, borderBottomRightRadius: 26, marginBottom: spacing.sm, padding: spacing.lg, paddingTop: 42 },
  eyebrow: { color: "#FFDB83", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  titleRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  heroDescription: { color: "#EAF1F8", fontSize: 12, marginTop: 6 },
  heroIcon: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  input: { borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: colors.text, fontSize: typography.body, minHeight: 48, paddingHorizontal: spacing.md },
  label: { color: colors.text, fontSize: typography.caption, fontWeight: "700" },
  linkText: { color: colors.primary, fontWeight: "700" },
  loading: { flex: 1 },
  muted: { color: colors.textMuted },
  name: { color: colors.text, fontWeight: "700" },
  panel: { backgroundColor: colors.surface, borderColor: "#AAB4E7", borderRadius: 18, borderWidth: 1, gap: spacing.sm, marginHorizontal: spacing.md, marginBottom: spacing.sm, padding: spacing.md },
  cardTop: { alignItems: "center", flexDirection: "row" }, cardIcon: { alignItems: "center", backgroundColor: "#EEF3FB", borderRadius: 12, height: 43, justifyContent: "center", width: 43 }, cardText: { flex: 1, marginLeft: 10 }, defaultBadge: { backgroundColor: "#EAF7EF", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5 }, defaultText: { color: colors.success, fontSize: 9, fontWeight: "800" },
  primaryButton: { alignItems: "center", alignSelf: "flex-start", backgroundColor: colors.primary, borderRadius: 13, flexDirection: "row", gap: 6, minHeight: 48, justifyContent: "center", paddingHorizontal: spacing.md },
  primaryText: { color: colors.surface, fontWeight: "700" },
  brandNotice: { alignItems: "center", backgroundColor: "#EEF3FB", borderRadius: radius.md, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  brandNoticeLabel: { color: colors.textMuted, fontSize: typography.caption, fontWeight: "700" },
  brandNoticeValue: { color: colors.primary, fontSize: typography.caption, fontWeight: "800" },
  remove: { color: colors.danger },
  row: { flexDirection: "row", gap: spacing.md },
  secondaryButton: { alignItems: "center", borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, minHeight: 40, justifyContent: "center", paddingHorizontal: spacing.md },
  title: { color: colors.surface, fontSize: typography.title, fontWeight: "900" },
  emptyCard: { alignItems: "center", backgroundColor: colors.surface, borderColor: "#AAB4E7", borderRadius: 20, borderWidth: 1, gap: 9, margin: spacing.md, padding: spacing.xl }, emptyIcon: { alignItems: "center", backgroundColor: "#EEF3FB", borderRadius: 28, height: 56, justifyContent: "center", width: 56 }, emptyTitle: { color: colors.text, fontSize: typography.subtitle, fontWeight: "900", textAlign: "center" }, emptyText: { color: colors.textMuted, textAlign: "center" }, formHero: { backgroundColor: colors.primary, borderBottomLeftRadius: 26, borderBottomRightRadius: 26, padding: spacing.lg, paddingTop: 42 }, formCard: { backgroundColor: colors.surface, borderColor: "#AAB4E7", borderRadius: 20, borderWidth: 1, gap: spacing.md, marginHorizontal: spacing.md, marginTop: -12, padding: spacing.md }, formTitle: { color: colors.text, fontSize: typography.subtitle, fontWeight: "900" }, securityBox: { alignItems: "center", backgroundColor: "#EAF7EF", borderRadius: 12, flexDirection: "row", gap: 8, padding: spacing.sm }, securityText: { color: colors.success, flex: 1, fontSize: typography.caption },
});
