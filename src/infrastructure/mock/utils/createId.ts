let idCounter = 0;

export function createId(prefix: string): string {
  const randomUUID = globalThis.crypto?.randomUUID;

  if (randomUUID) {
    return `${prefix}-${randomUUID()}`;
  }

  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}
