import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { Customer, LoginInput, RegisterCustomerInput, Session } from "@/core";
import { useRepositories } from "@/infrastructure";

type SessionContextValue = {
  session: Session | null;
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login(input: LoginInput): Promise<void>;
  register(input: Omit<RegisterCustomerInput, "tenantId">): Promise<void>;
  logout(): Promise<void>;
  refreshSession(): Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const { authRepository, businessConfigRepository, customerRepository } = useRepositories();
  const [session, setSession] = useState<Session | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentSession = await authRepository.getCurrentSession();
      const currentCustomer = currentSession ? await customerRepository.getById(currentSession.customerId) : null;

      if (currentSession && !currentCustomer) {
        await authRepository.logout();
        setSession(null);
        setCustomer(null);
        return;
      }

      setSession(currentSession);
      setCustomer(currentCustomer);
    } finally {
      setIsLoading(false);
    }
  }, [authRepository, customerRepository]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const currentSession = await authRepository.getCurrentSession();
      const currentCustomer = currentSession ? await customerRepository.getById(currentSession.customerId) : null;

      if (!isMounted) {
        return;
      }

      if (currentSession && !currentCustomer) {
        await authRepository.logout();
        setSession(null);
        setCustomer(null);
        setIsLoading(false);
        return;
      }

      setSession(currentSession);
      setCustomer(currentCustomer);
      setIsLoading(false);
    }

    void bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [authRepository, customerRepository]);

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await authRepository.login(input);
      setSession(result.session);
      setCustomer(result.customer);
    },
    [authRepository],
  );

  const register = useCallback(
    async (input: Omit<RegisterCustomerInput, "tenantId">) => {
      const businessConfig = await businessConfigRepository.getCurrent();
      const result = await authRepository.registerCustomer({ ...input, tenantId: businessConfig.tenantId });
      setSession(result.session);
      setCustomer(result.customer);
    },
    [authRepository, businessConfigRepository],
  );

  const logout = useCallback(async () => {
    await authRepository.logout();
    setSession(null);
    setCustomer(null);
  }, [authRepository]);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      customer,
      isAuthenticated: !!session,
      isLoading,
      login,
      register,
      logout,
      refreshSession,
    }),
    [customer, isLoading, login, logout, refreshSession, register, session],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used inside SessionProvider");
  }

  return context;
}
