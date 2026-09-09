import type {
  EntityId,
  ProductAvailability,
  ProductAvailabilityRepository,
  TenantId,
} from "@/core";

import type { MockDatabaseStore } from "../database";

export class MockProductAvailabilityRepository implements ProductAvailabilityRepository {
  constructor(private readonly store: MockDatabaseStore) {}

  async getByProduct(tenantId: TenantId, productId: EntityId): Promise<ProductAvailability[]> {
    const database = await this.store.getState();
    return database.productAvailability.filter((availability) => availability.tenantId === tenantId && availability.productId === productId);
  }

  async getByProductAndBranch(tenantId: TenantId, productId: EntityId, branchId: EntityId): Promise<ProductAvailability | null> {
    const database = await this.store.getState();
    return (
      database.productAvailability.find(
        (availability) => availability.tenantId === tenantId && availability.productId === productId && availability.branchId === branchId,
      ) ?? null
    );
  }

  async getByBranch(tenantId: TenantId, branchId: EntityId): Promise<ProductAvailability[]> {
    const database = await this.store.getState();
    return database.productAvailability.filter((availability) => availability.tenantId === tenantId && availability.branchId === branchId);
  }
}
