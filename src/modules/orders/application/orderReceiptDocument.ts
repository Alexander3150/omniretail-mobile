import type { ApiCheckoutReceipt } from "@/infrastructure/api/checkout";

type Business = {
  name: string;
  currency: string;
};

export type OrderReceiptDocumentData = {
  business: Business;
  receipt: ApiCheckoutReceipt;
};

/**
 * Documento informativo del pedido. No sustituye una factura fiscal ni incluye
 * datos de pago.
 */
export function renderOrderReceiptHtml({
  business,
  receipt,
}: OrderReceiptDocumentData): string {
  const delivery = formatDeliveryAddress(receipt.deliveryAddress);
  const subtotal = receipt.items.reduce((sum, item) => sum + item.subtotal, 0);
  const shipping = Math.max(0, receipt.total - subtotal);
  const createdAt = new Date(receipt.savedAt).toLocaleString("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          @page { margin: 28px; }
          body { color: #172033; font-family: Arial, sans-serif; font-size: 12px; margin: 0; }
          .topbar { background: #164a87; color: #fff; font-size: 10px; font-weight: 700; letter-spacing: 1px; margin: -28px -28px 24px; padding: 12px 28px; }
          .header { align-items: flex-start; border-bottom: 2px solid #0e8ecd; display: flex; justify-content: space-between; padding-bottom: 18px; }
          h1 { font-size: 24px; margin: 0; }
          h2 { font-size: 11px; letter-spacing: .8px; margin: 0 0 7px; text-transform: uppercase; }
          .muted { color: #687286; }
          .order { text-align: right; }
          .order p { margin: 4px 0 0; }
          .delivery { background: #f4f7fb; border-radius: 6px; margin: 18px 0; padding: 14px; }
          table { border-collapse: collapse; margin-top: 16px; width: 100%; }
          th { background: #0e8ecd; color: #fff; font-size: 10px; letter-spacing: .5px; padding: 9px 7px; text-align: left; }
          td { border-bottom: 1px solid #dce4ed; padding: 10px 7px; vertical-align: top; }
          .right { text-align: right; }
          .totals { margin-left: auto; margin-top: 18px; width: 230px; }
          .row { display: flex; justify-content: space-between; margin: 7px 0; }
          .total { border-top: 1px solid #0e8ecd; color: #172033; font-size: 16px; font-weight: 700; margin-top: 9px; padding-top: 10px; }
          footer { border-top: 1px solid #dce4ed; color: #687286; font-size: 10px; margin-top: 30px; padding-top: 14px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="topbar">${escapeHtml(business.name.toUpperCase())}</div>
        <section class="header">
          <div>
            <h1>Comprobante de pedido</h1>
            <p class="muted">Resumen de tu compra</p>
          </div>
          <div class="order">
            <h2>Pedido</h2>
            <strong>${escapeHtml(receipt.orderNumber)}</strong>
            <p class="muted">${escapeHtml(createdAt)}</p>
          </div>
        </section>

        <section class="delivery">
          <h2>Entrega a</h2>
          ${delivery ? `<div>${escapeHtml(delivery)}</div>` : '<div class="muted">Información de entrega no disponible</div>'}
        </section>

        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th class="right">Cantidad</th>
              <th class="right">Precio unit.</th>
              <th class="right">Importe</th>
            </tr>
          </thead>
          <tbody>
            ${receipt.items.map((item) => `
              <tr>
                <td><strong>${escapeHtml(item.name)}</strong><br /><span class="muted">${escapeHtml(item.sku)}</span></td>
                <td class="right">${item.quantity}</td>
                <td class="right">${formatCurrency(item.unitPrice, business.currency)}</td>
                <td class="right"><strong>${formatCurrency(item.subtotal, business.currency)}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <section class="totals">
          <div class="row"><span>Subtotal</span><span>${formatCurrency(subtotal, business.currency)}</span></div>
          <div class="row"><span>Envío</span><span>${formatCurrency(shipping, business.currency)}</span></div>
          <div class="row total"><span>Total</span><span>${formatCurrency(receipt.total, business.currency)}</span></div>
        </section>

        <footer>Gracias por tu compra. Este comprobante no es una factura fiscal.</footer>
      </body>
    </html>
  `;
}

export function buildOrderReceiptFileName(orderNumber: string): string {
  return `comprobante-${orderNumber.replace(/[^A-Za-z0-9_-]/g, "-")}.pdf`;
}

function formatDeliveryAddress(address: Record<string, unknown>): string {
  const value = (key: string) => typeof address[key] === "string" ? address[key].trim() : "";
  const recipient = value("recipientName");
  const line1 = value("line1") || value("addressLine1") || value("address");
  const line2 = value("line2");
  const city = value("city");
  const department = value("department") || value("stateOrDepartment");
  const country = value("country");
  const references = value("references");

  return [
    recipient,
    [line1, line2].filter(Boolean).join(", "),
    [city, department, country].filter(Boolean).join(", "),
    references ? `Referencia: ${references}` : "",
  ].filter(Boolean).join("\n");
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("es-GT", {
    currency,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br />");
}
