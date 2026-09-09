import type {
  Address,
  Branch,
  BusinessConfig,
  Cart,
  CartItem,
  Category,
  Customer,
  CustomerPaymentMethod,
  Favorite,
  Notification,
  Order,
  OrderItem,
  Payment,
  Product,
  ProductAvailability,
  ProductMedia,
  ProductPrice,
  Promotion,
  Unit,
  User,
} from "@/core";

export type MockDatabase = {
  version: number;
  users: User[];
  customers: Customer[];
  products: Product[];
  productPrices: ProductPrice[];
  productMedia: ProductMedia[];
  categories: Category[];
  units: Unit[];
  promotions: Promotion[];
  productAvailability: ProductAvailability[];
  addresses: Address[];
  favorites: Favorite[];
  carts: Cart[];
  cartItems: CartItem[];
  customerPaymentMethods: CustomerPaymentMethod[];
  payments: Payment[];
  orders: Order[];
  orderItems: OrderItem[];
  notifications: Notification[];
  branches: Branch[];
  businessConfig: BusinessConfig;
};
