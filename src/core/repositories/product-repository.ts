import type { Product } from "../entities";
import type { EntityId, TenantId } from "../types";

export type ProductSearchInput = {
  tenantId: TenantId;
  query: string;
  categoryId?: EntityId;
};

export interface ProductRepository {
  getAll(tenantId: TenantId): Promise<Product[]>;
  getById(id: EntityId): Promise<Product | null>;
  search(input: ProductSearchInput): Promise<Product[]>;
  getByCategory(tenantId: TenantId, categoryId: EntityId): Promise<Product[]>;
}
