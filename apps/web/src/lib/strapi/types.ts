export type EquipmentCondition = "excellent" | "good" | "fair" | "for-parts";
export type EquipmentAvailability = "available" | "under-review" | "sold";
export type EquipmentCurrency = "USD" | "EUR" | "CNY";
export type QuoteStatus = "new" | "contacted" | "qualified" | "negotiating" | "closed" | "spam";

export interface CategorySummary {
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface MediaAsset {
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
}

export interface EquipmentSpecification {
  label: string;
  value: string;
}

export interface EquipmentFeature {
  text: string;
}

export interface EquipmentSummary {
  documentId: string;
  title: string;
  slug: string;
  reference: string;
  category?: CategorySummary;
  condition: EquipmentCondition;
  availability: EquipmentAvailability;
  country?: string;
  location?: string;
  year?: number;
  make?: string;
  model?: string;
  serialNumber?: string;
  operatingHours?: string;
  weight?: string;
  dimensions?: string;
  price?: number;
  currency: EquipmentCurrency;
  summary?: string;
  description?: string;
  specifications: EquipmentSpecification[];
  features: EquipmentFeature[];
  mainImage?: MediaAsset;
  gallery: MediaAsset[];
  sellerDisplayName?: string;
  isFeatured: boolean;
  isPublished?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface InquirySummary {
  documentId: string;
  inquiryType: "buyer" | "seller";
  status: QuoteStatus;
  equipmentReferenceSnapshot?: string;
  equipmentTitleSnapshot?: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  country?: string;
  message: string;
  sourcePage?: string;
  internalNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteSettings {
  siteName: string;
  contactEmail: string;
  whatsappNumber: string;
  whatsappDisplayLabel: string;
  homepageHeadline?: string;
  homepageIntro?: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  footerSummary?: string;
}
