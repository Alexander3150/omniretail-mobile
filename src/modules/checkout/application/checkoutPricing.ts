import { DeliveryMethod } from "@/core";
import {
  calculateCartTotals,
  calculateHomeDeliveryShipping,
  type CartLine,
} from "@/modules/cart";

export const DEMO_STORE_PICKUP_SHIPPING_COST = 0;

export function getShippingCost(deliveryMethod: DeliveryMethod | null, subtotal: number): number {
  return deliveryMethod === DeliveryMethod.HomeDelivery
    ? calculateHomeDeliveryShipping(subtotal)
    : DEMO_STORE_PICKUP_SHIPPING_COST;
}

export function calculateCheckoutTotals(lines: CartLine[], deliveryMethod: DeliveryMethod | null) {
  const cartTotals = calculateCartTotals(lines, 0);
  return calculateCartTotals(lines, getShippingCost(deliveryMethod, cartTotals.subtotal));
}
