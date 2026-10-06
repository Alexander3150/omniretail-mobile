import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import {
  buildOrderReceiptFileName,
  renderOrderReceiptHtml,
  type OrderReceiptDocumentData,
} from "@/modules/orders/application/orderReceiptDocument";

export async function generateAndShareOrderReceiptPdf(
  data: OrderReceiptDocumentData,
): Promise<string> {
  const result = await Print.printToFileAsync({
    base64: true,
    html: renderOrderReceiptHtml(data),
  });

  if (!result.uri || !result.base64) {
    throw new Error("No se pudo generar el comprobante PDF.");
  }

  const destination = `${FileSystem.cacheDirectory}${buildOrderReceiptFileName(data.receipt.orderNumber)}`;

  await FileSystem.writeAsStringAsync(destination, result.base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const info = await FileSystem.getInfoAsync(destination);

  if (!info.exists || !info.size || info.size <= 0) {
    throw new Error("No se pudo guardar el comprobante PDF.");
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("No es posible compartir el comprobante en este dispositivo.");
  }

  await Sharing.shareAsync(destination, {
    dialogTitle: `Comprobante ${data.receipt.orderNumber}`,
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf",
  });

  return destination;
}
