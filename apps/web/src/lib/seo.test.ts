import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { fallbackEquipment } from "./fallback-data";
import { readPostgresFirst } from "./strapi/equipment";
import {
  buildRobotsPolicy,
  buildEquipmentJsonLd,
  buildEquipmentMetadata,
  buildSitemapEntries,
  canonicalUrl,
  getCanonicalUrl,
  getPublicSiteUrl,
  isPublicIndexablePath,
} from "./seo";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
});

test("canonicalUrl builds absolute production URLs without duplicate slashes", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://local-preview.example/";

  assert.equal(getPublicSiteUrl(), "https://local-preview.example");
  assert.equal(canonicalUrl("/catalog"), "https://www.plantxchanger.com/catalog");
  assert.equal(
    canonicalUrl("equipment/ici-low-pressure-methanol-plant-800000-mt-yr"),
    "https://www.plantxchanger.com/equipment/ici-low-pressure-methanol-plant-800000-mt-yr",
  );
});

test("getCanonicalUrl defaults to the public PlantXchanger domain", () => {
  delete process.env.NEXT_PUBLIC_SITE_URL;

  assert.equal(getCanonicalUrl(), "https://www.plantxchanger.com/");
  assert.equal(getCanonicalUrl("/catalog"), "https://www.plantxchanger.com/catalog");
  assert.equal(getCanonicalUrl("equipment/demo"), "https://www.plantxchanger.com/equipment/demo");
  assert.equal(
    getCanonicalUrl("https://example.com/catalog?category=reactors"),
    "https://www.plantxchanger.com/catalog?category=reactors",
  );
});

test("isPublicIndexablePath rejects private routes and accepts public routes", () => {
  assert.equal(isPublicIndexablePath("/admin"), false);
  assert.equal(isPublicIndexablePath("/admin/equipment"), false);
  assert.equal(isPublicIndexablePath("/administrator"), true);
  assert.equal(isPublicIndexablePath("https://www.plantxchanger.com/admin"), false);
  assert.equal(isPublicIndexablePath("/api/equipment-items"), false);
  assert.equal(isPublicIndexablePath("/apiary"), true);
  assert.equal(isPublicIndexablePath("/quotes"), false);
  assert.equal(isPublicIndexablePath("/quotes/new"), false);
  assert.equal(isPublicIndexablePath("/quotes-old"), true);
  assert.equal(isPublicIndexablePath("/quotes?status=new"), false);
  assert.equal(isPublicIndexablePath("/"), true);
  assert.equal(isPublicIndexablePath("/catalog?category=reactors"), true);
  assert.equal(isPublicIndexablePath("/equipment/demo"), true);
});

test("readPostgresFirst treats empty and null Postgres results as authoritative", async () => {
  assert.deepEqual(
    await readPostgresFirst({
      hasPostgres: true,
      readPostgres: async () => [],
      readFallback: async () => ["fallback"],
    }),
    [],
  );
  assert.equal(
    await readPostgresFirst({
      hasPostgres: true,
      readPostgres: async () => null,
      readFallback: async () => "fallback",
    }),
    null,
  );
});

test("readPostgresFirst falls back only without Postgres config or after Postgres throws", async () => {
  assert.equal(
    await readPostgresFirst({
      hasPostgres: false,
      readPostgres: async () => "postgres",
      readFallback: async () => "fallback",
    }),
    "fallback",
  );
  assert.equal(
    await readPostgresFirst({
      hasPostgres: true,
      readPostgres: async () => {
        throw new Error("database unavailable");
      },
      readFallback: async () => "fallback",
    }),
    "fallback",
  );
});

test("buildEquipmentMetadata creates keyword-specific title, description, and canonical URL", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.plantxchange.com";
  const equipment = fallbackEquipment.find((item) => item.slug === "ici-low-pressure-methanol-plant-800000-mt-yr")!;

  const metadata = buildEquipmentMetadata(equipment);

  assert.equal(
    metadata.title,
    "ICI Low-Pressure Methanol Plant 800,000 MT/YR | Used Chemical Plant",
  );
  assert.match(String(metadata.description), /used chemical plant/i);
  assert.match(String(metadata.description), /United States/i);
  assert.deepEqual(metadata.alternates, {
    canonical: "https://www.plantxchanger.com/equipment/ici-low-pressure-methanol-plant-800000-mt-yr",
  });
  assert.equal(metadata.openGraph?.title, metadata.title);
});

test("buildEquipmentJsonLd returns Product schema with offer and seller context", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.plantxchange.com";
  const equipment = fallbackEquipment[0];

  const jsonLd = buildEquipmentJsonLd(equipment);

  assert.equal(jsonLd["@context"], "https://schema.org");
  assert.equal(jsonLd["@type"], "Product");
  assert.equal(jsonLd.name, equipment.title);
  assert.equal(jsonLd.sku, equipment.reference);
  assert.equal(jsonLd.brand.name, equipment.make);
  assert.equal(jsonLd.offers.url, `https://www.plantxchanger.com/equipment/${equipment.slug}`);
  assert.equal(jsonLd.offers.priceCurrency, "USD");
});

test("buildSitemapEntries includes public pages and equipment but excludes private quote dashboard", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.plantxchange.com";
  const entries = buildSitemapEntries(fallbackEquipment.slice(0, 2));
  const urls = entries.map((entry) => entry.url);

  assert.ok(urls.includes("https://www.plantxchanger.com/"));
  assert.ok(urls.includes("https://www.plantxchanger.com/catalog"));
  assert.ok(urls.includes("https://www.plantxchanger.com/sell"));
  assert.ok(urls.includes("https://www.plantxchanger.com/about"));
  assert.ok(urls.includes(`https://www.plantxchanger.com/equipment/${fallbackEquipment[0].slug}`));
  assert.ok(!urls.includes("https://www.plantxchanger.com/quotes"));
});

test("buildRobotsPolicy allows search and AI crawlers while blocking private routes", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.plantxchange.com";

  const policy = buildRobotsPolicy();
  const rules = Array.isArray(policy.rules) ? policy.rules : [policy.rules];
  const userAgents = rules.flatMap((rule) =>
    Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent],
  );

  assert.equal(policy.sitemap, "https://www.plantxchanger.com/sitemap.xml");
  assert.ok(userAgents.includes("*"));
  assert.ok(userAgents.includes("Googlebot"));
  assert.ok(userAgents.includes("OAI-SearchBot"));
  assert.ok(userAgents.includes("GPTBot"));
  assert.ok(rules.every((rule) => {
    const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
    return disallow.includes("/api/") && disallow.includes("/quotes");
  }));
});
