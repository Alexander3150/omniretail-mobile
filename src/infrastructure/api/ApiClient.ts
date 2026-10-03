import { ApiError, type ApiErrorPayload } from "./ApiError";

export type ApiTokenProvider = () => Promise<string | null>;

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  timeoutMs?: number;
};

type ApiClientOptions = {
  baseUrl: string;
  timeoutMs?: number;
  getToken?: ApiTokenProvider;
};

export class ApiClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly getToken?: ApiTokenProvider;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs ?? 10_000;
    this.getToken = options.getToken;
  }

  async request<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new ApiError(
        "EXPO_PUBLIC_API_BASE_URL no está configurada.",
        {
          status: 0,
          code: "API_BASE_URL_MISSING",
        },
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      options.timeoutMs ?? this.timeoutMs,
    );

    try {
      const headers = new Headers(options.headers);
      headers.set("Accept", "application/json");

      if (options.body !== undefined) {
        headers.set("Content-Type", "application/json");
      }

      const token = this.getToken ? await this.getToken() : null;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const response = await fetch(
        `${this.baseUrl}/${path.replace(/^\/+/, "")}`,
        {
          ...options,
          headers,
          body:
            options.body === undefined
              ? undefined
              : JSON.stringify(options.body),
          signal: controller.signal,
        },
      );

      const text = await response.text();
      const payload = this.parseResponseBody(text);

      if (!response.ok) {
        throw this.createApiError(response, payload);
      }

      return payload as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError("La solicitud tardó demasiado tiempo.", {
          status: 0,
          code: "REQUEST_TIMEOUT",
        });
      }

      throw new ApiError("No se pudo conectar con el servidor.", {
        status: 0,
        code: "NETWORK_ERROR",
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  get<T>(
    path: string,
    options: Omit<ApiRequestOptions, "method" | "body"> = {},
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "GET",
    });
  }

  post<T>(
    path: string,
    body?: unknown,
    options: Omit<ApiRequestOptions, "method" | "body"> = {},
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body,
    });
  }

  private parseResponseBody(text: string): unknown {
    if (!text) {
      return undefined;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private createApiError(
    response: Response,
    payload: unknown,
  ): ApiError {
    const apiPayload = this.isApiErrorPayload(payload)
      ? payload
      : undefined;

    return new ApiError(
      apiPayload?.message ||
        `La solicitud falló con estado ${response.status}.`,
      {
        status: response.status,
        code: apiPayload?.code,
        path: apiPayload?.path,
        fields: apiPayload?.fields,
        timestamp: apiPayload?.timestamp,
        payload: apiPayload,
      },
    );
  }

  private isApiErrorPayload(
    payload: unknown,
  ): payload is ApiErrorPayload {
    return (
      typeof payload === "object" &&
      payload !== null &&
      !Array.isArray(payload)
    );
  }
}
