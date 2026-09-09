import type { EntityId, TenantId } from "../types";

export type ProductMedia = {
  id: EntityId;
  tenantId: TenantId;
  productId: EntityId;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
};
