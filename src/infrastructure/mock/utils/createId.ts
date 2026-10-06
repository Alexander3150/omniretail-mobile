let idCounter = 0;

export function createId(prefix: string): string {
  const crypto = globalThis.crypto;

  // Se invoca como método: desacoplado de `crypto`, el navegador lanza "Illegal invocation".
  if (typeof crypto?.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}
