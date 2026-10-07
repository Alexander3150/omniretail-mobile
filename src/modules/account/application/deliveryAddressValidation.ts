export const DELIVERY_ADDRESS_LIMITS = {
  label: 35,
  recipientName: 60,
  line: 200,
  references: 300,
} as const;

const recipientCharacters = /[^\p{L}\p{M} '-]/gu;
const addressCharacters = /[^\p{L}\p{N} .,#!'/-]/gu;
const labelCharacters = /[^\p{L}\p{N} .'-]/gu;

function normalizeSpaces(value: string): string {
  return value.replace(/\s{2,}/g, " ");
}

export function sanitizeAddressLabel(value: string): string {
  return normalizeSpaces(value.replace(labelCharacters, "")).slice(0, DELIVERY_ADDRESS_LIMITS.label);
}

export function sanitizeRecipientName(value: string): string {
  return normalizeSpaces(value.replace(recipientCharacters, "")).slice(0, DELIVERY_ADDRESS_LIMITS.recipientName);
}

export function sanitizeAddressText(value: string, field: "line" | "references"): string {
  return normalizeSpaces(value.replace(addressCharacters, "")).slice(0, DELIVERY_ADDRESS_LIMITS[field]);
}

export function validateDeliveryAddress(input: {
  label: string;
  recipientName: string;
  addressLine: string;
  department: string;
  municipality: string;
  references: string;
}): string | null {
  if (!input.label.trim()) return "El nombre de la dirección es obligatorio.";
  if (!input.recipientName.trim()) return "El destinatario es obligatorio.";
  if (!input.addressLine.trim()) return "La dirección es obligatoria.";
  if (!input.department.trim()) return "El departamento es obligatorio.";
  if (!input.municipality.trim()) return "El municipio es obligatorio.";
  return null;
}
