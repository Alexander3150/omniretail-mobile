import { apiClient } from "../createApiClient";
import type { ApiOrderTrackingResponse } from "./types";

export class ApiOrderTrackingService {
  async track(
    tenantSlug: string,
    trackingToken: string,
  ): Promise<ApiOrderTrackingResponse> {
    const slug = encodeURIComponent(tenantSlug);
    const token = encodeURIComponent(trackingToken);

    return apiClient.get<ApiOrderTrackingResponse>(
      `/public/${slug}/tracking/${token}`,
    );
  }
}
