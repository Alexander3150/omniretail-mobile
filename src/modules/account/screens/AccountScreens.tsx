import { useLocalSearchParams } from "expo-router";

import { PlaceholderScreen } from "@/shared";

export function AccountScreen() {
  return <PlaceholderScreen title="Cuenta" description="Tab futura para perfil, direcciones y soporte." />;
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
