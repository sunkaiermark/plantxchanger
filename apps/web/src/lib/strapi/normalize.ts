import type { CategorySummary, EquipmentSummary, InquirySummary, MediaAsset, QuoteStatus, SiteSettings } from "./types";

function unwrapEntity<T extends Record<string, any>>(item: T | null | undefined): Record<string, any> {
  if (!item) {
    return {};
  }

  if ("data" in item && item.data) {
    return unwrapEntity(item.data);
  }

  if ("attributes" in item && item.attributes) {
    return {
      id: item.id,
      documentId: item.documentId,
      ...item.attributes,
    };
  }

  return item;
}

function unwrapArray(value: any): any[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value.data)) {
    return value.data;
  }

  return [];
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

export function normalizeMedia(item: any, strapiUrl: string): MediaAsset | undefined {
  const entity = unwrapEntity(item);
  const url = absoluteUrl(entity.url, strapiUrl);

  if (!url) {
    return undefined;
  }

  return {
    url,
    alternativeText: entity.alternativeText ?? entity.name,
    width: entity.width,
    height: entity.height,
  };
}

export function normalizeCategory(item: any): CategorySummary {
  const entity = unwrapEntity(item);

  return {
    documentId: String(entity.documentId ?? entity.id ?? entity.slug),
    name: String(entity.name ?? "Uncategorized"),
    slug: String(entity.slug ?? "uncategorized"),
    description: entity.description,
    sortOrder: Number(entity.sortOrder ?? 0),
    seoTitle: entity.seoTitle,
    seoDescription: entity.seoDescription,
  };
}

export function normalizeEquipment(item: any, strapiUrl: string): EquipmentSummary {
  const entity = unwrapEntity(item);
  const categoryEntity = entity.category ? unwrapEntity(entity.category) : undefined;
  const mainImage = normalizeMedia(entity.mainImage, strapiUrl);
  const gallery = unwrapArray(entity.gallery)
    .map((image) => normalizeMedia(image, strapiUrl))
    .filter(Boolean) as MediaAsset[];

  return {
    documentId: String(entity.documentId ?? entity.id ?? entity.slug),
    title: String(entity.title ?? "Untitled equipment"),
    slug: String(entity.slug ?? entity.documentId ?? entity.id),
    reference: String(entity.reference ?? "PX-TBD"),
    category: categoryEntity?.slug ? normalizeCategory(categoryEntity) : undefined,
    condition: entity.condition ?? "good",
    availability: entity.availability ?? "available",
    country: entity.country,
    location: entity.location,
    year: entity.year ? Number(entity.year) : undefined,
    make: entity.make,
    model: entity.model,
    serialNumber: entity.serialNumber,
    operatingHours: entity.operatingHours,
    weight: entity.weight,
    dimensions: entity.dimensions,
    price: entity.price === null || entity.price === undefined ? undefined : Number(entity.price),
    currency: entity.currency ?? "USD",
    summary: entity.summary,
    description: entity.description,
    specifications: unwrapArray(entity.specifications).map((spec) => ({
      label: String(spec.label ?? ""),
      value: String(spec.value ?? ""),
    })),
    features: unwrapArray(entity.features).map((feature) => ({
      text: String(feature.text ?? ""),
    })),
    mainImage,
    gallery,
    sellerDisplayName: entity.sellerDisplayName,
    isFeatured: Boolean(entity.isFeatured),
    seoTitle: entity.seoTitle,
    seoDescription: entity.seoDescription,
  };
}

function normalizeQuoteStatus(status: string | undefined): QuoteStatus {
  if (status === "responded" || status === "negotiating" || status === "accepted") {
    return status;
  }

  return "pending";
}

export function normalizeInquiry(item: any): InquirySummary {
  const entity = unwrapEntity(item);

  return {
    documentId: String(entity.documentId ?? entity.id ?? entity.equipmentReferenceSnapshot ?? "quote"),
    inquiryType: entity.inquiryType === "seller" ? "seller" : "buyer",
    status: normalizeQuoteStatus(entity.status),
    equipmentReferenceSnapshot: entity.equipmentReferenceSnapshot,
    equipmentTitleSnapshot: entity.equipmentTitleSnapshot,
    name: String(entity.name ?? "Buyer"),
    company: entity.company,
    email: entity.email,
    phone: entity.phone,
    whatsapp: entity.whatsapp,
    country: entity.country,
    message: String(entity.message ?? ""),
    sourcePage: entity.sourcePage,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export function normalizeSiteSettings(item: any): SiteSettings {
  const entity = unwrapEntity(item);

  return {
    siteName: entity.siteName ?? "PlantXchange",
    contactEmail: entity.contactEmail ?? "sales@plantxchange.com",
    whatsappNumber: entity.whatsappNumber ?? "+8613800000000",
    whatsappDisplayLabel: entity.whatsappDisplayLabel ?? "WhatsApp",
    defaultSeoTitle: entity.defaultSeoTitle,
    defaultSeoDescription: entity.defaultSeoDescription,
    footerSummary: entity.footerSummary,
  };
}
