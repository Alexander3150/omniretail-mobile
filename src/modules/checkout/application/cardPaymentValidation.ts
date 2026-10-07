export type StorefrontCardBrand =
  | "Visa"
  | "Mastercard"
  | "American Express";

export function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function formatCardExpiration(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function detectStorefrontCardBrand(
  digits: string,
): StorefrontCardBrand | null {
  if (digits.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";

  if (digits.length >= 4) {
    const prefix = Number(digits.slice(0, 4));
    if (prefix >= 2221 && prefix <= 2720) return "Mastercard";
  }

  if (/^3[47]/.test(digits)) return "American Express";
  return null;
}

export function getSecurityCodeLength(
  brand: StorefrontCardBrand | null,
): number {
  return brand === "American Express" ? 4 : 3;
}

export function validateCardNumber(digits: string): string | null {
  if (!digits) return "Ingresa el número de tarjeta.";

  const brand = detectStorefrontCardBrand(digits);
  if (!brand) {
    return digits.length >= 4
      ? "Solo se aceptan tarjetas Visa, Mastercard o American Express."
      : "El número de tarjeta no es válido.";
  }

  const validLengths = brand === "Visa" ? [13, 16, 19] : brand === "Mastercard" ? [16] : [15];
  if (!validLengths.includes(digits.length) || !passesLuhnCheck(digits)) {
    return "El número de tarjeta no es válido.";
  }

  return null;
}

/** Muestra advertencias mientras se escribe, sin marcar una tarjeta incompleta. */
export function getCardNumberFieldError(digits: string): string | null {
  if (!digits) return null;

  const brand = detectStorefrontCardBrand(digits);
  if (!brand) {
    return digits.length >= 4
      ? "Solo se aceptan tarjetas Visa, Mastercard o American Express."
      : null;
  }

  const validLengths = brand === "Visa" ? [13, 16, 19] : brand === "Mastercard" ? [16] : [15];
  if (digits.length < Math.min(...validLengths)) return null;
  return validateCardNumber(digits);
}

export function validateCardExpiration(value: string): string | null {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return "Ingresa una fecha válida en formato MM/AA.";

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return "La tarjeta está vencida.";
  }
  if (year > currentYear + 20) {
    return "Ingresa una fecha de vencimiento válida.";
  }

  return null;
}

export function validateCardholderName(value: string): string | null {
  const name = value.trim();
  if (!name) return "Ingresa el nombre del titular.";
  if (name.length > 60 || !/^[\p{L}][\p{L}\s'-]*$/u.test(name)) {
    return "El nombre del titular solo permite letras, espacios, guiones y apóstrofes.";
  }
  return null;
}

function passesLuhnCheck(digits: string): boolean {
  let sum = 0;
  let doubleDigit = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
}
