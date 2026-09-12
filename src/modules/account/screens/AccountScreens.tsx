import { Link, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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

  const initials = getInitials(customer?.name ?? "Cliente");

  return (
    <ScrollView
      contentContainerStyle={accountStyles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={accountStyles.hero}>
        <View style={accountStyles.heroCircleLarge} />
        <View style={accountStyles.heroCircleSmall} />

        <View style={accountStyles.brandRow}>
          <View>
            <Text style={accountStyles.brandLabel}>FERREPHARMA</Text>
            <Text style={accountStyles.heroTitle}>Mi cuenta</Text>
          </View>

          <View style={accountStyles.headerIcon}>
            <Ionicons name="settings-outline" size={22} color="#3E668F" />
          </View>
        </View>

        <View style={accountStyles.profileRow}>
          <View style={accountStyles.avatar}>
            <Text style={accountStyles.avatarText}>{initials}</Text>
          </View>

          <View style={accountStyles.profileInfo}>
            <Text style={accountStyles.profileName}>
              {customer?.name ?? "Cliente"}
            </Text>

            <Text
              numberOfLines={1}
              style={accountStyles.profileEmail}
            >
              {customer?.email ?? "Sin correo"}
            </Text>

            <View style={accountStyles.memberBadge}>
              <Ionicons
                name="checkmark-circle"
                size={13}
                color="#3E668F"
              />
              <Text style={accountStyles.memberBadgeText}>
                Cliente FerrePharma
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={accountStyles.profileCard}>
        <View style={accountStyles.cardHeaderRow}>
          <View>
            <Text style={accountStyles.miniLabel}>PERFIL</Text>
            <Text style={accountStyles.cardTitle}>
              Datos personales
            </Text>
          </View>

          <View style={accountStyles.cardHeaderIcon}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#3E668F"
            />
          </View>
        </View>

        <Text style={accountStyles.cardDescription}>
          Mantén tus datos actualizados para facilitar tus compras y entregas.
        </Text>

        <ProfileEditor />
      </View>

      <AccountSection title="Compras">
        <AccountMenuItem
          icon="bag-handle-outline"
          iconBackground="#E9F1FF"
          label="Mis pedidos"
          description="Consulta compras y seguimiento"
          route="/(protected)/(tabs)/orders"
        />

        <AccountMenuItem
          icon="heart-outline"
          iconBackground="#FFF1F4"
          label="Mis favoritos"
          description="Productos que guardaste"
          route="/(protected)/favorites"
          isLast
        />
      </AccountSection>

      <AccountSection title="Cuenta y seguridad">
        <AccountMenuItem
          icon="shield-checkmark-outline"
          iconBackground="#EEF1FF"
          label="Seguridad"
          description="Contraseña y protección"
          route="/(protected)/account/security"
        />

        <AccountMenuItem
          icon="location-outline"
          iconBackground="#FFF5DA"
          label="Mis direcciones"
          description="Administra lugares de entrega"
          route="/(protected)/addresses"
        />

        <AccountMenuItem
          icon="card-outline"
          iconBackground="#EAF7F3"
          label="Métodos de pago"
          description="Administra tus tarjetas"
          route="/(protected)/account/payment-methods"
          isLast
        />
      </AccountSection>

      <AccountSection title="Preferencias y ayuda">
        <AccountMenuItem
          icon="notifications-outline"
          iconBackground="#FFF5DA"
          label="Notificaciones"
          description="Avisos y novedades"
          route="/(protected)/notifications"
        />

        <AccountMenuItem
          icon="storefront-outline"
          iconBackground="#EAF1FF"
          label="Sucursales"
          description="Encuentra una tienda cercana"
          route="/(protected)/branches"
        />

        <AccountMenuItem
          icon="help-circle-outline"
          iconBackground="#F1EDFF"
          label="Soporte"
          description="Ayuda y atención al cliente"
          route="/(protected)/support"
          isLast
        />
      </AccountSection>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          accountStyles.logoutButton,
          pressed ? accountStyles.pressed : null,
        ]}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color="#B94343"
        />

        <Text style={accountStyles.logoutButtonText}>
          Cerrar sesión
        </Text>
      </Pressable>

      <Text style={accountStyles.footer}>
        FerrePharma · Ferretería & Farmacia
      </Text>
    </ScrollView>
  );
}

type AccountSectionProps = {
  children: React.ReactNode;
  title: string;
};

