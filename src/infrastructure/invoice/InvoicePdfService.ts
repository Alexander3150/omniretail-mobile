import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { buildInvoiceFileName, renderInvoiceHtml, type InvoiceDocumentData } from "@/modules/invoice/application/invoiceDocument";

export async function generateAndShareInvoicePdf(data: InvoiceDocumentData): Promise<string> {
  const result = await Print.printToFileAsync({
    base64: true,
    html: renderInvoiceHtml(data),
  });
  const { base64, uri } = result;

  if (!uri) {
    throw new Error("Invoice PDF URI was not generated");
  }
  if (!base64) {
    throw new Error("Invoice PDF base64 was not generated");
  }

  const fileName = buildInvoiceFileName(data.order.number);
  const destination = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(destination, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const info = await FileSystem.getInfoAsync(destination);

  if (!info.exists || !info.size || info.size <= 0) {
    throw new Error("Invoice PDF cache copy was not created");
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device");
  }

  await Sharing.shareAsync(destination, {
    dialogTitle: `Factura ${data.order.number}`,
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
  });

  return destination;
}
