import assert from "node:assert/strict";
import test from "node:test";
import type {
  AdminCategoryInput,
  AdminEquipmentInput,
  AdminSettingsInput,
} from "@/lib/admin/validation";
import {
  createAdminCategory,
  createAdminEquipment,
  deleteAdminCategory,
  deleteAdminEquipment,
  getAdminDashboardStats,
  getAdminEquipmentById,
  getCatalogEquipmentFromPostgres,
  getCategoriesFromPostgres,
  getEquipmentBySlugFromPostgres,
  getSiteSettingsFromPostgres,
  listAdminEquipment,
  mapCategoryRow,
  mapEquipmentRow,
  seedFallbackCatalog,
  updateAdminCategory,
  updateAdminEquipment,
  updateAdminSettings,
} from "./catalog";

type SqlCall = {
  text: string;
  values: unknown[];
};

function createFakeSql(responses: Array<Record<string, unknown>[]>) {
  const calls: SqlCall[] = [];
  const sql = async (strings: TemplateStringsArray, ...values: unknown[]) => {
    calls.push({ text: strings.join("?"), values });
    return responses.shift() ?? [];
  };

  return { calls, sql };
}

const schemaResponses = () => Array.from({ length: 6 }, () => []);

const adminEquipmentInput: AdminEquipmentInput = {
  title: "Complete Ammonia Plant",
  slug: "complete-ammonia-plant",
  reference: "PX-CP-NH3-1000",
  categoryId: "11111111-1111-4111-8111-111111111111",
  condition: "good",
  availability: "available",
  country: "Netherlands",
  location: "Rotterdam",
  year: 2008,
  make: "Haldor Topsoe",
  model: "Ammonia 1000 MTPD",
  serialNumber: "NH3-1000-NL",
  operatingHours: "N/A",
  weight: "Complete plant package",
  dimensions: "Plot plan available under NDA",
  price: 1250000,
  currency: "USD",
  summary: "Complete plant.",
  description: "Inspection available.",
  specifications: [{ label: "Capacity", value: "1000 MTPD" }],
  features: [{ text: "P&IDs available" }],
  mainImageUrl: "/images/chemical-plant.png",
  galleryImageUrls: ["/images/petrochemical.png"],
  sellerDisplayName: "International Process Plants",
  isFeatured: true,
  isPublished: true,
  seoTitle: "Complete Ammonia Plant",
  seoDescription: "Used ammonia plant.",
};

const adminCategoryInput: AdminCategoryInput = {
  name: "Chemical Plant",
  slug: "chemical-plant",
  description: "Complete process plants.",
  imageUrl: "/images/chemical-plant.png",
  sortOrder: 10,
  seoTitle: "Chemical Plants",
  seoDescription: "Used chemical plants.",
};

const adminSettingsInput: AdminSettingsInput = {
  siteName: "PlantXchange",
  contactEmail: "sales@example.com",
  whatsappNumber: "+15550100",
  whatsappDisplayLabel: "Message us",
  homepageHeadline: "Used process equipment",
  homepageIntro: "Find serious sellers.",
  defaultSeoTitle: "DB title",
  defaultSeoDescription: "DB description",
  footerSummary: "DB footer",
};

const equipmentRow = {
  id: "eq-1",
  title: "Complete Ammonia Plant",
  slug: "complete-ammonia-plant",
  reference: "PX-CP-NH3-1000",
  condition: "good",
  availability: "available",
  country: "Netherlands",
  location: "Rotterdam",
  year: 2008,
  make: "Haldor Topsoe",
  model: "Ammonia 1000 MTPD",
  serial_number: "NH3-1000-NL",
  operating_hours: "N/A",
  weight: "Complete plant package",
  dimensions: "Plot plan available under NDA",
  price: "1250000",
  currency: "USD",
  summary: "Complete plant.",
  description: "Inspection available.",
  features: [{ text: "P&IDs available" }],
  specifications: [{ label: "Capacity", value: "1000 MTPD" }],
  main_image_url: "/images/chemical-plant.png",
  gallery_image_urls: ["/images/petrochemical.png"],
  seller_display_name: "International Process Plants",
  is_featured: true,
  is_published: true,
  seo_title: "Complete Ammonia Plant",
  seo_description: "Used ammonia plant.",
};

const categoryRow = {
  id: "cat-1",
  name: "Chemical Plant",
  slug: "chemical-plant",
  description: "Complete process plants.",
  sort_order: 10,
  seo_title: "Chemical Plants",
  seo_description: "Used chemical plants.",
};

