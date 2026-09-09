import { CartStatus } from "../enums";
import type { EntityId, ISODateString, TenantId } from "../types";

export type Cart = {
  id: EntityId;
  tenantId: TenantId;
  customerId: EntityId;
  status: CartStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type CartItem = {
  id: EntityId;
  cartId: EntityId;
  productId: EntityId;
  quantity: number;
  unitId?: EntityId;
  unitPriceSnapshot?: number;
  effectiveUnitPriceSnapshot?: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