function AccountSection({
  children,
  title,
}: AccountSectionProps) {
  return (
    <View style={accountStyles.section}>
      <Text style={accountStyles.sectionHeading}>{title}</Text>

      <View style={accountStyles.menuCard}>
        {children}
      </View>
    </View>
  );
}

type AccountMenuItemProps = {
  description: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconBackground: string;
  isLast?: boolean;
  label: string;
  route: string;
};

function AccountMenuItem({
  description,
  icon,
  iconBackground,
  isLast,
  label,
  route,
}: AccountMenuItemProps) {
  return (
    <Pressable
      onPress={() => router.push(route as never)}
      style={({ pressed }) => [
        accountStyles.menuItem,
        !isLast ? accountStyles.menuItemBorder : null,
        pressed ? accountStyles.menuItemPressed : null,
      ]}
    >
      <View
        style={[
          accountStyles.menuIcon,
          { backgroundColor: iconBackground },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color="#3E668F"
        />
      </View>

      <View style={accountStyles.menuText}>
        <Text style={accountStyles.menuLabel}>
          {label}
        </Text>

        <Text
          numberOfLines={1}
          style={accountStyles.menuDescription}
        >
          {description}
        </Text>
      </View>

      <View style={accountStyles.chevronCircle}>
        <Ionicons
          name="chevron-forward"
          size={17}
          color="#3E668F"
        />
      </View>
    </Pressable>
  );
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts
    .map((part) => part[0]?.toUpperCase())
    .join("") || "C";
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

    await customerRepository.updateProfile(customer.id, {
      name: name.trim(),
      phone: phone.trim() || undefined,
    });

    await refreshSession();
    setMessage("Perfil actualizado correctamente.");
  }

  return (
    <View style={accountStyles.editor}>
      <View style={accountStyles.field}>
        <Text style={accountStyles.fieldLabel}>Correo electrónico</Text>

        <View style={accountStyles.readonlyInput}>
          <Text style={accountStyles.readonlyText}>
            {customer?.email ?? "Sin correo"}
          </Text>
        </View>
      </View>

      <View style={accountStyles.field}>
        <Text style={accountStyles.fieldLabel}>Nombre</Text>

        <TextInput
          onChangeText={setName}
          placeholder="Tu nombre"
          placeholderTextColor="#7A8798"
          style={accountStyles.input}
          value={name}
        />
      </View>

      <View style={accountStyles.field}>
        <Text style={accountStyles.fieldLabel}>Teléfono</Text>

        <TextInput
          keyboardType="phone-pad"
          onChangeText={setPhone}
          placeholder="Agregar teléfono"
          placeholderTextColor="#7A8798"
          style={accountStyles.input}
          value={phone}
        />
      </View>

      <Pressable
        onPress={save}
        style={({ pressed }) => [
          accountStyles.saveButton,
          pressed ? accountStyles.pressed : null,
        ]}
      >
        <Text style={accountStyles.saveButtonText}>
          Guardar cambios
        </Text>
      </Pressable>

      {message ? (
        <View style={accountStyles.successBox}>
          <Text style={accountStyles.successText}>{message}</Text>
        </View>
      ) : null}
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

const accountPalette = {
  deepBlue: "#3E668F",
  dreamyBlue: "#81A9EE",
  silkyLilac: "#AAB4E7",
  butterHoney: "#FFDB83",
  vanillaMilk: "#FFF2D0",
  white: "#FFFFFF",
  text: "#172033",
  muted: "#687286",
  border: "#DDE3EE",
  danger: "#B94343",
  success: "#247A52",
};

const accountStyles = StyleSheet.create({
  container: {
    backgroundColor: accountPalette.vanillaMilk,
    flexGrow: 1,
    paddingBottom: 38,
  },

  hero: {
    backgroundColor: accountPalette.deepBlue,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    minHeight: 220,
    overflow: "hidden",
    paddingBottom: 28,
    paddingHorizontal: 22,
    paddingTop: 44,
  },

  heroCircleLarge: {
    backgroundColor: accountPalette.dreamyBlue,
    borderRadius: 100,
    height: 180,
    opacity: 0.18,
    position: "absolute",
    right: -55,
    top: -60,
    width: 180,
  },

  heroCircleSmall: {
    backgroundColor: accountPalette.butterHoney,
    borderRadius: 55,
    bottom: -42,
    height: 105,
    opacity: 0.2,
    position: "absolute",
    right: 55,
    width: 105,
  },

  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  brandLabel: {
    color: accountPalette.butterHoney,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.7,
  },

  heroTitle: {
    color: accountPalette.white,
    fontSize: 29,
    fontWeight: "900",
    marginTop: 2,
  },

  headerIcon: {
    alignItems: "center",
    backgroundColor: accountPalette.white,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  profileRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 28,
  },

  avatar: {
    alignItems: "center",
    backgroundColor: accountPalette.butterHoney,
    borderColor: accountPalette.white,
    borderRadius: 36,
    borderWidth: 3,
    height: 72,
    justifyContent: "center",
    marginRight: 15,
    width: 72,
  },

  avatarText: {
    color: accountPalette.deepBlue,
    fontSize: 23,
    fontWeight: "900",
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    color: accountPalette.white,
    fontSize: 20,
    fontWeight: "900",
  },

  profileEmail: {
    color: "#EDF4FC",
    fontSize: 13,
    marginTop: 3,
  },

  memberBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: accountPalette.butterHoney,
    borderRadius: 20,
    flexDirection: "row",
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  memberBadgeText: {
    color: accountPalette.deepBlue,
    fontSize: 11,
    fontWeight: "800",
  },

  profileCard: {
    backgroundColor: accountPalette.white,
    borderColor: accountPalette.silkyLilac,
    borderRadius: 22,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 18,
    padding: 18,
    shadowColor: "#172033",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  cardHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  miniLabel: {
    color: accountPalette.dreamyBlue,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  cardTitle: {
    color: accountPalette.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 2,
  },

  cardHeaderIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3FB",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  cardDescription: {
    color: accountPalette.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 15,
    marginTop: 7,
  },

  editor: {
    gap: 12,
  },

  field: {
    gap: 5,
  },

  fieldLabel: {
    color: accountPalette.deepBlue,
    fontSize: 12,
    fontWeight: "800",
  },

  input: {
    backgroundColor: "#FAFBFD",
    borderColor: accountPalette.border,
    borderRadius: 12,
    borderWidth: 1,
    color: accountPalette.text,
    fontSize: 14,
    minHeight: 47,
    paddingHorizontal: 14,
  },

  readonlyInput: {
    backgroundColor: "#F1F4F8",
    borderColor: accountPalette.border,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 47,
    paddingHorizontal: 14,
  },

  readonlyText: {
    color: accountPalette.muted,
    fontSize: 14,
  },

  saveButton: {
    alignItems: "center",
    backgroundColor: accountPalette.deepBlue,
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 3,
    minHeight: 48,
  },

  saveButtonText: {
    color: accountPalette.white,
    fontSize: 14,
    fontWeight: "900",
  },

  successBox: {
    backgroundColor: "#EAF7F0",
    borderColor: "#B8DDC9",
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },

  successText: {
    color: accountPalette.success,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  section: {
    marginHorizontal: 16,
    marginTop: 23,
  },

  sectionHeading: {
    color: accountPalette.deepBlue,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 9,
    paddingHorizontal: 3,
  },

  menuCard: {
    backgroundColor: accountPalette.white,
    borderColor: accountPalette.silkyLilac,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#172033",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  menuItem: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 70,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  menuItemBorder: {
    borderBottomColor: "#E8ECF2",
    borderBottomWidth: 1,
  },

  menuItemPressed: {
    backgroundColor: "#F7F9FC",
  },

  menuIcon: {
    alignItems: "center",
    borderRadius: 13,
    height: 44,
    justifyContent: "center",
    marginRight: 12,
    width: 44,
  },

  menuText: {
    flex: 1,
    justifyContent: "center",
  },

  menuLabel: {
    color: accountPalette.text,
    fontSize: 15,
    fontWeight: "800",
  },

  menuDescription: {
    color: accountPalette.muted,
    fontSize: 12,
    marginTop: 3,
  },

  chevronCircle: {
    alignItems: "center",
    backgroundColor: "#F1F5FB",
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    marginLeft: 8,
    width: 30,
  },

  logoutButton: {
    alignItems: "center",
    backgroundColor: accountPalette.white,
    borderColor: "#E9BDBD",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 26,
    minHeight: 51,
  },

  logoutButtonText: {
    color: accountPalette.danger,
    fontSize: 14,
    fontWeight: "900",
  },

  pressed: {
    opacity: 0.7,
  },

  footer: {
    color: accountPalette.deepBlue,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 20,
    opacity: 0.65,
    textAlign: "center",
  },
});

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
