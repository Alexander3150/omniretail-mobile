import { PromotionType, SalesChannel, type Product, type Promotion } from "@/core";

export type PriceSummary = {
  basePrice: number;
  discount: number;
  effectivePrice: number;
  promotion?: Promotion;
};

export function calculatePrice(product: Product, promotions: Promotion[]): PriceSummary {
  const basePrice = product.basePrice.amount;
  const promotion = promotions.find((item) => {
    const appliesToProduct = item.productId === product.id;
    const appliesToCategory = !!item.categoryId && item.categoryId === product.categoryId;
    return (appliesToProduct || appliesToCategory) && item.channels.includes(SalesChannel.MobileApp);
  });

  if (!promotion) {
    return { basePrice, discount: 0, effectivePrice: basePrice };
  }

  if (promotion.type === PromotionType.Percentage) {
    const discount = roundMoney(basePrice * (promotion.value / 100));
    return { basePrice, discount, effectivePrice: roundMoney(basePrice - discount), promotion };
  }

  if (promotion.type === PromotionType.FixedDiscount) {
    const discount = Math.min(basePrice, promotion.value);
    return { basePrice, discount, effectivePrice: roundMoney(basePrice - discount), promotion };
  }

  const effectivePrice = Math.min(basePrice, promotion.value);
  return { basePrice, discount: roundMoney(basePrice - effectivePrice), effectivePrice: roundMoney(effectivePrice), promotion };
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
