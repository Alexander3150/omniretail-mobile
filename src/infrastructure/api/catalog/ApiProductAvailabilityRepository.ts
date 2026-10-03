import type {
  EntityId,
  ProductAvailability,
  ProductAvailabilityRepository,
  TenantId,
} from "@/core";

import type { ApiStorefrontProduct } from "./types";

const STOREFRONT_BRANCH_ID = "storefront";

export class ApiProductAvailabilityRepository
  implements ProductAvailabilityRepository
{
  private availability = new Map<EntityId, ProductAvailability>();

  syncFromProducts(
    products: ApiStorefrontProduct[],
    tenantId: TenantId,
  ): void {
    for (const product of products) {
      this.availability.set(product.id, {
        tenantId,
        productId: product.id,
        branchId: STOREFRONT_BRANCH_ID,
        availableQuantity: Number(product.availableQuantity),
        available: product.inStock,
        pickupAvailable: false,
        deliveryAvailable: product.inStock,
      });
    }
  }

  async getByProduct(
    tenantId: TenantId,
    productId: EntityId,
  ): Promise<ProductAvailability[]> {
    const item = this.availability.get(productId);

    if (!item || item.tenantId !== tenantId) {
      return [];
    }

    return [item];
  }

  async getByProductAndBranch(
    tenantId: TenantId,
    productId: EntityId,
    branchId: EntityId,
  ): Promise<ProductAvailability | null> {
    const item = this.availability.get(productId);

    if (
      !item ||
      item.tenantId !== tenantId ||
      item.branchId !== branchId
    ) {
      return null;
    }

    return item;
  }

  async getByBranch(
    tenantId: TenantId,
    branchId: EntityId,
  ): Promise<ProductAvailability[]> {
    return [...this.availability.values()].filter(
      (item) =>
        item.tenantId === tenantId &&
        item.branchId === branchId,
    );
  }
}
