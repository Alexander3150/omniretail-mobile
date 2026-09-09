import { CategoryStatus, type Category, type CategoryRepository, type EntityId, type TenantId } from "@/core";

import type { MockDatabaseStore } from "../database";

export class MockCategoryRepository implements CategoryRepository {
  constructor(private readonly store: MockDatabaseStore) {}

  async getAll(tenantId: TenantId): Promise<Category[]> {
    const database = await this.store.getState();
    return database.categories
      .filter((category) => category.tenantId === tenantId && category.status === CategoryStatus.Active)
      .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
  }

  async getById(id: EntityId): Promise<Category | null> {
    const database = await this.store.getState();
    return database.categories.find((category) => category.id === id && category.status === CategoryStatus.Active) ?? null;
  }
}
