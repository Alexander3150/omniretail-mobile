import { useCallback, useEffect, useState } from "react";

import { useRepositories } from "@/infrastructure";
import { calculatePrice } from "@/modules/catalog";
import { useSession } from "@/modules/auth";

import { calculateCartTotals, type CartLine, type CartTotals } from "../application/cartTotals";

type CartState = {
  cartId: string | null;
  currency: string;
  lines: CartLine[];
  totals: CartTotals;
  isLoading: boolean;
  error: string | null;
};

const emptyTotals = calculateCartTotals([]);

export function useCart() {
  const repositories = useRepositories();
  const { session } = useSession();
  const [state, setState] = useState<CartState>({ cartId: null, currency: "GTQ", lines: [], totals: emptyTotals, isLoading: true, error: null });

  const load = useCallback(async () => {
    if (!session) {
      return;
    }

    setState((current) => ({ ...current, isLoading: true, error: null }));
    try {
      const business = await repositories.businessConfigRepository.getCurrent();
      const cart = await repositories.cartRepository.getOrCreate(session.tenantId, session.customerId);
      const cartItems = await repositories.cartRepository.getItems(cart.id);
      const promotions = await repositories.promotionRepository.getActive(session.tenantId);
      const linesWithMissingProducts: (CartLine | null)[] = (
        await Promise.all(
          cartItems.map(async (item) => {
            const product = await repositories.productRepository.getById(item.productId);
            if (!product) {
              return null;
            }
            const media = await repositories.productMediaRepository.getByProduct(product.id);
            const price = calculatePrice(product, promotions);
            const unitPrice = item.unitPriceSnapshot ?? price.basePrice;
            const effectiveUnitPrice = item.effectiveUnitPriceSnapshot ?? price.effectivePrice;
            return {
              id: item.id,
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              imageUrl: media.find((image) => image.isPrimary)?.url,
              quantity: item.quantity,
              unitPrice,
              effectiveUnitPrice,
              lineSubtotal: effectiveUnitPrice * item.quantity,
            };
          }),
        )
      );
      const lines = linesWithMissingProducts.filter((line): line is CartLine => !!line);

      setState({ cartId: cart.id, currency: business.currency, lines, totals: calculateCartTotals(lines), isLoading: false, error: null });
    } catch {
      setState((current) => ({ ...current, isLoading: false, error: "No se pudo cargar el carrito." }));
    }
  }, [repositories, session]);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      await repositories.cartRepository.removeItem(itemId);
    } else {
      const line = state.lines.find((item) => item.id === itemId);
      if (!session || !line) {
        return;
      }
      const availability = await repositories.productAvailabilityRepository.getByProduct(session.tenantId, line.productId);
      const availableQuantity = availability.reduce((sum, item) => sum + item.availableQuantity, 0);
      await repositories.cartRepository.updateQuantity(itemId, Math.min(quantity, availableQuantity));
    }
    await load();
  }

  async function removeItem(itemId: string) {
    await repositories.cartRepository.removeItem(itemId);
    await load();
  }

  async function clear() {
    if (state.cartId) {
      await repositories.cartRepository.clear(state.cartId);
      await load();
    }
  }

  return { ...state, clear, reload: load, removeItem, updateQuantity };
}
