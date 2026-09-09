import { createContext, type PropsWithChildren, useContext, useMemo, useState } from "react";

import { DeliveryMethod, PaymentMethodType } from "@/core";

export type CheckoutSelection = {
  deliveryMethod: DeliveryMethod | null;
  addressId?: string;
  pickupBranchId?: string;
  contactPhone: string;
  billingName: string;
  nit?: string;
  paymentMethod: PaymentMethodType | null;
  customerPaymentMethodId?: string;
  lastOrderId?: string;
};

type CheckoutContextValue = CheckoutSelection & {
  resetCheckout(): void;
  setDeliveryMethod(deliveryMethod: DeliveryMethod): void;
  setAddressId(addressId: string): void;
  setPickupBranchId(branchId: string): void;
  setContactPhone(contactPhone: string): void;
  setBillingName(billingName: string): void;
  setNit(nit: string): void;
  setPaymentMethod(paymentMethod: PaymentMethodType): void;
  setCustomerPaymentMethodId(paymentMethodId: string): void;
  setLastOrderId(orderId: string): void;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

const initialSelection: CheckoutSelection = {
  deliveryMethod: null,
  contactPhone: "",
  billingName: "",
  paymentMethod: PaymentMethodType.Card,
};

export function CheckoutProvider({ children }: PropsWithChildren) {
  const [selection, setSelection] = useState<CheckoutSelection>(initialSelection);

  const value = useMemo<CheckoutContextValue>(
    () => ({
      ...selection,
      resetCheckout: () => setSelection(initialSelection),
      setAddressId: (addressId) => setSelection((current) => (current.addressId === addressId ? current : { ...current, addressId })),
      setBillingName: (billingName) => setSelection((current) => (current.billingName === billingName ? current : { ...current, billingName })),
      setContactPhone: (contactPhone) => setSelection((current) => (current.contactPhone === contactPhone ? current : { ...current, contactPhone })),
      setCustomerPaymentMethodId: (customerPaymentMethodId) =>
        setSelection((current) => (current.customerPaymentMethodId === customerPaymentMethodId ? current : { ...current, customerPaymentMethodId })),
      setDeliveryMethod: (deliveryMethod) => setSelection((current) => (current.deliveryMethod === deliveryMethod ? current : { ...current, deliveryMethod })),
      setLastOrderId: (lastOrderId) => setSelection((current) => (current.lastOrderId === lastOrderId ? current : { ...current, lastOrderId })),
      setNit: (nit) => setSelection((current) => (current.nit === nit ? current : { ...current, nit })),
      setPaymentMethod: (paymentMethod) => setSelection((current) => (current.paymentMethod === paymentMethod ? current : { ...current, paymentMethod })),
      setPickupBranchId: (pickupBranchId) => setSelection((current) => (current.pickupBranchId === pickupBranchId ? current : { ...current, pickupBranchId })),
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
