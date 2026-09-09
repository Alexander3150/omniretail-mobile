export const DEMO_RESET_CODE = "123456";

export type MockCredential = {
  userId: string;
  email: string;
  passwordHash: string;
  pendingResetCode?: string;
};

export type MockCredentialSnapshot = {
  credentials: MockCredential[];
};

export function hashDemoPassword(value: string): string {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return `demo:${(hash >>> 0).toString(16)}`;
}

export const demoCredentials: MockCredentialSnapshot = {
  credentials: [
    {
      userId: "user-demo-customer",
      email: "cliente@demo.com",
      passwordHash: hashDemoPassword("Demo1234"),
    },
  ],
};
