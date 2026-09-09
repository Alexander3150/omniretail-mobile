import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useSession } from "@/modules/auth";
import { colors, radius, spacing, typography } from "@/theme";

import { buildSafePaymentMethodInput, type CardFormState, validateCardForm } from "../application/cardValidation";
import { usePaymentMethods } from "../hooks/usePaymentMethods";

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
  const { archive, isLoading, methods, reload, setDefault } = usePaymentMethods();

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
          <Text style={styles.title}>Metodos de pago</Text>
          <Pressable onPress={() => router.push("/(protected)/account/new-payment-method")} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Agregar tarjeta</Text>
          </Pressable>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.muted}>No hay tarjetas guardadas.</Text>}
      renderItem={({ item }) => (
        <View style={styles.panel}>
          <Text style={styles.name}>{item.brand ?? "Tarjeta"} terminada en {item.last4 ?? "demo"}</Text>
          <Text style={styles.muted}>Expira {formatExpiration(item.expirationMonth, item.expirationYear)}</Text>
          <Text>{item.cardholderName ?? "Titular demo"}</Text>
          <Text style={styles.muted}>{item.isDefault ? "Predeterminada" : "Disponible"}</Text>
          <View style={styles.row}>
            {!item.isDefault ? (
              <Pressable onPress={() => void setDefault(item.id)} style={styles.secondaryButton}>
                <Text style={styles.linkText}>Predeterminada</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={() => void archive(item.id)} style={styles.secondaryButton}>
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
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Agregar tarjeta</Text>
      <Text style={styles.muted}>Tarjeta demo: 4111 1111 1111 1111 · 12/30 · CVV 123</Text>
      <Pressable onPress={() => setForm(demoCardForm)} style={styles.secondaryButton}>
        <Text style={styles.linkText}>Usar tarjeta demo</Text>
      </Pressable>
      {error ? <Text style={styles.remove}>{error}</Text> : null}
      <Field keyboardType="number-pad" label="Numero de tarjeta" onChangeText={(cardNumber) => setForm((current) => ({ ...current, cardNumber }))} value={form.cardNumber} />
      <Field label="Titular" onChangeText={(cardholderName) => setForm((current) => ({ ...current, cardholderName }))} value={form.cardholderName} />
      <View style={styles.row}>
        <Field keyboardType="number-pad" label="Mes" onChangeText={(expirationMonth) => setForm((current) => ({ ...current, expirationMonth }))} value={form.expirationMonth} />
        <Field keyboardType="number-pad" label="Ano" onChangeText={(expirationYear) => setForm((current) => ({ ...current, expirationYear }))} value={form.expirationYear} />
      </View>
      <Field keyboardType="number-pad" label="CVV" onChangeText={(cvv) => setForm((current) => ({ ...current, cvv }))} secureTextEntry value={form.cvv} />
      <Pressable disabled={isSubmitting} onPress={save} style={[styles.primaryButton, isSubmitting ? styles.disabled : null]}>
        <Text style={styles.primaryText}>{isSubmitting ? "Guardando..." : "Guardar tarjeta"}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({
  keyboardType = "default",
  label,
  onChangeText,
  secureTextEntry,
  value,
}: {
  keyboardType?: "default" | "number-pad";
  label: string;
  onChangeText(value: string): void;
  secureTextEntry?: boolean;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput keyboardType={keyboardType} onChangeText={onChangeText} placeholder={label} placeholderTextColor={colors.textMuted} secureTextEntry={secureTextEntry} style={styles.input} value={value} />
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
  content: { backgroundColor: colors.background, flexGrow: 1, gap: spacing.md, padding: spacing.md },
  disabled: { opacity: 0.7 },
  field: { flex: 1, gap: spacing.xs },
  header: { gap: spacing.md },
  input: { borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: colors.text, fontSize: typography.body, minHeight: 48, paddingHorizontal: spacing.md },
  label: { color: colors.text, fontSize: typography.caption, fontWeight: "700" },
  linkText: { color: colors.primary, fontWeight: "700" },
  loading: { flex: 1 },
  muted: { color: colors.textMuted },
  name: { color: colors.text, fontWeight: "700" },
  panel: { borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, gap: spacing.sm, padding: spacing.md },
  primaryButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radius.md, minHeight: 48, justifyContent: "center", paddingHorizontal: spacing.md },
  primaryText: { color: colors.surface, fontWeight: "700" },
  remove: { color: colors.danger },
  row: { flexDirection: "row", gap: spacing.md },
  secondaryButton: { alignItems: "center", borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, minHeight: 40, justifyContent: "center", paddingHorizontal: spacing.md },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "700" },
});
