import { PromotionStatus, type EntityId, type Promotion, type PromotionRepository, type TenantId } from "@/core";

import type { MockDatabaseStore } from "../database";

export class MockPromotionRepository implements PromotionRepository {
  constructor(private readonly store: MockDatabaseStore) {}

  async getActive(tenantId: TenantId, at = new Date().toISOString()): Promise<Promotion[]> {
    const database = await this.store.getState();
    return database.promotions.filter((promotion) => isActivePromotion(promotion, tenantId, at));
  }

  async getByProduct(tenantId: TenantId, productId: EntityId, at = new Date().toISOString()): Promise<Promotion[]> {
    const database = await this.store.getState();
    const product = database.products.find((item) => item.id === productId);
    return database.promotions.filter((promotion) => {
      const matchesScope = promotion.productId === productId || (!!promotion.categoryId && promotion.categoryId === product?.categoryId);
      return matchesScope && isActivePromotion(promotion, tenantId, at);
    });
  }
}

function isActivePromotion(promotion: Promotion, tenantId: TenantId, at: string): boolean {
  return (
    promotion.tenantId === tenantId &&
    promotion.status === PromotionStatus.Active &&
    (!promotion.startsAt || promotion.startsAt <= at) &&
    (!promotion.endsAt || promotion.endsAt >= at)
  );
}
