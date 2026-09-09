import type { EntityId, Favorite, FavoriteRepository, TenantId } from "@/core";

import type { MockDatabaseStore } from "../database";

export class MockFavoriteRepository implements FavoriteRepository {
  constructor(private readonly store: MockDatabaseStore) {}

  async getByCustomer(tenantId: TenantId, customerId: EntityId): Promise<Favorite[]> {
    const database = await this.store.getState();
    return database.favorites.filter((favorite) => favorite.tenantId === tenantId && favorite.customerId === customerId);
  }

  async isFavorite(tenantId: TenantId, customerId: EntityId, productId: EntityId): Promise<boolean> {
    const database = await this.store.getState();
    return database.favorites.some((favorite) => favorite.tenantId === tenantId && favorite.customerId === customerId && favorite.productId === productId);
  }

  async add(input: Favorite): Promise<Favorite> {
    await this.store.update((database) => {
      const exists = database.favorites.some(
        (favorite) => favorite.tenantId === input.tenantId && favorite.customerId === input.customerId && favorite.productId === input.productId,
      );
      if (!exists) {
        database.favorites.push(input);
      }
    });
    return input;
  }

  async remove(tenantId: TenantId, customerId: EntityId, productId: EntityId): Promise<void> {
    await this.store.update((database) => {
      database.favorites = database.favorites.filter(
        (favorite) => favorite.tenantId !== tenantId || favorite.customerId !== customerId || favorite.productId !== productId,
      );
    });
  }
}
