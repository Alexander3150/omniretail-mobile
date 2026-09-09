import type { Branch } from "../entities";
import type { EntityId, TenantId } from "../types";

export interface BranchRepository {
  getAll(tenantId: TenantId): Promise<Branch[]>;
  getById(id: EntityId): Promise<Branch | null>;
  getActive(tenantId: TenantId): Promise<Branch[]>;
}
