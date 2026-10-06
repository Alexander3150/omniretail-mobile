import type {
  EntityId,
  ProductMedia,
  ProductMediaRepository,
  TenantId,
} from "@/core";

import { resolveApiAssetUrl } from "../config";

import type { ApiStorefrontProduct } from "./types";

/**
 * El catálogo público incluye solamente la imagen primaria de cada producto.
 * Esta caché la adapta al contrato de medios que usan las pantallas de catálogo.
 */
export class ApiProductMediaRepository implements ProductMediaRepository {
  private readonly mediaByProduct = new Map<EntityId, ProductMedia[]>();

  syncFromProducts(
    products: ApiStorefrontProduct[],
    tenantId: TenantId,
  ) {
    for (const product of products) {
      const url = resolveApiAssetUrl(product.primaryImageUrl);

      this.mediaByProduct.set(
        product.id,
        url
          ? [
              {
                id: `api-media-${product.id}-primary`,
                tenantId,
                productId: product.id,
                url,
                altText: product.primaryImageAlt ?? product.name,
                isPrimary: true,
                sortOrder: 0,
              },
            ]
          : [],
      );
    }
  }

  async getByProduct(productId: EntityId): Promise<ProductMedia[]> {
    return this.mediaByProduct.get(productId) ?? [];
  }
}
