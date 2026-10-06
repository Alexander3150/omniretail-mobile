import { Platform } from "react-native";

export type ApiMode = "mock" | "api";

const DEFAULT_API_MODE: ApiMode = "mock";

// El emulador de Android no ve el localhost de la computadora: lo expone en 10.0.2.2.
const ANDROID_EMULATOR_HOST = "10.0.2.2";
const LOOPBACK_HOST = /^(https?:\/\/)(localhost|127\.0\.0\.1)(?=[:/]|$)/i;

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

function trimTrailingSlashes(value: string | undefined): string {
  return value?.trim().replace(/\/+$/, "") ?? "";
}

/**
 * Resuelve la URL del backend según la plataforma:
 * - EXPO_PUBLIC_API_BASE_URL_ANDROID tiene prioridad en Android (dispositivo físico con IP LAN).
 * - Si no existe y la URL general apunta a localhost, en Android se reescribe a 10.0.2.2.
 */
function resolveBaseUrl(): string {
  const baseUrl = trimTrailingSlashes(process.env.EXPO_PUBLIC_API_BASE_URL);

  if (Platform.OS !== "android") {
    return baseUrl;
  }

  const androidBaseUrl = trimTrailingSlashes(
    process.env.EXPO_PUBLIC_API_BASE_URL_ANDROID,
  );

  if (androidBaseUrl) {
    return androidBaseUrl;
  }

  return baseUrl.replace(LOOPBACK_HOST, `$1${ANDROID_EMULATOR_HOST}`);
}

export const apiConfig = {
  mode: getApiMode(),
  baseUrl: resolveBaseUrl(),
  tenantSlug: process.env.EXPO_PUBLIC_TENANT_SLUG?.trim() ?? "",
  timeoutMs: 10_000,
} as const;

export function isApiMode(): boolean {
  return apiConfig.mode === "api";
}

/**
 * En modo API una configuración incompleta debe fallar al arrancar, no degradar
 * silenciosamente a comportamiento mock ni a errores de red difíciles de rastrear.
 */
export function assertApiConfig(): void {
  if (!isApiMode()) {
    return;
  }

  const missing = [
    !apiConfig.baseUrl ? "EXPO_PUBLIC_API_BASE_URL" : null,
    !apiConfig.tenantSlug ? "EXPO_PUBLIC_TENANT_SLUG" : null,
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `EXPO_PUBLIC_API_MODE="api" requiere ${missing.join(" y ")}. ` +
        "Revisa tu .env.local (ver .env.example) y reinicia Expo con --clear.",
    );
  }
}
