import type { ProductAvailability } from "../entities";
import type { EntityId, TenantId } from "../types";

export interface ProductAvailabilityRepository {
  getByProduct(tenantId: TenantId, productId: EntityId): Promise<ProductAvailability[]>;
  getByProductAndBranch(tenantId: TenantId, productId: EntityId, branchId: EntityId): Promise<ProductAvailability | null>;
  getByBranch(tenantId: TenantId, branchId: EntityId): Promise<ProductAvailability[]>;
}
