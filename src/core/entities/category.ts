import { CategoryStatus } from "../enums";
import type { EntityId, TenantId } from "../types";

export type Category = {
  id: EntityId;
  tenantId: TenantId;
  name: string;
  description?: string;
  imageUrl?: string;
  status: CategoryStatus;
  sortOrder?: number;
};
