import type { BusinessConfig, BusinessConfigRepository } from "@/core";

import type { MockDatabaseStore } from "../database";

export class MockBusinessConfigRepository implements BusinessConfigRepository {
  constructor(private readonly store: MockDatabaseStore) {}

  async getCurrent(): Promise<BusinessConfig> {
    const database = await this.store.getState();
    return database.businessConfig;
  }
}
