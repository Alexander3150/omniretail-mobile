import type { Promotion } from "../entities";
import type { EntityId, TenantId } from "../types";

export interface PromotionRepository {
  getActive(tenantId: TenantId, at?: string): Promise<Promotion[]>;
  getByProduct(tenantId: TenantId, productId: EntityId, at?: string): Promise<Promotion[]>;
}
