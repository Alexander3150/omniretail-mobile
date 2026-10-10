import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";

type StoreLogoProps = {
  /** URL http(s) del logo de la tienda. Cualquier otra cosa muestra el icono por defecto. */
  uri?: string;
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
};

/**
 * Logo de la tienda configurado en el panel web. Si no hay logo, no es una URL utilizable o la
 * imagen no carga, se muestra el icono de tienda para no dejar un hueco roto.
 */
export function StoreLogo({
  uri,
  size = 44,
  backgroundColor = "#FFFFFF",
  iconColor = "#3E668F",
}: StoreLogoProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const canShowImage = Boolean(uri && /^https?:\/\//i.test(uri) && failedUri !== uri);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, borderRadius: size / 2, height: size, width: size },
      ]}
    >
      {canShowImage ? (
        <Image
          accessibilityIgnoresInvertColors
          onError={() => setFailedUri(uri ?? null)}
          resizeMode="contain"
          source={{ uri }}
          style={{ height: size * 0.8, width: size * 0.8 }}
        />
      ) : (
        <Ionicons color={iconColor} name="storefront-outline" size={size * 0.5} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
