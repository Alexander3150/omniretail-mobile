import { ProductStatus, SalesChannel, type EntityId, type Product, type ProductRepository, type ProductSearchInput, type TenantId } from "@/core";

import type { MockDatabaseStore } from "../database";

export class MockProductRepository implements ProductRepository {
  constructor(private readonly store: MockDatabaseStore) {}

  async getAll(tenantId: TenantId): Promise<Product[]> {
    const database = await this.store.getState();
    return database.products.filter((product) => isMobileVisible(product, tenantId));
  }

  async getById(id: EntityId): Promise<Product | null> {
    const database = await this.store.getState();
    return database.products.find((product) => product.id === id && isMobileVisible(product, product.tenantId)) ?? null;
  }

  async search(input: ProductSearchInput): Promise<Product[]> {
    const query = input.query.trim().toLowerCase();
    const products = await this.getAll(input.tenantId);

    return products.filter((product) => {
      const matchesQuery = !query || product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query);
      const matchesCategory = !input.categoryId || product.categoryId === input.categoryId;
      return matchesQuery && matchesCategory;
    });
  }

  async getByCategory(tenantId: TenantId, categoryId: EntityId): Promise<Product[]> {
    const products = await this.getAll(tenantId);
    return products.filter((product) => product.categoryId === categoryId);
  }
}

function isMobileVisible(product: Product, tenantId: TenantId): boolean {
  return product.tenantId === tenantId && product.status === ProductStatus.Published && product.channels.includes(SalesChannel.MobileApp);
}
