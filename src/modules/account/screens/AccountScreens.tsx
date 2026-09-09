import { Link, router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PlaceholderScreen } from "@/shared";
import { useSession } from "@/modules/auth";
import { colors, radius, spacing, typography } from "@/theme";

export function AccountScreen() {
  const { customer, logout } = useSession();

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cuenta</Text>
      <Text style={styles.label}>Nombre</Text>
      <Text style={styles.value}>{customer?.name ?? "Cliente"}</Text>
      <Text style={styles.label}>Correo</Text>
      <Text style={styles.value}>{customer?.email ?? "Sin correo"}</Text>
      {customer?.phone ? (
        <>
          <Text style={styles.label}>Telefono</Text>
          <Text style={styles.value}>{customer.phone}</Text>
        </>
      ) : null}
      <Link href="/(protected)/account/security" style={styles.link}>
        Cambiar contrasena
      </Link>
      <Pressable onPress={handleLogout} style={styles.button}>
        <Text style={styles.buttonText}>Cerrar sesion</Text>
      </Pressable>
    </View>
  );
}

export function AddressesScreen() {
  return <PlaceholderScreen title="Direcciones" description="Pantalla futura de direcciones del cliente." />;
}

export function NewAddressScreen() {
  return <PlaceholderScreen title="Nueva direccion" description="Formulario futuro de direccion." />;
}

export function AddressDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <PlaceholderScreen title="Editar direccion" description={`Direccion futura ${id ?? "seleccionada"}.`} />;
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    minHeight: 48,
    justifyContent: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  buttonText: {
    color: colors.surface,
    fontSize: typography.body,
    fontWeight: "700",
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    padding: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  link: {
    color: colors.primary,
    fontSize: typography.body,
    marginTop: spacing.md,
    textAlign: "center",
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  value: {
    color: colors.text,
    fontSize: typography.body,
    marginBottom: spacing.sm,
  },
});
