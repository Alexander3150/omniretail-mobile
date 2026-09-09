import { useState } from "react";

import type { Order } from "@/core";
import { generateAndShareInvoicePdf, useRepositories } from "@/infrastructure";

export function useInvoiceDownload() {
  const repositories = useRepositories();
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function downloadInvoice(order: Order) {
    setError(null);
    setIsGenerating(true);
    try {
      const orderWithItems = await repositories.orderRepository.getWithItems(order.id);
      if (!orderWithItems) {
        throw new Error("Order not found");
      }
      await generateAndShareInvoicePdf({
        business: await repositories.businessConfigRepository.getCurrent(),
        order: orderWithItems.order,
        items: orderWithItems.items,
        payments: await repositories.paymentRepository.getByOrder(order.id),
      });
    } catch (cause) {
      console.error("Invoice generation failed", cause);
      setError("No se pudo generar la factura.");
    } finally {
      setIsGenerating(false);
    }
  }

  return { downloadInvoice, error, isGenerating };
}
