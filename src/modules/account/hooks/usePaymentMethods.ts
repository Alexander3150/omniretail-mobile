import { useCallback, useEffect, useState } from "react";

import type { CreateCustomerPaymentMethodInput, CustomerPaymentMethod } from "@/core";
import { useRepositories } from "@/infrastructure";
import { useSession } from "@/modules/auth";

export function usePaymentMethods() {
  const { customerPaymentMethodRepository } = useRepositories();
  const { session } = useSession();
  const [methods, setMethods] = useState<CustomerPaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) {
      setMethods([]);
      setIsLoading(false);
      return;
    }

    setMethods(await customerPaymentMethodRepository.getByCustomer(session.tenantId, session.customerId));
    setIsLoading(false);
  }, [customerPaymentMethodRepository, session]);

  const create = useCallback(
    async (input: CreateCustomerPaymentMethodInput) => {
      const method = await customerPaymentMethodRepository.create(input);
      await load();
      return method;
    },
    [customerPaymentMethodRepository, load],
  );

  const setDefault = useCallback(
    async (methodId: string) => {
      if (!session) {
        return;
      }
      await customerPaymentMethodRepository.setDefault(session.customerId, methodId);
      await load();
    },
    [customerPaymentMethodRepository, load, session],
  );

  const archive = useCallback(
    async (methodId: string) => {
      await customerPaymentMethodRepository.archive(methodId);
      await load();
    },
    [customerPaymentMethodRepository, load],
  );

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);
    return () => clearTimeout(timeout);
  }, [load]);

  return { archive, create, isLoading, methods, reload: load, setDefault };
}
