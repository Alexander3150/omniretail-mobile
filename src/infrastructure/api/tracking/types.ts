export type ApiOrderTrackingStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "sent"
  | "delivered"
  | "cancelled";

export type ApiOrderTrackingItem = {
  sku: string;
  name: string;
  quantity: number;
  subtotal: number;
};

export type ApiOrderTrackingResponse = {
  orderNumber: string;
  status: ApiOrderTrackingStatus;
  total: number;
  items: ApiOrderTrackingItem[];
};