const settingsRow = {
  site_name: "PlantXchange",
  contact_email: "sales@example.com",
  whatsapp_number: "+15550100",
  whatsapp_display_label: "Message us",
  homepage_headline: "Used process equipment",
  homepage_intro: "Find serious sellers.",
  default_seo_title: "DB title",
  default_seo_description: "DB description",
  footer_summary: "DB footer",
};

test("mapCategoryRow converts database rows to public category summaries", () => {
  const category = mapCategoryRow({
    id: "cat-1",
    name: "Chemical Plant",
    slug: "chemical-plant",
    description: "Complete process plants.",
    sort_order: 10,
    seo_title: "Chemical Plants",
    seo_description: "Used chemical plants.",
  });

  assert.deepEqual(category, {
    documentId: "cat-1",
    name: "Chemical Plant",
    slug: "chemical-plant",
    description: "Complete process plants.",
    sortOrder: 10,
    seoTitle: "Chemical Plants",
    seoDescription: "Used chemical plants.",
  });
});

test("mapEquipmentRow converts JSON fields, category fields, and image URLs", () => {
  const equipment = mapEquipmentRow({
    id: "eq-1",
    title: "Complete Ammonia Plant",
    slug: "complete-ammonia-plant",
    reference: "PX-CP-NH3-1000",
    category_id: "cat-1",
    category_name: "Chemical Plant",
    category_slug: "chemical-plant",
    category_description: "Complete plants.",
    category_sort_order: 10,
    category_seo_title: "Chemical Plants",
    category_seo_description: "Used chemical plants.",
    condition: "good",
    availability: "available",
    country: "Netherlands",
    location: "Rotterdam",
    year: 2008,
    make: "Haldor Topsoe",
    model: "Ammonia 1000 MTPD",
    serial_number: "NH3-1000-NL",
    operating_hours: "N/A",
    weight: "Complete plant package",
    dimensions: "Plot plan available under NDA",
    price: "1250000",
    currency: "USD",
    summary: "Complete plant.",
    description: "Inspection available.",
    features: [{ text: "P&IDs available" }],
    specifications: [{ label: "Capacity", value: "1000 MTPD" }],
    main_image_url: "/images/chemical-plant.png",
    gallery_image_urls: ["/images/petrochemical.png"],
    seller_display_name: "International Process Plants",
    is_featured: true,
    seo_title: "Complete Ammonia Plant",
    seo_description: "Used ammonia plant.",
  });

  assert.equal(equipment.documentId, "eq-1");
  assert.equal(equipment.category?.slug, "chemical-plant");
  assert.equal(equipment.category?.seoTitle, "Chemical Plants");
  assert.equal(equipment.price, 1250000);
  assert.deepEqual(equipment.specifications, [{ label: "Capacity", value: "1000 MTPD" }]);
  assert.deepEqual(equipment.features, [{ text: "P&IDs available" }]);
  assert.deepEqual(equipment.mainImage, {
    url: "/images/chemical-plant.png",
    alternativeText: "Complete Ammonia Plant",
  });
  assert.deepEqual(equipment.gallery[0], {
    url: "/images/petrochemical.png",
    alternativeText: "Complete Ammonia Plant gallery 1",
  });
});

test("getCatalogEquipmentFromPostgres filters published records and includes search/category SQL", async () => {
  const fake = createFakeSql([...schemaResponses(), []]);

  await getCatalogEquipmentFromPostgres(fake.sql, {
    category: "chemical-plant",
    search: "ammonia",
    condition: "good",
    availability: "available",
    country: "Netherlands",
  });

  const query = fake.calls.at(-1);
  assert.match(query?.text ?? "", /WHERE equipment\.is_published = true/);
  assert.match(query?.text ?? "", /categories\.slug = \?/);
  assert.match(query?.text ?? "", /equipment\.condition = \?/);
  assert.match(query?.text ?? "", /equipment\.availability = \?/);
  assert.match(query?.text ?? "", /equipment\.country = \?/);
  assert.match(query?.text ?? "", /equipment\.title ILIKE \?/);
  assert.match(query?.text ?? "", /equipment\.reference ILIKE \?/);
  assert.deepEqual(query?.values, [
    "chemical-plant",
    "good",
    "available",
    "Netherlands",
    "%ammonia%",
    "%ammonia%",
    "%ammonia%",
    "%ammonia%",
  ]);
});

