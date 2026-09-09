import type { Product, ProductAvailability, ProductMedia, Promotion } from "@/core";

import { calculatePrice, type PriceSummary } from "./pricing";

export type ProductCardViewModel = {
  product: Product;
  primaryImage?: ProductMedia;
  price: PriceSummary;
  availableQuantity: number;
  available: boolean;
  isFavorite: boolean;
};

export function createProductCardViewModel(
  product: Product,
  media: ProductMedia[],
  promotions: Promotion[],
  availability: ProductAvailability[],
  favoriteProductIds: string[],
): ProductCardViewModel {
  const relevantAvailability = availability.filter((item) => item.productId === product.id);
  const availableQuantity = relevantAvailability.reduce((sum, item) => sum + item.availableQuantity, 0);

  return {
    product,
    primaryImage: media.find((item) => item.productId === product.id && item.isPrimary) ?? media.find((item) => item.productId === product.id),
    price: calculatePrice(
      product,
      promotions.filter((promotion) => promotion.productId === product.id || promotion.categoryId === product.categoryId),
    ),
    availableQuantity,
    available: relevantAvailability.some((item) => item.available),
    isFavorite: favoriteProductIds.includes(product.id),
  };
}
