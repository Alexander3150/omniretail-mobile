import type { EntityId, TenantId } from "../types";

export type Branch = {
  id: EntityId;
  tenantId: TenantId;
  name: string;
  code?: string;
  address: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  isActive: boolean;
};
