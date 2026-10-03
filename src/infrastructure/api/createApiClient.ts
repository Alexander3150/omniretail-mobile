import { ApiClient, type ApiTokenProvider } from "./ApiClient";
import { apiConfig } from "./config";

export function createApiClient(
  getToken?: ApiTokenProvider,
  onUnauthorized?: () => Promise<void> | void,
): ApiClient {
  return new ApiClient({
    baseUrl: apiConfig.baseUrl,
    timeoutMs: apiConfig.timeoutMs,
    getToken,
    onUnauthorized,
  });
}

export const apiClient = createApiClient();
