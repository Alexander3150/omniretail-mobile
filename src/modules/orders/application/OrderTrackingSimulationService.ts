import { NotificationType, OrderStatus, type Order } from "@/core";
import type { RepositoryRegistry } from "@/infrastructure";
import { showSystemNotification } from "@/modules/notifications";

export type AdvanceOrderStatusResult = {
  advanced: boolean;
  order: Order;
};

export async function advanceOrderStatusForDemo(repositories: RepositoryRegistry, order: Order): Promise<AdvanceOrderStatusResult> {
  const next = getNextStatus(order.status);

  if (!next) {
    return { advanced: false, order };
  }

  const updatedOrder = await repositories.orderRepository.updateStatus(order.id, next.status);
  const notificationMessage = next.message(updatedOrder.number);

  await repositories.notificationRepository.create({
    tenantId: order.tenantId,
    customerId: order.customerId,
    type: next.notificationType,
    title: next.title,
    message: notificationMessage,
    relatedOrderId: updatedOrder.id,
  });

  await showSystemNotification({
    title: next.title,
    body: notificationMessage,
    orderId: updatedOrder.id,
  });

  return { advanced: true, order: updatedOrder };
}

function getNextStatus(status: OrderStatus) {
  if (status === OrderStatus.Confirmed) {
    return {
      status: OrderStatus.Preparing,
      notificationType: NotificationType.OrderPreparing,
      title: "Pedido en preparacion",
      message: (number: string) => `Tu pedido ${number} esta siendo preparado.`,
    };
  }

  if (status === OrderStatus.Preparing) {
    return {
      status: OrderStatus.Shipped,
      notificationType: NotificationType.OrderShipped,
      title: "Pedido enviado",
      message: (number: string) => `Tu pedido ${number} salio a entrega.`,
    };
  }

  return null;
}
