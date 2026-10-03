import {
  CategoryStatus,
  type Category,
  type CategoryRepository,
  type EntityId,
  type TenantId,
} from "@/core";

import type { ApiStorefrontProduct } from "./types";

export class ApiCategoryRepository implements CategoryRepository {
  private categories = new Map<EntityId, Category>();

  syncFromProducts(
    products: ApiStorefrontProduct[],
    tenantId: TenantId,
  ): void {
    this.categories.clear();

    for (const product of products) {
      if (!product.categoryId || !product.categoryName) {
        continue;
      }

      this.categories.set(product.categoryId, {
        id: product.categoryId,
        tenantId,
        name: product.categoryName,
        status: CategoryStatus.Active,
      });
    }
  }

  async getAll(tenantId: TenantId): Promise<Category[]> {
    return [...this.categories.values()].filter(
      (category) => category.tenantId === tenantId,
    );
  }

  async getById(id: EntityId): Promise<Category | null> {
    return this.categories.get(id) ?? null;
  }
}
