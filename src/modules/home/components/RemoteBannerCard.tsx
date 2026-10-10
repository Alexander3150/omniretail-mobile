import { useState } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";

import type { BusinessHeroSlide } from "@/core";

type RemoteBannerCardProps = {
  slide: BusinessHeroSlide;
  width: number;
};

/**
 * Diapositiva del carrusel configurada en el panel web: imagen de fondo con título y descripción
 * encima. Si la imagen no existe o no carga, queda el fondo de color con los textos.
 */
export function RemoteBannerCard({ slide, width }: RemoteBannerCardProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const imageUri = slide.imageUri && failedUri !== slide.imageUri ? slide.imageUri : undefined;

  return (
    <View style={[styles.outer, { width }]}>
      <ImageBackground
        imageStyle={styles.image}
        onError={() => setFailedUri(slide.imageUri ?? null)}
        resizeMode="cover"
        source={imageUri ? { uri: imageUri } : undefined}
        style={styles.card}
      >
        {slide.title || slide.description ? (
          <View style={[styles.overlay, imageUri ? styles.overlayOnImage : null]}>
            {slide.title ? (
              <Text numberOfLines={2} style={styles.title}>
                {slide.title}
              </Text>
            ) : null}
            {slide.description ? (
              <Text numberOfLines={3} style={styles.description}>
                {slide.description}
              </Text>
            ) : null}
          </View>
        ) : null}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingRight: 12,
  },
  card: {
    backgroundColor: "#3E668F",
    borderRadius: 24,
    height: 168,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  image: {
    borderRadius: 24,
  },
  overlay: {
    gap: 4,
    padding: 18,
  },
  overlayOnImage: {
    backgroundColor: "rgba(23, 32, 51, 0.45)",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  description: {
    color: "#FFF2D0",
    fontSize: 13,
    lineHeight: 18,
  },
});
