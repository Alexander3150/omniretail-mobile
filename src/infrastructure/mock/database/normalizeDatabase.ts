import { createMockDatabase } from "./createMockDatabase";
import type { MockDatabase } from "./MockDatabase";
import { MOCK_DATABASE_VERSION } from "./storageKeys";

type PartialMockDatabase = Partial<MockDatabase> & { version?: number };

export function normalizeDatabase(input: unknown): MockDatabase {
  const fallback = createMockDatabase();

  if (!isRecord(input)) {
    return fallback;
  }

  const partial = input as PartialMockDatabase;

  return {
    version: MOCK_DATABASE_VERSION,
    users: normalizeArray(partial.users, fallback.users),
    customers: normalizeArray(partial.customers, fallback.customers),
    products: normalizeArray(partial.products, fallback.products),
    productPrices: normalizeArray(partial.productPrices, fallback.productPrices),
    productMedia: normalizeArray(partial.productMedia, fallback.productMedia),
    categories: normalizeArray(partial.categories, fallback.categories),
    units: normalizeArray(partial.units, fallback.units),
    promotions: normalizeArray(partial.promotions, fallback.promotions),
    productAvailability: normalizeArray(partial.productAvailability, fallback.productAvailability),
    addresses: normalizeArray(partial.addresses, fallback.addresses),
    favorites: normalizeArray(partial.favorites, fallback.favorites),
    carts: normalizeArray(partial.carts, fallback.carts),
    cartItems: normalizeArray(partial.cartItems, fallback.cartItems),
    customerPaymentMethods: normalizeArray(partial.customerPaymentMethods, fallback.customerPaymentMethods),
    payments: normalizeArray(partial.payments, fallback.payments),
    orders: normalizeArray(partial.orders, fallback.orders),
    orderItems: normalizeArray(partial.orderItems, fallback.orderItems),
    notifications: normalizeArray(partial.notifications, fallback.notifications),
    branches: normalizeArray(partial.branches, fallback.branches),
    businessConfig: isRecord(partial.businessConfig) ? (partial.businessConfig as MockDatabase["businessConfig"]) : fallback.businessConfig,
  };
}

function normalizeArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
