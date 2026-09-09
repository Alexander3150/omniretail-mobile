import type { Product, ProductMedia } from "@/core";
import type { ImageSourcePropType } from "react-native";

const productImageAssets: Record<string, ImageSourcePropType> = {
  "asset://demo/products/product-hammer.png": require("../../../../assets/products/product-hammer.png"),
  "asset://demo/products/product-drill.png": require("../../../../assets/products/product-drill.png"),
  "asset://demo/products/product-led-bulb.png": require("../../../../assets/products/product-led-bulb.png"),
  "asset://demo/products/product-cleaner.png": require("../../../../assets/products/product-cleaner.png"),
  "asset://demo/products/product-shampoo.png": require("../../../../assets/products/product-shampoo.png"),
  "asset://demo/products/product-vitamins.png": require("../../../../assets/products/product-vitamins.png"),
  "asset://demo/products/product-bandages.png": require("../../../../assets/products/product-bandages.png"),
  "asset://demo/products/product-notebook.png": require("../../../../assets/products/product-notebook.png"),
  "asset://demo/products/product-pen-pack.png": require("../../../../assets/products/product-pen-pack.png"),
  "asset://demo/products/product-rice.png": require("../../../../assets/products/product-rice.png"),
  "asset://demo/products/product-coffee.png": require("../../../../assets/products/product-coffee.png"),
  "asset://demo/products/product-screwdriver-kit.png": require("../../../../assets/products/product-screwdriver-kit.png"),
  "asset://demo/products/product-towel.png": require("../../../../assets/products/product-towel.png"),
  "asset://demo/products/product-soap.png": require("../../../../assets/products/product-soap.png"),
  "asset://demo/products/product-thermometer.png": require("../../../../assets/products/product-thermometer.png"),
  "asset://demo/products/product-extension.png": require("../../../../assets/products/product-extension.png"),
};

const productFallbackImage: ImageSourcePropType = require("../../../../assets/products/product-placeholder.png");

export type ProductImageViewModel = {
  source: ImageSourcePropType;
  fallbackSource: ImageSourcePropType;
  altText: string;
  media?: ProductMedia;
};

export function selectPrimaryProductMedia(media: ProductMedia[]): ProductMedia | undefined {
  return media.find((item) => item.isPrimary) ?? [...media].sort((first, second) => first.sortOrder - second.sortOrder)[0];
}

export function resolveProductImage(product: Product, media?: ProductMedia): ProductImageViewModel {
  return {
    source: resolveImageSource(media?.url),
    fallbackSource: productFallbackImage,
    altText: media?.altText ?? product.name,
    media,
  };
}

export function resolveProductImages(product: Product, media: ProductMedia[]): ProductImageViewModel[] {
  const sortedMedia = [...media].sort((first, second) => first.sortOrder - second.sortOrder);
  const images = sortedMedia.map((item) => resolveProductImage(product, item));

  return images.length > 0 ? images : [resolveProductImage(product)];
}

function resolveImageSource(url?: string): ImageSourcePropType {
  if (!url) {
    return productFallbackImage;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return { uri: url };
  }

  return productImageAssets[url] ?? productFallbackImage;
}
