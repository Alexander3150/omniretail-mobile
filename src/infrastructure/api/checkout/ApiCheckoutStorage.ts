import { AsyncStorageKeyValueStorage } from "@/infrastructure/storage";

import type {
  ApiStorefrontCheckoutRequest,
  ApiStorefrontCheckoutResponse,
} from "./types";

const RECEIPTS_KEY = "omniretail-mobile.api-checkout-receipts.v1";
const PENDING_KEY = "omniretail-mobile.api-checkout-pending.v1";

export type ApiCheckoutReceipt = ApiStorefrontCheckoutResponse & {
  savedAt: string;
};

type PendingCheckout = {
  idempotencyKey: string;
  fingerprint: string;
};

export class ApiCheckoutStorage {
  private readonly storage = new AsyncStorageKeyValueStorage();

  async getReceipts(): Promise<ApiCheckoutReceipt[]> {
    const raw = await this.storage.get(RECEIPTS_KEY);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async saveReceipt(
    response: ApiStorefrontCheckoutResponse,
  ): Promise<ApiCheckoutReceipt> {
    const receipt: ApiCheckoutReceipt = {
      ...response,
      savedAt: new Date().toISOString(),
    };

    const current = await this.getReceipts();
    const withoutDuplicate = current.filter(
      (item) => item.orderNumber !== response.orderNumber,
    );

    await this.storage.set(
      RECEIPTS_KEY,
      JSON.stringify([receipt, ...withoutDuplicate]),
    );

    return receipt;
  }

  async getReceipt(
    orderNumber: string,
  ): Promise<ApiCheckoutReceipt | null> {
    const receipts = await this.getReceipts();

    return (
      receipts.find((item) => item.orderNumber === orderNumber) ?? null
    );
  }

  async resolveIdempotencyKey(
    request: ApiStorefrontCheckoutRequest,
  ): Promise<string> {
    const fingerprint = createRequestFingerprint(request);
    const raw = await this.storage.get(PENDING_KEY);

    if (raw) {
      try {
        const pending = JSON.parse(raw) as PendingCheckout;

        if (
          pending.fingerprint === fingerprint &&
          pending.idempotencyKey
        ) {
          return pending.idempotencyKey;
        }
      } catch {
        // Se reemplaza el valor local inválido.
      }
    }

    const idempotencyKey = createIdempotencyKey();

    await this.storage.set(
      PENDING_KEY,
      JSON.stringify({
        idempotencyKey,
        fingerprint,
      } satisfies PendingCheckout),
    );

    return idempotencyKey;
  }

  async clearPending(): Promise<void> {
    await this.storage.remove(PENDING_KEY);
  }
}

function createRequestFingerprint(
  request: ApiStorefrontCheckoutRequest,
): string {
  const normalized = {
    ...request,
    items: [...request.items]
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))
      .sort((left, right) =>
        left.productId.localeCompare(right.productId),
      ),
  };

  return JSON.stringify(normalized);
}

function createIdempotencyKey(): string {
  const randomUUID = globalThis.crypto?.randomUUID;

  if (randomUUID) {
    return randomUUID.call(globalThis.crypto);
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (character) => {
      const random = Math.floor(Math.random() * 16);
      const value = character === "x" ? random : (random & 0x3) | 0x8;

      return value.toString(16);
    },
  );
}
