import { useCallback, useEffect, useState } from "react";

import type { Branch, Order, OrderItem, Payment } from "@/core";
import { isApiMode, useRepositories } from "@/infrastructure";
import type { ApiCustomerOrderResponse } from "@/infrastructure/api/account";
import { useSession } from "@/modules/auth";

import { advanceOrderStatusForDemo } from "../application/OrderTrackingSimulationService";
import { mapOrderTracking, type TrackingStep } from "../application/orderTracking";

export type OrderListItem = Order & {
  itemCount: number;
};

export type ApiOrderListStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type ApiOrderListItem = {
  id: string;
  number: string;
  createdAt: string;
  status: ApiOrderListStatus;
  total: number;
  itemCount: number;
};

export type CommerceOrderListItem = OrderListItem | ApiOrderListItem;

function normalizeApiOrderStatus(status: string): ApiOrderListStatus {
  switch (status) {
    case "pending":
      return "pending";
    case "preparing":
      return "preparing";
    case "sent":
    case "shipped":
      return "shipped";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    default:
      return "confirmed";
  }
}

// El prefijo "api:" enruta al detalle remoto (ver app/(protected)/orders/[id].tsx).
function mapApiOrderToListItem(
  order: ApiCustomerOrderResponse,
): ApiOrderListItem {
  return {
    id: `api:${order.id}`,
    number: order.orderNumber,
    createdAt: order.createdAt,
    status: normalizeApiOrderStatus(order.status),
    total: Number(order.total),
    itemCount: order.itemCount,
  };
}

export function useOrders() {
  const { apiCustomerOrderService, businessConfigRepository, orderRepository } = useRepositories();
  const { session } = useSession();
  const [orders, setOrders] = useState<CommerceOrderListItem[]>([]);
  const [currency, setCurrency] = useState("GTQ");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) {
      setOrders([]);
      setIsLoading(false);
      return;
    }
    const business = await businessConfigRepository.getCurrent();

    if (isApiMode()) {
      try {
        const apiOrders = await apiCustomerOrderService.list();

        setCurrency(business.currency);
        setOrders(apiOrders.map(mapApiOrderToListItem));
      } catch (error) {
        console.warn("No se pudo cargar el historial de pedidos:", error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const customerOrders = await orderRepository.getByCustomer(
      session.tenantId,
      session.customerId,
    );
    const ordersWithCounts = await Promise.all(
      customerOrders
        .sort((left, right) =>
          right.createdAt.localeCompare(left.createdAt),
        )
        .map(async (order) => ({
          ...order,
          itemCount: (
            await orderRepository.getItems(order.id)
          ).reduce(
            (total, item) => total + item.quantity,
            0,
          ),
        })),
    );

    setCurrency(business.currency);
    setOrders(ordersWithCounts);
    setIsLoading(false);
  }, [apiCustomerOrderService, businessConfigRepository, orderRepository, session]);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  return { currency, isLoading, orders, reload: load };
}

export function useOrder(orderId?: string) {
  const repositories = useRepositories();
  const { session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [currency, setCurrency] = useState("GTQ");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session || !orderId) {
      setOrder(null);
      setItems([]);
      setPayments([]);
      setBranch(null);
      setIsLoading(false);
      return;
    }

    const business = await repositories.businessConfigRepository.getCurrent();
    const orderWithItems = await repositories.orderRepository.getWithItems(orderId);
    const nextOrder = orderWithItems?.order ?? null;

    if (!nextOrder || nextOrder.tenantId !== session.tenantId || nextOrder.customerId !== session.customerId) {
      setOrder(null);
      setItems([]);
      setPayments([]);
      setBranch(null);
      setCurrency(business.currency);
      setIsLoading(false);
      return;
    }

    setOrder(nextOrder);
    setItems(orderWithItems?.items ?? []);
    setPayments(await repositories.paymentRepository.getByOrder(nextOrder.id));
    setBranch(nextOrder.branchId ? await repositories.branchRepository.getById(nextOrder.branchId) : null);
    setCurrency(business.currency);
    setIsLoading(false);
  }, [orderId, repositories, session]);

  const advanceForDemo = useCallback(async () => {
    if (!order) {
      return;
    }
    const result = await advanceOrderStatusForDemo(repositories, order);
    setOrder(result.order);
    await load();
  }, [load, order, repositories]);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  return { advanceForDemo, branch, currency, isLoading, items, order, payments, reload: load };
}

export function useOrderTracking(order: Order | null): TrackingStep[] {
  return order ? mapOrderTracking(order) : [];
}
