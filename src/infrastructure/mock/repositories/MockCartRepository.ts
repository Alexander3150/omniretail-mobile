import { CartStatus, type AddCartItemInput, type Cart, type CartItem, type CartRepository, type CartWithItems, type EntityId, type TenantId } from "@/core";

import type { MockDatabaseStore } from "../database";
import { createId } from "../utils/createId";

export class MockCartRepository implements CartRepository {
  constructor(private readonly store: MockDatabaseStore) {}

  async getByCustomer(tenantId: TenantId, customerId: EntityId): Promise<Cart | null> {
    const database = await this.store.getState();
    return database.carts.find((cart) => cart.tenantId === tenantId && cart.customerId === customerId && cart.status === CartStatus.Active) ?? null;
  }

  async getById(id: EntityId): Promise<Cart | null> {
    const database = await this.store.getState();
    return database.carts.find((cart) => cart.id === id) ?? null;
  }

  async getItems(cartId: EntityId): Promise<CartItem[]> {
    const database = await this.store.getState();
    return database.cartItems.filter((cartItem) => cartItem.cartId === cartId);
  }

  async getWithItems(cartId: EntityId): Promise<CartWithItems | null> {
    const cart = await this.getById(cartId);

    if (!cart) {
      return null;
    }

    return {
      cart,
      items: await this.getItems(cartId),
    };
  }

  async getOrCreate(tenantId: TenantId, customerId: EntityId): Promise<Cart> {
    const existing = await this.getByCustomer(tenantId, customerId);
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const cart: Cart = { id: createId("cart"), tenantId, customerId, status: CartStatus.Active, createdAt: now, updatedAt: now };
    await this.store.update((database) => {
      database.carts.push(cart);
    });
    return cart;
  }

  async addItem(input: AddCartItemInput): Promise<CartItem> {
    const now = new Date().toISOString();
    let item: CartItem | null = null;
    await this.store.update((database) => {
      const existing = database.cartItems.find((cartItem) => cartItem.cartId === input.cartId && cartItem.productId === input.productId && cartItem.unitId === input.unitId);
      if (existing) {
        existing.quantity += input.quantity;
        existing.unitPriceSnapshot = input.unitPriceSnapshot ?? existing.unitPriceSnapshot;
        existing.effectiveUnitPriceSnapshot = input.effectiveUnitPriceSnapshot ?? existing.effectiveUnitPriceSnapshot;
        existing.updatedAt = now;
        item = existing;
      } else {
        item = { ...input, id: createId("cart-item"), createdAt: now, updatedAt: now };
        database.cartItems.push(item);
      }
      touchCart(database.carts, input.cartId, now);
    });

    if (!item) {
      throw new Error("Cart item not found");
    }

    return item;
  }

  async updateQuantity(cartItemId: EntityId, quantity: number): Promise<CartItem> {
    let updated: CartItem | null = null;
    await this.store.update((database) => {
      const item = database.cartItems.find((cartItem) => cartItem.id === cartItemId);
      if (!item) {
        throw new Error("Cart item not found");
      }
      item.quantity = quantity;
      item.updatedAt = new Date().toISOString();
      updated = item;
      touchCart(database.carts, item.cartId, item.updatedAt);
    });

    if (!updated) {
      throw new Error("Cart item not found");
    }

    return updated;
  }

  async removeItem(cartItemId: EntityId): Promise<void> {
    await this.store.update((database) => {
      const item = database.cartItems.find((cartItem) => cartItem.id === cartItemId);
      database.cartItems = database.cartItems.filter((cartItem) => cartItem.id !== cartItemId);
      if (item) {
        touchCart(database.carts, item.cartId, new Date().toISOString());
      }
    });
  }

  async clear(cartId: EntityId): Promise<void> {
    await this.store.update((database) => {
      database.cartItems = database.cartItems.filter((cartItem) => cartItem.cartId !== cartId);
      touchCart(database.carts, cartId, new Date().toISOString());
    });
  }
}

function touchCart(carts: Cart[], cartId: EntityId, updatedAt: string): void {
  const cart = carts.find((item) => item.id === cartId);
  if (cart) {
    cart.updatedAt = updatedAt;
  }
}
