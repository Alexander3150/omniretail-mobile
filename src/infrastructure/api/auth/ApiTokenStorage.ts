import type { KeyValueStorage } from "../../storage";

export const API_TOKEN_STORAGE_KEY =
  "omniretail-mobile.api-token.v1";

export class ApiTokenStorage {
  constructor(private readonly storage: KeyValueStorage) {}

  async getToken(): Promise<string | null> {
    return this.storage.get(API_TOKEN_STORAGE_KEY);
  }

  async saveToken(token: string): Promise<void> {
    await this.storage.set(API_TOKEN_STORAGE_KEY, token);
  }

  async clearToken(): Promise<void> {
    await this.storage.remove(API_TOKEN_STORAGE_KEY);
  }
}
