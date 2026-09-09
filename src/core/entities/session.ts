import type { EntityId, ISODateString, TenantId } from "../types";

export type Session = {
  id: EntityId;
  userId: EntityId;
  customerId: EntityId;
  tenantId: TenantId;
  createdAt: ISODateString;
  expiresAt?: ISODateString;
};
