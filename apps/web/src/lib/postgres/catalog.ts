import type { AdminCategoryInput, AdminEquipmentInput, AdminSettingsInput } from "@/lib/admin/validation";
import type { CatalogSearchParams } from "@/lib/catalog/types";
import { fallbackCategories, fallbackEquipment, fallbackSiteSettings } from "@/lib/fallback-data";
import type {
  CategorySummary,
  EquipmentAvailability,
  EquipmentCondition,
  EquipmentCurrency,
  EquipmentFeature,
  EquipmentSpecification,
  EquipmentSummary,
  MediaAsset,
  SiteSettings,
} from "@/lib/strapi/types";
import type { SqlExecutor } from "./client";

type Row = Record<string, unknown>;

const schemaReady = new WeakSet<SqlExecutor>();

const EQUIPMENT_SELECT = `
  equipment.*,
  categories.id AS category_id,
  categories.name AS category_name,
  categories.slug AS category_slug,
  categories.description AS category_description,
  categories.sort_order AS category_sort_order,
  categories.seo_title AS category_seo_title,
  categories.seo_description AS category_seo_description
`;

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function requiredString(value: unknown, fallback = ""): string {
  return optionalString(value) ?? fallback;
}

function optionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function numberOrDefault(value: unknown, fallback: number): number {
  return optionalNumber(value) ?? fallback;
}

function booleanOrDefault(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }
  return fallback;
}

function jsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mediaAsset(url: unknown, alt: string): MediaAsset | undefined {
  const value = optionalString(url);
  return value ? { url: value, alternativeText: alt } : undefined;
}

function queryText(sql: SqlExecutor, text: string, values: unknown[] = []) {
  const strings = text.split("?") as unknown as TemplateStringsArray;
  Object.defineProperty(strings, "raw", { value: strings });
  return sql(strings, ...values);
}

function mapSiteSettingsRow(row: Row | undefined): SiteSettings {
  return {
    ...fallbackSiteSettings,
    siteName: optionalString(row?.site_name) ?? fallbackSiteSettings.siteName,
    contactEmail: optionalString(row?.contact_email) ?? fallbackSiteSettings.contactEmail,
    whatsappNumber: optionalString(row?.whatsapp_number) ?? fallbackSiteSettings.whatsappNumber,
    whatsappDisplayLabel:
      optionalString(row?.whatsapp_display_label) ?? fallbackSiteSettings.whatsappDisplayLabel,
    homepageHeadline: optionalString(row?.homepage_headline) ?? fallbackSiteSettings.homepageHeadline,
    homepageIntro: optionalString(row?.homepage_intro) ?? fallbackSiteSettings.homepageIntro,
    defaultSeoTitle: optionalString(row?.default_seo_title) ?? fallbackSiteSettings.defaultSeoTitle,
    defaultSeoDescription:
      optionalString(row?.default_seo_description) ?? fallbackSiteSettings.defaultSeoDescription,
    footerSummary: optionalString(row?.footer_summary) ?? fallbackSiteSettings.footerSummary,
  };
}

function readCount(value: unknown): number {
  return numberOrDefault(value, 0);
}

export function mapCategoryRow(row: Row): CategorySummary {
  const imageUrl = optionalString(row.image_url);

  return {
    documentId: requiredString(row.id),
    name: requiredString(row.name, "Untitled category"),
    slug: requiredString(row.slug, "category"),
    description: optionalString(row.description),
    ...(imageUrl ? { imageUrl } : {}),
    sortOrder: numberOrDefault(row.sort_order, 0),
    seoTitle: optionalString(row.seo_title),
    seoDescription: optionalString(row.seo_description),
  };
}

