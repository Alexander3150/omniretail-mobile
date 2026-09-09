import { useCallback, useEffect, useState } from "react";

import type { Order } from "@/core";
import { useRepositories } from "@/infrastructure";
import { useSession } from "@/modules/auth";

export function useOrders() {
  const { businessConfigRepository, orderRepository } = useRepositories();
  const { session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currency, setCurrency] = useState("GTQ");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) {
      return;
    }
    const business = await businessConfigRepository.getCurrent();
    setCurrency(business.currency);
    setOrders(await orderRepository.getByCustomer(session.tenantId, session.customerId));
    setIsLoading(false);
  }, [businessConfigRepository, orderRepository, session]);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  return { currency, isLoading, orders, reload: load };
}
