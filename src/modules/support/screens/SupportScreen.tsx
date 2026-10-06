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
  silkyLilac: "#AAB4E7",
  butterHoney: "#FFDB83",
  vanillaMilk: "#FFF2D0",
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
      </View>
    );
  }

  if (!businessConfig) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Hero />

        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              color={palette.deepBlue}
              name="headset-outline"
              size={34}
            />
          </View>
          <Text style={styles.emptyTitle}>Soporte no disponible</Text>
          <Text style={styles.emptyText}>
            No hay información de soporte disponible en este momento.
          </Text>
        </View>
      </ScrollView>
    );
  }

  const { support } = businessConfig;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Hero />

      <View style={styles.businessCard}>
        <View style={styles.businessIcon}>
          <Ionicons
            color={palette.deepBlue}
            name="storefront-outline"
            size={25}
          />
        </View>

        <View style={styles.businessBody}>
          <Text style={styles.businessLabel}>ESTÁS CONTACTANDO A</Text>
          <Text style={styles.businessName}>{businessConfig.name}</Text>
          {businessConfig.slogan ? (
            <Text style={styles.businessSlogan}>{businessConfig.slogan}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>¿Cómo podemos ayudarte?</Text>
          <Text style={styles.sectionSubtitle}>
            Selecciona un medio de contacto
          </Text>
        </View>

        <View style={styles.sectionIcon}>
          <Ionicons
            color={palette.deepBlue}
            name="chatbubbles-outline"
            size={21}
          />
        </View>
      </View>

      <View style={styles.actionsContainer}>
        {support.phone ? (
          <Pressable
            onPress={() => void callSupport(support.phone ?? "")}
            style={({ pressed }) => [
              styles.actionCard,
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                color={palette.deepBlue}
                name="call-outline"
                size={23}
              />
            </View>

            <View style={styles.actionBody}>
              <Text style={styles.actionTitle}>Llamar</Text>
              <Text style={styles.actionValue}>{support.phone}</Text>
            </View>

            <Ionicons
              color={palette.deepBlue}
              name="chevron-forward"
              size={20}
            />
          </Pressable>
        ) : null}

        {support.whatsapp ? (
          <Pressable
            onPress={() => void openWhatsAppSupport(support.whatsapp ?? "")}
            style={({ pressed }) => [
              styles.actionCard,
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                color={palette.deepBlue}
                name="logo-whatsapp"
                size={23}
              />
            </View>

            <View style={styles.actionBody}>
              <Text style={styles.actionTitle}>WhatsApp</Text>
              <Text style={styles.actionValue}>{support.whatsapp}</Text>
            </View>

            <Ionicons
              color={palette.deepBlue}
              name="chevron-forward"
              size={20}
            />
          </Pressable>
        ) : null}

        {support.email ? (
          <Pressable
            onPress={() => void emailSupport(support.email ?? "")}
            style={({ pressed }) => [
              styles.actionCard,
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                color={palette.deepBlue}
                name="mail-outline"
                size={23}
              />
            </View>

            <View style={styles.actionBody}>
              <Text style={styles.actionTitle}>Correo electrónico</Text>
              <Text style={styles.actionValue}>{support.email}</Text>
            </View>

            <Ionicons
              color={palette.deepBlue}
              name="chevron-forward"
              size={20}
            />
          </Pressable>
        ) : null}
      </View>

      {support.address || support.openingHours ? (
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.infoHeaderIcon}>
              <Ionicons
                color={palette.deepBlue}
                name="information-circle-outline"
                size={22}
              />
            </View>
            <Text style={styles.infoTitle}>Información</Text>
          </View>

          {support.address ? (
            <View style={styles.infoRow}>
              <Ionicons
                color={palette.deepBlue}
                name="location-outline"
                size={18}
              />
              <View style={styles.infoBody}>
                <Text style={styles.infoLabel}>Dirección</Text>
                <Text style={styles.infoValue}>{support.address}</Text>
              </View>
            </View>
          ) : null}

          {support.openingHours ? (
            <View style={styles.infoRow}>
              <Ionicons
                color={palette.deepBlue}
                name="time-outline"
                size={18}
              />
              <View style={styles.infoBody}>
                <Text style={styles.infoLabel}>Horario</Text>
                <Text style={styles.infoValue}>{support.openingHours}</Text>
              </View>
            </View>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

function Hero() {
  return (
    <View style={styles.hero}>
      <View style={styles.heroCircleLarge} />
      <View style={styles.heroCircleSmall} />

      <View style={styles.heroTop}>
        <View style={styles.heroText}>
          <Text style={styles.brand}>FERREPHARMA</Text>
          <Text style={styles.heroTitle}>Soporte</Text>
        </View>

        <View style={styles.heroIcon}>
          <Ionicons
            color={palette.deepBlue}
            name="headset-outline"
            size={24}
          />
        </View>
      </View>

      <Text style={styles.heroSubtitle}>
        Estamos para ayudarte con tus compras y consultas.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actionBody: {
    flex: 1,
  },

  actionCard: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 72,
    padding: 13,
  },

  actionIcon: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  actionsContainer: {
    gap: 10,
    paddingHorizontal: 18,
  },

  actionTitle: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "900",
  },

  actionValue: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 3,
  },

  backButton: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  brand: {
    color: palette.butterHoney,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.7,
  },

  businessBody: {
    flex: 1,
  },

  businessCard: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
    marginHorizontal: 18,
    marginTop: 20,
    padding: 15,
  },

  businessIcon: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 15,
    height: 52,
    justifyContent: "center",
    width: 52,
  },

  businessLabel: {
    color: palette.deepBlue,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  businessName: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },

  businessSlogan: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 3,
  },

  content: {
    backgroundColor: palette.vanillaMilk,
    flexGrow: 1,
    paddingBottom: 34,
  },

  emptyCard: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.silkyLilac,
    borderRadius: 22,
    borderWidth: 1,
    marginHorizontal: 18,
    marginTop: 24,
    padding: 30,
  },

  emptyIcon: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    width: 68,
  },

  emptyText: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    textAlign: "center",
  },

  emptyTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 14,
  },

  hero: {
    backgroundColor: palette.deepBlue,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
    minHeight: 212,
    overflow: "hidden",
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 44,
  },

  heroCircleLarge: {
    backgroundColor: palette.dreamyBlue,
    borderRadius: 110,
    height: 185,
    opacity: 0.17,
    position: "absolute",
    right: -55,
    top: -65,
    width: 185,
  },

  heroCircleSmall: {
    backgroundColor: palette.butterHoney,
    borderRadius: 55,
    bottom: -46,
    height: 105,
    opacity: 0.17,
    position: "absolute",
    right: 62,
    width: 105,
  },

  heroIcon: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    position: "relative",
    width: 46,
  },

  heroSubtitle: {
    color: "#EAF1F8",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 15,
    maxWidth: "82%",
  },

  heroText: {
    flex: 1,
  },

  heroTitle: {
    color: palette.white,
    fontSize: 29,
    fontWeight: "900",
    marginTop: 2,
  },

  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoBody: {
    flex: 1,
  },

  infoCard: {
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 18,
    marginTop: 20,
    padding: 16,
  },

  infoHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginBottom: 8,
  },

  infoHeaderIcon: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 11,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  infoLabel: {
    color: palette.muted,
    fontSize: 9,
    fontWeight: "800",
    marginBottom: 2,
    textTransform: "uppercase",
  },

  infoRow: {
    alignItems: "flex-start",
    borderTopColor: "#EEF0F4",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingVertical: 12,
  },

  infoTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "900",
  },

  infoValue: {
    color: palette.text,
    fontSize: 11,
    lineHeight: 17,
  },

  loading: {
    alignItems: "center",
    backgroundColor: palette.vanillaMilk,
    flex: 1,
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.76,
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 14,
    paddingHorizontal: 18,
    paddingTop: 22,
  },

  sectionIcon: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  sectionSubtitle: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 3,
  },

  sectionTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "900",
  },
});