test("getEquipmentBySlugFromPostgres returns null for missing rows", async () => {
  const fake = createFakeSql([...schemaResponses(), []]);

  const equipment = await getEquipmentBySlugFromPostgres(fake.sql, "missing");

  assert.equal(equipment, null);
  assert.match(fake.calls.at(-1)?.text ?? "", /equipment\.is_published = true/);
  assert.deepEqual(fake.calls.at(-1)?.values, ["missing"]);
});

test("getCategoriesFromPostgres orders by sort_order and name", async () => {
  const fake = createFakeSql([...schemaResponses(), []]);

  await getCategoriesFromPostgres(fake.sql);

  assert.match(fake.calls.at(-1)?.text ?? "", /ORDER BY sort_order ASC, name ASC/);
});

test("getSiteSettingsFromPostgres maps stored global settings with fallback defaults", async () => {
  const fake = createFakeSql([
    ...schemaResponses(),
    [
      {
        site_name: "PlantXchange DB",
        contact_email: "sales@example.com",
        whatsapp_number: "+15550100",
        whatsapp_display_label: "Message us",
        homepage_headline: "Used process equipment",
        homepage_intro: "Find serious sellers.",
        default_seo_title: "DB title",
        default_seo_description: "DB description",
        footer_summary: "DB footer",
      },
    ],
  ]);

  const settings = await getSiteSettingsFromPostgres(fake.sql);

  assert.equal(settings.siteName, "PlantXchange DB");
  assert.equal(settings.homepageHeadline, "Used process equipment");
  assert.equal(settings.homepageIntro, "Find serious sellers.");
});

test("getAdminDashboardStats maps aggregate counts", async () => {
  const fake = createFakeSql([
    ...schemaResponses(),
    [
      {
        total_equipment: "9",
        published_equipment: "7",
        featured_equipment: "3",
      },
    ],
    [{ inquiries_table: "inquiries" }],
    [{ new_inquiries: "2" }],
  ]);

  const stats = await getAdminDashboardStats(fake.sql);

  assert.deepEqual(stats, {
    totalEquipment: 9,
    publishedEquipment: 7,
    featuredEquipment: 3,
    newInquiries: 2,
  });
  assert.match(fake.calls.at(-2)?.text ?? "", /to_regclass\('public\.inquiries'\)/);
  assert.match(fake.calls.at(-1)?.text ?? "", /FROM inquiries/);
});

test("getAdminDashboardStats returns zero new inquiries when the inquiries table is missing", async () => {
  const fake = createFakeSql([
    ...schemaResponses(),
    [
      {
        total_equipment: "9",
        published_equipment: "7",
        featured_equipment: "3",
      },
    ],
    [{ inquiries_table: null }],
  ]);

  const stats = await getAdminDashboardStats(fake.sql);

  assert.deepEqual(stats, {
    totalEquipment: 9,
    publishedEquipment: 7,
    featuredEquipment: 3,
    newInquiries: 0,
  });
  assert.match(fake.calls.at(-1)?.text ?? "", /to_regclass\('public\.inquiries'\)/);
  assert.doesNotMatch(fake.calls.map((call) => call.text).join("\n"), /FROM inquiries/);
});

test("listAdminEquipment uses admin query without published-only filtering", async () => {
  const fake = createFakeSql([...schemaResponses(), [equipmentRow]]);

  const equipment = await listAdminEquipment(fake.sql);

  const query = fake.calls.at(-1);
  assert.equal(equipment[0]?.documentId, "eq-1");
  assert.match(query?.text ?? "", /FROM equipment/);
  assert.doesNotMatch(query?.text ?? "", /is_published = true/);
});

test("getAdminEquipmentById returns null for missing rows", async () => {
  const fake = createFakeSql([...schemaResponses(), []]);

  const equipment = await getAdminEquipmentById(fake.sql, "missing");

  assert.equal(equipment, null);
  assert.match(fake.calls.at(-1)?.text ?? "", /WHERE equipment\.id = \?/);
  assert.deepEqual(fake.calls.at(-1)?.values, ["missing"]);
});

test("createAdminEquipment inserts and maps the returned row", async () => {
  const fake = createFakeSql([...schemaResponses(), [equipmentRow]]);

  const equipment = await createAdminEquipment(fake.sql, adminEquipmentInput);

  const query = fake.calls.at(-1);
  assert.equal(equipment.documentId, "eq-1");
  assert.equal(equipment.title, "Complete Ammonia Plant");
  assert.match(query?.text ?? "", /INSERT INTO equipment/);
  assert.match(query?.text ?? "", /is_published/);
  assert.match(query?.text ?? "", /RETURNING \*/);
  assert.equal(query?.values[0], "Complete Ammonia Plant");
  assert.equal(query?.values[25], true);
});

