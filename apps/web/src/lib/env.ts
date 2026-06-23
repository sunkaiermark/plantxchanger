const missingValues = new Set(["", "replace-with-read-token", "replace-with-write-token"]);

export function getServerEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && !missingValues.has(value) ? value : undefined;
}

export function getRequiredServerEnv(name: string): string {
  const value = getServerEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function hasStrapiReadConfig(): boolean {
  return Boolean(getServerEnv("STRAPI_URL") && getServerEnv("STRAPI_READ_TOKEN"));
}

export function hasStrapiWriteConfig(): boolean {
  return Boolean(getServerEnv("STRAPI_URL") && getServerEnv("STRAPI_WRITE_TOKEN"));
}

export function getFallbackContactEmail(): string {
  return process.env.NEXT_PUBLIC_FALLBACK_CONTACT_EMAIL ?? "sales@plantxchange.com";
}

export function getFallbackWhatsAppNumber(): string {
  return process.env.NEXT_PUBLIC_FALLBACK_WHATSAPP_NUMBER ?? "+8613800000000";
}
