import { useLocalSearchParams } from "expo-router";

import { PlaceholderScreen } from "@/shared";

export function OrdersScreen() {
  return <PlaceholderScreen title="Pedidos" description="Tab futura para historial de pedidos." />;
}

export function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <PlaceholderScreen title="Detalle de pedido" description={`Pedido futuro ${id ?? "seleccionado"}.`} />;
}
