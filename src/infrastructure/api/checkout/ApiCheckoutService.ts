import type { ApiClient } from "../ApiClient";

import type {
  ApiStorefrontCheckoutRequest,
  ApiStorefrontCheckoutResponse,
} from "./types";

export class ApiCheckoutService {
  constructor(
    private readonly client: ApiClient,
    private readonly tenantSlug: string,
  ) {}

  checkout(
    request: ApiStorefrontCheckoutRequest,
    idempotencyKey: string,
  ): Promise<ApiStorefrontCheckoutResponse> {
    if (!idempotencyKey.trim()) {
      throw new Error("Idempotency key is required");
    }

    return this.client.post<ApiStorefrontCheckoutResponse>(
      `/public/${encodeURIComponent(this.tenantSlug)}/checkout`,
      request,
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      },
    );
  }
}
