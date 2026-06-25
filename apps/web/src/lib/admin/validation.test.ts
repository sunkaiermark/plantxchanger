import assert from "node:assert/strict";
import test from "node:test";
import {
  adminCategorySchema,
  adminEquipmentSchema,
  adminInquiryUpdateSchema,
  adminSettingsSchema,
  normalizeSlug,
} from "./validation";

test("normalizeSlug removes punctuation and normalizes industrial equipment titles", () => {
  assert.equal(
    normalizeSlug(" ICI Low-Pressure Methanol Plant 800,000 MT/YR "),
    "ici-low-pressure-methanol-plant-800000-mt-yr",
  );
});

test("adminEquipmentSchema accepts a complete published process equipment record", () => {
  const result = adminEquipmentSchema.safeParse({
    title: "ICI Low-Pressure Methanol Plant 800,000 MT/YR",
    slug: " ICI Low-Pressure Methanol Plant 800,000 MT/YR ",
    reference: "PX-METH-800K",
    categoryId: "550e8400-e29b-41d4-a716-446655440000",
    condition: "good",
    availability: "available",
    country: "United Kingdom",
    location: "Teesside",
    year: 2018,
    make: "ICI",
    model: "Low Pressure Methanol",
    serialNumber: "ICI-800K-2018",
    operatingHours: "18,500",
    weight: "12,000 MT",
    dimensions: "Complete process train",
    price: 12500000,
    currency: "USD",
    summary: "Complete methanol plant package ready for relocation.",
    description: "A complete published process equipment listing for buyers.",
    specifications: [
      { label: "Capacity", value: "800,000 MT/YR" },
      { label: "Pressure", value: "Low pressure process" },
    ],
    features: [
      { text: "Documented maintenance history" },
      { text: "Major equipment preserved for relocation" },
    ],
    mainImageUrl: "https://example.com/methanol-plant-main.jpg",
    galleryImageUrls: [
      "https://example.com/methanol-plant-1.jpg",
      "https://example.com/methanol-plant-2.jpg",
    ],
    sellerDisplayName: "PlantXchange Verified Seller",
    isFeatured: true,
    isPublished: "true",
    seoTitle: "ICI Low-Pressure Methanol Plant for Sale",
    seoDescription: "Complete low-pressure methanol plant package available for relocation.",
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.categoryId, "550e8400-e29b-41d4-a716-446655440000");
    assert.equal(result.data.slug, "ici-low-pressure-methanol-plant-800000-mt-yr");
    assert.equal(result.data.mainImageUrl, "https://example.com/methanol-plant-main.jpg");
    assert.deepEqual(result.data.galleryImageUrls, [
      "https://example.com/methanol-plant-1.jpg",
      "https://example.com/methanol-plant-2.jpg",
    ]);
    assert.equal(result.data.isPublished, true);
  }
});

test("adminEquipmentSchema coerces numeric form fields", () => {
  const result = adminEquipmentSchema.safeParse({
    title: "Used Glass Lined Reactor",
    slug: "used-glass-lined-reactor",
    reference: "PX-REACTOR-001",
    condition: "excellent",
    availability: "available",
    year: "2020",
    price: "125000",
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.year, 2020);
    assert.equal(result.data.price, 125000);
    assert.equal(result.data.currency, "USD");
    assert.equal(result.data.isFeatured, false);
  }
});

test("adminEquipmentSchema parses explicit false boolean strings", () => {
  const result = adminEquipmentSchema.safeParse({
    title: "Used Dryer",
    slug: "used-dryer",
    reference: "PX-DRYER-001",
    condition: "fair",
    availability: "under-review",
    isFeatured: "false",
    isPublished: "false",
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.isFeatured, false);
    assert.equal(result.data.isPublished, false);
  }
});

test("adminEquipmentSchema rejects unknown top-level and nested keys", () => {
  const baseEquipment = {
    title: "Used Reactor",
    slug: "used-reactor",
    reference: "PX-REACTOR-003",
    condition: "good",
    availability: "available",
  };

  assert.equal(
    adminEquipmentSchema.safeParse({
      ...baseEquipment,
      unexpected: "value",
    }).success,
    false,
  );
  assert.equal(
    adminEquipmentSchema.safeParse({
      ...baseEquipment,
      specifications: [{ label: "Capacity", value: "10,000 L", unit: "L" }],
    }).success,
    false,
  );
  assert.equal(
    adminEquipmentSchema.safeParse({
      ...baseEquipment,
      features: [{ text: "Available immediately", icon: "clock" }],
    }).success,
    false,
  );
});

