import { createContext, type PropsWithChildren, useContext } from "react";

import { getRepositoryRegistry, type RepositoryRegistry } from "./RepositoryRegistry";

const RepositoryContext = createContext<RepositoryRegistry | null>(null);

export function RepositoryProvider({ children }: PropsWithChildren) {
  return <RepositoryContext.Provider value={getRepositoryRegistry()}>{children}</RepositoryContext.Provider>;
}

export function useRepositories(): RepositoryRegistry {
  const repositories = useContext(RepositoryContext);

  if (!repositories) {
    throw new Error("useRepositories must be used inside RepositoryProvider");
  }

  return repositories;
}
