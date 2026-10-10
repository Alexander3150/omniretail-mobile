import type { StyleProp, TextStyle } from "react-native";
import { Text } from "react-native";

import { useBusinessConfig } from "../hooks/useBusinessConfig";

/** Nombre de la tienda en mayúsculas (el configurado en el panel web, o el valor por defecto). */
export function StoreBrandText({ style }: { style?: StyleProp<TextStyle> }) {
  const { storeName } = useBusinessConfig();

  return <Text style={style}>{storeName.toUpperCase()}</Text>;
}
