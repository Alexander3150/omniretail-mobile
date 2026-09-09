import type { BusinessConfig, Order, OrderItem, Payment } from "@/core";
import { formatCurrency, formatDateTime } from "@/shared";

export type InvoiceDocumentData = {
  business: BusinessConfig;
  order: Order;
  items: OrderItem[];
  payments: Payment[];
};

export function renderInvoiceHtml(data: InvoiceDocumentData): string {
  const { business, items, order, payments } = data;
  const payment = payments[0];
  const billingName = order.billingSnapshot?.name ?? order.contactSnapshot?.name ?? "Consumidor final";
  const nit = order.billingSnapshot?.nit?.trim() || "CF";
  const contactPhone = order.contactSnapshot?.phone ?? "No registrado";
  const paymentBrand = payment?.cardBrandSnapshot ?? "Tarjeta";
  const paymentLast4 = payment?.cardLast4Snapshot ? `terminada en ${payment.cardLast4Snapshot}` : "sin terminacion registrada";
  const paymentStatus = payment?.status ?? order.paymentStatus ?? "approved";

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { color: #172033; font-family: Arial, sans-serif; margin: 32px; }
          h1 { font-size: 24px; margin: 0 0 8px; }
          h2 { border-bottom: 1px solid #D9E2EF; font-size: 16px; margin-top: 24px; padding-bottom: 6px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border-bottom: 1px solid #D9E2EF; padding: 8px; text-align: left; }
          th { background: #F4F7FB; }
          .muted { color: #687286; }
          .totals { margin-left: auto; width: 260px; }
          .row { display: flex; justify-content: space-between; margin: 6px 0; }
          .total { font-size: 18px; font-weight: 700; }
          .footer { border-top: 1px solid #D9E2EF; font-weight: 700; margin-top: 32px; padding-top: 16px; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(business.name)}</h1>
        <div class="muted">${escapeHtml(business.support.address ?? "")}</div>
        <div class="muted">${escapeHtml([business.support.phone, business.support.email].filter(Boolean).join(" | "))}</div>

        <h2>Factura de demostracion</h2>
        <p><strong>Pedido:</strong> ${escapeHtml(order.number)}</p>
        <p><strong>Fecha:</strong> ${escapeHtml(formatDateTime(order.createdAt))}</p>

        <h2>Cliente</h2>
        <p><strong>Nombre facturacion:</strong> ${escapeHtml(billingName)}</p>
        <p><strong>NIT:</strong> ${escapeHtml(nit)}</p>
        <p><strong>Telefono contacto:</strong> ${escapeHtml(contactPhone)}</p>

        <h2>Items</h2>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th>Cantidad</th>
              <th>Unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item) => renderItemRow(item, business.currency)).join("")}
          </tbody>
        </table>

        <h2>Totales</h2>
        <div class="totals">
          <div class="row"><span>Subtotal</span><span>${escapeHtml(formatCurrency(order.subtotal, business.currency))}</span></div>
          <div class="row"><span>Descuento</span><span>${escapeHtml(formatCurrency(order.discount, business.currency))}</span></div>
          <div class="row"><span>Envio</span><span>${escapeHtml(formatCurrency(order.shippingCost, business.currency))}</span></div>
          <div class="row total"><span>Total</span><span>${escapeHtml(formatCurrency(order.total, business.currency))}</span></div>
        </div>

        <h2>Pago</h2>
        <p><strong>Metodo:</strong> ${escapeHtml(paymentBrand)} ${escapeHtml(paymentLast4)}</p>
        <p><strong>Estado:</strong> ${escapeHtml(paymentStatus)}</p>

        <div class="footer">DOCUMENTO DE DEMOSTRACION - SIN VALIDEZ FISCAL</div>
      </body>
    </html>
  `;
}

export function buildInvoiceFileName(orderNumber: string): string {
  return `factura-${orderNumber.replace(/[^A-Za-z0-9_-]/g, "-")}.pdf`;
}

function renderItemRow(item: OrderItem, currency: string): string {
  const unitPrice = item.effectiveUnitPriceSnapshot ?? item.unitPriceSnapshot;

  return `
    <tr>
      <td>${escapeHtml(item.productNameSnapshot)}</td>
      <td>${escapeHtml(item.skuSnapshot ?? "")}</td>
      <td>${item.quantity}</td>
      <td>${escapeHtml(formatCurrency(unitPrice, currency))}</td>
      <td>${escapeHtml(formatCurrency(item.subtotal, currency))}</td>
    </tr>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
