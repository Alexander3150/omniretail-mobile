import { DEMO_RESET_CODE, demoCredentials, hashDemoPassword, type MockCredentialSnapshot } from "../seeds";
import { MOCK_CREDENTIALS_STORAGE_KEY } from "../database";
import type { KeyValueStorage } from "../../storage";

export class MockCredentialStore {
  constructor(private readonly storage: KeyValueStorage) {}

  async initialize(): Promise<MockCredentialSnapshot> {
    const persisted = await this.storage.get(MOCK_CREDENTIALS_STORAGE_KEY);

    if (!persisted) {
      return this.resetToDemoCredentials();
    }

    try {
      const parsed = JSON.parse(persisted) as Partial<MockCredentialSnapshot>;
      const snapshot = { credentials: Array.isArray(parsed.credentials) ? parsed.credentials : [] };
      await this.persist(snapshot);
      return snapshot;
    } catch {
      return this.resetToDemoCredentials();
    }
  }

  async findByEmail(email: string) {
    const snapshot = await this.initialize();
    return snapshot.credentials.find((credential) => credential.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async verifyPassword(email: string, password: string): Promise<boolean> {
    const credential = await this.findByEmail(email);
    return credential?.passwordHash === hashDemoPassword(password);
  }

  async upsertCredential(userId: string, email: string, password: string): Promise<void> {
    const snapshot = await this.initialize();
    const normalizedEmail = email.toLowerCase();
    const nextCredential = { userId, email: normalizedEmail, passwordHash: hashDemoPassword(password) };
    const existingIndex = snapshot.credentials.findIndex((credential) => credential.email.toLowerCase() === normalizedEmail);

    if (existingIndex >= 0) {
      snapshot.credentials[existingIndex] = nextCredential;
    } else {
      snapshot.credentials.push(nextCredential);
    }

    await this.persist(snapshot);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const snapshot = await this.initialize();
    const credential = snapshot.credentials.find((item) => item.userId === userId);

    if (!credential || credential.passwordHash !== hashDemoPassword(currentPassword)) {
      return false;
    }

    credential.passwordHash = hashDemoPassword(newPassword);
    delete credential.pendingResetCode;
    await this.persist(snapshot);
    return true;
  }

  async requestReset(email: string): Promise<void> {
    const snapshot = await this.initialize();
    const credential = snapshot.credentials.find((item) => item.email.toLowerCase() === email.toLowerCase());

    if (credential) {
      credential.pendingResetCode = DEMO_RESET_CODE;
      await this.persist(snapshot);
    }
  }

  async verifyResetCode(email: string, code: string): Promise<boolean> {
    const credential = await this.findByEmail(email);
    return credential?.pendingResetCode === code;
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<boolean> {
    const snapshot = await this.initialize();
    const credential = snapshot.credentials.find((item) => item.email.toLowerCase() === email.toLowerCase());

    if (!credential || credential.pendingResetCode !== code) {
      return false;
    }

    credential.passwordHash = hashDemoPassword(newPassword);
    delete credential.pendingResetCode;
    await this.persist(snapshot);
    return true;
  }

  async resetToDemoCredentials(): Promise<MockCredentialSnapshot> {
    const snapshot = JSON.parse(JSON.stringify(demoCredentials)) as MockCredentialSnapshot;
    await this.persist(snapshot);
    return snapshot;
  }

  private async persist(snapshot: MockCredentialSnapshot): Promise<void> {
    await this.storage.set(MOCK_CREDENTIALS_STORAGE_KEY, JSON.stringify(snapshot));
  }
}
