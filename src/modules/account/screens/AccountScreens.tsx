import { router, useLocalSearchParams } from "expo-router";
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
import { useRepositories } from "@/infrastructure";

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

  const load = useCallback(async () => {
    if (session) {
      setAddresses(
        await addressRepository.getByCustomer(
          session.tenantId,
          session.customerId,
        ),
      );
    }
  }, [addressRepository, session]);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  return (
    <FlatList
      contentContainerStyle={addressStyles.container}
      data={addresses}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <View style={addressStyles.hero}>
            <View style={addressStyles.heroCircleOne} />
            <View style={addressStyles.heroCircleTwo} />

            <View style={addressStyles.heroRow}>
              <View style={addressStyles.heroText}>
                <Text style={addressStyles.brand}>FERREPHARMA</Text>
                <Text style={addressStyles.heroTitle}>Mis direcciones</Text>
                <Text style={addressStyles.heroSubtitle}>
                  Administra los lugares donde deseas recibir tus pedidos.
                </Text>
              </View>

              <View style={addressStyles.heroIcon}>
                <Ionicons
                  color={addressPalette.deepBlue}
                  name="location-outline"
                  size={22}
                />
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/(protected)/addresses/new")}
            style={({ pressed }) => [
              addressStyles.addAddressButton,
              pressed ? addressStyles.pressed : null,
            ]}
          >
            <View style={addressStyles.addAddressIcon}>
              <Ionicons
                color={addressPalette.deepBlue}
                name="add"
                size={19}
              />
            </View>

            <View style={addressStyles.addAddressText}>
              <Text style={addressStyles.addAddressTitle}>
                Agregar dirección
              </Text>
              <Text style={addressStyles.addAddressSubtitle}>
                Registra un nuevo lugar de entrega
              </Text>
            </View>

            <Ionicons
              color={addressPalette.white}
              name="chevron-forward"
              size={18}
            />
          </Pressable>

          {addresses.length > 0 ? (
            <View style={addressStyles.sectionHeading}>
              <View>
                <Text style={addressStyles.sectionTitle}>
                  Direcciones guardadas
                </Text>
                <Text style={addressStyles.sectionSubtitle}>
                  {addresses.length}{" "}
                  {addresses.length === 1 ? "dirección" : "direcciones"}
                </Text>
              </View>

              <View style={addressStyles.countBadge}>
                <Text style={addressStyles.countText}>{addresses.length}</Text>
              </View>
            </View>
          ) : null}
        </>
      }
      ListEmptyComponent={
        <View style={addressStyles.emptyCard}>
          <View style={addressStyles.emptyIcon}>
            <Ionicons
              color={addressPalette.deepBlue}
              name="map-outline"
              size={30}
            />
          </View>

          <Text style={addressStyles.emptyTitle}>
            Aún no tienes direcciones
          </Text>

          <Text style={addressStyles.emptyText}>
            Agrega una dirección para facilitar la entrega de tus compras.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View
          style={[
            addressStyles.addressCard,
            item.isDefault ? addressStyles.defaultCard : null,
          ]}
        >
          <View style={addressStyles.addressTop}>
            <View style={addressStyles.locationIcon}>
              <Ionicons
                color={addressPalette.deepBlue}
                name={item.isDefault ? "home" : "location-outline"}
                size={20}
              />
            </View>

            <View style={addressStyles.addressMain}>
              <View style={addressStyles.addressNameRow}>
                <Text style={addressStyles.addressName}>{item.label}</Text>

                {item.isDefault ? (
                  <View style={addressStyles.defaultBadge}>
                    <Ionicons
                      color={addressPalette.deepBlue}
                      name="checkmark-circle"
                      size={12}
                    />
                    <Text style={addressStyles.defaultBadgeText}>
                      Principal
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text style={addressStyles.addressLine}>
                {item.addressLine}
              </Text>

              {item.municipality || item.department ? (
                <View style={addressStyles.metaRow}>
                  <Ionicons
                    color={addressPalette.muted}
                    name="navigate-outline"
                    size={13}
                  />
                  <Text style={addressStyles.metaText}>
                    {[item.municipality, item.department]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                </View>
              ) : null}

              {item.phone ? (
                <View style={addressStyles.metaRow}>
                  <Ionicons
                    color={addressPalette.muted}
                    name="call-outline"
                    size={13}
                  />
                  <Text style={addressStyles.metaText}>{item.phone}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={addressStyles.cardDivider} />

          <View style={addressStyles.actionsRow}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(protected)/addresses/[id]",
                  params: { id: item.id },
                })
              }
              style={({ pressed }) => [
                addressStyles.actionButton,
                pressed ? addressStyles.pressed : null,
              ]}
            >
              <Ionicons
                color={addressPalette.deepBlue}
                name="create-outline"
                size={16}
              />
              <Text style={addressStyles.actionText}>Editar</Text>
            </Pressable>

            {!item.isDefault ? (
              <Pressable
                onPress={async () => {
                  await addressRepository.setDefault(
                    item.customerId,
                    item.id,
                  );
                  await load();
                }}
                style={({ pressed }) => [
                  addressStyles.actionButton,
                  pressed ? addressStyles.pressed : null,
                ]}
              >
                <Ionicons
                  color={addressPalette.deepBlue}
                  name="star-outline"
                  size={16}
                />
                <Text style={addressStyles.actionText}>Principal</Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={async () => {
                await addressRepository.archive(item.id);
                await load();
              }}
              style={({ pressed }) => [
                addressStyles.deleteButton,
                pressed ? addressStyles.pressed : null,
              ]}
            >
              <Ionicons
                color={addressPalette.danger}
                name="trash-outline"
                size={16}
              />
              <Text style={addressStyles.deleteText}>Eliminar</Text>
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
        <Text style={accountStyles.saveButtonText}>Guardar cambios</Text>
      </Pressable>

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
      setError("El nombre y la dirección son requeridos.");
      return;
    }

    setError(null);

    const input = {
      label: label.trim(),
      addressLine: addressLine.trim(),
      municipality: municipality.trim() || undefined,
      department: department.trim() || undefined,
      phone: phone.trim() || undefined,
      isDefault,
    };

    if (mode === "create") {
      await addressRepository.create({
        ...input,
        tenantId: session.tenantId,
        customerId: session.customerId,
      });
    } else if (addressId) {
      await addressRepository.update(addressId, input);

      if (isDefault) {
        await addressRepository.setDefault(
          session.customerId,
          addressId,
        );
      }
    }

    router.replace("/(protected)/addresses");
  }

  if (isLoading) {
    return (
      <View style={addressStyles.loadingContainer}>
        <ActivityIndicator
          color={addressPalette.deepBlue}
          size="large"
        />
        <Text style={addressStyles.loadingText}>
          Cargando dirección...
        </Text>
      </View>
    );
  }

  const isCreate = mode === "create";

  return (
    <ScrollView
      contentContainerStyle={addressStyles.formContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={addressStyles.formHero}>
        <View style={addressStyles.heroCircleOne} />
        <View style={addressStyles.heroCircleTwo} />

        <View style={addressStyles.heroRow}>
          <View style={addressStyles.heroText}>
            <Text style={addressStyles.brand}>FERREPHARMA</Text>
            <Text style={addressStyles.heroTitle}>
              {isCreate ? "Nueva dirección" : "Editar dirección"}
            </Text>
            <Text style={addressStyles.heroSubtitle}>
              {isCreate
                ? "Agrega la información del lugar donde deseas recibir tus pedidos."
                : "Actualiza los datos de tu lugar de entrega."}
            </Text>
          </View>

          <View style={addressStyles.heroIcon}>
            <Ionicons
              color={addressPalette.deepBlue}
              name={isCreate ? "location-outline" : "create-outline"}
              size={22}
            />
          </View>
        </View>
      </View>

      <View style={addressStyles.formBody}>
        {error ? (
          <View style={addressStyles.errorBox}>
            <Ionicons
              color={addressPalette.danger}
              name="alert-circle-outline"
              size={18}
            />
            <Text style={addressStyles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={addressStyles.formCard}>
          <View style={addressStyles.formCardHeader}>
            <View style={addressStyles.formCardIcon}>
              <Ionicons
                color={addressPalette.deepBlue}
                name="map-outline"
                size={19}
              />
            </View>

            <View>
              <Text style={addressStyles.formCardTitle}>
                Información de entrega
              </Text>
              <Text style={addressStyles.formCardSubtitle}>
                Completa los datos de la dirección
              </Text>
            </View>
          </View>

          <View style={addressStyles.field}>
            <Text style={addressStyles.fieldLabel}>
              Nombre de la dirección
            </Text>

            <View style={addressStyles.inputContainer}>
              <Ionicons
                color={addressPalette.muted}
                name="bookmark-outline"
                size={17}
              />
              <TextInput
                onChangeText={setLabel}
                placeholder="Casa, Trabajo..."
                placeholderTextColor="#8A94A3"
                style={addressStyles.input}
                value={label}
              />
            </View>
          </View>

          <View style={addressStyles.field}>
            <Text style={addressStyles.fieldLabel}>Dirección</Text>

            <View style={addressStyles.inputContainer}>
              <Ionicons
                color={addressPalette.muted}
                name="location-outline"
                size={17}
              />
              <TextInput
                onChangeText={setAddressLine}
                placeholder="Calle, avenida, zona..."
                placeholderTextColor="#8A94A3"
                style={addressStyles.input}
                value={addressLine}
              />
            </View>
          </View>

          <View style={addressStyles.doubleFieldRow}>
            <View style={addressStyles.doubleField}>
              <Text style={addressStyles.fieldLabel}>Municipio</Text>
              <TextInput
                onChangeText={setMunicipality}
                placeholder="Municipio"
                placeholderTextColor="#8A94A3"
                style={addressStyles.simpleInput}
                value={municipality}
              />
            </View>

            <View style={addressStyles.doubleField}>
              <Text style={addressStyles.fieldLabel}>Departamento</Text>
              <TextInput
                onChangeText={setDepartment}
                placeholder="Departamento"
                placeholderTextColor="#8A94A3"
                style={addressStyles.simpleInput}
                value={department}
              />
            </View>
          </View>

          <View style={addressStyles.field}>
            <Text style={addressStyles.fieldLabel}>Teléfono de contacto</Text>

            <View style={addressStyles.inputContainer}>
              <Ionicons
                color={addressPalette.muted}
                name="call-outline"
                size={17}
              />
              <TextInput
                keyboardType="phone-pad"
                onChangeText={setPhone}
                placeholder="Número de teléfono"
                placeholderTextColor="#8A94A3"
                style={addressStyles.input}
                value={phone}
              />
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => setIsDefault((value) => !value)}
          style={({ pressed }) => [
            addressStyles.defaultSelector,
            isDefault ? addressStyles.defaultSelectorActive : null,
            pressed ? addressStyles.pressed : null,
          ]}
        >
          <View
            style={[
              addressStyles.defaultSelectorIcon,
              isDefault
                ? addressStyles.defaultSelectorIconActive
                : null,
            ]}
          >
            <Ionicons
              color={
                isDefault
                  ? addressPalette.white
                  : addressPalette.deepBlue
              }
              name={isDefault ? "checkmark" : "star-outline"}
              size={18}
            />
          </View>

          <View style={addressStyles.defaultSelectorText}>
            <Text style={addressStyles.defaultSelectorTitle}>
              Dirección principal
            </Text>
            <Text style={addressStyles.defaultSelectorSubtitle}>
              {isDefault
                ? "Esta será tu dirección predeterminada"
                : "Usar esta dirección como predeterminada"}
            </Text>
          </View>

          <Ionicons
            color={addressPalette.deepBlue}
            name={isDefault ? "checkmark-circle" : "ellipse-outline"}
            size={21}
          />
        </Pressable>

        <Pressable
          onPress={save}
          style={({ pressed }) => [
            addressStyles.saveAddressButton,
            pressed ? addressStyles.pressed : null,
          ]}
        >
          <View style={addressStyles.saveAddressIcon}>
            <Ionicons
              color={addressPalette.deepBlue}
              name={isCreate ? "add" : "checkmark"}
              size={19}
            />
          </View>

          <Text style={addressStyles.saveAddressText}>
            {isCreate ? "Guardar dirección" : "Guardar cambios"}
          </Text>

          <Ionicons
            color={addressPalette.white}
            name="arrow-forward"
            size={18}
          />
        </Pressable>
      </View>
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

const addressPalette = {
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

const addressStyles = StyleSheet.create({
  container: {
    backgroundColor: addressPalette.vanillaMilk,
    flexGrow: 1,
    gap: 10,
    paddingBottom: 28,
  },

  hero: {
    backgroundColor: addressPalette.deepBlue,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    minHeight: 148,
    overflow: "hidden",
    paddingBottom: 20,
    paddingHorizontal: 18,
    paddingTop: 30,
  },

  formHero: {
    backgroundColor: addressPalette.deepBlue,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    minHeight: 145,
    overflow: "hidden",
    paddingBottom: 20,
    paddingHorizontal: 18,
    paddingTop: 30,
  },

  heroCircleOne: {
    backgroundColor: addressPalette.dreamyBlue,
    borderRadius: 90,
    height: 155,
    opacity: 0.16,
    position: "absolute",
    right: -48,
    top: -58,
    width: 155,
  },

  heroCircleTwo: {
    backgroundColor: addressPalette.butterHoney,
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

  heroText: {
    flex: 1,
    paddingRight: 12,
  },

  brand: {
    color: addressPalette.butterHoney,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  heroTitle: {
    color: addressPalette.white,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 3,
  },

  heroSubtitle: {
    color: "#EAF1F8",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    maxWidth: "95%",
  },

  heroIcon: {
    alignItems: "center",
    backgroundColor: addressPalette.white,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  addAddressButton: {
    alignItems: "center",
    backgroundColor: addressPalette.deepBlue,
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 12,
    marginTop: 2,
    minHeight: 58,
    paddingHorizontal: 12,
  },

  addAddressIcon: {
    alignItems: "center",
    backgroundColor: addressPalette.butterHoney,
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },

  addAddressText: {
    flex: 1,
  },

  addAddressTitle: {
    color: addressPalette.white,
    fontSize: 13,
    fontWeight: "900",
  },

  addAddressSubtitle: {
    color: "#DDE8F2",
    fontSize: 10,
    marginTop: 2,
  },

  sectionHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 14,
    marginTop: 8,
  },

  sectionTitle: {
    color: addressPalette.text,
    fontSize: 14,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: addressPalette.muted,
    fontSize: 10,
    marginTop: 2,
  },

  countBadge: {
    alignItems: "center",
    backgroundColor: "#E7EDF5",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    minWidth: 28,
    paddingHorizontal: 8,
  },

  countText: {
    color: addressPalette.deepBlue,
    fontSize: 11,
    fontWeight: "900",
  },

  addressCard: {
    backgroundColor: addressPalette.white,
    borderColor: "#E2E7EE",
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: 12,
    padding: 13,
  },

  defaultCard: {
    borderColor: addressPalette.dreamyBlue,
  },

  addressTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
  },

  locationIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    width: 40,
  },

  addressMain: {
    flex: 1,
  },

  addressNameRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  addressName: {
    color: addressPalette.text,
    fontSize: 14,
    fontWeight: "900",
  },

  defaultBadge: {
    alignItems: "center",
    backgroundColor: "#FFF2C9",
    borderRadius: 12,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  defaultBadgeText: {
    color: addressPalette.deepBlue,
    fontSize: 9,
    fontWeight: "900",
  },

  addressLine: {
    color: addressPalette.text,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },

  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 4,
  },

  metaText: {
    color: addressPalette.muted,
    flex: 1,
    fontSize: 10,
  },

  cardDivider: {
    backgroundColor: "#EEF1F5",
    height: 1,
    marginVertical: 10,
  },

  actionsRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  actionButton: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 10,
    flexDirection: "row",
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 9,
  },

  actionText: {
    color: addressPalette.deepBlue,
    fontSize: 10,
    fontWeight: "800",
  },

  deleteButton: {
    alignItems: "center",
    backgroundColor: "#FCEEEE",
    borderRadius: 10,
    flexDirection: "row",
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 9,
  },

  deleteText: {
    color: addressPalette.danger,
    fontSize: 10,
    fontWeight: "800",
  },

  emptyCard: {
    alignItems: "center",
    backgroundColor: addressPalette.white,
    borderColor: "#E2E7EE",
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: 12,
    marginTop: 4,
    padding: 24,
  },

  emptyIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    marginBottom: 10,
    width: 52,
  },

  emptyTitle: {
    color: addressPalette.text,
    fontSize: 15,
    fontWeight: "900",
  },

  emptyText: {
    color: addressPalette.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
    textAlign: "center",
  },

  formContainer: {
    backgroundColor: addressPalette.vanillaMilk,
    flexGrow: 1,
    paddingBottom: 28,
  },

  formBody: {
    gap: 10,
    marginTop: -8,
    paddingHorizontal: 12,
  },

  formCard: {
    backgroundColor: addressPalette.white,
    borderColor: "#E2E7EE",
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },

  formCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginBottom: 2,
  },

  formCardIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },

  formCardTitle: {
    color: addressPalette.text,
    fontSize: 14,
    fontWeight: "900",
  },

  formCardSubtitle: {
    color: addressPalette.muted,
    fontSize: 10,
    marginTop: 2,
  },

  field: {
    gap: 5,
  },

  fieldLabel: {
    color: addressPalette.text,
    fontSize: 10,
    fontWeight: "800",
  },

  inputContainer: {
    alignItems: "center",
    backgroundColor: "#FAFBFC",
    borderColor: addressPalette.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 11,
  },

  input: {
    color: addressPalette.text,
    flex: 1,
    fontSize: 12,
    minHeight: 42,
    paddingVertical: 0,
  },

  doubleFieldRow: {
    flexDirection: "row",
    gap: 8,
  },

  doubleField: {
    flex: 1,
    gap: 5,
  },

  simpleInput: {
    backgroundColor: "#FAFBFC",
    borderColor: addressPalette.border,
    borderRadius: 12,
    borderWidth: 1,
    color: addressPalette.text,
    fontSize: 11,
    minHeight: 44,
    paddingHorizontal: 10,
  },

  defaultSelector: {
    alignItems: "center",
    backgroundColor: addressPalette.white,
    borderColor: "#E2E7EE",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 58,
    paddingHorizontal: 12,
  },

  defaultSelectorActive: {
    backgroundColor: "#F2F6FB",
    borderColor: addressPalette.dreamyBlue,
  },

  defaultSelectorIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },

  defaultSelectorIconActive: {
    backgroundColor: addressPalette.deepBlue,
  },

  defaultSelectorText: {
    flex: 1,
  },

  defaultSelectorTitle: {
    color: addressPalette.text,
    fontSize: 12,
    fontWeight: "900",
  },

  defaultSelectorSubtitle: {
    color: addressPalette.muted,
    fontSize: 9,
    marginTop: 2,
  },

  saveAddressButton: {
    alignItems: "center",
    backgroundColor: addressPalette.deepBlue,
    borderRadius: 15,
    flexDirection: "row",
    gap: 9,
    minHeight: 50,
    paddingHorizontal: 12,
  },

  saveAddressIcon: {
    alignItems: "center",
    backgroundColor: addressPalette.butterHoney,
    borderRadius: 9,
    height: 30,
    justifyContent: "center",
    width: 30,
  },

  saveAddressText: {
    color: addressPalette.white,
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },

  errorBox: {
    alignItems: "center",
    backgroundColor: "#FCEEEE",
    borderRadius: 12,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },

  errorText: {
    color: addressPalette.danger,
    flex: 1,
    fontSize: 10,
    fontWeight: "700",
  },

  loadingContainer: {
    alignItems: "center",
    backgroundColor: addressPalette.vanillaMilk,
    flex: 1,
    gap: 10,
    justifyContent: "center",
  },

  loadingText: {
    color: addressPalette.deepBlue,
    fontSize: 11,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.76,
  },
});
