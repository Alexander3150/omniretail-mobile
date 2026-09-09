import type { Session } from "@/core";

import type { KeyValueStorage } from "./types";

export const SESSION_STORAGE_KEY = "omniretail-mobile.session.v1";

export class SessionStorage {
  constructor(private readonly storage: KeyValueStorage) {}

  async getCurrentSession(): Promise<Session | null> {
    const rawSession = await this.storage.get(SESSION_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as Session;
    } catch {
      await this.clearSession();
      return null;
    }
  }

  async saveSession(session: Session): Promise<void> {
    await this.storage.set(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  async clearSession(): Promise<void> {
    await this.storage.remove(SESSION_STORAGE_KEY);
  }
}
