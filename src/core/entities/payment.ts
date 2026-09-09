import { CustomerPaymentMethodStatus, PaymentMethodType, PaymentStatus } from "../enums";
import type { EntityId, ISODateString, TenantId } from "../types";

export type CustomerPaymentMethod = {
  id: EntityId;
  tenantId: TenantId;
  customerId: EntityId;
  providerTokenId?: string;
  brand?: string;
  last4?: string;
  expirationMonth?: number;
  expirationYear?: number;
  cardholderName?: string;
  isDefault: boolean;
  status: CustomerPaymentMethodStatus;
};

export type Payment = {
  id: EntityId;
  tenantId: TenantId;
  orderId: EntityId;
  customerId: EntityId;
  method: PaymentMethodType;
  status: PaymentStatus;
  amount: number;
  reference?: string;
  customerPaymentMethodId?: EntityId;
  cardBrandSnapshot?: string;
  cardLast4Snapshot?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
