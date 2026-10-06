import { useState } from "react";

import type { ApiCheckoutReceipt } from "@/infrastructure/api/checkout";
import { generateAndShareOrderReceiptPdf, useRepositories } from "@/infrastructure";

export function useOrderReceiptDownload() {
  const { businessConfigRepository } = useRepositories();
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function downloadReceipt(receipt: ApiCheckoutReceipt) {
    setError(null);
    setIsGenerating(true);

    try {
      const business = await businessConfigRepository.getCurrent();

      await generateAndShareOrderReceiptPdf({ business, receipt });
    } catch (cause) {
      console.error("Receipt generation failed", cause);
      setError("No se pudo generar el comprobante.");
    } finally {
      setIsGenerating(false);
    }
  }

  return { downloadReceipt, error, isGenerating };
}
