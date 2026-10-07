import type { CreateCustomerPaymentMethodInput } from "@/core";
import { CARD_BRANDS, GUATEMALA_BANKS } from "@/config";

const MAX_EXPIRATION_YEARS_AHEAD = 20;
const CARDHOLDER_NAME_MAX_LENGTH = 60;

export type CardFormState = {
  brand: string;
  last4: string;
  issuingBank: string;
  cardholderName: string;
  expirationMonth: string;
  expirationYear: string;
};

export function validateCardForm(input: CardFormState): string | null {
  const month = Number(input.expirationMonth);
  const year = normalizeExpirationYear(input.expirationYear);

  if (!CARD_BRANDS.includes(input.brand as (typeof CARD_BRANDS)[number])) {
    return "Selecciona una marca de tarjeta válida.";
  }
  if (!/^\d{4}$/.test(input.last4)) {
    return "Ingresa exactamente los últimos 4 dígitos.";
  }
  if (!GUATEMALA_BANKS.includes(input.issuingBank as (typeof GUATEMALA_BANKS)[number])) {
    return "Selecciona un banco emisor válido.";
  }
  if (input.cardholderName.trim().length > CARDHOLDER_NAME_MAX_LENGTH) {
    return `El titular no puede superar ${CARDHOLDER_NAME_MAX_LENGTH} caracteres.`;
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return "El mes de expiracion no es valido.";
  }
  if (!Number.isInteger(year)) {
    return "El año de expiración no es válido.";
  }
  if (year === new Date().getFullYear() && month < new Date().getMonth() + 1) {
    return "La tarjeta esta vencida.";
  }
  if (year > new Date().getFullYear() + MAX_EXPIRATION_YEARS_AHEAD) {
    return `El año de expiración no puede superar ${new Date().getFullYear() + MAX_EXPIRATION_YEARS_AHEAD}.`;
  }

  return null;
}

export function buildSafePaymentMethodInput(
  input: CardFormState,
  owner: { tenantId: string; customerId: string },
  isDefault: boolean,
): CreateCustomerPaymentMethodInput {
  return {
    tenantId: owner.tenantId,
    customerId: owner.customerId,
    providerTokenId: createPaymentMethodReference(input.brand, input.last4),
    brand: input.brand,
    issuingBank: input.issuingBank.trim(),
    last4: input.last4,
    expirationMonth: Number(input.expirationMonth),
    expirationYear: normalizeExpirationYear(input.expirationYear),
    cardholderName: input.cardholderName.trim(),
    isDefault,
  };
}

function normalizeExpirationYear(value: string): number {
  const year = Number(value.trim());

  if (value.trim().length === 2) {
    return 2000 + year;
  }

  return year;
}

function createPaymentMethodReference(brand: string, last4: string): string {
  return `mobile-card-${brand.toLowerCase().replace(/\s+/g, "-")}-${last4}-${Date.now().toString(36)}`;
}
