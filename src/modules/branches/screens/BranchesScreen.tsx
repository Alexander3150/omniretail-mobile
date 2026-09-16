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

export function BranchesScreen() {
  const { branches, isLoading } = useBranches();

  if (isLoading) {
    return <LoadingScreen text="Buscando sucursales..." />;
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={branches}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <Hero
            subtitle="Encuentra la sucursal FERREPHARMA que más te convenga."
            title="Sucursales"
          />

          {branches.length > 0 ? (
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Nuestras ubicaciones
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Toca una sucursal para ver más información
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countText}>{branches.length}</Text>
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
              size={30}
            />
          </View>
          <Text style={styles.emptyTitle}>Sin sucursales activas</Text>
          <Text style={styles.emptyText}>
            Por el momento no encontramos sucursales disponibles.
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
              size={22}
            />
          </View>

          <View style={styles.branchBody}>
            <Text style={styles.branchName}>{item.name}</Text>

            <View style={styles.infoRow}>
              <Ionicons
                color={palette.muted}
                name="location-outline"
                size={13}
              />
              <Text style={styles.infoText}>{item.address}</Text>
            </View>

            {item.phone ? (
              <View style={styles.infoRow}>
                <Ionicons
                  color={palette.muted}
                  name="call-outline"
                  size={13}
                />
                <Text style={styles.infoText}>{item.phone}</Text>
              </View>
            ) : null}

            {item.openingHours ? (
              <View style={styles.infoRow}>
                <Ionicons
                  color={palette.muted}
                  name="time-outline"
                  size={13}
                />
                <Text style={styles.infoText}>
                  {item.openingHours}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.chevron}>
            <Ionicons
              color={palette.deepBlue}
              name="chevron-forward"
              size={18}
            />
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
    return <LoadingScreen text="Cargando sucursal..." />;
  }

  if (!branch) {
    return (
      <View style={styles.notFound}>
        <View style={styles.emptyIcon}>
          <Ionicons
            color={palette.deepBlue}
            name="location-outline"
            size={30}
          />
        </View>
        <Text style={styles.emptyTitle}>Sucursal no encontrada</Text>
        <Text style={styles.emptyText}>
          No pudimos encontrar esta sucursal activa.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.detailContent}
      showsVerticalScrollIndicator={false}
    >
      <Hero
        subtitle="Información y ubicación de tu tienda."
        title="Detalle de sucursal"
      />

      <View style={styles.detailBody}>
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={styles.largeBranchIcon}>
              <Ionicons
                color={palette.deepBlue}
                name="storefront"
                size={25}
              />
            </View>

            <View style={styles.branchBody}>
              <Text style={styles.detailName}>{branch.name}</Text>
              <View style={styles.availableBadge}>
                <View style={styles.availableDot} />
                <Text style={styles.availableText}>Sucursal activa</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Info
            icon="location-outline"
            label="Dirección"
            value={branch.address}
          />

          {branch.phone ? (
            <Info
              icon="call-outline"
              label="Teléfono"
              value={branch.phone}
            />
          ) : null}

          {branch.openingHours ? (
            <Info
              icon="time-outline"
              label="Horario"
              value={branch.openingHours}
            />
          ) : null}

          <Info
            icon="navigate-outline"
            label="Ubicación"
            value={formatCoordinates(
              branch.latitude,
              branch.longitude,
            )}
          />
        </View>

        <Pressable
          onPress={() => void openBranchDirections(branch)}
          style={({ pressed }) => [
            styles.directionsButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <View style={styles.yellowIcon}>
            <Ionicons
              color={palette.deepBlue}
              name="navigate"
              size={18}
            />
          </View>

          <Text style={styles.directionsText}>Cómo llegar</Text>

          <Ionicons
            color={palette.white}
            name="open-outline"
            size={17}
          />
        </Pressable>

        <View style={styles.mapsNote}>
          <Ionicons
            color={palette.deepBlue}
            name="map-outline"
            size={17}
          />
          <Text style={styles.mapsNoteText}>
            Abriremos la ubicación en tu aplicación de mapas para
            mostrarte la ruta.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function Hero({
  subtitle,
  title,
}: {
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.bubbleOne} />
      <View style={styles.bubbleTwo} />

      <View style={styles.heroRow}>
        <View style={styles.heroCopy}>
          <Text style={styles.brand}>FERREPHARMA</Text>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </View>

        <View style={styles.heroIcon}>
          <Ionicons
            color={palette.deepBlue}
            name="storefront-outline"
            size={22}
          />
        </View>
      </View>
    </View>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailInfo}>
      <View style={styles.infoIcon}>
        <Ionicons color={palette.deepBlue} name={icon} size={17} />
      </View>

      <View style={styles.branchBody}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
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

function formatCoordinates(
  latitude?: number,
  longitude?: number,
): string {
  if (latitude === undefined || longitude === undefined) {
    return "Coordenadas no disponibles";
  }

  return `${latitude}, ${longitude}`;
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 28,
  },
  detailContent: {
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
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 14,
    marginTop: 13,
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
  branchCard: {
    alignItems: "flex-start",
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 12,
    marginTop: 9,
    padding: 12,
  },
  branchIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 12,
    height: 43,
    justifyContent: "center",
    width: 43,
  },
  branchBody: { flex: 1 },
  branchName: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 5,
  },
  infoRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 5,
    marginTop: 3,
  },
  infoText: {
    color: palette.muted,
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
  },
  chevron: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 9,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  detailBody: {
    gap: 10,
    marginTop: -8,
    paddingHorizontal: 12,
  },
  detailCard: {
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 11,
    padding: 14,
  },
  detailHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  largeBranchIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  detailName: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900",
  },
  availableBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 4,
  },
  availableDot: {
    backgroundColor: "#247A52",
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  availableText: {
    color: "#247A52",
    fontSize: 9,
    fontWeight: "800",
  },
  divider: {
    backgroundColor: "#EEF1F5",
    height: 1,
  },
  detailInfo: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 9,
  },
  infoIcon: {
    alignItems: "center",
    backgroundColor: "#F2F5F8",
    borderRadius: 9,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  detailLabel: {
    color: palette.muted,
    fontSize: 9,
    fontWeight: "800",
  },
  detailValue: {
    color: palette.text,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  directionsButton: {
    alignItems: "center",
    backgroundColor: palette.deepBlue,
    borderRadius: 15,
    flexDirection: "row",
    gap: 9,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  yellowIcon: {
    alignItems: "center",
    backgroundColor: palette.honey,
    borderRadius: 9,
    height: 31,
    justifyContent: "center",
    width: 31,
  },
  directionsText: {
    color: palette.white,
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  mapsNote: {
    alignItems: "flex-start",
    backgroundColor: "#EEF3F8",
    borderRadius: 13,
    flexDirection: "row",
    gap: 8,
    padding: 11,
  },
  mapsNoteText: {
    color: palette.muted,
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: palette.white,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: 12,
    marginTop: 12,
    padding: 25,
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
  pressed: { opacity: 0.76 },
});
