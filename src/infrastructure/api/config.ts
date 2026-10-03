export type ApiMode = "mock" | "api";

const DEFAULT_API_MODE: ApiMode = "mock";

function getApiMode(): ApiMode {
  const value = process.env.EXPO_PUBLIC_API_MODE;

  if (!value) {
    return DEFAULT_API_MODE;
  }

  if (value !== "mock" && value !== "api") {
    console.warn(
      `EXPO_PUBLIC_API_MODE="${value}" no es válido. Se usará "${DEFAULT_API_MODE}".`,
    );
    return DEFAULT_API_MODE;
  }

  return value;
}

export const apiConfig = {
  mode: getApiMode(),
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "",
  tenantSlug: process.env.EXPO_PUBLIC_TENANT_SLUG?.trim() ?? "",
  timeoutMs: 10_000,
} as const;

export function isApiMode(): boolean {
  return apiConfig.mode === "api";
}
