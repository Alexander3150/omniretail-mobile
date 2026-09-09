import { useCallback, useEffect, useState } from "react";

import { useRepositories } from "@/infrastructure";
import { createProductCardViewModel, type ProductCardViewModel } from "@/modules/catalog";
import { useCommerceCatalog } from "@/modules/catalog";
import { useSession } from "@/modules/auth";

export function useFavorites() {
  const repositories = useRepositories();
  const { session } = useSession();
  const { addToCart } = useCommerceCatalog();
  const [items, setItems] = useState<ProductCardViewModel[]>([]);
  const [currency, setCurrency] = useState("GTQ");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) {
      return;
    }
    setIsLoading(true);
    const business = await repositories.businessConfigRepository.getCurrent();
    const favorites = await repositories.favoriteRepository.getByCustomer(session.tenantId, session.customerId);
    const products = (await Promise.all(favorites.map((favorite) => repositories.productRepository.getById(favorite.productId)))).filter((product) => !!product);
    const promotions = await repositories.promotionRepository.getActive(session.tenantId);
    const media = (await Promise.all(products.map((product) => repositories.productMediaRepository.getByProduct(product.id)))).flat();
    const availability = (await Promise.all(products.map((product) => repositories.productAvailabilityRepository.getByProduct(session.tenantId, product.id)))).flat();
    setCurrency(business.currency);
    setItems(products.map((product) => createProductCardViewModel(product, media, promotions, availability, favorites.map((favorite) => favorite.productId))));
    setIsLoading(false);
  }, [repositories, session]);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  async function toggleFavorite(productId: string) {
    if (!session) {
      return;
    }
    await repositories.favoriteRepository.remove(session.tenantId, session.customerId, productId);
    await load();
  }

  return { addToCart, currency, isLoading, items, reload: load, toggleFavorite };
}
