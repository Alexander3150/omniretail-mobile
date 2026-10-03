export type ApiStorefrontProduct = {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  brand?: string | null;
  salePrice: number;
  basePrice: number;
  effectivePrice: number;
  discountAmount: number;
  promotionId?: string | null;
  categoryId: string;
  categoryName?: string | null;
  saleUnitId: string;
  saleUnitName?: string | null;
  inStock: boolean;
  availableQuantity: number;
};