export function mapEquipmentRow(row: Row): EquipmentSummary {
  const title = requiredString(row.title, "Untitled equipment");
  const categoryId = optionalString(row.category_id);

  return {
    documentId: requiredString(row.id),
    title,
    slug: requiredString(row.slug, "equipment"),
    reference: requiredString(row.reference),
    category: categoryId
      ? {
          documentId: categoryId,
          name: requiredString(row.category_name, "Uncategorized"),
          slug: requiredString(row.category_slug, "uncategorized"),
          description: optionalString(row.category_description),
          sortOrder: numberOrDefault(row.category_sort_order, 0),
          seoTitle: optionalString(row.category_seo_title),
          seoDescription: optionalString(row.category_seo_description),
        }
      : undefined,
    condition: requiredString(row.condition, "good") as EquipmentCondition,
    availability: requiredString(row.availability, "available") as EquipmentAvailability,
    country: optionalString(row.country),
    location: optionalString(row.location),
    year: optionalNumber(row.year),
    make: optionalString(row.make),
    model: optionalString(row.model),
    serialNumber: optionalString(row.serial_number),
    operatingHours: optionalString(row.operating_hours),
    weight: optionalString(row.weight),
    dimensions: optionalString(row.dimensions),
    price: optionalNumber(row.price),
    currency: requiredString(row.currency, "USD") as EquipmentCurrency,
    summary: optionalString(row.summary),
    description: optionalString(row.description),
    specifications: jsonArray<EquipmentSpecification>(row.specifications),
    features: jsonArray<EquipmentFeature>(row.features),
    mainImage: mediaAsset(row.main_image_url, title),
    gallery: jsonArray<string>(row.gallery_image_urls).map((url, index) => ({
      url,
      alternativeText: `${title} gallery ${index + 1}`,
    })),
    sellerDisplayName: optionalString(row.seller_display_name),
    isFeatured: booleanOrDefault(row.is_featured),
    isPublished: booleanOrDefault(row.is_published),
    seoTitle: optionalString(row.seo_title),
    seoDescription: optionalString(row.seo_description),
  };
}

