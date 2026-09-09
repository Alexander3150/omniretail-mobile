import { useSessionContext } from "../session/SessionProvider";

export function useSession() {
  return useSessionContext();
}
