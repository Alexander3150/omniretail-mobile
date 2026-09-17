import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  callSupport,
  emailSupport,
  openWhatsAppSupport,
} from "../application/supportLinks";
import { useSupport } from "../hooks/useSupport";

const palette = {
  deepBlue: "#3E668F",
  dreamyBlue: "#81A9EE",
  honey: "#FFDB83",
  cream: "#FFF2D0",
  white: "#FFFFFF",
  text: "#172033",
  muted: "#687286",
  border: "#DDE3EE",
};

export function SupportScreen() {
  const { businessConfig, isLoading } = useSupport();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={palette.deepBlue} size="large" />
        <Text style={styles.loadingText}>
          Cargando información de soporte...
        </Text>
      </View>
    );
  }

  if (!businessConfig) {
    return (
      <View style={styles.notFound}>
        <View style={styles.emptyIcon}>
          <Ionicons
            color={palette.deepBlue}
            name="headset-outline"
            size={30}
          />
        </View>
        <Text style={styles.emptyTitle}>Soporte no disponible</Text>
        <Text style={styles.emptyText}>
          No hay información de soporte disponible en este momento.
        </Text>
      </View>
    );
  }

  const { support } = businessConfig;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.bubbleOne} />
        <View style={styles.bubbleTwo} />

        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.brand}>FERREPHARMA</Text>
            <Text style={styles.heroTitle}>¿Necesitas ayuda?</Text>
            <Text style={styles.heroSubtitle}>
              Estamos para ayudarte con tus compras y consultas.
            </Text>
          </View>

          <View style={styles.heroIcon}>
            <Ionicons
              color={palette.deepBlue}
              name="headset-outline"
              size={23}
            />
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.businessCard}>
          <View style={styles.storeIcon}>
            <Ionicons
              color={palette.deepBlue}
              name="storefront-outline"
              size={22}
            />
          </View>

          <View style={styles.businessCopy}>
            <Text style={styles.businessName}>
              {businessConfig.name}
            </Text>

            {businessConfig.slogan ? (
              <Text style={styles.businessSlogan}>
                {businessConfig.slogan}
              </Text>
            ) : null}
          </View>

          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Soporte</Text>
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Contáctanos</Text>
          <Text style={styles.sectionSubtitle}>
            Elige el medio que prefieras
          </Text>
        </View>

        {support.whatsapp ? (
          <ContactCard
            icon="logo-whatsapp"
            label="WhatsApp"
            onPress={() =>
              void openWhatsAppSupport(support.whatsapp ?? "")
            }
            value={support.whatsapp}
          />
        ) : null}

        {support.phone ? (
          <ContactCard
            icon="call-outline"
            label="Teléfono"
            onPress={() => void callSupport(support.phone ?? "")}
            value={support.phone}
          />
        ) : null}

        {support.email ? (
          <ContactCard
            icon="mail-outline"
            label="Correo electrónico"
            onPress={() => void emailSupport(support.email ?? "")}
            value={support.email}
          />
        ) : null}

        {support.address || support.openingHours ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Información</Text>

            {support.address ? (
              <InfoRow
                icon="location-outline"
                label="Dirección"
                value={support.address}
              />
            ) : null}

            {support.openingHours ? (
              <InfoRow
                icon="time-outline"
                label="Horario de atención"
                value={support.openingHours}
              />
            ) : null}
          </View>
        ) : null}

        <View style={styles.helpNote}>
          <View style={styles.helpIcon}>
            <Ionicons
              color={palette.deepBlue}
              name="information-circle-outline"
              size={19}
            />
          </View>

          <Text style={styles.helpText}>
            Ten a la mano la información de tu pedido cuando necesites
            ayuda relacionada con una compra.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function ContactCard({
  icon,
  label,
  onPress,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress(): void;
  value: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.contactCard,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.contactIcon}>
        <Ionicons
          color={palette.deepBlue}
          name={icon}
          size={21}
        />
      </View>

      <View style={styles.contactCopy}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>

      <View style={styles.contactArrow}>
        <Ionicons
          color={palette.deepBlue}
          name="arrow-forward"
          size={16}
        />
      </View>
    </Pressable>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.smallIcon}>
        <Ionicons
          color={palette.deepBlue}
          name={icon}
          size={16}
        />
      </View>

      <View style={styles.contactCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 28,
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
  bubbleOne: {
    backgroundColor: palette.dreamyBlue,
    borderRadius: 90,
    height: 155,
    opacity: 0.16,
    position: "absolute",
    right: -48,
    top: -58,
    width: 155,
  },
  bubbleTwo: {
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
  heroCopy: { flex: 1, paddingRight: 12 },
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
  body: {
    gap: 9,
    marginTop: -8,
    paddingHorizontal: 12,
  },
  businessCard: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    padding: 12,
  },
  storeIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 11,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  businessCopy: { flex: 1 },
  businessName: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "900",
  },
  businessSlogan: {
    color: palette.muted,
    fontSize: 9,
    marginTop: 2,
  },
  onlineBadge: {
    alignItems: "center",
    backgroundColor: "#EAF5EF",
    borderRadius: 10,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  onlineDot: {
    backgroundColor: "#247A52",
    borderRadius: 4,
    height: 6,
    width: 6,
  },
  onlineText: {
    color: "#247A52",
    fontSize: 8,
    fontWeight: "900",
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4,
  },
  sectionSubtitle: {
    color: palette.muted,
    fontSize: 9,
    marginTop: 2,
  },
  contactCard: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 62,
    padding: 10,
  },
  contactIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 11,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  contactCopy: { flex: 1 },
  contactLabel: {
    color: palette.text,
    fontSize: 11,
    fontWeight: "900",
  },
  contactValue: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 3,
  },
  contactArrow: {
    alignItems: "center",
    backgroundColor: palette.honey,
    borderRadius: 9,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  infoCard: {
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 11,
    padding: 12,
  },
  infoTitle: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "900",
  },
  infoRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
  smallIcon: {
    alignItems: "center",
    backgroundColor: "#F2F5F8",
    borderRadius: 8,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  infoLabel: {
    color: palette.muted,
    fontSize: 8,
    fontWeight: "800",
  },
  infoValue: {
    color: palette.text,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },
  helpNote: {
    alignItems: "flex-start",
    backgroundColor: "#EEF3F8",
    borderRadius: 13,
    flexDirection: "row",
    gap: 8,
    padding: 11,
  },
  helpIcon: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 9,
    height: 31,
    justifyContent: "center",
    width: 31,
  },
  helpText: {
    color: palette.muted,
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
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
  notFound: {
    alignItems: "center",
    backgroundColor: palette.cream,
    flex: 1,
    justifyContent: "center",
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
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
    textAlign: "center",
  },
  pressed: { opacity: 0.76 },
});
