import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme";

import { openBranchDirections } from "../application/branchLinks";
import { useBranch, useBranches } from "../hooks/useBranches";

export function BranchesScreen() {
  const { branches, isLoading } = useBranches();

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={branches}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={<Text style={styles.title}>Sucursales</Text>}
      ListEmptyComponent={<Text style={styles.muted}>No hay sucursales activas.</Text>}
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push(`/(protected)/branches/${item.id}` as never)} style={styles.panel}>
          <Text style={styles.name}>{item.name}</Text>
          <Text>{item.address}</Text>
          {item.phone ? <Text style={styles.muted}>{item.phone}</Text> : null}
          {item.openingHours ? <Text style={styles.muted}>{item.openingHours}</Text> : null}
          <Text style={styles.muted}>{formatCoordinates(item.latitude, item.longitude)}</Text>
        </Pressable>
      )}
    />
  );
}

export function BranchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { branch, isLoading } = useBranch(id);

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }

  if (!branch) {
    return (
      <View style={styles.content}>
        <Text style={styles.title}>Sucursal no encontrada</Text>
        <Text style={styles.muted}>No pudimos encontrar esta sucursal activa.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.panel}>
        <Text style={styles.title}>{branch.name}</Text>
        <Text>{branch.address}</Text>
        {branch.phone ? <Text style={styles.muted}>{branch.phone}</Text> : null}
        {branch.openingHours ? <Text style={styles.muted}>{branch.openingHours}</Text> : null}
        <Text style={styles.muted}>{formatCoordinates(branch.latitude, branch.longitude)}</Text>
        <Pressable onPress={() => void openBranchDirections(branch)} style={styles.primaryButton}>
          <Text style={styles.primaryText}>Como llegar</Text>
        </Pressable>
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
  content: { backgroundColor: colors.background, gap: spacing.md, padding: spacing.md },
  loading: { flex: 1 },
  muted: { color: colors.textMuted },
  name: { color: colors.text, fontWeight: "700" },
  panel: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.sm, padding: spacing.md },
  primaryButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 8, minHeight: 44, justifyContent: "center", marginTop: spacing.sm },
  primaryText: { color: colors.surface, fontWeight: "700" },
  title: { color: colors.text, fontSize: typography.title, fontWeight: "700" },
});
