import { Link, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSession } from "@/modules/auth";
import {
  GUATEMALA_DEPARTMENTS,
  getGuatemalaMunicipalities,
  matchLocationName,
} from "@/config";
import { getErrorMessage, isApiMode, useRepositories } from "@/infrastructure";
import { OptionPicker } from "@/shared";
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

            <Text numberOfLines={1} style={accountStyles.profileEmail}>
              {customer?.email ?? "Sin correo"}
            </Text>

            <View style={accountStyles.memberBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#3E668F" />
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
            <Text style={accountStyles.cardTitle}>Datos personales</Text>
          </View>

          <View style={accountStyles.cardHeaderIcon}>
            <Ionicons name="person-outline" size={20} color="#3E668F" />
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
        <Ionicons name="log-out-outline" size={20} color="#B94343" />

        <Text style={accountStyles.logoutButtonText}>Cerrar sesión</Text>
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

function AccountSection({ children, title }: AccountSectionProps) {
  return (
    <View style={accountStyles.section}>
      <Text style={accountStyles.sectionHeading}>{title}</Text>

      <View style={accountStyles.menuCard}>{children}</View>
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
        style={[accountStyles.menuIcon, { backgroundColor: iconBackground }]}
      >
        <Ionicons name={icon} size={22} color="#3E668F" />
      </View>

      <View style={accountStyles.menuText}>
        <Text style={accountStyles.menuLabel}>{label}</Text>

        <Text numberOfLines={1} style={accountStyles.menuDescription}>
          {description}
        </Text>
      </View>

      <View style={accountStyles.chevronCircle}>
        <Ionicons name="chevron-forward" size={17} color="#3E668F" />
      </View>
    </Pressable>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase()).join("") || "C";
}

export function AddressesScreen() {
  const { addressRepository } = useRepositories();
  const { session } = useSession();
  const [addresses, setAddresses] = useState<
    Awaited<ReturnType<typeof addressRepository.getByCustomer>>
  >([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) {
      return;
    }

    try {
      setAddresses(
        await addressRepository.getByCustomer(
          session.tenantId,
          session.customerId,
        ),
      );
      setError(null);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "No se pudieron cargar las direcciones."));
    }
  }, [addressRepository, session]);

  async function runAction(action: () => Promise<unknown>) {
    try {
      await action();
      await load();
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={addresses}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <View style={styles.addressHero}><Text style={styles.addressEyebrow}>MI CUENTA</Text><View style={styles.addressTitleRow}><View><Text style={styles.addressTitle}>Mis direcciones</Text><Text style={styles.addressSubtitle}>Guarda lugares para tus próximas entregas.</Text></View><View style={styles.addressHeroIcon}><Ionicons color={accountPalette.deepBlue} name="location-outline" size={24} /></View></View><Link asChild href="/(protected)/addresses/new"><Pressable style={styles.addressAddButton}><Ionicons color={accountPalette.white} name="add" size={18} /><Text style={styles.addressAddText}>Nueva dirección</Text></Pressable></Link></View>
          {error ? <Text style={styles.remove}>{error}</Text> : null}
        </>
      }
      ListEmptyComponent={<View style={styles.addressEmpty}><View style={styles.addressEmptyIcon}><Ionicons color={accountPalette.deepBlue} name="location-outline" size={29} /></View><Text style={styles.addressEmptyTitle}>Aún no tienes direcciones guardadas</Text><Text style={styles.addressEmptyText}>Agrega una dirección para reutilizarla en tus próximas compras.</Text><Link asChild href="/(protected)/addresses/new"><Pressable style={styles.addressPrimaryButton}><Text style={styles.addressAddText}>Agregar dirección</Text></Pressable></Link></View>}
      renderItem={({ item }) => (
        <View style={styles.addressPanel}>
          <Text style={styles.value}>{item.label}</Text>
          {item.isDefault ? <View style={styles.defaultAddressBadge}><Ionicons color={accountPalette.success} name="checkmark-circle" size={14} /><Text style={styles.defaultAddressBadgeText}>Predeterminada</Text></View> : null}
          <Text style={styles.label}>
            {[item.addressLine, item.addressLine2].filter(Boolean).join(", ")}
          </Text>
          <Text style={styles.label}>
            {item.municipality} {item.department}
          </Text>
          <View style={styles.addressActions}>
            {!item.isDefault ? <Pressable onPress={() => void runAction(() => addressRepository.setDefault(item.customerId, item.id))}><Text style={styles.linkText}>Predeterminada</Text></Pressable> : null}
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(protected)/addresses/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.linkText}>Editar</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                void runAction(() => addressRepository.archive(item.id))
              }
            >
              <Text style={styles.remove}>Eliminar</Text>
            </Pressable>
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
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    if (!customer || isSaving) {
      return;
    }

    if (!name.trim()) {
      setError("El nombre es requerido.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsSaving(true);
    try {
      await customerRepository.updateProfile(customer.id, {
        name: name.trim(),
        phone: phone.trim(),
      });

      await refreshSession();
      setMessage("Perfil actualizado correctamente.");
    } catch (saveError) {
      setError(getErrorMessage(saveError, "No se pudo actualizar el perfil."));
    } finally {
      setIsSaving(false);
    }
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
          maxLength={8}
          onChangeText={(value) => setPhone(value.replace(/\D/g, ""))}
          placeholder="Agregar teléfono (8 dígitos)"
          placeholderTextColor="#7A8798"
          style={accountStyles.input}
          value={phone}
        />
      </View>

      <Pressable
        disabled={isSaving}
        onPress={save}
        style={({ pressed }) => [
          accountStyles.saveButton,
          pressed || isSaving ? accountStyles.pressed : null,
        ]}
      >
        <Text style={accountStyles.saveButtonText}>
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Text>
      </Pressable>

      {error ? (
        <Text style={accountStyles.errorText}>{error}</Text>
      ) : null}

      {message ? (
        <View style={accountStyles.successBox}>
          <Text style={accountStyles.successText}>{message}</Text>
        </View>
      ) : null}
    </View>
  );
}

function AddressForm({
  addressId,
  mode,
}: {
  addressId?: string;
  mode: "create" | "edit";
}) {
  const { addressRepository } = useRepositories();
  const { customer, session } = useSession();
  const [label, setLabel] = useState("");
  const [recipientName, setRecipientName] = useState(customer?.name ?? "");
  const [addressLine, setAddressLine] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [department, setDepartment] = useState("");
  const [references, setReferences] = useState("");
  const [phone, setPhone] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiMode = isApiMode();

  useEffect(() => {
    async function load() {
      try {
        if (mode === "edit" && addressId) {
          const address = await addressRepository.getById(addressId);
          if (address) {
            const nextDepartment = matchLocationName(
              address.department,
              GUATEMALA_DEPARTMENTS,
            );

            setLabel(address.label);
            setRecipientName(address.recipientName ?? customer?.name ?? "");
            setAddressLine(address.addressLine);
            setAddressLine2(address.addressLine2 ?? "");
            setDepartment(nextDepartment || (address.department ?? ""));
            setMunicipality(
              matchLocationName(
                address.municipality,
                getGuatemalaMunicipalities(nextDepartment),
              ) || (address.municipality ?? ""),
            );
            setReferences(address.references ?? "");
            setPhone(address.phone ?? "");
            setIsDefault(address.isDefault);
          }
        }
      } catch (loadError) {
        setError(getErrorMessage(loadError, "No se pudo cargar la dirección."));
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [addressId, addressRepository, customer?.name, mode]);

  function selectDepartment(value: string) {
    setDepartment(value);
    if (!getGuatemalaMunicipalities(value).includes(municipality)) {
      setMunicipality("");
    }
  }

  async function save() {
    if (!session || isSaving) {
      return;
    }
    if (!label.trim() || !addressLine.trim()) {
      setError("El nombre y la dirección son requeridos.");
      return;
    }
    if (apiMode && (!department || !municipality)) {
      setError("Selecciona el departamento y el municipio.");
      return;
    }

    const input = {
      label: label.trim(),
      recipientName: recipientName.trim() || undefined,
      addressLine: addressLine.trim(),
      addressLine2: addressLine2.trim() || undefined,
      municipality: municipality.trim() || undefined,
      department: department.trim() || undefined,
      references: references.trim() || undefined,
      phone: phone.trim() || undefined,
      isDefault,
    };

    setError(null);
    setIsSaving(true);
    try {
      if (mode === "create") {
        await addressRepository.create({
          ...input,
          tenantId: session.tenantId,
          customerId: session.customerId,
        });
      } else if (addressId) {
        await addressRepository.update(addressId, input);
        if (isDefault) {
          await addressRepository.setDefault(session.customerId, addressId);
        }
      }
      router.replace("/(protected)/addresses");
    } catch (saveError) {
      setError(getErrorMessage(saveError, "No se pudo guardar la dirección."));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={styles.loading} />;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formAddressHero}><Text style={styles.addressEyebrow}>FERREPHARMA</Text><Text style={styles.formAddressTitle}>
        {mode === "create" ? "Nueva direccion" : "Editar direccion"}
      </Text><Text style={styles.formAddressSubtitle}>Completa los datos para usar esta dirección en tus pedidos.</Text></View><View style={styles.addressFormCard}>
      {error ? <Text style={styles.remove}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        value={label}
        onChangeText={setLabel}
        maxLength={35}
        placeholder="Nombre: Casa, Trabajo..."
      />
      <TextInput
        style={styles.input}
        value={recipientName}
        onChangeText={setRecipientName}
        maxLength={60}
        placeholder="Destinatario"
      />
      <TextInput
        style={styles.input}
        value={addressLine}
        onChangeText={setAddressLine}
        placeholder="Direccion"
      />
      <TextInput
        style={styles.input}
        value={addressLine2}
        onChangeText={setAddressLine2}
        placeholder="Complemento (opcional)"
      />
      {apiMode ? (
        <>
          <OptionPicker
            label="Departamento"
            onChange={selectDepartment}
            options={GUATEMALA_DEPARTMENTS}
            value={department}
          />
          <OptionPicker
            emptyText="Selecciona primero un departamento."
            label="Municipio"
            onChange={setMunicipality}
            options={getGuatemalaMunicipalities(department)}
            value={municipality}
          />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            value={municipality}
            onChangeText={setMunicipality}
            placeholder="Municipio"
          />
          <TextInput
            style={styles.input}
            value={department}
            onChangeText={setDepartment}
            placeholder="Departamento"
          />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Telefono"
          />
        </>
      )}
      <TextInput
        style={styles.input}
        value={references}
        onChangeText={setReferences}
        placeholder="Referencias (opcional)"
      />
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isDefault }}
        onPress={() => setIsDefault((previous) => !previous)}
        style={[styles.defaultAddressToggle, isDefault ? styles.defaultAddressToggleActive : null]}
      >
        <Ionicons color={isDefault ? accountPalette.success : accountPalette.deepBlue} name={isDefault ? "checkmark-circle" : "ellipse-outline"} size={20} />
        <Text style={[styles.defaultAddressToggleText, isDefault ? styles.defaultAddressToggleTextActive : null]}>{isDefault ? "Dirección predeterminada" : "Usar como dirección predeterminada"}</Text>
      </Pressable>
      <Pressable disabled={isSaving} onPress={save} style={styles.addressSaveButton}>
        <Text style={styles.buttonText}>{isSaving ? "Guardando..." : "Guardar"}</Text>
      </Pressable>
      </View></ScrollView>
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

  errorText: {
    color: accountPalette.danger,
    fontSize: 12,
    fontWeight: "700",
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
  addressHero: { backgroundColor: accountPalette.deepBlue, borderBottomLeftRadius: 26, borderBottomRightRadius: 26, marginBottom: 16, padding: 20, paddingTop: 42 },
  addressEyebrow: { color: accountPalette.butterHoney, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  addressTitleRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  addressTitle: { color: accountPalette.white, fontSize: 26, fontWeight: "900" },
  addressSubtitle: { color: "#EAF1F8", fontSize: 12, marginTop: 6, maxWidth: 240 },
  addressHeroIcon: { alignItems: "center", backgroundColor: accountPalette.white, borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  addressAddButton: { alignItems: "center", alignSelf: "flex-start", backgroundColor: accountPalette.butterHoney, borderRadius: 13, flexDirection: "row", gap: 5, marginTop: 16, minHeight: 44, paddingHorizontal: 14 },
  addressAddText: { color: accountPalette.deepBlue, fontSize: 12, fontWeight: "900" },
  addressEmpty: { alignItems: "center", backgroundColor: accountPalette.white, borderColor: accountPalette.silkyLilac, borderRadius: 20, borderWidth: 1, margin: 16, padding: 25 },
  addressEmptyIcon: { alignItems: "center", backgroundColor: "#EEF3FB", borderRadius: 27, height: 54, justifyContent: "center", width: 54 },
  addressEmptyTitle: { color: accountPalette.text, fontSize: 17, fontWeight: "900", marginTop: 14, textAlign: "center" }, addressEmptyText: { color: accountPalette.muted, fontSize: 12, lineHeight: 18, marginTop: 6, textAlign: "center" }, addressPrimaryButton: { backgroundColor: accountPalette.deepBlue, borderRadius: 13, marginTop: 17, minHeight: 45, justifyContent: "center", paddingHorizontal: 15 },
  addressPanel: { backgroundColor: accountPalette.white, borderColor: accountPalette.silkyLilac, borderRadius: 18, borderWidth: 1, gap: spacing.sm, marginHorizontal: spacing.md, marginBottom: spacing.sm, padding: spacing.md }, addressActions: { flexDirection: "row", gap: spacing.md },
  defaultAddressBadge: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#EAF7EF", borderRadius: 10, flexDirection: "row", gap: 4, paddingHorizontal: 8, paddingVertical: 5 }, defaultAddressBadgeText: { color: accountPalette.success, fontSize: 10, fontWeight: "900" }, defaultAddressToggle: { alignItems: "center", backgroundColor: "#EEF3FB", borderColor: accountPalette.silkyLilac, borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: spacing.sm, minHeight: 48, paddingHorizontal: 12 }, defaultAddressToggleActive: { backgroundColor: "#EAF7EF", borderColor: "#B8DDC9" }, defaultAddressToggleText: { color: accountPalette.deepBlue, fontSize: 12, fontWeight: "800" }, defaultAddressToggleTextActive: { color: accountPalette.success },
  formAddressHero: { backgroundColor: accountPalette.deepBlue, borderBottomLeftRadius: 26, borderBottomRightRadius: 26, marginHorizontal: -spacing.lg, marginTop: -spacing.lg, padding: 20, paddingTop: 42 }, formAddressTitle: { color: accountPalette.white, fontSize: 25, fontWeight: "900", marginTop: 4 }, formAddressSubtitle: { color: "#EAF1F8", fontSize: 12, marginTop: 7 }, addressFormCard: { backgroundColor: accountPalette.white, borderColor: accountPalette.silkyLilac, borderRadius: 20, borderWidth: 1, gap: spacing.sm, marginTop: -12, padding: spacing.md }, addressSaveButton: { alignItems: "center", backgroundColor: accountPalette.deepBlue, borderRadius: 13, justifyContent: "center", minHeight: 48, marginTop: spacing.sm },
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
    flexGrow: 1,
    gap: spacing.sm,
    paddingBottom: 42,
    padding: spacing.lg,
  },
  input: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    minHeight: 44,
    paddingHorizontal: spacing.md,
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
  linkText: { color: colors.primary },
  loading: { flex: 1 },
  panel: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  remove: { color: colors.danger },
  row: { flexDirection: "row", gap: spacing.md },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "700",
  },
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
