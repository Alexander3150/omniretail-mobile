export type ApiErrorField = {
  field?: string;
  message?: string;
  [key: string]: unknown;
};

export type ApiErrorPayload = {
  status?: number;
  error?: string;
  code?: string;
  message?: string;
  path?: string;
  fields?: ApiErrorField[] | Record<string, unknown>;
  timestamp?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly path?: string;
  readonly fields?: ApiErrorPayload["fields"];
  readonly timestamp?: string;
  readonly payload?: ApiErrorPayload;

  constructor(
    message: string,
    options: {
      status: number;
      code?: string;
      path?: string;
      fields?: ApiErrorPayload["fields"];
      timestamp?: string;
      payload?: ApiErrorPayload;
    },
  ) {
    super(message);

    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.path = options.path;
    this.fields = options.fields;
    this.timestamp = options.timestamp;
    this.payload = options.payload;
  }
}

/**
 * Mensaje legible para la UI: prioriza los errores por campo del backend
 * (VALIDATION_ERROR) y traduce fallas de red a un texto accionable.
 */
export function getErrorMessage(
  error: unknown,
  fallback = "No se pudo completar la operación.",
): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  if (error.code === "NETWORK_ERROR") {
    return "No se pudo conectar con el servidor. Verifica que el backend esté encendido.";
  }

  if (error.code === "REQUEST_TIMEOUT") {
    return "El servidor tardó demasiado en responder.";
  }

  if (error.status === 401) {
    return "Tu sesión expiró. Inicia sesión nuevamente.";
  }

  const fieldMessages = Array.isArray(error.fields)
    ? error.fields.map((field) => field.message).filter(Boolean)
    : Object.values(error.fields ?? {}).filter(
        (value): value is string => typeof value === "string",
      );

  if (fieldMessages.length > 0) {
    return fieldMessages.join("\n");
  }

  return error.message || fallback;
}
