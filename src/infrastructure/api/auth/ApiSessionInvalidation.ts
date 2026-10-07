type ApiSessionInvalidationListener = () => void;

const listeners = new Set<ApiSessionInvalidationListener>();

export function subscribeToApiSessionInvalidation(
  listener: ApiSessionInvalidationListener,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function notifyApiSessionInvalidated(): void {
  for (const listener of listeners) {
    listener();
  }
}
