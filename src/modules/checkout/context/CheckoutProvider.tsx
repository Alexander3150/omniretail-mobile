import { createContext, type PropsWithChildren, useContext, useMemo, useState } from "react";

import { DeliveryMethod, PaymentMethodType } from "@/core";

export type CheckoutSelection = {
  deliveryMethod: DeliveryMethod | null;
  addressId?: string;
  pickupBranchId?: string;
  paymentMethod: PaymentMethodType | null;
  customerPaymentMethodId?: string;
  lastOrderId?: string;
};

type CheckoutContextValue = CheckoutSelection & {
  resetCheckout(): void;
  setDeliveryMethod(deliveryMethod: DeliveryMethod): void;
  setAddressId(addressId: string): void;
  setPickupBranchId(branchId: string): void;
  setPaymentMethod(paymentMethod: PaymentMethodType): void;
  setCustomerPaymentMethodId(paymentMethodId: string): void;
  setLastOrderId(orderId: string): void;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

const initialSelection: CheckoutSelection = {
  deliveryMethod: null,
  paymentMethod: PaymentMethodType.Card,
};

export function CheckoutProvider({ children }: PropsWithChildren) {
  const [selection, setSelection] = useState<CheckoutSelection>(initialSelection);

  const value = useMemo<CheckoutContextValue>(
    () => ({
      ...selection,
      resetCheckout: () => setSelection(initialSelection),
      setAddressId: (addressId) => setSelection((current) => ({ ...current, addressId })),
      setCustomerPaymentMethodId: (customerPaymentMethodId) => setSelection((current) => ({ ...current, customerPaymentMethodId })),
      setDeliveryMethod: (deliveryMethod) => setSelection((current) => ({ ...current, deliveryMethod })),
      setLastOrderId: (lastOrderId) => setSelection((current) => ({ ...current, lastOrderId })),
      setPaymentMethod: (paymentMethod) => setSelection((current) => ({ ...current, paymentMethod })),
      setPickupBranchId: (pickupBranchId) => setSelection((current) => ({ ...current, pickupBranchId })),
    }),
    [selection],
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used inside CheckoutProvider");
  }
  return context;
}
