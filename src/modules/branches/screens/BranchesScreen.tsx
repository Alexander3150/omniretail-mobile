import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { openBranchDirections } from "../application/branchLinks";
import { useBranch, useBranches } from "../hooks/useBranches";
import { StoreBrandText } from "@/shared";

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

function Hero({
  title,
  subtitle,
  icon,
  showBackButton = true,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  showBackButton?: boolean;
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroCircleLarge} />
      <View style={styles.heroCircleSmall} />

      <View style={styles.heroTop}>
        {showBackButton ? <Pressable accessibilityLabel="Regresar" onPress={() => router.back()} style={styles.backButton}><Ionicons color={palette.deepBlue} name="arrow-back" size={20} /></Pressable> : null}
        <View style={styles.heroText}>
          <StoreBrandText style={styles.brand} />
          <Text style={styles.heroTitle}>{title}</Text>
        </View>

        <View style={styles.heroIcon}>
          <Ionicons color={palette.deepBlue} name={icon} size={24} />
        </View>
      </View>

      <Text style={styles.heroSubtitle}>{subtitle}</Text>
    </View>
  );
}

export function BranchesScreen() {
  const { branches, isLoading } = useBranches();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={palette.deepBlue} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={branches}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <Hero
            icon="storefront-outline"
            subtitle="Encuentra el punto FERREPHARMA más conveniente para ti."
            title="Sucursales"
          />

          {branches.length > 0 ? (
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Nuestras ubicaciones</Text>
                <Text style={styles.sectionSubtitle}>
                  {branches.length} {branches.length === 1 ? "sucursal activa" : "sucursales activas"}
                </Text>
              </View>

              <View style={styles.sectionIcon}>
                <Ionicons
                  color={palette.deepBlue}
                  name="location-outline"
                  size={21}
                />
              </View>
            </View>
          ) : null}
        </>
      }
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              color={palette.deepBlue}
              name="storefront-outline"
              size={34}
            />
          </View>
          <Text style={styles.emptyTitle}>Sin sucursales disponibles</Text>
          <Text style={styles.emptyText}>
            No hay sucursales activas disponibles en este momento.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            router.push(`/(protected)/branches/${item.id}` as never)
          }
          style={({ pressed }) => [
            styles.branchCard,
            pressed ? styles.pressed : null,
          ]}
        >
          <View style={styles.branchIcon}>
            <Ionicons
              color={palette.deepBlue}
              name="storefront-outline"
              size={25}
            />
          </View>

          <View style={styles.branchBody}>
            <Text style={styles.branchName}>{item.name}</Text>

            <View style={styles.infoRow}>
              <Ionicons
                color={palette.deepBlue}
                name="location-outline"
                size={16}
              />
              <Text style={styles.infoText}>{item.address}</Text>
            </View>

            {item.phone ? (
              <View style={styles.infoRow}>
                <Ionicons
                  color={palette.deepBlue}
                  name="call-outline"
                  size={15}
                />
                <Text style={styles.infoMuted}>{item.phone}</Text>
              </View>
            ) : null}

            {item.openingHours ? (
              <View style={styles.infoRow}>
                <Ionicons
                  color={palette.deepBlue}
                  name="time-outline"
                  size={15}
                />
                <Text style={styles.infoMuted}>{item.openingHours}</Text>
              </View>
            ) : null}

            <View style={styles.cardFooter}>
              <Text style={styles.coordinates}>
                {formatCoordinates(item.latitude, item.longitude)}
              </Text>

              <View style={styles.openButton}>
                <Text style={styles.openButtonText}>Ver detalles</Text>
                <Ionicons
                  color={palette.deepBlue}
                  name="chevron-forward"
                  size={16}
                />
              </View>
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}

