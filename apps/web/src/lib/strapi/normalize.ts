import type {
  CategorySummary,
  EquipmentAvailability,
  EquipmentCondition,
  EquipmentCurrency,
  EquipmentSummary,
  InquirySummary,
  MediaAsset,
  QuoteStatus,
  SiteSettings,
} from "./types";

type StrapiRecord = Record<string, unknown>;

function isRecord(value: unknown): value is StrapiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapEntity(item: unknown): StrapiRecord {
  if (!isRecord(item)) {
    return {};
  }

  if (isRecord(item.data)) {
    return unwrapEntity(item.data);
  }

  if (isRecord(item.attributes)) {
    return {
      id: item.id,
      documentId: item.documentId,
      ...item.attributes,
    };
  }

  return item;
}

function unwrapArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (isRecord(value) && Array.isArray(value.data)) {
    return value.data;
  }

  return [];
}

function stringOrDefault(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function normalizeCondition(value: unknown): EquipmentCondition {
  if (value === "excellent" || value === "fair" || value === "for-parts") {
    return value;
  }

  return "good";
}

function normalizeAvailability(value: unknown): EquipmentAvailability {
  if (value === "under-review" || value === "sold") {
    return value;
  }

  return "available";
}

function normalizeCurrency(value: unknown): EquipmentCurrency {
  if (value === "EUR" || value === "CNY") {
    return value;
  }

  return "USD";
}

function absoluteUrl(url: string | undefined, strapiUrl: string): string | undefined {
  if (!url) {
    return undefined;
  }

  if (/^https?:\/\//.test(url)) {
    return url;
  }

  return `${strapiUrl.replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
}

export function normalizeMedia(item: unknown, strapiUrl: string): MediaAsset | undefined {
  const entity = unwrapEntity(item);
  const url = absoluteUrl(optionalString(entity.url), strapiUrl);

  if (!url) {
    return undefined;
  }

  return {
    url,
    alternativeText: optionalString(entity.alternativeText) ?? optionalString(entity.name),
    width: optionalNumber(entity.width),
    height: optionalNumber(entity.height),
  };
}

export function normalizeCategory(item: unknown): CategorySummary {
  const entity = unwrapEntity(item);

  return {
    documentId: stringOrDefault(entity.documentId ?? entity.id ?? entity.slug, "uncategorized"),
    name: stringOrDefault(entity.name, "Uncategorized"),
    slug: stringOrDefault(entity.slug, "uncategorized"),
    description: optionalString(entity.description),
    sortOrder: optionalNumber(entity.sortOrder) ?? 0,
    seoTitle: optionalString(entity.seoTitle),
    seoDescription: optionalString(entity.seoDescription),
  };
}

export function normalizeEquipment(item: unknown, strapiUrl: string): EquipmentSummary {
  const entity = unwrapEntity(item);
  const categoryEntity = entity.category ? unwrapEntity(entity.category) : undefined;
  const mainImage = normalizeMedia(entity.mainImage, strapiUrl);
  const gallery = unwrapArray(entity.gallery)
    .map((image) => normalizeMedia(image, strapiUrl))
    .filter(Boolean) as MediaAsset[];

  return {
    documentId: stringOrDefault(entity.documentId ?? entity.id ?? entity.slug, "equipment"),
    title: stringOrDefault(entity.title, "Untitled equipment"),
    slug: stringOrDefault(entity.slug ?? entity.documentId ?? entity.id, "equipment"),
    reference: stringOrDefault(entity.reference, "PX-TBD"),
    category: categoryEntity?.slug ? normalizeCategory(categoryEntity) : undefined,
    condition: normalizeCondition(entity.condition),
    availability: normalizeAvailability(entity.availability),
    country: optionalString(entity.country),
    location: optionalString(entity.location),
    year: optionalNumber(entity.year),
    make: optionalString(entity.make),
    model: optionalString(entity.model),
    serialNumber: optionalString(entity.serialNumber),
    operatingHours: optionalString(entity.operatingHours),
    weight: optionalString(entity.weight),
    dimensions: optionalString(entity.dimensions),
    price: optionalNumber(entity.price),
    currency: normalizeCurrency(entity.currency),
    summary: optionalString(entity.summary),
    description: optionalString(entity.description),
    specifications: unwrapArray(entity.specifications).map((spec) => ({
      label: stringOrDefault(unwrapEntity(spec).label, ""),
      value: stringOrDefault(unwrapEntity(spec).value, ""),
    })),
    features: unwrapArray(entity.features).map((feature) => ({
      text: stringOrDefault(unwrapEntity(feature).text, ""),
    })),
    mainImage,
    gallery,
    sellerDisplayName: optionalString(entity.sellerDisplayName),
    isFeatured: Boolean(entity.isFeatured),
    seoTitle: optionalString(entity.seoTitle),
    seoDescription: optionalString(entity.seoDescription),
  };
}

function normalizeQuoteStatus(status: unknown): QuoteStatus {
  if (status === "responded" || status === "negotiating" || status === "accepted") {
    return status;
  }

  return "pending";
}

export function normalizeInquiry(item: unknown): InquirySummary {
  const entity = unwrapEntity(item);

  return {
    documentId: stringOrDefault(entity.documentId ?? entity.id ?? entity.equipmentReferenceSnapshot, "quote"),
    inquiryType: entity.inquiryType === "seller" ? "seller" : "buyer",
    status: normalizeQuoteStatus(entity.status),
    equipmentReferenceSnapshot: optionalString(entity.equipmentReferenceSnapshot),
    equipmentTitleSnapshot: optionalString(entity.equipmentTitleSnapshot),
    name: stringOrDefault(entity.name, "Buyer"),
    company: optionalString(entity.company),
    email: optionalString(entity.email),
    phone: optionalString(entity.phone),
    whatsapp: optionalString(entity.whatsapp),
    country: optionalString(entity.country),
    message: stringOrDefault(entity.message, ""),
    sourcePage: optionalString(entity.sourcePage),
    createdAt: optionalString(entity.createdAt),
    updatedAt: optionalString(entity.updatedAt),
  };
}

export function normalizeSiteSettings(item: unknown): SiteSettings {
  const entity = unwrapEntity(item);

  return {
    siteName: stringOrDefault(entity.siteName, "PlantXchange"),
    contactEmail: stringOrDefault(entity.contactEmail, "sales@plantxchanger.com"),
    whatsappNumber: stringOrDefault(entity.whatsappNumber, "+8613800000000"),
    whatsappDisplayLabel: stringOrDefault(entity.whatsappDisplayLabel, "WhatsApp"),
    defaultSeoTitle: optionalString(entity.defaultSeoTitle),
    defaultSeoDescription: optionalString(entity.defaultSeoDescription),
    footerSummary: optionalString(entity.footerSummary),
  };
}
