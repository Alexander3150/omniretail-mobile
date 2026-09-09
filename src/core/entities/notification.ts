import { NotificationType } from "../enums";
import type { EntityId, ISODateString, TenantId } from "../types";

export type Notification = {
  id: EntityId;
  tenantId: TenantId;
  customerId: EntityId;
  type: NotificationType;
  title: string;
  message: string;
  relatedOrderId?: EntityId;
  readAt?: ISODateString;
  createdAt: ISODateString;
};
