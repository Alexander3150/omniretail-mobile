import type { Category } from "../entities";
import type { EntityId, TenantId } from "../types";

export interface CategoryRepository {
  getAll(tenantId: TenantId): Promise<Category[]>;
  getById(id: EntityId): Promise<Category | null>;
}
