import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";

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

  fullName: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  department: string;
  references: string;
  cardholderName: string;
  cardLastFour: string;
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

  setFullName(value: string): void;
  setEmail(value: string): void;
  setAddressLine1(value: string): void;
  setAddressLine2(value: string): void;
  setCity(value: string): void;
  setDepartment(value: string): void;
  setReferences(value: string): void;
  setCardholderName(value: string): void;
  setCardLastFour(value: string): void;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

const initialSelection: CheckoutSelection = {
  deliveryMethod: DeliveryMethod.HomeDelivery,
  contactPhone: "",
  billingName: "",
  paymentMethod: PaymentMethodType.Card,

  fullName: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  department: "",
  references: "",
  cardholderName: "",
  cardLastFour: "",
};

export function CheckoutProvider({ children }: PropsWithChildren) {
  const [selection, setSelection] =
    useState<CheckoutSelection>(initialSelection);

  const setField = <K extends keyof CheckoutSelection>(
    key: K,
    nextValue: CheckoutSelection[K],
  ) => {
    setSelection((current) =>
      current[key] === nextValue
        ? current
        : { ...current, [key]: nextValue },
    );
  };

  const value = useMemo<CheckoutContextValue>(
    () => ({
      ...selection,

      resetCheckout: () => setSelection(initialSelection),

      setAddressId: (value) => setField("addressId", value),
      setPickupBranchId: (value) => setField("pickupBranchId", value),
      setContactPhone: (value) => setField("contactPhone", value),
      setBillingName: (value) => setField("billingName", value),
      setNit: (value) => setField("nit", value),
      setPaymentMethod: (value) => setField("paymentMethod", value),
      setCustomerPaymentMethodId: (value) =>
        setField("customerPaymentMethodId", value),
      setLastOrderId: (value) => setField("lastOrderId", value),

      setDeliveryMethod: (value) =>
        setField("deliveryMethod", value),

      setFullName: (value) => setField("fullName", value),
      setEmail: (value) => setField("email", value),
      setAddressLine1: (value) => setField("addressLine1", value),
      setAddressLine2: (value) => setField("addressLine2", value),
      setCity: (value) => setField("city", value),
      setDepartment: (value) => setField("department", value),
      setReferences: (value) => setField("references", value),
      setCardholderName: (value) =>
        setField("cardholderName", value),
      setCardLastFour: (value) =>
        setField("cardLastFour", value.replace(/\D/g, "").slice(0, 4)),
    }),
    [selection],
  );

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error("useCheckout must be used inside CheckoutProvider");
  }

  return context;
}
