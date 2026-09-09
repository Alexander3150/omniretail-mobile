import type { CreateCustomerPaymentMethodInput } from "@/core";

export type CardFormState = {
  cardNumber: string;
  cardholderName: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
};

export function validateCardForm(input: CardFormState): string | null {
  const digits = normalizeCardNumber(input.cardNumber);
  const month = Number(input.expirationMonth);
  const year = normalizeExpirationYear(input.expirationYear);

  if (digits.length < 12 || digits.length > 19 || !/^\d+$/.test(digits)) {
    return "El numero de tarjeta no es valido.";
  }
  if (!passesLuhn(digits)) {
    return "El numero de tarjeta no es valido.";
  }
  if (!input.cardholderName.trim()) {
    return "El titular es requerido.";
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return "El mes de expiracion no es valido.";
  }
  if (!Number.isInteger(year) || year < new Date().getFullYear()) {
    return "El ano de expiracion no es valido.";
  }
  if (year === new Date().getFullYear() && month < new Date().getMonth() + 1) {
    return "La tarjeta esta vencida.";
  }
  if (!/^\d{3,4}$/.test(input.cvv.trim())) {
    return "El CVV es requerido.";
  }

  return null;
}

export function buildSafePaymentMethodInput(
  input: CardFormState,
  owner: { tenantId: string; customerId: string },
  isDefault: boolean,
): CreateCustomerPaymentMethodInput {
  const digits = normalizeCardNumber(input.cardNumber);

  return {
    tenantId: owner.tenantId,
    customerId: owner.customerId,
    providerTokenId: createDemoToken(digits),
    brand: detectCardBrand(digits),
    last4: digits.slice(-4),
    expirationMonth: Number(input.expirationMonth),
    expirationYear: normalizeExpirationYear(input.expirationYear),
    cardholderName: input.cardholderName.trim(),
    isDefault,
  };
}

export function detectCardBrand(cardNumber: string): string {
  const digits = normalizeCardNumber(cardNumber);

  if (digits.startsWith("4")) {
    return "Visa";
  }
  if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]\d|7[01]|720)/.test(digits)) {
    return "Mastercard";
  }

  return "Unknown";
}

function normalizeCardNumber(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeExpirationYear(value: string): number {
  const year = Number(value.trim());

  if (value.trim().length === 2) {
    return 2000 + year;
  }

  return year;
}

function passesLuhn(value: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    let digit = Number(value[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function createDemoToken(cardNumber: string): string {
  return `demo-card-${detectCardBrand(cardNumber).toLowerCase()}-${cardNumber.slice(-4)}-${Date.now().toString(36)}`;
}
