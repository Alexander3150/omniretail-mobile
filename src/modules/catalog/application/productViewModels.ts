import type { Product, ProductAvailability, ProductMedia, Promotion } from "@/core";

import { calculatePrice, type PriceSummary } from "./pricing";
import { resolveProductImages, selectPrimaryProductMedia, type ProductImageViewModel } from "./productMediaImages";

export type ProductCardViewModel = {
  product: Product;
  primaryImage: ProductImageViewModel;
  images: ProductImageViewModel[];
  price: PriceSummary;
  /** Quantity in the configured sale unit, or null when the product has no stock control. */
  availableQuantity: number | null;
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
  const availableQuantity = resolveAvailableQuantity(relevantAvailability);
  const productMedia = media.filter((item) => item.productId === product.id);
  const primaryMedia = selectPrimaryProductMedia(productMedia);
  const images = resolveProductImages(product, primaryMedia ? [primaryMedia, ...productMedia.filter((item) => item.id !== primaryMedia.id)] : productMedia);

  return {
    product,
    primaryImage: images[0],
    images,
    price: calculatePrice(
      product,
      promotions.filter((promotion) => promotion.productId === product.id || promotion.categoryId === product.categoryId),
    ),
    availableQuantity,
    available: relevantAvailability.some((item) => item.available),
    isFavorite: favoriteProductIds.includes(product.id),
  };
}

/**
 * In API mode the repository exposes one storefront availability already resolved by the backend.
 * Mock records can still contain branch projections, so they retain their existing aggregate.
 */
export function resolveAvailableQuantity(availability: ProductAvailability[]): number | null {
  if (availability.length === 0) return 0;
  if (availability.every((item) => item.availableQuantity === null)) return null;

  return availability.reduce(
    (sum, item) => sum + (item.availableQuantity ?? 0),
    0,
  );
}
