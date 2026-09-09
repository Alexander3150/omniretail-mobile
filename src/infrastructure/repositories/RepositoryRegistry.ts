import type {
  AddressRepository,
  AuthRepository,
  BranchRepository,
  BusinessConfigRepository,
  CartRepository,
  CategoryRepository,
  CustomerPaymentMethodRepository,
  CustomerRepository,
  FavoriteRepository,
  NotificationRepository,
  OrderRepository,
  PaymentRepository,
  ProductAvailabilityRepository,
  ProductMediaRepository,
  ProductRepository,
  PromotionRepository,
} from "@/core";

import { MockCredentialStore } from "../mock/auth";
import { MockDatabaseStore } from "../mock/database";
import {
  MockAddressRepository,
  MockAuthRepository,
  MockBranchRepository,
  MockBusinessConfigRepository,
  MockCartRepository,
  MockCategoryRepository,
  MockCustomerPaymentMethodRepository,
  MockCustomerRepository,
  MockFavoriteRepository,
  MockNotificationRepository,
  MockOrderRepository,
  MockPaymentRepository,
  MockProductAvailabilityRepository,
  MockProductMediaRepository,
  MockProductRepository,
  MockPromotionRepository,
} from "../mock/repositories";
import { AsyncStorageKeyValueStorage, SecureKeyValueStorage, SessionStorage } from "../storage";

export type RepositoryRegistry = {
  authRepository: AuthRepository;
  customerRepository: CustomerRepository;
  productRepository: ProductRepository;
  productMediaRepository: ProductMediaRepository;
  categoryRepository: CategoryRepository;
  promotionRepository: PromotionRepository;
  productAvailabilityRepository: ProductAvailabilityRepository;
  addressRepository: AddressRepository;
  favoriteRepository: FavoriteRepository;
  cartRepository: CartRepository;
  orderRepository: OrderRepository;
  paymentRepository: PaymentRepository;
  customerPaymentMethodRepository: CustomerPaymentMethodRepository;
  notificationRepository: NotificationRepository;
  branchRepository: BranchRepository;
  businessConfigRepository: BusinessConfigRepository;
  databaseStore: MockDatabaseStore;
  resetToDemoData(): Promise<void>;
};

let registry: RepositoryRegistry | null = null;

export function getRepositoryRegistry(): RepositoryRegistry {
  registry ??= createRepositoryRegistry();
  return registry;
}

export function createRepositoryRegistry(): RepositoryRegistry {
  const databaseStorage = new AsyncStorageKeyValueStorage();
  const secureStorage = new SecureKeyValueStorage();
  const databaseStore = new MockDatabaseStore(databaseStorage);
  const credentialStore = new MockCredentialStore(secureStorage);
  const sessionStorage = new SessionStorage(secureStorage);

  return {
    authRepository: new MockAuthRepository(databaseStore, credentialStore, sessionStorage),
    customerRepository: new MockCustomerRepository(databaseStore),
    productRepository: new MockProductRepository(databaseStore),
    productMediaRepository: new MockProductMediaRepository(databaseStore),
    categoryRepository: new MockCategoryRepository(databaseStore),
    promotionRepository: new MockPromotionRepository(databaseStore),
    productAvailabilityRepository: new MockProductAvailabilityRepository(databaseStore),
    addressRepository: new MockAddressRepository(databaseStore),
    favoriteRepository: new MockFavoriteRepository(databaseStore),
    cartRepository: new MockCartRepository(databaseStore),
    orderRepository: new MockOrderRepository(databaseStore),
    paymentRepository: new MockPaymentRepository(databaseStore),
    customerPaymentMethodRepository: new MockCustomerPaymentMethodRepository(databaseStore),
    notificationRepository: new MockNotificationRepository(databaseStore),
    branchRepository: new MockBranchRepository(databaseStore),
    businessConfigRepository: new MockBusinessConfigRepository(databaseStore),
    databaseStore,
    async resetToDemoData() {
      await databaseStore.resetToDemoData();
      await credentialStore.resetToDemoCredentials();
      await sessionStorage.clearSession();
    },
  };
}