export function BranchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { branch, isLoading } = useBranch(id);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={palette.deepBlue} size="large" />
      </View>
    );
  }

  if (!branch) {
    return (
      <View style={styles.content}>
        <Hero
          icon="storefront-outline"
          subtitle="No pudimos encontrar la ubicación solicitada."
          title="Sucursal"
        />

        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Sucursal no encontrada</Text>
          <Text style={styles.emptyText}>
            No pudimos encontrar esta sucursal activa.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Hero
        icon="storefront-outline"
        subtitle="Información y ubicación de tu sucursal."
        title={branch.name}
      />

      <View style={styles.detailSection}>
        <View style={styles.detailCard}>
          <View style={styles.detailMainIcon}>
            <Ionicons
              color={palette.deepBlue}
              name="location-outline"
              size={29}
            />
          </View>

          <Text style={styles.detailTitle}>Información de la sucursal</Text>

          <View style={styles.detailInfoRow}>
            <Ionicons
              color={palette.deepBlue}
              name="location-outline"
              size={19}
            />
            <View style={styles.detailInfoBody}>
              <Text style={styles.detailLabel}>Dirección</Text>
              <Text style={styles.detailValue}>{branch.address}</Text>
            </View>
          </View>

          {branch.phone ? (
            <View style={styles.detailInfoRow}>
              <Ionicons
                color={palette.deepBlue}
                name="call-outline"
                size={19}
              />
              <View style={styles.detailInfoBody}>
                <Text style={styles.detailLabel}>Teléfono</Text>
                <Text style={styles.detailValue}>{branch.phone}</Text>
              </View>
            </View>
          ) : null}

          {branch.openingHours ? (
            <View style={styles.detailInfoRow}>
              <Ionicons
                color={palette.deepBlue}
                name="time-outline"
                size={19}
              />
              <View style={styles.detailInfoBody}>
                <Text style={styles.detailLabel}>Horario</Text>
                <Text style={styles.detailValue}>{branch.openingHours}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.detailInfoRow}>
            <Ionicons
              color={palette.deepBlue}
              name="navigate-outline"
              size={19}
            />
            <View style={styles.detailInfoBody}>
              <Text style={styles.detailLabel}>Coordenadas</Text>
              <Text style={styles.detailValue}>
                {formatCoordinates(branch.latitude, branch.longitude)}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => void openBranchDirections(branch)}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons color={palette.white} name="navigate" size={19} />
            <Text style={styles.primaryText}>Cómo llegar</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function formatCoordinates(latitude?: number, longitude?: number): string {
  if (latitude === undefined || longitude === undefined) {
    return "Coordenadas no disponibles";
  }

  return `${latitude}, ${longitude}`;
}

const styles = StyleSheet.create({
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

  branchBody: {
    flex: 1,
  },

  branchCard: {
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
    marginBottom: 12,
    marginHorizontal: 18,
    padding: 15,
  },

  branchIcon: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 15,
    height: 50,
    justifyContent: "center",
    width: 50,
  },

  branchName: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 9,
  },

  cardFooter: {
    alignItems: "center",
    borderTopColor: "#EEF0F4",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 11,
    paddingTop: 10,
  },

  content: {
    backgroundColor: palette.vanillaMilk,
    flexGrow: 1,
    paddingBottom: 34,
  },

  coordinates: {
    color: palette.muted,
    flex: 1,
    fontSize: 9,
  },

  detailCard: {
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },

  detailInfoBody: {
    flex: 1,
  },

  detailInfoRow: {
    alignItems: "flex-start",
    borderTopColor: "#EEF0F4",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingVertical: 13,
  },

  detailLabel: {
    color: palette.muted,
    fontSize: 9,
    fontWeight: "800",
    marginBottom: 3,
    textTransform: "uppercase",
  },

  detailMainIcon: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 18,
    height: 58,
    justifyContent: "center",
    width: 58,
  },

  detailSection: {
    padding: 18,
  },

  detailTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 16,
    marginTop: 13,
  },

  detailValue: {
    color: palette.text,
    fontSize: 12,
    lineHeight: 18,
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
    textAlign: "center",
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

  infoMuted: {
    color: palette.muted,
    flex: 1,
    fontSize: 11,
  },

  infoRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 7,
    marginTop: 5,
  },

  infoText: {
    color: palette.text,
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },

  loading: {
    alignItems: "center",
    backgroundColor: palette.vanillaMilk,
    flex: 1,
    justifyContent: "center",
  },

  openButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
  },

  openButtonText: {
    color: palette.deepBlue,
    fontSize: 9,
    fontWeight: "900",
  },

  pressed: {
    opacity: 0.76,
  },

  primaryButton: {
    alignItems: "center",
    backgroundColor: palette.deepBlue,
    borderRadius: 13,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: 7,
    minHeight: 48,
  },

  primaryText: {
    color: palette.white,
    fontSize: 11,
    fontWeight: "900",
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 15,
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
    fontSize: 18,
    fontWeight: "900",
  },
});
