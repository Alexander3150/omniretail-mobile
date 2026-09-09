import { DeliveryMethod, OrderStatus, PaymentStatus } from "../enums";
import type { EntityId, ISODateString, TenantId } from "../types";

export type OrderDeliveryAddressSnapshot = {
  label?: string;
  addressLine: string;
  municipality?: string;
  department?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
};

export type OrderContactSnapshot = {
  name: string;
  email: string;
  phone?: string;
};

export type Order = {
  id: EntityId;
  tenantId: TenantId;
  number: string;
  customerId: EntityId;
  branchId?: EntityId;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  deliveryAddressSnapshot?: OrderDeliveryAddressSnapshot;
  contactSnapshot?: OrderContactSnapshot;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  paymentStatus?: PaymentStatus;
  createdAt: ISODateString;
  confirmedAt?: ISODateString;
  preparingAt?: ISODateString;
  shippedAt?: ISODateString;
};

export type OrderItem = {
  id: EntityId;
  orderId: EntityId;
  productId: EntityId;
  productNameSnapshot: string;
  skuSnapshot?: string;
  quantity: number;
  unitPriceSnapshot: number;
  effectiveUnitPriceSnapshot?: number;
  subtotal: number;
};
