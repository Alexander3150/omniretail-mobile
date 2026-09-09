import type { EntityId, TenantId } from "../types";

export type Unit = {
  id: EntityId;
  tenantId: TenantId;
  name: string;
  code: string;
  symbol?: string;
  allowsDecimals: boolean;
};
