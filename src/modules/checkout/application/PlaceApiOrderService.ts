import {
  ApiCheckoutStorage,
  ApiError,
  isApiMode,
  type ApiCheckoutReceipt,
  type ApiStorefrontCheckoutRequest,
  type RepositoryRegistry,
} from "@/infrastructure";

import { NotificationType } from "@/core";
import { showSystemNotification } from "@/modules/notifications/services/systemNotifications";

import type { CheckoutSelection } from "../context/CheckoutProvider";

export type ApiPlaceOrderResult = {
  mode: "api";
  receipt: ApiCheckoutReceipt;
};

const checkoutStorage = new ApiCheckoutStorage();

export async function placeApiOrder(
  repositories: RepositoryRegistry,
  session: { tenantId: string; customerId: string },
  selection: CheckoutSelection,
): Promise<ApiPlaceOrderResult> {
  if (!isApiMode()) {
    throw new Error("API checkout is only available in API mode.");
  }

  validateSelection(selection);

  const cart = await repositories.cartRepository.getOrCreate(
    session.tenantId,
    session.customerId,
  );

  const cartItems = await repositories.cartRepository.getItems(cart.id);

  if (cartItems.length === 0) {
    throw new Error("El carrito está vacío.");
  }

  const request: ApiStorefrontCheckoutRequest = {
    items: cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    fullName: selection.fullName.trim(),
    email: selection.email.trim().toLowerCase(),
    phone: selection.contactPhone.trim(),
    addressLine1: selection.addressLine1.trim(),
    addressLine2: optionalText(selection.addressLine2),
    city: selection.city.trim(),
    department: optionalText(selection.department),
    references: optionalText(selection.references),
    cardholderName: selection.cardholderName.trim(),
    cardLastFour: selection.cardLastFour.trim(),
  };

  const idempotencyKey =
    await checkoutStorage.resolveIdempotencyKey(request);

  try {
    const response = await repositories.apiCheckoutService.checkout(
      request,
      idempotencyKey,
    );

    const receipt = await checkoutStorage.saveReceipt(response);

    const notificationTitle = "Pedido confirmado";
    const notificationMessage = `Tu pedido ${receipt.orderNumber} fue confirmado.`;

    await repositories.notificationRepository.create({
      tenantId: session.tenantId,
      customerId: session.customerId,
      type: NotificationType.OrderConfirmed,
      title: notificationTitle,
      message: notificationMessage,
    });

    await showSystemNotification({
      title: notificationTitle,
      body: notificationMessage,
    });

    await repositories.cartRepository.clear(cart.id);
    await checkoutStorage.clearPending();

    return {
      mode: "api",
      receipt,
    };
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.code === "IDEMPOTENCY_KEY_REUSED"
    ) {
      await checkoutStorage.clearPending();
    }

    throw error;
  }
}

export function getApiCheckoutReceipt(
  orderNumber: string,
): Promise<ApiCheckoutReceipt | null> {
  return checkoutStorage.getReceipt(orderNumber);
}

function validateSelection(selection: CheckoutSelection): void {
  if (!selection.fullName.trim()) {
    throw new Error("Ingresa el nombre completo.");
  }

  if (!selection.email.trim()) {
    throw new Error("Ingresa el correo electrónico.");
  }

  if (!/^[0-9]{8}$/.test(selection.contactPhone.trim())) {
    throw new Error("El teléfono debe tener 8 dígitos.");
  }

  if (!selection.addressLine1.trim()) {
    throw new Error("Ingresa la dirección de entrega.");
  }

  if (!selection.city.trim()) {
    throw new Error("Ingresa la ciudad.");
  }

  if (!selection.cardholderName.trim()) {
    throw new Error("Ingresa el nombre del titular.");
  }

  if (!/^[0-9]{4}$/.test(selection.cardLastFour.trim())) {
    throw new Error("Ingresa únicamente los últimos 4 dígitos.");
  }
}

function optionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
