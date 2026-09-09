import type { CurrencyCode, TenantId } from "../types";

export type SupportInfo = {
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  openingHours?: string;
};

export type BusinessBranding = {
  primaryColor?: string;
  accentColor?: string;
};

export type BusinessConfig = {
  tenantId: TenantId;
  name: string;
  slogan?: string;
  logoUri?: string;
  currency: CurrencyCode;
  support: SupportInfo;
  branding?: BusinessBranding;
};
