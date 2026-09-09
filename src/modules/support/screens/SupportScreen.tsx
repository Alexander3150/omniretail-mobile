import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme";

import { callSupport, emailSupport, openWhatsAppSupport } from "../application/supportLinks";
import { useSupport } from "../hooks/useSupport";

export function SupportScreen() {
  const { businessConfig, isLoading } = useSupport();

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }

  if (!businessConfig) {
    return (
      <View style={styles.content}>
        <Text style={styles.title}>Soporte</Text>
        <Text style={styles.muted}>No hay informacion de soporte disponible.</Text>
      </View>
    );
  }

  const { support } = businessConfig;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.panel}>
        <Text style={styles.title}>Soporte</Text>
        <Text style={styles.name}>{businessConfig.name}</Text>
        {businessConfig.slogan ? <Text style={styles.muted}>{businessConfig.slogan}</Text> : null}
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Contacto</Text>
        {support.phone ? (
          <Pressable onPress={() => void callSupport(support.phone ?? "")} style={styles.action}>
            <Text style={styles.actionText}>Telefono: {support.phone}</Text>
          </Pressable>
        ) : null}
        {support.whatsapp ? (
          <Pressable onPress={() => void openWhatsAppSupport(support.whatsapp ?? "")} style={styles.action}>
            <Text style={styles.actionText}>WhatsApp: {support.whatsapp}</Text>
          </Pressable>
        ) : null}
        {support.email ? (
          <Pressable onPress={() => void emailSupport(support.email ?? "")} style={styles.action}>
            <Text style={styles.actionText}>Email: {support.email}</Text>
          </Pressable>
        ) : null}
        {support.address ? <Text>Direccion: {support.address}</Text> : null}
        {support.openingHours ? <Text style={styles.muted}>Horario: {support.openingHours}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  action: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.md },
  actionText: { color: colors.primary, fontWeight: "700" },
  content: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  loading: { flex: 1 },
  muted: { color: colors.textMuted },
  name: { color: colors.text, fontWeight: "700" },
  panel: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.sm, padding: spacing.md },
  sectionTitle: { color: colors.text, fontSize: typography.subtitle, fontWeight: "700" },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "700" },
});
