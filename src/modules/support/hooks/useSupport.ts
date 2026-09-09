import { useCallback, useEffect, useState } from "react";

import type { BusinessConfig } from "@/core";
import { useRepositories } from "@/infrastructure";

export function useSupport() {
  const { businessConfigRepository } = useRepositories();
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setBusinessConfig(await businessConfigRepository.getCurrent());
    setIsLoading(false);
  }, [businessConfigRepository]);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  return { businessConfig, isLoading, reload: load };
}
