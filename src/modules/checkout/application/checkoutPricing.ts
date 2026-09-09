import { DeliveryMethod } from "@/core";
import { calculateCartTotals, type CartLine } from "@/modules/cart";

export const DEMO_HOME_DELIVERY_SHIPPING_COST = 25;
export const DEMO_STORE_PICKUP_SHIPPING_COST = 0;

export function getShippingCost(deliveryMethod: DeliveryMethod | null): number {
  return deliveryMethod === DeliveryMethod.HomeDelivery ? DEMO_HOME_DELIVERY_SHIPPING_COST : DEMO_STORE_PICKUP_SHIPPING_COST;
}

export function calculateCheckoutTotals(lines: CartLine[], deliveryMethod: DeliveryMethod | null) {
  return calculateCartTotals(lines, getShippingCost(deliveryMethod));
}
