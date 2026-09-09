import type { EntityId, TenantId } from "../types";

export type ProductAvailability = {
  tenantId: TenantId;
  productId: EntityId;
  branchId: EntityId;
  availableQuantity: number;
  available: boolean;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
};
