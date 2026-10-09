import type { EntityId, TenantId } from "../types";

export type ProductAvailability = {
  tenantId: TenantId;
  productId: EntityId;
  branchId: EntityId;
  /** `null` means the product does not consume tracked stock. */
  availableQuantity: number | null;
  available: boolean;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
};
