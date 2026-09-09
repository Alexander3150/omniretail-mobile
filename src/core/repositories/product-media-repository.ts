import type { ProductMedia } from "../entities";
import type { EntityId } from "../types";

export interface ProductMediaRepository {
  getByProduct(productId: EntityId): Promise<ProductMedia[]>;
}
