import type {
  EntityId,
  ProductAvailability,
  ProductAvailabilityRepository,
  TenantId,
} from "@/core";

import type { ApiStorefrontProduct } from "./types";

const STOREFRONT_BRANCH_ID = "storefront";

/**
 * Disponibilidad derivada de los productos del storefront. Cada instancia atiende un
 * único tenant (el slug configurado), así que no se filtra por tenantId: los llamadores
 * a veces pasan el UUID de la sesión y a veces el slug cuando no hay sesión.
 */
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
    _tenantId: TenantId,
    productId: EntityId,
  ): Promise<ProductAvailability[]> {
    const item = this.availability.get(productId);

    return item ? [item] : [];
  }

  async getByProductAndBranch(
    _tenantId: TenantId,
    productId: EntityId,
    branchId: EntityId,
  ): Promise<ProductAvailability | null> {
    const item = this.availability.get(productId);

    return item && item.branchId === branchId ? item : null;
  }

  async getByBranch(
    _tenantId: TenantId,
    branchId: EntityId,
  ): Promise<ProductAvailability[]> {
    return [...this.availability.values()].filter(
      (item) => item.branchId === branchId,
    );
  }
}
