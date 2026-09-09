import { Link, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useSession } from "@/modules/auth";
import { useRepositories } from "@/infrastructure";
import { colors, radius, spacing, typography } from "@/theme";

export function AccountScreen() {
  const { customer, logout } = useSession();

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
      <Link href="/(protected)/addresses" style={styles.link}>Mis direcciones</Link>
      <Link href="/(protected)/account/payment-methods" style={styles.link}>Metodos de pago</Link>
      <Link href="/(protected)/favorites" style={styles.link}>Mis favoritos</Link>
      <Link href="/(protected)/(tabs)/orders" style={styles.link}>Mis pedidos</Link>
      <Link href="/(protected)/notifications" style={styles.link}>Notificaciones</Link>
      <Link href="/(protected)/branches" style={styles.link}>Sucursales</Link>
      <Link href="/(protected)/support" style={styles.link}>Soporte</Link>
      <Pressable onPress={handleLogout} style={styles.button}>
        <Text style={styles.buttonText}>Cerrar sesion</Text>
      </Pressable>
      <ProfileEditor />
    </ScrollView>
  );
}

export function AddressesScreen() {
  const { addressRepository } = useRepositories();
  const { session } = useSession();
  const [addresses, setAddresses] = useState<Awaited<ReturnType<typeof addressRepository.getByCustomer>>>([]);

  const load = useCallback(async () => {
    if (session) {
      setAddresses(await addressRepository.getByCustomer(session.tenantId, session.customerId));
    }
  }, [addressRepository, session]);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={addresses}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={<><Text style={styles.title}>Direcciones</Text><Link href="/(protected)/addresses/new" style={styles.link}>Nueva direccion</Link></>}
      ListEmptyComponent={<Text style={styles.value}>No hay direcciones.</Text>}
      renderItem={({ item }) => (
        <View style={styles.panel}>
          <Text style={styles.value}>{item.label} {item.isDefault ? "(default)" : ""}</Text>
          <Text style={styles.label}>{item.addressLine}</Text>
          <Text style={styles.label}>{item.municipality} {item.department}</Text>
          <View style={styles.row}>
            <Pressable onPress={() => router.push({ pathname: "/(protected)/addresses/[id]", params: { id: item.id } })}><Text style={styles.linkText}>Editar</Text></Pressable>
            <Pressable onPress={async () => { await addressRepository.setDefault(item.customerId, item.id); await load(); }}><Text style={styles.linkText}>Default</Text></Pressable>
            <Pressable onPress={async () => { await addressRepository.archive(item.id); await load(); }}><Text style={styles.remove}>Eliminar</Text></Pressable>
          </View>
        </View>
      )}
    />
  );
}

export function NewAddressScreen() {
  return <AddressForm mode="create" />;
}

export function AddressDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <AddressForm addressId={id} mode="edit" />;
}

function ProfileEditor() {
  const { customer, refreshSession } = useSession();
  const { customerRepository } = useRepositories();
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    if (!customer || !name.trim()) {
      return;
    }
    await customerRepository.updateProfile(customer.id, { name: name.trim(), phone: phone.trim() || undefined });
    await refreshSession();
    setMessage("Perfil actualizado.");
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.sectionTitle}>Datos personales</Text>
      <Text style={styles.label}>Email no editable en esta rama: {customer?.email}</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nombre" />
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Telefono" />
      <Pressable onPress={save} style={styles.secondaryButton}><Text>Guardar perfil</Text></Pressable>
      {message ? <Text style={styles.success}>{message}</Text> : null}
    </View>
  );
}

function AddressForm({ addressId, mode }: { addressId?: string; mode: "create" | "edit" }) {
  const { addressRepository } = useRepositories();
  const { session } = useSession();
  const [label, setLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (mode === "edit" && addressId) {
        const address = await addressRepository.getById(addressId);
        if (address) {
          setLabel(address.label);
          setAddressLine(address.addressLine);
          setMunicipality(address.municipality ?? "");
          setDepartment(address.department ?? "");
          setPhone(address.phone ?? "");
          setIsDefault(address.isDefault);
        }
      }
      setIsLoading(false);
    }
    void load();
  }, [addressId, addressRepository, mode]);

  async function save() {
    if (!session) {
      return;
    }
    if (!label.trim() || !addressLine.trim()) {
      setError("Label y direccion son requeridos.");
      return;
    }

    const input = { label: label.trim(), addressLine: addressLine.trim(), municipality: municipality.trim() || undefined, department: department.trim() || undefined, phone: phone.trim() || undefined, isDefault };
    if (mode === "create") {
      await addressRepository.create({ ...input, tenantId: session.tenantId, customerId: session.customerId });
    } else if (addressId) {
      await addressRepository.update(addressId, input);
      if (isDefault) {
        await addressRepository.setDefault(session.customerId, addressId);
      }
    }
    router.replace("/(protected)/addresses");
  }

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{mode === "create" ? "Nueva direccion" : "Editar direccion"}</Text>
      {error ? <Text style={styles.remove}>{error}</Text> : null}
      <TextInput style={styles.input} value={label} onChangeText={setLabel} placeholder="Casa, Trabajo..." />
      <TextInput style={styles.input} value={addressLine} onChangeText={setAddressLine} placeholder="Direccion" />
      <TextInput style={styles.input} value={municipality} onChangeText={setMunicipality} placeholder="Municipio" />
      <TextInput style={styles.input} value={department} onChangeText={setDepartment} placeholder="Departamento" />
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Telefono" />
      <Pressable onPress={() => setIsDefault((value) => !value)} style={styles.secondaryButton}><Text>{isDefault ? "Default: si" : "Marcar default"}</Text></Pressable>
      <Pressable onPress={save} style={styles.button}><Text style={styles.buttonText}>Guardar</Text></Pressable>
    </ScrollView>
  );
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
    padding: spacing.lg,
  },
  input: { borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: colors.text, minHeight: 44, paddingHorizontal: spacing.md },
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
  linkText: { color: colors.primary },
  loading: { flex: 1 },
  panel: { borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, gap: spacing.sm, padding: spacing.md },
  remove: { color: colors.danger },
  row: { flexDirection: "row", gap: spacing.md },
  secondaryButton: { alignItems: "center", borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, minHeight: 44, justifyContent: "center" },
  sectionTitle: { color: colors.text, fontSize: typography.subtitle, fontWeight: "700" },
  success: { color: colors.success },
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
