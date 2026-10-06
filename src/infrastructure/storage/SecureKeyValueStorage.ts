import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { AsyncStorageKeyValueStorage } from "./AsyncStorageKeyValueStorage";
import type { KeyValueStorage } from "./types";

/**
 * Keychain/Keystore en iOS y Android. expo-secure-store no existe en web, así que
 * ahí se usa AsyncStorage (localStorage): suficiente para desarrollo, no es almacenamiento seguro.
 */
export class SecureKeyValueStorage implements KeyValueStorage {
  private readonly webFallback =
    Platform.OS === "web" ? new AsyncStorageKeyValueStorage() : null;

  async get(key: string): Promise<string | null> {
    if (this.webFallback) {
      return this.webFallback.get(key);
    }

    return SecureStore.getItemAsync(key);
  }

  async set(key: string, value: string): Promise<void> {
    if (this.webFallback) {
      await this.webFallback.set(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  }

  async remove(key: string): Promise<void> {
    if (this.webFallback) {
      await this.webFallback.remove(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  }
}
