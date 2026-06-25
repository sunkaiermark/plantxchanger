import { z } from "zod";

const equipmentConditions = ["excellent", "good", "fair", "for-parts"] as const;
const equipmentAvailability = ["available", "under-review", "sold"] as const;
const equipmentCurrencies = ["USD", "EUR", "CNY"] as const;
const inquiryStatuses = ["new", "contacted", "qualified", "negotiating", "closed", "spam"] as const;

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalString = (maxLength: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(maxLength).optional());

const parseOptionalNumber = (value: unknown) => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : Number.NaN;
  }
  return value;
};

const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess(parseOptionalNumber, schema.optional());

const parseDefaultedNumber = (value: unknown) => {
  if (value === undefined || value === "") return undefined;
  if (value === null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : Number.NaN;
  }
  return value;
};

const adminBoolean = z.preprocess((value) => {
  if (value === true || value === "true" || value === "on" || value === "1" || value === 1) {
    return true;
  }

  if (
    value === false ||
    value === "false" ||
    value === "off" ||
    value === "0" ||
    value === 0 ||
    value === "" ||
    value === undefined
  ) {
    return false;
  }

  return value;
}, z.boolean());

const requiredString = (maxLength: number) => z.string().trim().min(1).max(maxLength);
const imageUrlSchema = z.preprocess(emptyToUndefined, z.string().trim().max(500).optional());

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/(?<=\d),(?=\d)/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const slugSchema = z.preprocess(
  (value) => (typeof value === "string" ? normalizeSlug(value) : value),
  z.string().min(1).max(220),
);

const equipmentSpecificationSchema = z
  .object({
    label: requiredString(80),
    value: requiredString(180),
  })
  .strict();

const equipmentFeatureSchema = z
  .object({
    text: requiredString(180),
  })
  .strict();

export const adminCategorySchema = z
  .object({
    name: requiredString(120),
    slug: slugSchema,
    description: optionalString(600),
    imageUrl: imageUrlSchema,
    sortOrder: z.preprocess(
      parseDefaultedNumber,
      z.number().finite().int().min(0).max(10000).default(0),
    ),
    seoTitle: optionalString(160),
    seoDescription: optionalString(260),
  })
  .strict();

export const adminEquipmentSchema = z
  .object({
    title: requiredString(180),
    slug: slugSchema,
    reference: requiredString(80),
    categoryId: z.preprocess(emptyToUndefined, z.string().trim().uuid().optional()),
    condition: z.enum(equipmentConditions),
    availability: z.enum(equipmentAvailability),
    country: optionalString(120),
    location: optionalString(180),
    year: optionalNumber(z.number().finite().int().min(1900).max(2100)),
    make: optionalString(120),
    model: optionalString(160),
    serialNumber: optionalString(120),
    operatingHours: optionalString(80),
    weight: optionalString(120),
    dimensions: optionalString(180),
    price: optionalNumber(z.number().finite().min(0)),
    currency: z.enum(equipmentCurrencies).default("USD"),
    summary: optionalString(400),
    description: optionalString(4000),
    specifications: z.array(equipmentSpecificationSchema).max(40).default([]),
    features: z.array(equipmentFeatureSchema).max(20).default([]),
    mainImageUrl: imageUrlSchema,
    galleryImageUrls: z.array(z.string().trim().min(1).max(500)).max(12).default([]),
    sellerDisplayName: optionalString(180),
    isFeatured: adminBoolean,
    isPublished: adminBoolean,
    seoTitle: optionalString(160),
    seoDescription: optionalString(260),
  })
  .strict();

export const adminInquiryUpdateSchema = z
  .object({
    status: z.enum(inquiryStatuses),
    internalNote: optionalString(2000),
  })
  .strict();

export const adminSettingsSchema = z
  .object({
    siteName: requiredString(120),
    contactEmail: z.string().trim().email().max(180),
    whatsappNumber: requiredString(80),
    whatsappDisplayLabel: requiredString(80),
    homepageHeadline: optionalString(180),
    homepageIntro: optionalString(500),
    defaultSeoTitle: optionalString(160),
    defaultSeoDescription: optionalString(260),
    footerSummary: optionalString(600),
  })
  .strict();

export type AdminCategoryInput = z.infer<typeof adminCategorySchema>;
export type AdminEquipmentInput = z.infer<typeof adminEquipmentSchema>;
export type AdminInquiryUpdateInput = z.infer<typeof adminInquiryUpdateSchema>;
export type AdminSettingsInput = z.infer<typeof adminSettingsSchema>;
