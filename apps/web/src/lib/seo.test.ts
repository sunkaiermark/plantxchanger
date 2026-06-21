import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { fallbackEquipment } from "./fallback-data";
import {
  buildRobotsPolicy,
  buildEquipmentJsonLd,
  buildEquipmentMetadata,
  buildSitemapEntries,
  canonicalUrl,
  getPublicSiteUrl,
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
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.plantxchange.com/";

  assert.equal(getPublicSiteUrl(), "https://www.plantxchange.com");
  assert.equal(canonicalUrl("/catalog"), "https://www.plantxchange.com/catalog");
  assert.equal(
    canonicalUrl("equipment/ici-low-pressure-methanol-plant-800000-mt-yr"),
    "https://www.plantxchange.com/equipment/ici-low-pressure-methanol-plant-800000-mt-yr",
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
    canonical: "https://www.plantxchange.com/equipment/ici-low-pressure-methanol-plant-800000-mt-yr",
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
  assert.equal(jsonLd.offers.url, `https://www.plantxchange.com/equipment/${equipment.slug}`);
  assert.equal(jsonLd.offers.priceCurrency, "USD");
});

test("buildSitemapEntries includes public pages and equipment but excludes private quote dashboard", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.plantxchange.com";
  const entries = buildSitemapEntries(fallbackEquipment.slice(0, 2));
  const urls = entries.map((entry) => entry.url);

  assert.ok(urls.includes("https://www.plantxchange.com/"));
  assert.ok(urls.includes("https://www.plantxchange.com/catalog"));
  assert.ok(urls.includes("https://www.plantxchange.com/sell"));
  assert.ok(urls.includes("https://www.plantxchange.com/about"));
  assert.ok(urls.includes(`https://www.plantxchange.com/equipment/${fallbackEquipment[0].slug}`));
  assert.ok(!urls.includes("https://www.plantxchange.com/quotes"));
});

test("buildRobotsPolicy allows search and AI crawlers while blocking private routes", () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.plantxchange.com";

  const policy = buildRobotsPolicy();
  const rules = Array.isArray(policy.rules) ? policy.rules : [policy.rules];
  const userAgents = rules.flatMap((rule) =>
    Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent],
  );

  assert.equal(policy.sitemap, "https://www.plantxchange.com/sitemap.xml");
  assert.ok(userAgents.includes("*"));
  assert.ok(userAgents.includes("Googlebot"));
  assert.ok(userAgents.includes("OAI-SearchBot"));
  assert.ok(userAgents.includes("GPTBot"));
  assert.ok(rules.every((rule) => {
    const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
    return disallow.includes("/api/") && disallow.includes("/quotes");
  }));
});
