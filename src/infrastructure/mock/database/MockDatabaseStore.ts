import type { KeyValueStorage } from "../../storage";

import { createMockDatabase } from "./createMockDatabase";
import type { MockDatabase } from "./MockDatabase";
import { normalizeDatabase } from "./normalizeDatabase";
import { MOCK_DATABASE_STORAGE_KEY } from "./storageKeys";

export class MockDatabaseStore {
  private database: MockDatabase | null = null;

  constructor(private readonly storage: KeyValueStorage) {}

  async initialize(): Promise<MockDatabase> {
    if (this.database) {
      return this.database;
    }

    const persisted = await this.storage.get(MOCK_DATABASE_STORAGE_KEY);

    if (!persisted) {
      const seeded = createMockDatabase();
      this.database = seeded;
      await this.persist();
      return seeded;
    }

    try {
      this.database = normalizeDatabase(JSON.parse(persisted));
      await this.persist();
      return this.database;
    } catch {
      this.database = createMockDatabase();
      await this.persist();
      return this.database;
    }
  }

  async getState(): Promise<MockDatabase> {
    return this.initialize();
  }

  async update(mutator: (database: MockDatabase) => void): Promise<MockDatabase> {
    const database = await this.initialize();
    mutator(database);
    await this.persist();
    return database;
  }

  async resetToDemoData(): Promise<MockDatabase> {
    await this.storage.remove(MOCK_DATABASE_STORAGE_KEY);
    this.database = createMockDatabase();
    await this.persist();
    return this.database;
  }

  private async persist(): Promise<void> {
    if (!this.database) {
      return;
    }

    await this.storage.set(MOCK_DATABASE_STORAGE_KEY, JSON.stringify(this.database));
  }
}
