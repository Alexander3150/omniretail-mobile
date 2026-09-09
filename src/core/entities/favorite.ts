import type { EntityId, ISODateString, TenantId } from "../types";

export type Favorite = {
  tenantId: TenantId;
  customerId: EntityId;
  productId: EntityId;
  createdAt: ISODateString;
};
