import { useCallback, useEffect, useState } from "react";

import type { Category } from "@/core";
import { useRepositories } from "@/infrastructure";
import { useSession } from "@/modules/auth";

import { createProductCardViewModel, type ProductCardViewModel } from "../application/productViewModels";

type CatalogState = {
  businessName: string;
  currency: string;
  categories: Category[];
  products: ProductCardViewModel[];
  isLoading: boolean;
  error: string | null;
};

export function useCommerceCatalog(categoryId?: string, query = "") {
  const repositories = useRepositories();
  const { session } = useSession();
  const [state, setState] = useState<CatalogState>({ businessName: "", currency: "GTQ", categories: [], products: [], isLoading: true, error: null });

  const load = useCallback(async () => {
    if (!session) {
      return;
    }

    setState((current) => ({ ...current, isLoading: true, error: null }));
    try {
      const business = await repositories.businessConfigRepository.getCurrent();
      const categories = await repositories.categoryRepository.getAll(session.tenantId);
      const products = query.trim()
        ? await repositories.productRepository.search({ tenantId: session.tenantId, query, categoryId })
        : categoryId
          ? await repositories.productRepository.getByCategory(session.tenantId, categoryId)
          : await repositories.productRepository.getAll(session.tenantId);
      const promotions = await repositories.promotionRepository.getActive(session.tenantId);
      const favorites = await repositories.favoriteRepository.getByCustomer(session.tenantId, session.customerId);
      const media = (await Promise.all(products.map((product) => repositories.productMediaRepository.getByProduct(product.id)))).flat();
      const availability = (await Promise.all(products.map((product) => repositories.productAvailabilityRepository.getByProduct(session.tenantId, product.id)))).flat();
      const favoriteIds = favorites.map((favorite) => favorite.productId);

      setState({
        businessName: business.name,
        currency: business.currency,
        categories,
        products: products.map((product) => createProductCardViewModel(product, media, promotions, availability, favoriteIds)),
        isLoading: false,
        error: null,
      });
    } catch {
      setState((current) => ({ ...current, isLoading: false, error: "No se pudo cargar el catalogo." }));
    }
  }, [categoryId, query, repositories, session]);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  async function toggleFavorite(productId: string) {
    if (!session) {
      return;
    }

    const exists = await repositories.favoriteRepository.isFavorite(session.tenantId, session.customerId, productId);
    if (exists) {
      await repositories.favoriteRepository.remove(session.tenantId, session.customerId, productId);
    } else {
      await repositories.favoriteRepository.add({ tenantId: session.tenantId, customerId: session.customerId, productId, createdAt: new Date().toISOString() });
    }
    await load();
  }

  async function addToCart(productId: string) {
    if (!session) {
      return;
    }

    const product = await repositories.productRepository.getById(productId);
    if (!product) {
      return;
    }

    const availability = await repositories.productAvailabilityRepository.getByProduct(session.tenantId, product.id);
    const availableQuantity = availability.reduce((sum, item) => sum + item.availableQuantity, 0);
    const cart = await repositories.cartRepository.getOrCreate(session.tenantId, session.customerId);
    const cartItems = await repositories.cartRepository.getItems(cart.id);
    const currentQuantity = cartItems
      .filter((item) => item.cartId === cart.id && item.productId === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (availableQuantity <= 0 || currentQuantity >= availableQuantity) {
      return;
    }

    const promotions = await repositories.promotionRepository.getByProduct(session.tenantId, product.id);
    const viewModel = createProductCardViewModel(product, [], promotions, availability, []);
    await repositories.cartRepository.addItem({
      cartId: cart.id,
      productId: product.id,
      quantity: 1,
      unitId: product.unitId,
      unitPriceSnapshot: viewModel.price.basePrice,
      effectiveUnitPriceSnapshot: viewModel.price.effectivePrice,
    });
    await load();
  }

  return { ...state, addToCart, reload: load, toggleFavorite };
}
