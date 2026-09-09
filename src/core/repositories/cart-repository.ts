import type { Cart, CartItem } from "../entities";
import type { EntityId, TenantId } from "../types";

export type CartWithItems = {
  cart: Cart;
  items: CartItem[];
};

export type AddCartItemInput = {
  cartId: EntityId;
  productId: EntityId;
  quantity: number;
  unitId?: EntityId;
  unitPriceSnapshot?: number;
  effectiveUnitPriceSnapshot?: number;
};

export interface CartRepository {
  getByCustomer(tenantId: TenantId, customerId: EntityId): Promise<Cart | null>;
  getById(id: EntityId): Promise<Cart | null>;
  getItems(cartId: EntityId): Promise<CartItem[]>;
  getWithItems(cartId: EntityId): Promise<CartWithItems | null>;
  getOrCreate(tenantId: TenantId, customerId: EntityId): Promise<Cart>;
  addItem(input: AddCartItemInput): Promise<CartItem>;
  updateQuantity(cartItemId: EntityId, quantity: number): Promise<CartItem>;
  removeItem(cartItemId: EntityId): Promise<void>;
  clear(cartId: EntityId): Promise<void>;
}
