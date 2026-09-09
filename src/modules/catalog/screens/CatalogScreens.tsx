import { useLocalSearchParams } from "expo-router";

import { PlaceholderScreen } from "@/shared";

export function CategoriesScreen() {
  return <PlaceholderScreen title="Categorias" description="Entrada futura al catalogo por categorias." />;
}

export function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <PlaceholderScreen title="Producto" description={`Detalle futuro del producto ${id ?? "seleccionado"}.`} />;
}
