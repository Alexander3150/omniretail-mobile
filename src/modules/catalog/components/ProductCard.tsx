import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";

import { formatCurrency } from "@/shared";

import type { ProductCardViewModel } from "../application/productViewModels";

const palette = {
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

type ProductCardProps = {
  item: ProductCardViewModel;
  currency: string;
  onAddToCart(productId: string): Promise<void> | void;
  onToggleFavorite(productId: string): Promise<void> | void;
};

export function ProductCard({
  currency,
  item,
  onAddToCart,
  onToggleFavorite,
}: ProductCardProps) {
  const canAdd = item.available && item.availableQuantity > 0;
  const [imageFailed, setImageFailed] = useState(false);

  function handleToggleFavorite(event: GestureResponderEvent) {
    event.stopPropagation();
    void onToggleFavorite(item.product.id);
  }

  function handleAddToCart(event: GestureResponderEvent) {
    event.stopPropagation();
    void onAddToCart(item.product.id);
  }

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/(protected)/products/[id]",
          params: { id: item.product.id },
        })
      }
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.imageArea}>
        <Image
          accessibilityLabel={item.primaryImage.altText}
          onError={() => setImageFailed(true)}
          resizeMode="contain"
          source={
            imageFailed
              ? item.primaryImage.fallbackSource
              : item.primaryImage.source
          }
          style={styles.image}
        />

        {item.price.discount > 0 ? (
          <View style={styles.offerBadge}>
            <Ionicons color={palette.deepBlue} name="flash" size={12} />
            <Text style={styles.offerText}>OFERTA</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.nameContainer}>
            <Text numberOfLines={2} style={styles.name}>
              {item.product.name}
            </Text>

            <Text numberOfLines={1} style={styles.sku}>
              SKU {item.product.sku}
            </Text>
          </View>

          <Pressable
            accessibilityLabel={
              item.isFavorite
                ? `Quitar ${item.product.name} de favoritos`
                : `Agregar ${item.product.name} a favoritos`
            }
            onPress={handleToggleFavorite}
            style={({ pressed }) => [
              styles.favoriteButton,
              item.isFavorite ? styles.favoriteButtonActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons
              color={item.isFavorite ? palette.danger : palette.deepBlue}
              name={item.isFavorite ? "heart" : "heart-outline"}
              size={19}
            />
          </Pressable>
        </View>

        <View style={styles.stockRow}>
          <View
            style={[
              styles.stockDot,
              !item.available ? styles.stockDotUnavailable : null,
            ]}
          />

          <Text
            style={[
              styles.stockText,
              !item.available ? styles.unavailableText : null,
            ]}
          >
            {item.available
              ? `${item.availableQuantity} disponibles`
              : "No disponible"}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <View>
            {item.price.discount > 0 ? (
              <Text style={styles.oldPrice}>
                {formatCurrency(item.price.basePrice, currency)}
              </Text>
            ) : null}

            <Text style={styles.price}>
              {formatCurrency(item.price.effectivePrice, currency)}
            </Text>
          </View>

          {item.price.discount > 0 ? (
            <View style={styles.savingsIcon}>
              <Ionicons
                color={palette.deepBlue}
                name="pricetag-outline"
                size={16}
              />
            </View>
          ) : null}
        </View>

        <Pressable
          disabled={!canAdd}
          onPress={handleAddToCart}
          style={({ pressed }) => [
            styles.button,
            !canAdd ? styles.buttonDisabled : null,
            pressed && canAdd ? styles.buttonPressed : null,
          ]}
        >
          <Ionicons
            color={palette.white}
            name={canAdd ? "cart-outline" : "ban-outline"}
            size={17}
          />

          <Text style={styles.buttonText}>
            {canAdd ? "Agregar al carrito" : "Sin existencias"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderColor: palette.silkyLilac,
    borderRadius: 21,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 13,
    marginHorizontal: 16,
    padding: 13,
    shadowColor: "#172033",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  imageArea: {
    backgroundColor: "#F7F9FC",
    borderColor: "#E7EBF1",
    borderRadius: 16,
    borderWidth: 1,
    height: 116,
    marginRight: 13,
    overflow: "hidden",
    position: "relative",
    width: 108,
  },

  image: {
    height: "100%",
    width: "100%",
  },

  offerBadge: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 9,
    flexDirection: "row",
    gap: 2,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    position: "absolute",
    top: 6,
  },

  offerText: {
    color: palette.deepBlue,
    fontSize: 8,
    fontWeight: "900",
  },

  body: {
    flex: 1,
    justifyContent: "space-between",
  },

  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
  },

  nameContainer: {
    flex: 1,
    paddingRight: 5,
  },

  name: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 18,
  },

  sku: {
    color: palette.muted,
    fontSize: 9,
    marginTop: 3,
  },

  favoriteButton: {
    alignItems: "center",
    backgroundColor: "#EEF3FB",
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },

  favoriteButtonActive: {
    backgroundColor: "#FFF0F0",
  },

  stockRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 6,
  },

  stockDot: {
    backgroundColor: palette.success,
    borderRadius: 4,
    height: 7,
    width: 7,
  },

  stockDotUnavailable: {
    backgroundColor: palette.danger,
  },

  stockText: {
    color: palette.success,
    fontSize: 9,
    fontWeight: "700",
  },

  unavailableText: {
    color: palette.danger,
  },

  priceRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  oldPrice: {
    color: palette.muted,
    fontSize: 9,
    textDecorationLine: "line-through",
  },

  price: {
    color: palette.deepBlue,
    fontSize: 17,
    fontWeight: "900",
  },

  savingsIcon: {
    alignItems: "center",
    backgroundColor: palette.butterHoney,
    borderRadius: 9,
    height: 29,
    justifyContent: "center",
    width: 29,
  },

  button: {
    alignItems: "center",
    backgroundColor: palette.deepBlue,
    borderRadius: 11,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    marginTop: 8,
    minHeight: 38,
    paddingHorizontal: 8,
  },

  buttonDisabled: {
    backgroundColor: "#A9B1BC",
  },

  buttonPressed: {
    opacity: 0.76,
  },

  buttonText: {
    color: palette.white,
    fontSize: 10,
    fontWeight: "900",
  },

  pressed: {
    opacity: 0.8,
  },
});
