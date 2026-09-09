import type { Favorite } from "../entities";
import type { EntityId, TenantId } from "../types";

export interface FavoriteRepository {
  getByCustomer(tenantId: TenantId, customerId: EntityId): Promise<Favorite[]>;
  isFavorite(tenantId: TenantId, customerId: EntityId, productId: EntityId): Promise<boolean>;
  add(input: Favorite): Promise<Favorite>;
  remove(tenantId: TenantId, customerId: EntityId, productId: EntityId): Promise<void>;
}
