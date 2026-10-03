import { ApiClient, type ApiTokenProvider } from "./ApiClient";
import { apiConfig } from "./config";

export function createApiClient(
  getToken?: ApiTokenProvider,
): ApiClient {
  return new ApiClient({
    baseUrl: apiConfig.baseUrl,
    timeoutMs: apiConfig.timeoutMs,
    getToken,
  });
}

export const apiClient = createApiClient();
