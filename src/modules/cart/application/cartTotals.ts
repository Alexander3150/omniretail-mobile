import { roundMoney } from "@/modules/catalog";

export type CartLine = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  imageUrl?: string;
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

export function calculateCartTotals(lines: CartLine[], shippingCost = 0): CartTotals {
  const subtotalBeforeDiscount = roundMoney(lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0));
  const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.effectiveUnitPrice * line.quantity, 0));
  const discount = roundMoney(subtotalBeforeDiscount - subtotal);

  return {
    subtotalBeforeDiscount,
    discount,
    subtotal,
    shippingCost,
    total: roundMoney(subtotal + shippingCost),
  };
}
