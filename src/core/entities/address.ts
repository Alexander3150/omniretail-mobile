import { AddressStatus } from "../enums";
import type { EntityId, ISODateString, TenantId } from "../types";

export type Address = {
  id: EntityId;
  tenantId: TenantId;
  customerId: EntityId;
  label: string;
  addressLine: string;
  municipality?: string;
  department?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  status?: AddressStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
