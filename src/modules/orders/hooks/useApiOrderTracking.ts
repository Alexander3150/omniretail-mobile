import { useCallback, useEffect, useState } from "react";

import { apiConfig } from "@/infrastructure/api";
import {
  ApiOrderTrackingService,
  type ApiOrderTrackingResponse,
  type ApiOrderTrackingStatus,
} from "@/infrastructure/api/tracking";

export type ApiTrackingPresentationStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export function mapApiTrackingStatus(
  status: ApiOrderTrackingStatus,
): ApiTrackingPresentationStatus {
  return status === "sent" ? "shipped" : status;
}

export function useApiOrderTracking(trackingToken?: string) {
  const [tracking, setTracking] =
    useState<ApiOrderTrackingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(trackingToken));
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!trackingToken) {
      setTracking(null);
      setErrorCode(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorCode(null);

    try {
      const result = await new ApiOrderTrackingService().track(
        apiConfig.tenantSlug,
        trackingToken,
      );

      setTracking(result);
    } catch (error) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string"
          ? error.code
          : "ORDER_TRACKING_REQUEST_FAILED";

      setTracking(null);
      setErrorCode(code);
    } finally {
      setIsLoading(false);
    }
  }, [trackingToken]);

  useEffect(() => {
    const timeout = setTimeout(() => void load(), 0);

    return () => clearTimeout(timeout);
  }, [load]);

  return {
    errorCode,
    isLoading,
    presentationStatus: tracking
      ? mapApiTrackingStatus(tracking.status)
      : null,
    reload: load,
    tracking,
  };
}
