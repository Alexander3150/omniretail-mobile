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