export async function ensureCatalogSchema(sql: SqlExecutor): Promise<void> {
  if (schemaReady.has(sql)) return;

  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      seo_title TEXT,
      seo_description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS equipment (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      reference TEXT NOT NULL UNIQUE,
      category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
      condition TEXT,
      availability TEXT,
      country TEXT,
      location TEXT,
      year INTEGER,
      make TEXT,
      model TEXT,
      serial_number TEXT,
      operating_hours TEXT,
      weight TEXT,
      dimensions TEXT,
      price NUMERIC,
      currency TEXT NOT NULL DEFAULT 'USD',
      summary TEXT,
      description TEXT,
      features JSONB NOT NULL DEFAULT '[]'::jsonb,
      specifications JSONB NOT NULL DEFAULT '[]'::jsonb,
      main_image_url TEXT,
      gallery_image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
      seller_display_name TEXT,
      is_featured BOOLEAN NOT NULL DEFAULT false,
      is_published BOOLEAN NOT NULL DEFAULT false,
      seo_title TEXT,
      seo_description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      site_name TEXT,
      contact_email TEXT,
      whatsapp_number TEXT,
      whatsapp_display_label TEXT,
      default_seo_title TEXT,
      default_seo_description TEXT,
      footer_summary TEXT,
      homepage_headline TEXT,
      homepage_intro TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS equipment_published_updated_at_idx ON equipment (is_published, updated_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS equipment_category_id_idx ON equipment (category_id)`;

  schemaReady.add(sql);
}

function equipmentJoinQuery(where: string, orderBy: string, limit?: number) {
  return `
    SELECT ${EQUIPMENT_SELECT}
    FROM equipment
    LEFT JOIN categories ON categories.id = equipment.category_id
    ${where}
    ${orderBy}
    ${limit ? `LIMIT ${limit}` : ""}
  `;
}

export async function getCategoriesFromPostgres(sql: SqlExecutor): Promise<CategorySummary[]> {
  await ensureCatalogSchema(sql);
  const rows = await sql`
    SELECT *
    FROM categories
    ORDER BY sort_order ASC, name ASC
  `;
  return rows.map(mapCategoryRow);
}

export async function getFeaturedEquipmentFromPostgres(sql: SqlExecutor): Promise<EquipmentSummary[]> {
  await ensureCatalogSchema(sql);
  const rows = await queryText(
    sql,
    equipmentJoinQuery(
      "WHERE equipment.is_published = true AND equipment.is_featured = true",
      "ORDER BY equipment.updated_at DESC",
      6,
    ),
  );
  return rows.map(mapEquipmentRow);
}

export async function getCatalogEquipmentFromPostgres(
  sql: SqlExecutor,
  searchParams: CatalogSearchParams,
): Promise<EquipmentSummary[]> {
  await ensureCatalogSchema(sql);

  const conditions = ["equipment.is_published = true"];
  const values: unknown[] = [];

  if (searchParams.category) {
    conditions.push("categories.slug = ?");
    values.push(searchParams.category);
  }
  if (searchParams.condition) {
    conditions.push("equipment.condition = ?");
    values.push(searchParams.condition);
  }
  if (searchParams.availability) {
    conditions.push("equipment.availability = ?");
    values.push(searchParams.availability);
  }
  if (searchParams.country) {
    conditions.push("equipment.country = ?");
    values.push(searchParams.country);
  }
  if (searchParams.search) {
    const search = `%${searchParams.search}%`;
    conditions.push(
      "(equipment.title ILIKE ? OR equipment.reference ILIKE ? OR equipment.summary ILIKE ? OR equipment.description ILIKE ?)",
    );
    values.push(search, search, search, search);
  }

  const rows = await queryText(
    sql,
    equipmentJoinQuery(
      `WHERE ${conditions.join(" AND ")}`,
      "ORDER BY equipment.updated_at DESC",
      48,
    ),
    values,
  );
  return rows.map(mapEquipmentRow);
}

export async function getEquipmentBySlugFromPostgres(
  sql: SqlExecutor,
  slug: string,
): Promise<EquipmentSummary | null> {
  await ensureCatalogSchema(sql);
  const rows = await queryText(
    sql,
    equipmentJoinQuery(
      "WHERE equipment.is_published = true AND equipment.slug = ?",
      "ORDER BY equipment.updated_at DESC",
      1,
    ),
    [slug],
  );
  return rows[0] ? mapEquipmentRow(rows[0]) : null;
}

export async function getSiteSettingsFromPostgres(sql: SqlExecutor): Promise<SiteSettings> {
  await ensureCatalogSchema(sql);
  const rows = await sql`
    SELECT *
    FROM site_settings
    WHERE id = 'global'
    LIMIT 1
  `;
  return mapSiteSettingsRow(rows[0]);
}

export async function getAdminDashboardStats(sql: SqlExecutor): Promise<{
  totalEquipment: number;
  publishedEquipment: number;
  featuredEquipment: number;
  newInquiries: number;
}> {
  await ensureCatalogSchema(sql);
  const rows = await sql`
    SELECT
      COUNT(*)::int AS total_equipment,
      COUNT(*) FILTER (WHERE is_published = true)::int AS published_equipment,
      COUNT(*) FILTER (WHERE is_featured = true)::int AS featured_equipment
    FROM equipment
  `;
  const inquiryTable = await sql`SELECT to_regclass('public.inquiries') AS inquiries_table`;
  const inquiryRows = inquiryTable[0]?.inquiries_table
    ? await sql`SELECT COUNT(*)::int AS new_inquiries FROM inquiries WHERE status = 'new'`
    : [];
  const row = rows[0] ?? {};
  return {
    totalEquipment: readCount(row.total_equipment),
    publishedEquipment: readCount(row.published_equipment),
    featuredEquipment: readCount(row.featured_equipment),
    newInquiries: readCount(inquiryRows[0]?.new_inquiries),
  };
}

export async function listAdminEquipment(sql: SqlExecutor): Promise<EquipmentSummary[]> {
  await ensureCatalogSchema(sql);
  const rows = await queryText(sql, equipmentJoinQuery("", "ORDER BY equipment.updated_at DESC"));
  return rows.map(mapEquipmentRow);
}

export async function getAdminEquipmentById(
  sql: SqlExecutor,
  id: string,
): Promise<EquipmentSummary | null> {
  await ensureCatalogSchema(sql);
  const rows = await queryText(
    sql,
    equipmentJoinQuery("WHERE equipment.id = ?", "ORDER BY equipment.updated_at DESC", 1),
    [id],
  );
  return rows[0] ? mapEquipmentRow(rows[0]) : null;
}

function adminEquipmentValues(input: AdminEquipmentInput) {
  return [
    input.title,
    input.slug,
    input.reference,
    input.categoryId ?? null,
    input.condition,
    input.availability,
    input.country ?? null,
    input.location ?? null,
    input.year ?? null,
    input.make ?? null,
    input.model ?? null,
    input.serialNumber ?? null,
    input.operatingHours ?? null,
    input.weight ?? null,
    input.dimensions ?? null,
    input.price ?? null,
    input.currency,
    input.summary ?? null,
    input.description ?? null,
    JSON.stringify(input.features),
    JSON.stringify(input.specifications),
    input.mainImageUrl ?? null,
    JSON.stringify(input.galleryImageUrls),
    input.sellerDisplayName ?? null,
    input.isFeatured,
    input.isPublished,
    input.seoTitle ?? null,
    input.seoDescription ?? null,
  ];
}

export async function createAdminEquipment(
  sql: SqlExecutor,
  input: AdminEquipmentInput,
): Promise<EquipmentSummary> {
  await ensureCatalogSchema(sql);
  const rows = await queryText(
    sql,
    `
      INSERT INTO equipment (
        title, slug, reference, category_id, condition, availability, country, location, year,
        make, model, serial_number, operating_hours, weight, dimensions, price, currency,
        summary, description, features, specifications, main_image_url, gallery_image_urls,
        seller_display_name, is_featured, is_published, seo_title, seo_description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?, ?::jsonb, ?, ?, ?, ?, ?)
      RETURNING *
    `,
    adminEquipmentValues(input),
  );
  if (!rows[0]) throw new Error("Created equipment could not be loaded");
  return mapEquipmentRow(rows[0]);
}

export async function updateAdminEquipment(
  sql: SqlExecutor,
  id: string,
  input: AdminEquipmentInput,
): Promise<EquipmentSummary> {
  await ensureCatalogSchema(sql);
  const rows = await queryText(
    sql,
    `
      UPDATE equipment
      SET
        title = ?,
        slug = ?,
        reference = ?,
        category_id = ?,
        condition = ?,
        availability = ?,
        country = ?,
        location = ?,
        year = ?,
        make = ?,
        model = ?,
        serial_number = ?,
        operating_hours = ?,
        weight = ?,
        dimensions = ?,
        price = ?,
        currency = ?,
        summary = ?,
        description = ?,
        features = ?::jsonb,
        specifications = ?::jsonb,
        main_image_url = ?,
        gallery_image_urls = ?::jsonb,
        seller_display_name = ?,
        is_featured = ?,
        is_published = ?,
        seo_title = ?,
        seo_description = ?,
        updated_at = NOW()
      WHERE id = ?
      RETURNING *
    `,
    [...adminEquipmentValues(input), id],
  );
  if (!rows[0]) throw new Error(`Equipment not found: ${id}`);
  return mapEquipmentRow(rows[0]);
}

export async function deleteAdminEquipment(sql: SqlExecutor, id: string): Promise<void> {
  await ensureCatalogSchema(sql);
  const rows = await sql`
    DELETE FROM equipment
    WHERE id = ${id}
    RETURNING id
  `;
  if (!rows[0]) throw new Error(`Equipment not found: ${id}`);
}

export async function listAdminCategories(sql: SqlExecutor): Promise<CategorySummary[]> {
  return getCategoriesFromPostgres(sql);
}

export async function createAdminCategory(
  sql: SqlExecutor,
  input: AdminCategoryInput,
): Promise<CategorySummary> {
  await ensureCatalogSchema(sql);
  const rows = await sql`
    INSERT INTO categories (
      name, slug, description, image_url, sort_order, seo_title, seo_description
    )
    VALUES (
      ${input.name},
      ${input.slug},
      ${input.description ?? null},
      ${input.imageUrl ?? null},
      ${input.sortOrder},
      ${input.seoTitle ?? null},
      ${input.seoDescription ?? null}
    )
    RETURNING *
  `;
  return mapCategoryRow(rows[0] ?? {});
}

export async function updateAdminCategory(
  sql: SqlExecutor,
  id: string,
  input: AdminCategoryInput,
): Promise<CategorySummary> {
  await ensureCatalogSchema(sql);
  const rows = await sql`
    UPDATE categories
    SET
      name = ${input.name},
      slug = ${input.slug},
      description = ${input.description ?? null},
      image_url = ${input.imageUrl ?? null},
      sort_order = ${input.sortOrder},
      seo_title = ${input.seoTitle ?? null},
      seo_description = ${input.seoDescription ?? null},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  if (!rows[0]) throw new Error(`Category not found: ${id}`);
  return mapCategoryRow(rows[0]);
}

export async function deleteAdminCategory(sql: SqlExecutor, id: string): Promise<void> {
  await ensureCatalogSchema(sql);
  const rows = await sql`
    DELETE FROM categories
    WHERE id = ${id}
    RETURNING id
  `;
  if (!rows[0]) throw new Error(`Category not found: ${id}`);
}

export async function updateAdminSettings(
  sql: SqlExecutor,
  input: AdminSettingsInput,
): Promise<SiteSettings> {
  await ensureCatalogSchema(sql);
  const rows = await sql`
    INSERT INTO site_settings (
      id,
      site_name,
      contact_email,
      whatsapp_number,
      whatsapp_display_label,
      default_seo_title,
      default_seo_description,
      footer_summary,
      homepage_headline,
      homepage_intro,
      updated_at
    )
    VALUES (
      'global',
      ${input.siteName},
      ${input.contactEmail},
      ${input.whatsappNumber},
      ${input.whatsappDisplayLabel},
      ${input.defaultSeoTitle ?? null},
      ${input.defaultSeoDescription ?? null},
      ${input.footerSummary ?? null},
      ${input.homepageHeadline ?? null},
      ${input.homepageIntro ?? null},
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      site_name = EXCLUDED.site_name,
      contact_email = EXCLUDED.contact_email,
      whatsapp_number = EXCLUDED.whatsapp_number,
      whatsapp_display_label = EXCLUDED.whatsapp_display_label,
      default_seo_title = EXCLUDED.default_seo_title,
      default_seo_description = EXCLUDED.default_seo_description,
      footer_summary = EXCLUDED.footer_summary,
      homepage_headline = EXCLUDED.homepage_headline,
      homepage_intro = EXCLUDED.homepage_intro,
      updated_at = NOW()
    RETURNING *
  `;
  return mapSiteSettingsRow(rows[0]);
}

export async function seedFallbackCatalog(
  sql: SqlExecutor,
): Promise<{ categories: number; equipment: number }> {
  await ensureCatalogSchema(sql);

  const categoryIds = new Map<string, string>();
  for (const category of fallbackCategories) {
    const rows = await sql`
      INSERT INTO categories (
        name, slug, description, sort_order, seo_title, seo_description, updated_at
      )
      VALUES (
        ${category.name},
        ${category.slug},
        ${category.description ?? null},
        ${category.sortOrder},
        ${category.seoTitle ?? null},
        ${category.seoDescription ?? null},
        NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        sort_order = EXCLUDED.sort_order,
        seo_title = EXCLUDED.seo_title,
        seo_description = EXCLUDED.seo_description,
        updated_at = NOW()
      RETURNING id, slug
    `;
    const id = optionalString(rows[0]?.id);
    const slug = optionalString(rows[0]?.slug);
    if (id && slug) categoryIds.set(slug, id);
  }

  for (const equipment of fallbackEquipment) {
    await sql`
      INSERT INTO equipment (
        title, slug, reference, category_id, condition, availability, country, location, year,
        make, model, serial_number, operating_hours, weight, dimensions, price, currency,
        summary, description, features, specifications, main_image_url, gallery_image_urls,
        seller_display_name, is_featured, is_published, seo_title, seo_description, updated_at
      )
      VALUES (
        ${equipment.title},
        ${equipment.slug},
        ${equipment.reference},
        ${equipment.category?.slug ? categoryIds.get(equipment.category.slug) ?? null : null},
        ${equipment.condition},
        ${equipment.availability},
        ${equipment.country ?? null},
        ${equipment.location ?? null},
        ${equipment.year ?? null},
        ${equipment.make ?? null},
        ${equipment.model ?? null},
        ${equipment.serialNumber ?? null},
        ${equipment.operatingHours ?? null},
        ${equipment.weight ?? null},
        ${equipment.dimensions ?? null},
        ${equipment.price ?? null},
        ${equipment.currency},
        ${equipment.summary ?? null},
        ${equipment.description ?? null},
        ${JSON.stringify(equipment.features)},
        ${JSON.stringify(equipment.specifications)},
        ${equipment.mainImage?.url ?? null},
        ${JSON.stringify(equipment.gallery.map((image) => image.url))},
        ${equipment.sellerDisplayName ?? null},
        ${equipment.isFeatured},
        ${true},
        ${equipment.seoTitle ?? null},
        ${equipment.seoDescription ?? null},
        NOW()
      )
      ON CONFLICT (reference) DO UPDATE SET
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        category_id = EXCLUDED.category_id,
        condition = EXCLUDED.condition,
        availability = EXCLUDED.availability,
        country = EXCLUDED.country,
        location = EXCLUDED.location,
        year = EXCLUDED.year,
        make = EXCLUDED.make,
        model = EXCLUDED.model,
        serial_number = EXCLUDED.serial_number,
        operating_hours = EXCLUDED.operating_hours,
        weight = EXCLUDED.weight,
        dimensions = EXCLUDED.dimensions,
        price = EXCLUDED.price,
        currency = EXCLUDED.currency,
        summary = EXCLUDED.summary,
        description = EXCLUDED.description,
        features = EXCLUDED.features,
        specifications = EXCLUDED.specifications,
        main_image_url = EXCLUDED.main_image_url,
        gallery_image_urls = EXCLUDED.gallery_image_urls,
        seller_display_name = EXCLUDED.seller_display_name,
        is_featured = EXCLUDED.is_featured,
        is_published = EXCLUDED.is_published,
        seo_title = EXCLUDED.seo_title,
        seo_description = EXCLUDED.seo_description,
        updated_at = NOW()
    `;
  }

  await updateAdminSettings(sql, {
    siteName: fallbackSiteSettings.siteName,
    contactEmail: fallbackSiteSettings.contactEmail,
    whatsappNumber: fallbackSiteSettings.whatsappNumber,
    whatsappDisplayLabel: fallbackSiteSettings.whatsappDisplayLabel,
    homepageHeadline: fallbackSiteSettings.homepageHeadline,
    homepageIntro: fallbackSiteSettings.homepageIntro,
    defaultSeoTitle: fallbackSiteSettings.defaultSeoTitle,
    defaultSeoDescription: fallbackSiteSettings.defaultSeoDescription,
    footerSummary: fallbackSiteSettings.footerSummary,
  });

  return { categories: fallbackCategories.length, equipment: fallbackEquipment.length };
}
