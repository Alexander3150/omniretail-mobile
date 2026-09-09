import { ProductStatus, ProductType, SalesChannel } from "../enums";
import type { EntityId, ISODateString, TenantId } from "../types";

export type ProductPrice = {
  productId: EntityId;
  currency: string;
  amount: number;
};

export type Product = {
  id: EntityId;
  tenantId: TenantId;
  sku: string;
  name: string;
  description?: string;
  categoryId?: EntityId;
  unitId?: EntityId;
  type: ProductType;
  status: ProductStatus;
  channels: SalesChannel[];
  basePrice: ProductPrice;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