test("adminEquipmentSchema handles optional numeric form values safely", () => {
  const baseEquipment = {
    title: "Used Pump",
    slug: "used-pump",
    reference: "PX-PUMP-001",
    condition: "good",
    availability: "available",
  };

  const parsed = adminEquipmentSchema.safeParse({
    ...baseEquipment,
    year: "2021",
    price: "45000.50",
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.year, 2021);
    assert.equal(parsed.data.price, 45000.5);
  }

  const blank = adminEquipmentSchema.safeParse({
    ...baseEquipment,
    year: "",
    price: "   ",
  });
  assert.equal(blank.success, true);
  if (blank.success) {
    assert.equal(blank.data.year, undefined);
    assert.equal(blank.data.price, undefined);
  }

  const nullValues = adminEquipmentSchema.safeParse({
    ...baseEquipment,
    year: null,
    price: null,
  });
  assert.equal(nullValues.success, true);
  if (nullValues.success) {
    assert.equal(nullValues.data.year, undefined);
    assert.equal(nullValues.data.price, undefined);
  }

  assert.equal(
    adminEquipmentSchema.safeParse({
      ...baseEquipment,
      year: "not a year",
    }).success,
    false,
  );
  assert.equal(
    adminEquipmentSchema.safeParse({
      ...baseEquipment,
      price: "not a price",
    }).success,
    false,
  );
});

test("adminEquipmentSchema enforces planned specification and feature limits", () => {
  const baseEquipment = {
    title: "Used Reactor",
    slug: "used-reactor",
    reference: "PX-REACTOR-002",
    condition: "good",
    availability: "available",
  };

  assert.equal(
    adminEquipmentSchema.safeParse({
      ...baseEquipment,
      specifications: Array.from({ length: 41 }, (_, index) => ({
        label: `Spec ${index}`,
        value: "Value",
      })),
    }).success,
    false,
  );
  assert.equal(
    adminEquipmentSchema.safeParse({
      ...baseEquipment,
      specifications: [{ label: "L".repeat(81), value: "Value" }],
    }).success,
    false,
  );
  assert.equal(
    adminEquipmentSchema.safeParse({
      ...baseEquipment,
      specifications: [{ label: "Capacity", value: "V".repeat(181) }],
    }).success,
    false,
  );
  assert.equal(
    adminEquipmentSchema.safeParse({
      ...baseEquipment,
      features: Array.from({ length: 21 }, (_, index) => ({ text: `Feature ${index}` })),
    }).success,
    false,
  );
  assert.equal(
    adminEquipmentSchema.safeParse({
      ...baseEquipment,
      features: [{ text: "F".repeat(181) }],
    }).success,
    false,
  );
});

test("adminCategorySchema rejects empty name and slug", () => {
  const result = adminCategorySchema.safeParse({
    name: "",
    slug: "",
  });

  assert.equal(result.success, false);
});

test("adminCategorySchema normalizes ampersands in category slugs", () => {
  const result = adminCategorySchema.safeParse({
    name: "Tanks & Vessels",
    slug: "Tanks & Vessels",
    imageUrl: "https://example.com/tanks.jpg",
    sortOrder: "42",
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.slug, "tanks-and-vessels");
    assert.equal(result.data.imageUrl, "https://example.com/tanks.jpg");
    assert.equal(result.data.sortOrder, 42);
  }
});

test("adminCategorySchema defaults sortOrder", () => {
  const result = adminCategorySchema.safeParse({
    name: "Reactors",
    slug: "reactors",
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.sortOrder, 0);
  }
});

test("adminCategorySchema rejects null sortOrder instead of coercing to zero", () => {
  const result = adminCategorySchema.safeParse({
    name: "Reactors",
    slug: "reactors",
    sortOrder: null,
  });

  assert.equal(result.success, false);
});

test("adminCategorySchema accepts 600 character descriptions", () => {
  const result = adminCategorySchema.safeParse({
    name: "Reactors",
    slug: "reactors",
    description: "D".repeat(600),
  });

  assert.equal(result.success, true);
});

test("adminInquiryUpdateSchema accepts qualified and rejects pending", () => {
  assert.equal(adminInquiryUpdateSchema.safeParse({ status: "qualified" }).success, true);
  assert.equal(adminInquiryUpdateSchema.safeParse({ status: "pending" }).success, false);
  assert.equal(adminInquiryUpdateSchema.safeParse({ status: "qualified", extra: true }).success, false);
});

test("adminSettingsSchema accepts homepage headline and intro settings", () => {
  const result = adminSettingsSchema.safeParse({
    siteName: "PlantXchange",
    contactEmail: "sales@plantxchange.com",
    whatsappNumber: "+86 138 0000 0000",
    whatsappDisplayLabel: "WhatsApp",
    homepageHeadline: "Buy and sell complete process plants",
    homepageIntro: "I".repeat(500),
    defaultSeoTitle: "PlantXchange Process Equipment Marketplace",
    defaultSeoDescription: "Industrial process equipment and complete plant assets for sale.",
    footerSummary: "F".repeat(600),
  });

  assert.equal(result.success, true);
});
