import type { EntityId, ProductMedia, ProductMediaRepository } from "@/core";

import type { MockDatabaseStore } from "../database";

export class MockProductMediaRepository implements ProductMediaRepository {
  constructor(private readonly store: MockDatabaseStore) {}

  async getByProduct(productId: EntityId): Promise<ProductMedia[]> {
    const database = await this.store.getState();
    return database.productMedia
      .filter((media) => media.productId === productId)
      .sort((left, right) => left.sortOrder - right.sortOrder);
  }
}
