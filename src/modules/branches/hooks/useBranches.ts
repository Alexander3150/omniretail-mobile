import { useCallback, useEffect, useState } from "react";

import type { Branch } from "@/core";
import { useRepositories } from "@/infrastructure";
import { useSession } from "@/modules/auth";

export function useBranches() {
  const { branchRepository } = useRepositories();
  const { session } = useSession();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) {
      setBranches([]);
      setIsLoading(false);
      return;
    }

    setBranches(await branchRepository.getActive(session.tenantId));
    setIsLoading(false);
  }, [branchRepository, session]);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  return { branches, isLoading, reload: load };
}

export function useBranch(branchId?: string) {
  const { branchRepository } = useRepositories();
  const { session } = useSession();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session || !branchId) {
      setBranch(null);
      setIsLoading(false);
      return;
    }

    const nextBranch = await branchRepository.getById(branchId);
    setBranch(nextBranch?.tenantId === session.tenantId && nextBranch.isActive ? nextBranch : null);
    setIsLoading(false);
  }, [branchId, branchRepository, session]);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  return { branch, isLoading, reload: load };
}
