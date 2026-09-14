export const DEFAULT_PHONE_NUMBER = "+852 9616 6083";
export const DEFAULT_WHATSAPP_NUMBER = "+852 96166083";

const LEGACY_WHATSAPP_DIGITS = new Set(["8613800000000"]);

function trimmedString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function resolvePhoneNumber(value: unknown): string {
  return trimmedString(value) ?? DEFAULT_PHONE_NUMBER;
}

export function resolveWhatsAppNumber(value: unknown): string {
  const configured = trimmedString(value);
  if (!configured || LEGACY_WHATSAPP_DIGITS.has(digitsOnly(configured))) {
    return DEFAULT_WHATSAPP_NUMBER;
  }

  return configured;
}

export function buildTelephoneHref(phoneNumber: string): string {
  const resolved = resolvePhoneNumber(phoneNumber);
  const prefix = resolved.startsWith("+") ? "+" : "";
  return `tel:${prefix}${digitsOnly(resolved)}`;
}

export function buildWhatsAppHref(whatsappNumber: string): string {
  return `https://wa.me/${digitsOnly(resolveWhatsAppNumber(whatsappNumber))}`;
}