test("updateAdminEquipment updates key fields including isPublished", async () => {
  const fake = createFakeSql([...schemaResponses(), [{ ...equipmentRow, is_published: false }]]);

  const equipment = await updateAdminEquipment(fake.sql, "eq-1", {
    ...adminEquipmentInput,
    isPublished: false,
  });

  const query = fake.calls.at(-1);
  assert.equal(equipment.documentId, "eq-1");
  assert.match(query?.text ?? "", /UPDATE equipment/);
  assert.match(query?.text ?? "", /is_published = \?/);
  assert.match(query?.text ?? "", /WHERE id = \?/);
  assert.equal(query?.values[0], "Complete Ammonia Plant");
  assert.equal(query?.values[25], false);
  assert.equal(query?.values.at(-1), "eq-1");
});

test("deleteAdminEquipment deletes by id", async () => {
  const fake = createFakeSql([...schemaResponses(), [{ id: "eq-1" }]]);

  await deleteAdminEquipment(fake.sql, "eq-1");

  assert.match(fake.calls.at(-1)?.text ?? "", /DELETE FROM equipment\s+WHERE id = \?/);
  assert.match(fake.calls.at(-1)?.text ?? "", /RETURNING id/);
  assert.deepEqual(fake.calls.at(-1)?.values, ["eq-1"]);
});

test("deleteAdminEquipment throws when the equipment does not exist", async () => {
  const fake = createFakeSql([...schemaResponses(), []]);

  await assert.rejects(() => deleteAdminEquipment(fake.sql, "missing"), /Equipment not found: missing/);
});

test("createAdminCategory inserts and maps the returned category", async () => {
  const fake = createFakeSql([...schemaResponses(), [categoryRow]]);

  const category = await createAdminCategory(fake.sql, adminCategoryInput);

  assert.equal(category.documentId, "cat-1");
  assert.match(fake.calls.at(-1)?.text ?? "", /INSERT INTO categories/);
  assert.equal(fake.calls.at(-1)?.values[0], "Chemical Plant");
});

test("updateAdminCategory updates by id and maps the returned category", async () => {
  const fake = createFakeSql([...schemaResponses(), [categoryRow]]);

  const category = await updateAdminCategory(fake.sql, "cat-1", adminCategoryInput);

  assert.equal(category.slug, "chemical-plant");
  assert.match(fake.calls.at(-1)?.text ?? "", /UPDATE categories/);
  assert.match(fake.calls.at(-1)?.text ?? "", /WHERE id = \?/);
  assert.equal(fake.calls.at(-1)?.values.at(-1), "cat-1");
});

test("deleteAdminCategory deletes by id", async () => {
  const fake = createFakeSql([...schemaResponses(), [{ id: "cat-1" }]]);

  await deleteAdminCategory(fake.sql, "cat-1");

  assert.match(fake.calls.at(-1)?.text ?? "", /DELETE FROM categories\s+WHERE id = \?/);
  assert.match(fake.calls.at(-1)?.text ?? "", /RETURNING id/);
  assert.deepEqual(fake.calls.at(-1)?.values, ["cat-1"]);
});

test("deleteAdminCategory throws when the category does not exist", async () => {
  const fake = createFakeSql([...schemaResponses(), []]);

  await assert.rejects(() => deleteAdminCategory(fake.sql, "missing"), /Category not found: missing/);
});

test("updateAdminSettings upserts global settings", async () => {
  const fake = createFakeSql([...schemaResponses(), [settingsRow]]);

  const settings = await updateAdminSettings(fake.sql, adminSettingsInput);

  assert.equal(settings.siteName, "PlantXchange");
  assert.match(fake.calls.at(-1)?.text ?? "", /INSERT INTO site_settings/);
  assert.match(fake.calls.at(-1)?.text ?? "", /ON CONFLICT \(id\) DO UPDATE/);
});

test("seedFallbackCatalog uses category, equipment, and settings upsert statements", async () => {
  const fake = createFakeSql([...schemaResponses()]);

  const result = await seedFallbackCatalog(fake.sql);

  const allSql = fake.calls.map((call) => call.text).join("\n");
  assert.match(allSql, /ON CONFLICT \(slug\) DO UPDATE/);
  assert.match(allSql, /ON CONFLICT \(reference\) DO UPDATE/);
  assert.match(allSql, /ON CONFLICT \(id\) DO UPDATE/);
  assert.ok(result.categories > 0);
  assert.ok(result.equipment > 0);
});
