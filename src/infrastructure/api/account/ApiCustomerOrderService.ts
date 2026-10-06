import type { ApiClient } from "../ApiClient";
import type { ApiCheckoutReceipt } from "../checkout";
import type {
  ApiCustomerOrderDetailResponse,
  ApiCustomerOrderResponse,
  ApiPageResponse,
} from "./types";

const BASE_PATH = "/customer/orders";
const PAGE_SIZE = 50;

/** Historial de pedidos e-commerce del cliente autenticado. */
export class ApiCustomerOrderService {
  constructor(private readonly apiClient: ApiClient) {}

  async list(): Promise<ApiCustomerOrderResponse[]> {
    const response = await this.apiClient.get<
      ApiPageResponse<ApiCustomerOrderResponse>
    >(`${BASE_PATH}?page=0&size=${PAGE_SIZE}&sort=createdAt,desc`);

    return response.items;
  }

  async getById(id: string): Promise<ApiCustomerOrderDetailResponse> {
    return this.apiClient.get<ApiCustomerOrderDetailResponse>(
      `${BASE_PATH}/${encodeURIComponent(id)}`,
    );
  }

  /**
   * Adapta el detalle del backend al recibo que ya consume la pantalla de detalle,
   * para que pedidos del historial y recibos locales de checkout compartan la misma vista.
   */
  async getReceipt(id: string): Promise<ApiCheckoutReceipt> {
    const detail = await this.getById(id);

    return {
      orderNumber: detail.orderNumber,
      trackingToken: detail.trackingToken ?? "",
      total: detail.total,
      orderStatus: detail.status,
      paymentStatus: detail.payment?.status ?? "pending",
      guestTrackingEnabled: true,
      hasInventoryReservations: false,
      deliveryAddress: { ...(detail.deliveryAddress ?? {}) },
      confirmationEmailSent: false,
      items: detail.items.map((item) => ({
        sku: item.sku,
        name: item.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discount: 0,
        subtotal: Number(item.subtotal),
        promotionId: null,
      })),
      savedAt: detail.createdAt,
    };
  }
}
