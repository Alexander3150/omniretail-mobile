import { PromotionStatus, PromotionType, SalesChannel } from "../enums";
import type { EntityId, ISODateString, TenantId } from "../types";

export type Promotion = {
  id: EntityId;
  tenantId: TenantId;
  productId?: EntityId;
  categoryId?: EntityId;
  type: PromotionType;
  value: number;
  startsAt?: ISODateString;
  endsAt?: ISODateString;
  channels: SalesChannel[];
  status: PromotionStatus;
};
