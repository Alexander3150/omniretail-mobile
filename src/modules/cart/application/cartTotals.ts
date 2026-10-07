import { roundMoney } from "@/modules/catalog";
import type { ProductImageViewModel } from "@/modules/catalog";

export type CartLine = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  image?: ProductImageViewModel;
  quantity: number;
  unitPrice: number;
  effectiveUnitPrice: number;
  lineSubtotal: number;
};

export type CartTotals = {
  subtotalBeforeDiscount: number;
  discount: number;
  subtotal: number;
  shippingCost: number;
  total: number;
};

export const FREE_SHIPPING_THRESHOLD = 300;
export const HOME_DELIVERY_SHIPPING_COST = 25;

export function calculateHomeDeliveryShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : HOME_DELIVERY_SHIPPING_COST;
}

export function calculateCartTotals(lines: CartLine[], shippingCost?: number): CartTotals {
  const subtotalBeforeDiscount = roundMoney(lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0));
  const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.effectiveUnitPrice * line.quantity, 0));
  const discount = roundMoney(subtotalBeforeDiscount - subtotal);

  return {
    subtotalBeforeDiscount,
    discount,
    subtotal,
    shippingCost: shippingCost ?? calculateHomeDeliveryShipping(subtotal),
    total: roundMoney(subtotal + (shippingCost ?? calculateHomeDeliveryShipping(subtotal))),
  };
}
