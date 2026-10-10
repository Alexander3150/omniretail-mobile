import { describe, expect, it } from "vitest";

import {
  buildInvoiceFileName,
  renderInvoiceHtml,
  type InvoiceDocumentData,
} from "@/modules/invoice/application/invoiceDocument";

describe("invoiceDocument", () => {
  it("construye un nombre de archivo seguro para el PDF de factura", () => {
    expect(buildInvoiceFileName("ORD-1234/A")).toBe("factura-ORD-1234-A.pdf");
  });

  it("renderiza el HTML de la factura con los datos del pedido y de la empresa", () => {
    const data: InvoiceDocumentData = {
      business: {
        tenantId: "tenant-1",
        name: "Ferretería El Tornillo",
        currency: "GTQ",
        support: {
          address: "Ciudad de Guatemala",
          phone: "12345678",
          email: "soporte@ejemplo.com",
        },
      },
      order: {
        id: "order-1",
        number: "ORD-9999",
        createdAt: "2026-10-09T12:00:00Z",
        currency: "GTQ",
        total: 150,
        subtotal: 150,
        billingSnapshot: {
          name: "Juan Perez",
          nit: "123456-7",
        },
        contactSnapshot: {
          name: "Juan Perez",
          phone: "55554444",
        },
        status: "confirmed",
        paymentStatus: "approved",
        discount: 0,
        shippingCost: 0,
      } as any,
      items: [
        {
          id: "item-1",
          productId: "prod-1",
          productNameSnapshot: "Martillo",
          skuSnapshot: "MAR-001",
          quantity: 2,
          unitPriceSnapshot: 75,
          subtotal: 150,
        } as any,
      ],
      payments: [
        {
          id: "pay-1",
          amount: 150,
          status: "approved",
          cardBrandSnapshot: "Visa",
          cardLast4Snapshot: "4242",
        } as any,
      ],
    };

    const html = renderInvoiceHtml(data);
    expect(html).toContain("Ferretería El Tornillo");
    expect(html).toContain("ORD-9999");
    expect(html).toContain("Juan Perez");
    expect(html).toContain("123456-7");
    expect(html).toContain("Martillo");
    expect(html).toContain("Visa");
    expect(html).toContain("4242");
  });
});
