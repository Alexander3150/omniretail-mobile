export type ApiStorefrontCheckoutItemRequest = {
  productId: string;
  quantity: number;
};

export type ApiStorefrontCheckoutRequest = {
  items: ApiStorefrontCheckoutItemRequest[];
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  department?: string | null;
  references?: string | null;
  cardholderName: string;
  cardLastFour: string;
};

export type ApiStorefrontCheckoutItem = {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  promotionId?: string | null;
};

export type ApiStorefrontCheckoutResponse = {
  orderNumber: string;
  trackingToken: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  guestTrackingEnabled: boolean;
  hasInventoryReservations: boolean;
  deliveryAddress: Record<string, unknown>;
  confirmationEmailSent: boolean;
  items: ApiStorefrontCheckoutItem[];
};
