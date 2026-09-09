import type { Branch, BranchRepository, EntityId, TenantId } from "@/core";

import type { MockDatabaseStore } from "../database";

export class MockBranchRepository implements BranchRepository {
  constructor(private readonly store: MockDatabaseStore) {}

  async getAll(tenantId: TenantId): Promise<Branch[]> {
    const database = await this.store.getState();
    return database.branches.filter((branch) => branch.tenantId === tenantId);
  }

  async getById(id: EntityId): Promise<Branch | null> {
    const database = await this.store.getState();
    return database.branches.find((branch) => branch.id === id) ?? null;
  }

  async getActive(tenantId: TenantId): Promise<Branch[]> {
    const branches = await this.getAll(tenantId);
    return branches.filter((branch) => branch.isActive);
  }
}
