import { CustomerStatus } from "../enums";
import type { EntityId, ISODateString, TenantId } from "../types";

export type Customer = {
  id: EntityId;
  tenantId: TenantId;
  userId?: EntityId;
  name: string;
  email: string;
  phone?: string;
  status: CustomerStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
