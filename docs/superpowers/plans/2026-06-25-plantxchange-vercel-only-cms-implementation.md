# PlantXchange Vercel-Only CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a password-protected CMS inside the existing Next.js app so PlantXchange can manage equipment, categories, settings, SEO fields, and inquiries before Google promotion.

**Architecture:** Keep production Vercel-only: the public site and admin UI both live in `apps/web`, admin APIs run as Next.js route handlers, and Postgres is accessed through the existing `DATABASE_URL` and Neon SQL helper. Public catalog routes read published Postgres content first and fall back to checked-in sample data when the database is empty or unavailable.

**Tech Stack:** Next.js 16 app router, React 19, TypeScript, Zod, `@neondatabase/serverless`, Node `crypto`, built-in `node:test`, ESLint, Vercel environment variables.

---

## File Structure

Create or modify these files. Keep public site rendering separate from admin-only code.

- Create `apps/web/src/lib/admin/session.ts`: signed admin session cookie creation, parsing, verification, and cookie clearing.
- Create `apps/web/src/lib/admin/session.test.ts`: deterministic session and tamper tests.
- Create `apps/web/src/lib/admin/validation.ts`: Zod schemas and normalization helpers for admin forms and APIs.
- Create `apps/web/src/lib/admin/validation.test.ts`: schema tests for equipment, category, settings, inquiry status, and slug normalization.
- Create `apps/web/src/lib/catalog/types.ts`: CMS-facing public catalog aliases and query option types.
- Create `apps/web/src/lib/postgres/catalog.ts`: schema initialization, mapping, public catalog queries, admin CRUD, settings access, and seed helpers.
- Create `apps/web/src/lib/postgres/catalog.test.ts`: SQL shape, mapping, fallback trigger, and seed idempotency tests using a fake SQL executor.
- Modify `apps/web/src/lib/postgres/inquiries.ts`: migrate inquiry statuses, add internal notes, expose admin query/update functions.
- Modify `apps/web/src/lib/postgres/inquiries.test.ts`: cover inquiry migration, admin filtering, and note updates.
- Modify `apps/web/src/lib/strapi/types.ts`: update `QuoteStatus`, `InquirySummary`, and `SiteSettings` fields used by the new CMS.
- Modify `apps/web/src/lib/strapi/inquiries.ts`: keep public inquiry creation and quote listing compatible with Postgres-first inquiry storage.
- Modify `apps/web/src/lib/fallback-quotes.ts`: convert old sample statuses to the new status set.
- Modify `apps/web/src/lib/fallback-data.ts`: add settings fields used by the CMS and keep sample catalog as fallback seed source.
- Modify `apps/web/src/lib/strapi/equipment.ts`: delegate catalog reads to Postgres-first helpers while preserving function names used by public pages.
- Create `apps/web/src/app/admin/(protected)/layout.tsx`: admin metadata and shared protected layout wrapper.
- Create `apps/web/src/app/admin/login/page.tsx`: login page.
- Create `apps/web/src/app/admin/(protected)/page.tsx`: dashboard counts and seed action entry point.
- Create `apps/web/src/app/admin/(protected)/equipment/page.tsx`: equipment table.
- Create `apps/web/src/app/admin/(protected)/equipment/new/page.tsx`: create equipment form.
- Create `apps/web/src/app/admin/(protected)/equipment/[id]/page.tsx`: edit equipment form.
- Create `apps/web/src/app/admin/(protected)/categories/page.tsx`: category table and form links.
- Create `apps/web/src/app/admin/(protected)/inquiries/page.tsx`: inquiry table and status controls.
- Create `apps/web/src/app/admin/(protected)/settings/page.tsx`: global settings form.
- Create `apps/web/src/components/admin/admin-shell.tsx`: sidebar, header, logout form, and layout chrome.
- Create `apps/web/src/components/admin/admin-login-form.tsx`: client-side password form.
- Create `apps/web/src/components/admin/admin-equipment-form.tsx`: client-side equipment editor.
- Create `apps/web/src/components/admin/admin-category-form.tsx`: client-side category editor.
- Create `apps/web/src/components/admin/admin-inquiry-status-form.tsx`: status and note editor.
- Create `apps/web/src/components/admin/admin-settings-form.tsx`: settings editor.
- Create `apps/web/src/components/admin/admin-seed-form.tsx`: import checked-in fallback data into Postgres.
- Create `apps/web/src/app/api/admin/login/route.ts`: password login.
- Create `apps/web/src/app/api/admin/logout/route.ts`: logout.
- Create `apps/web/src/app/api/admin/seed/route.ts`: authenticated fallback catalog seed endpoint.
- Create `apps/web/src/app/api/admin/equipment/route.ts`: authenticated list/create equipment endpoint.
- Create `apps/web/src/app/api/admin/equipment/[id]/route.ts`: authenticated get/update/delete equipment endpoint.
- Create `apps/web/src/app/api/admin/categories/route.ts`: authenticated list/create category endpoint.
- Create `apps/web/src/app/api/admin/categories/[id]/route.ts`: authenticated update/delete category endpoint.
- Create `apps/web/src/app/api/admin/inquiries/route.ts`: authenticated inquiry list endpoint.
- Create `apps/web/src/app/api/admin/inquiries/[id]/route.ts`: authenticated inquiry update endpoint.
- Create `apps/web/src/app/api/admin/settings/route.ts`: authenticated settings read/update endpoint.
- Modify `apps/web/src/app/page.tsx`: use DB-backed settings and featured equipment through existing data functions.
- Modify `apps/web/src/app/catalog/page.tsx`: use DB-backed published catalog.
- Modify `apps/web/src/app/equipment/[slug]/page.tsx`: use DB-backed published equipment detail and metadata.
- Modify `apps/web/src/app/quotes/page.tsx`: render new inquiry statuses.
- Modify `apps/web/src/app/robots.ts`: disallow `/admin`, `/api`, and `/quotes`.
- Modify `apps/web/src/app/sitemap.ts`: generate sitemap from published DB-backed equipment and categories.
- Modify `apps/web/src/lib/seo.ts` and `apps/web/src/lib/seo.test.ts`: ensure canonical URLs and sitemap content use `https://www.plantxchanger.com`.
- Modify `apps/web/.env.example` and root `.env.example`: document `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.
- Modify `docs/deployment.md`: add Vercel admin CMS environment variables and smoke test steps.

## Status Model

Use this single inquiry status set throughout the CMS and quote pages:

```ts
export type QuoteStatus = "new" | "contacted" | "qualified" | "negotiating" | "closed" | "spam";
```

Map existing rows during schema initialization:

```sql
UPDATE inquiries SET status = 'new' WHERE status = 'pending';
UPDATE inquiries SET status = 'contacted' WHERE status = 'responded';
UPDATE inquiries SET status = 'closed' WHERE status = 'accepted';
```

Keep `"negotiating"` unchanged. No public route exposes inquiry records to crawlers.

## Task 1: Admin Session Foundation

**Files:**
- Create: `apps/web/src/lib/admin/session.ts`
- Create: `apps/web/src/lib/admin/session.test.ts`
- Modify: `apps/web/.env.example`
- Modify: `.env.example`

- [ ] **Step 1: Write session tests**

Create `apps/web/src/lib/admin/session.test.ts` with these tests:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  verifyAdminSessionToken,
} from "./session";

const now = new Date("2026-06-25T00:00:00.000Z");
const secret = "0123456789abcdef0123456789abcdef";

test("createAdminSessionToken signs a verifiable token", () => {
  const token = createAdminSessionToken({ secret, now });
  const result = verifyAdminSessionToken(token, { secret, now });

  assert.equal(result.valid, true);
  assert.equal(result.reason, undefined);
});

test("verifyAdminSessionToken rejects tampered payloads", () => {
  const token = createAdminSessionToken({ secret, now });
  const [payload, signature] = token.split(".");
  const tampered = `${payload.slice(0, -2)}xx.${signature}`;

  const result = verifyAdminSessionToken(tampered, { secret, now });

  assert.equal(result.valid, false);
  assert.equal(result.reason, "signature");
});

test("verifyAdminSessionToken rejects expired tokens", () => {
  const token = createAdminSessionToken({ secret, now });
  const later = new Date("2026-07-05T00:00:00.000Z");

  const result = verifyAdminSessionToken(token, { secret, now: later });

  assert.equal(result.valid, false);
  assert.equal(result.reason, "expired");
});

test("getAdminSessionCookieOptions locks the cookie down", () => {
  const options = getAdminSessionCookieOptions("production");

  assert.equal(ADMIN_SESSION_COOKIE, "plantxchange_admin_session");
  assert.equal(options.httpOnly, true);
  assert.equal(options.secure, true);
  assert.equal(options.sameSite, "lax");
  assert.equal(options.path, "/");
});
```

- [ ] **Step 2: Run the new test and confirm it fails**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
npm run test -- src/lib/admin/session.test.ts
```

Expected: the command fails because `apps/web/src/lib/admin/session.ts` does not exist.

- [ ] **Step 3: Implement signed session helpers**

Create `apps/web/src/lib/admin/session.ts` with this API:

```ts
import { createHmac, timingSafeEqual } from "node:crypto";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const ADMIN_SESSION_COOKIE = "plantxchange_admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

type SessionPayload = {
  sub: "admin";
  exp: number;
};

type TokenOptions = {
  secret: string;
  now?: Date;
};

export type SessionVerification =
  | { valid: true; payload: SessionPayload }
  | { valid: false; reason: "format" | "signature" | "expired" | "payload" };

function base64urlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64urlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function signaturesMatch(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function createAdminSessionToken({ secret, now = new Date() }: TokenOptions): string {
  const payload: SessionPayload = {
    sub: "admin",
    exp: now.getTime() + SESSION_DURATION_MS,
  };
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function verifyAdminSessionToken(
  token: string | undefined,
  { secret, now = new Date() }: TokenOptions,
): SessionVerification {
  if (!token) return { valid: false, reason: "format" };

  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra) return { valid: false, reason: "format" };

  const expectedSignature = sign(encodedPayload, secret);
  if (!signaturesMatch(signature, expectedSignature)) return { valid: false, reason: "signature" };

  try {
    const payload = JSON.parse(base64urlDecode(encodedPayload)) as Partial<SessionPayload>;
    if (payload.sub !== "admin" || typeof payload.exp !== "number") {
      return { valid: false, reason: "payload" };
    }
    if (payload.exp <= now.getTime()) return { valid: false, reason: "expired" };
    return { valid: true, payload: { sub: "admin", exp: payload.exp } };
  } catch {
    return { valid: false, reason: "payload" };
  }
}

export function getAdminSessionCookieOptions(
  nodeEnv = process.env.NODE_ENV,
): Pick<ResponseCookie, "httpOnly" | "secure" | "sameSite" | "path" | "maxAge"> {
  return {
    httpOnly: true,
    secure: nodeEnv === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  };
}

export function getExpiredAdminSessionCookieOptions(): Pick<
  ResponseCookie,
  "httpOnly" | "secure" | "sameSite" | "path" | "maxAge"
> {
  return {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  };
}
```

- [ ] **Step 4: Add environment variable examples**

Append these lines to `apps/web/.env.example` and root `.env.example`:

```env
ADMIN_PASSWORD=change-this-admin-password-before-production
ADMIN_SESSION_SECRET=change-this-32-character-secret-before-production
```

- [ ] **Step 5: Verify session tests pass**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
npm run test -- src/lib/admin/session.test.ts
```

Expected: all tests in `session.test.ts` pass.

- [ ] **Step 6: Commit session foundation**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design
git add apps/web/src/lib/admin/session.ts apps/web/src/lib/admin/session.test.ts apps/web/.env.example .env.example
git commit -m "feat: add admin session signing"
```

Expected: commit succeeds.

## Task 2: Admin Validation Schemas

**Files:**
- Create: `apps/web/src/lib/admin/validation.ts`
- Create: `apps/web/src/lib/admin/validation.test.ts`
- Modify: `apps/web/src/lib/strapi/types.ts`

- [ ] **Step 1: Write validation tests**

Create `apps/web/src/lib/admin/validation.test.ts` with these tests:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  adminCategorySchema,
  adminEquipmentSchema,
  adminInquiryUpdateSchema,
  adminSettingsSchema,
  normalizeSlug,
} from "./validation";

test("normalizeSlug lowercases, trims, and removes unsafe characters", () => {
  assert.equal(normalizeSlug(" ICI Low-Pressure Methanol Plant 800,000 MT/YR "), "ici-low-pressure-methanol-plant-800000-mt-yr");
});

test("adminEquipmentSchema accepts a complete published process equipment record", () => {
  const result = adminEquipmentSchema.safeParse({
    title: "Complete Ammonia Plant 1000 MTPD",
    slug: "complete-ammonia-plant-1000-mtpd",
    reference: "PX-CP-NH3-1000",
    categoryId: "00000000-0000-4000-8000-000000000001",
    condition: "good",
    availability: "available",
    country: "Netherlands",
    location: "Rotterdam, Netherlands",
    year: 2008,
    make: "Haldor Topsoe",
    model: "Ammonia 1000 MTPD",
    serialNumber: "NH3-1000-NL",
    operatingHours: "N/A",
    weight: "Complete plant package",
    dimensions: "Plot plan available under NDA",
    price: 0,
    currency: "USD",
    summary: "Complete ammonia plant available for qualified buyers.",
    description: "Engineering package and inspection available by appointment.",
    features: [{ text: "P&IDs available" }],
    specifications: [{ label: "Capacity", value: "1000 MTPD" }],
    mainImageUrl: "/images/chemical-plant.png",
    galleryImageUrls: ["/images/petrochemical.png"],
    sellerDisplayName: "International Process Plants",
    isFeatured: true,
    isPublished: true,
    seoTitle: "Complete Ammonia Plant 1000 MTPD",
    seoDescription: "Used complete ammonia plant package for sale.",
  });

  assert.equal(result.success, true);
});

test("adminCategorySchema rejects empty names and normalizes slugs", () => {
  const invalid = adminCategorySchema.safeParse({ name: "", slug: "", sortOrder: 0 });
  assert.equal(invalid.success, false);

  const valid = adminCategorySchema.parse({
    name: "Tanks & Vessels",
    slug: " Tanks & Vessels ",
    description: "Used tanks.",
    sortOrder: 40,
  });
  assert.equal(valid.slug, "tanks-vessels");
});

test("adminInquiryUpdateSchema only accepts CMS statuses", () => {
  assert.equal(adminInquiryUpdateSchema.safeParse({ status: "qualified", internalNote: "Call buyer" }).success, true);
  assert.equal(adminInquiryUpdateSchema.safeParse({ status: "pending" }).success, false);
});

test("adminSettingsSchema accepts global settings", () => {
  const parsed = adminSettingsSchema.parse({
    siteName: "PlantXchange",
    contactEmail: "sales@plantxchanger.com",
    whatsappNumber: "+8613800000000",
    whatsappDisplayLabel: "WhatsApp",
    defaultSeoTitle: "Used Industrial Process Equipment Marketplace",
    defaultSeoDescription: "Source used tanks, reactors, mixers, pumps, compressors, and plant assets.",
    footerSummary: "B2B marketplace for second-hand industrial equipment.",
    homepageHeadline: "Used Process Equipment For Serious Buyers",
    homepageIntro: "Find used process equipment and plant assets worldwide.",
  });

  assert.equal(parsed.siteName, "PlantXchange");
});
```

- [ ] **Step 2: Run the validation tests and confirm they fail**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
npm run test -- src/lib/admin/validation.test.ts
```

Expected: the command fails because `validation.ts` does not exist.

- [ ] **Step 3: Update shared types**

Modify `apps/web/src/lib/strapi/types.ts`:

```ts
export type QuoteStatus = "new" | "contacted" | "qualified" | "negotiating" | "closed" | "spam";

export interface InquirySummary {
  documentId: string;
  inquiryType: "buyer" | "seller";
  status: QuoteStatus;
  internalNote?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteSettings {
  siteName: string;
  contactEmail: string;
  whatsappNumber: string;
  whatsappDisplayLabel: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  footerSummary?: string;
  homepageHeadline?: string;
  homepageIntro?: string;
}
```

Keep all existing equipment and category interfaces unchanged.

- [ ] **Step 4: Implement validation schemas**

Create `apps/web/src/lib/admin/validation.ts`:

```ts
import { z } from "zod";
import type {
  EquipmentAvailability,
  EquipmentCondition,
  EquipmentCurrency,
  QuoteStatus,
} from "@/lib/strapi/types";

const equipmentConditions: [EquipmentCondition, ...EquipmentCondition[]] = [
  "excellent",
  "good",
  "fair",
  "for-parts",
];
const equipmentAvailability: [EquipmentAvailability, ...EquipmentAvailability[]] = [
  "available",
  "under-review",
  "sold",
];
const equipmentCurrencies: [EquipmentCurrency, ...EquipmentCurrency[]] = ["USD", "EUR", "CNY"];
const inquiryStatuses: [QuoteStatus, ...QuoteStatus[]] = [
  "new",
  "contacted",
  "qualified",
  "negotiating",
  "closed",
  "spam",
];

function emptyToUndefined(value: unknown): unknown {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

const trimmed = (max: number) =>
  z.string().trim().min(1).max(max);

const optionalTrimmed = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());

const featureSchema = z.object({
  text: trimmed(180),
});

const specificationSchema = z.object({
  label: trimmed(80),
  value: trimmed(180),
});

export const adminCategorySchema = z.object({
  name: trimmed(120),
  slug: z.string().trim().min(1).max(140).transform(normalizeSlug),
  description: optionalTrimmed(600),
  imageUrl: optionalTrimmed(500),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
  seoTitle: optionalTrimmed(160),
  seoDescription: optionalTrimmed(260),
});

export const adminEquipmentSchema = z.object({
  title: trimmed(180),
  slug: z.string().trim().min(1).max(220).transform(normalizeSlug),
  reference: trimmed(80),
  categoryId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  condition: z.enum(equipmentConditions),
  availability: z.enum(equipmentAvailability),
  country: optionalTrimmed(120),
  location: optionalTrimmed(180),
  year: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1900).max(2100).optional()),
  make: optionalTrimmed(120),
  model: optionalTrimmed(160),
  serialNumber: optionalTrimmed(120),
  operatingHours: optionalTrimmed(80),
  weight: optionalTrimmed(120),
  dimensions: optionalTrimmed(180),
  price: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
  currency: z.enum(equipmentCurrencies).default("USD"),
  summary: optionalTrimmed(400),
  description: optionalTrimmed(4000),
  features: z.array(featureSchema).max(20).default([]),
  specifications: z.array(specificationSchema).max(40).default([]),
  mainImageUrl: optionalTrimmed(500),
  galleryImageUrls: z.array(z.string().trim().min(1).max(500)).max(12).default([]),
  sellerDisplayName: optionalTrimmed(180),
  isFeatured: z.coerce.boolean().default(false),
  isPublished: z.coerce.boolean().default(false),
  seoTitle: optionalTrimmed(160),
  seoDescription: optionalTrimmed(260),
});

export const adminInquiryUpdateSchema = z.object({
  status: z.enum(inquiryStatuses),
  internalNote: optionalTrimmed(2000),
});

export const adminSettingsSchema = z.object({
  siteName: trimmed(120),
  contactEmail: z.string().trim().email().max(180),
  whatsappNumber: trimmed(80),
  whatsappDisplayLabel: trimmed(80),
  defaultSeoTitle: optionalTrimmed(160),
  defaultSeoDescription: optionalTrimmed(260),
  footerSummary: optionalTrimmed(600),
  homepageHeadline: optionalTrimmed(180),
  homepageIntro: optionalTrimmed(500),
});

export type AdminCategoryInput = z.infer<typeof adminCategorySchema>;
export type AdminEquipmentInput = z.infer<typeof adminEquipmentSchema>;
export type AdminInquiryUpdateInput = z.infer<typeof adminInquiryUpdateSchema>;
export type AdminSettingsInput = z.infer<typeof adminSettingsSchema>;
```

- [ ] **Step 5: Verify validation tests pass**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
npm run test -- src/lib/admin/validation.test.ts
```

Expected: all validation tests pass.

- [ ] **Step 6: Commit validation schemas**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design
git add apps/web/src/lib/admin/validation.ts apps/web/src/lib/admin/validation.test.ts apps/web/src/lib/strapi/types.ts
git commit -m "feat: add admin validation schemas"
```

Expected: commit succeeds.

## Task 3: Postgres Catalog Repository

**Files:**
- Create: `apps/web/src/lib/catalog/types.ts`
- Create: `apps/web/src/lib/postgres/catalog.ts`
- Create: `apps/web/src/lib/postgres/catalog.test.ts`
- Modify: `apps/web/src/lib/fallback-data.ts`

- [ ] **Step 1: Write repository tests**

Create `apps/web/src/lib/postgres/catalog.test.ts` with fake executor coverage:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import type { SqlExecutor } from "./client";
import {
  getCatalogEquipmentFromPostgres,
  getCategoriesFromPostgres,
  getEquipmentBySlugFromPostgres,
  mapCategoryRow,
  mapEquipmentRow,
  seedFallbackCatalog,
} from "./catalog";

function fakeSql(rowsByCall: Array<Array<Record<string, unknown>>>) {
  const calls: string[] = [];
  const sql: SqlExecutor = async (strings, ...values) => {
    calls.push(String.raw({ raw: strings }, ...values.map((_, index) => `$${index + 1}`)));
    return rowsByCall.shift() ?? [];
  };
  return { sql, calls };
}

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

  assert.equal(category.documentId, "cat-1");
  assert.equal(category.sortOrder, 10);
});

test("mapEquipmentRow converts JSON fields and category fields", () => {
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
    price: "0",
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
  assert.equal(equipment.gallery[0]?.url, "/images/petrochemical.png");
});

test("getCatalogEquipmentFromPostgres filters published records", async () => {
  const { sql, calls } = fakeSql([[]]);

  await getCatalogEquipmentFromPostgres(sql, { category: "chemical-plant", search: "ammonia" });

  assert.match(calls.join("\n"), /is_published = true/);
  assert.match(calls.join("\n"), /category_slug/);
});

test("getEquipmentBySlugFromPostgres returns null for missing rows", async () => {
  const { sql } = fakeSql([[]]);

  const equipment = await getEquipmentBySlugFromPostgres(sql, "missing");

  assert.equal(equipment, null);
});

test("getCategoriesFromPostgres orders by sort order and name", async () => {
  const { sql, calls } = fakeSql([[]]);

  await getCategoriesFromPostgres(sql);

  assert.match(calls[0], /ORDER BY sort_order ASC, name ASC/);
});

test("seedFallbackCatalog uses upsert statements", async () => {
  const { sql, calls } = fakeSql([[], [], [], []]);

  await seedFallbackCatalog(sql);

  assert.match(calls.join("\n"), /ON CONFLICT \(slug\) DO UPDATE/);
  assert.match(calls.join("\n"), /ON CONFLICT \(reference\) DO UPDATE/);
});
```

- [ ] **Step 2: Run repository tests and confirm they fail**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
npm run test -- src/lib/postgres/catalog.test.ts
```

Expected: the command fails because `catalog.ts` does not exist.

- [ ] **Step 3: Create catalog query types**

Create `apps/web/src/lib/catalog/types.ts`:

```ts
export interface CatalogSearchParams {
  search?: string;
  category?: string;
  condition?: string;
  availability?: string;
  country?: string;
}
```

- [ ] **Step 4: Add fallback setting fields**

Modify `apps/web/src/lib/fallback-data.ts` so `fallbackSiteSettings` includes:

```ts
homepageHeadline: "The global exchange for used process equipment",
homepageIntro:
  "Source used tanks, reactors, mixers, pumps, compressors, and complete plant assets from serious industrial sellers.",
```

Keep existing fields unchanged.

- [ ] **Step 5: Implement Postgres catalog repository**

Create `apps/web/src/lib/postgres/catalog.ts` with these exports and behavior:

```ts
import { fallbackCategories, fallbackEquipment, fallbackSiteSettings } from "@/lib/fallback-data";
import type { CatalogSearchParams } from "@/lib/catalog/types";
import type {
  CategorySummary,
  EquipmentFeature,
  EquipmentSpecification,
  EquipmentSummary,
  MediaAsset,
  SiteSettings,
} from "@/lib/strapi/types";
import type { AdminCategoryInput, AdminEquipmentInput, AdminSettingsInput } from "@/lib/admin/validation";
import type { SqlExecutor } from "./client";

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return undefined;
}

function booleanValue(value: unknown): boolean {
  return value === true;
}

function jsonArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function mediaAsset(url: unknown): MediaAsset | undefined {
  const value = stringValue(url);
  return value ? { url: value } : undefined;
}

export function mapCategoryRow(row: Record<string, unknown>): CategorySummary {
  return {
    documentId: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: stringValue(row.description),
    sortOrder: Number(row.sort_order ?? 0),
    seoTitle: stringValue(row.seo_title),
    seoDescription: stringValue(row.seo_description),
  };
}

export function mapEquipmentRow(row: Record<string, unknown>): EquipmentSummary {
  const galleryUrls = jsonArray<string>(row.gallery_image_urls);
  const categoryId = stringValue(row.category_id);

  return {
    documentId: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    reference: String(row.reference),
    category: categoryId
      ? {
          documentId: categoryId,
          name: String(row.category_name ?? ""),
          slug: String(row.category_slug ?? ""),
          description: stringValue(row.category_description),
          sortOrder: Number(row.category_sort_order ?? 0),
        }
      : undefined,
    condition: String(row.condition ?? "good") as EquipmentSummary["condition"],
    availability: String(row.availability ?? "available") as EquipmentSummary["availability"],
    country: stringValue(row.country),
    location: stringValue(row.location),
    year: numberValue(row.year),
    make: stringValue(row.make),
    model: stringValue(row.model),
    serialNumber: stringValue(row.serial_number),
    operatingHours: stringValue(row.operating_hours),
    weight: stringValue(row.weight),
    dimensions: stringValue(row.dimensions),
    price: numberValue(row.price),
    currency: String(row.currency ?? "USD") as EquipmentSummary["currency"],
    summary: stringValue(row.summary),
    description: stringValue(row.description),
    specifications: jsonArray<EquipmentSpecification>(row.specifications),
    features: jsonArray<EquipmentFeature>(row.features),
    mainImage: mediaAsset(row.main_image_url),
    gallery: galleryUrls.map((url) => ({ url })),
    sellerDisplayName: stringValue(row.seller_display_name),
    isFeatured: booleanValue(row.is_featured),
    seoTitle: stringValue(row.seo_title),
    seoDescription: stringValue(row.seo_description),
  };
}
```

Add `ensureCatalogSchema(sql)` in the same file. It must create these tables idempotently:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS categories (...);
CREATE TABLE IF NOT EXISTS equipment (...);
CREATE TABLE IF NOT EXISTS site_settings (...);
```

Use the column list from the approved spec. Use `gen_random_uuid()` as the default UUID generator. Add `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` to all mutable tables.

Add public query functions:

```ts
export async function getCategoriesFromPostgres(sql: SqlExecutor): Promise<CategorySummary[]>;
export async function getFeaturedEquipmentFromPostgres(sql: SqlExecutor): Promise<EquipmentSummary[]>;
export async function getCatalogEquipmentFromPostgres(
  sql: SqlExecutor,
  searchParams: CatalogSearchParams,
): Promise<EquipmentSummary[]>;
export async function getEquipmentBySlugFromPostgres(
  sql: SqlExecutor,
  slug: string,
): Promise<EquipmentSummary | null>;
export async function getSiteSettingsFromPostgres(sql: SqlExecutor): Promise<SiteSettings>;
```

Each query must call `ensureCatalogSchema(sql)` first. Public equipment queries must include `WHERE equipment.is_published = true`.

Add admin functions in the same file:

```ts
export async function getAdminDashboardStats(sql: SqlExecutor): Promise<{
  totalEquipment: number;
  publishedEquipment: number;
  featuredEquipment: number;
  newInquiries: number;
}>;
export async function listAdminEquipment(sql: SqlExecutor): Promise<EquipmentSummary[]>;
export async function getAdminEquipmentById(sql: SqlExecutor, id: string): Promise<EquipmentSummary | null>;
export async function createAdminEquipment(sql: SqlExecutor, input: AdminEquipmentInput): Promise<EquipmentSummary>;
export async function updateAdminEquipment(sql: SqlExecutor, id: string, input: AdminEquipmentInput): Promise<EquipmentSummary>;
export async function deleteAdminEquipment(sql: SqlExecutor, id: string): Promise<void>;
export async function listAdminCategories(sql: SqlExecutor): Promise<CategorySummary[]>;
export async function createAdminCategory(sql: SqlExecutor, input: AdminCategoryInput): Promise<CategorySummary>;
export async function updateAdminCategory(sql: SqlExecutor, id: string, input: AdminCategoryInput): Promise<CategorySummary>;
export async function deleteAdminCategory(sql: SqlExecutor, id: string): Promise<void>;
export async function updateAdminSettings(sql: SqlExecutor, input: AdminSettingsInput): Promise<SiteSettings>;
export async function seedFallbackCatalog(sql: SqlExecutor): Promise<{ categories: number; equipment: number }>;
```

Use `INSERT ... ON CONFLICT (slug) DO UPDATE` for categories and `INSERT ... ON CONFLICT (reference) DO UPDATE` for equipment seeding. Seed from `fallbackCategories`, `fallbackEquipment`, and `fallbackSiteSettings`.

- [ ] **Step 6: Verify repository tests pass**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
npm run test -- src/lib/postgres/catalog.test.ts
```

Expected: all catalog repository tests pass.

- [ ] **Step 7: Commit catalog repository**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design
git add apps/web/src/lib/catalog/types.ts apps/web/src/lib/postgres/catalog.ts apps/web/src/lib/postgres/catalog.test.ts apps/web/src/lib/fallback-data.ts
git commit -m "feat: add CMS catalog repository"
```

Expected: commit succeeds.

## Task 4: Inquiry Repository Migration

**Files:**
- Modify: `apps/web/src/lib/postgres/inquiries.ts`
- Modify: `apps/web/src/lib/postgres/inquiries.test.ts`
- Modify: `apps/web/src/lib/strapi/inquiries.ts`
- Modify: `apps/web/src/lib/fallback-quotes.ts`
- Modify: `apps/web/src/app/quotes/page.tsx`

- [ ] **Step 1: Add inquiry migration tests**

Extend `apps/web/src/lib/postgres/inquiries.test.ts` with tests that verify:

```ts
test("ensureInquirySchema migrates old status values to CMS status values", async () => {
  const { calls, sql } = fakeSql([]);

  await ensureInquirySchema(sql);

  assert.match(calls.join("\n"), /UPDATE inquiries SET status = 'new' WHERE status = 'pending'/);
  assert.match(calls.join("\n"), /DROP CONSTRAINT IF EXISTS inquiries_status_check/);
  assert.match(calls.join("\n"), /ADD CONSTRAINT inquiries_status_check/);
});

test("updateAdminInquiryInPostgres updates status and internal note", async () => {
  const { calls, sql } = fakeSql([
    [
      {
        id: "inq-1",
        inquiry_type: "buyer",
        status: "qualified",
        internal_note: "Call buyer Tuesday",
        name: "Buyer",
        message: "Need price",
      },
    ],
  ]);

  const inquiry = await updateAdminInquiryInPostgres(sql, "inq-1", {
    status: "qualified",
    internalNote: "Call buyer Tuesday",
  });

  assert.equal(inquiry.status, "qualified");
  assert.equal(inquiry.internalNote, "Call buyer Tuesday");
  assert.match(calls.join("\n"), /internal_note/);
});
```

Use the existing test helper style in `inquiries.test.ts`.

- [ ] **Step 2: Run inquiry tests and confirm they fail**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
npm run test -- src/lib/postgres/inquiries.test.ts
```

Expected: new tests fail because the migration and admin update function do not exist.

- [ ] **Step 3: Update Postgres inquiry schema and mapping**

Modify `apps/web/src/lib/postgres/inquiries.ts`:

- Export `ensureInquirySchema`.
- Add `internal_note TEXT` if missing.
- Add `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` if missing.
- Migrate old statuses:

```sql
UPDATE inquiries SET status = 'new' WHERE status = 'pending';
UPDATE inquiries SET status = 'contacted' WHERE status = 'responded';
UPDATE inquiries SET status = 'closed' WHERE status = 'accepted';
```

- Replace the status check constraint with:

```sql
ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS inquiries_status_check;
ALTER TABLE inquiries
  ADD CONSTRAINT inquiries_status_check
  CHECK (status IN ('new', 'contacted', 'qualified', 'negotiating', 'closed', 'spam'));
```

- Change new inquiry creation default status to `"new"`.
- Map `internal_note` to `internalNote`.

Add these exports:

```ts
export async function getAdminInquiriesFromPostgres(
  sql: SqlExecutor,
  filters?: { status?: QuoteStatus; inquiryType?: "buyer" | "seller"; search?: string },
): Promise<InquirySummary[]>;

export async function updateAdminInquiryInPostgres(
  sql: SqlExecutor,
  id: string,
  input: AdminInquiryUpdateInput,
): Promise<InquirySummary>;
```

- [ ] **Step 4: Update inquiry facade and fallback quotes**

Modify `apps/web/src/lib/strapi/inquiries.ts`:

```ts
const quoteStatuses = new Set<QuoteStatus>([
  "new",
  "contacted",
  "qualified",
  "negotiating",
  "closed",
  "spam",
]);
```

Change fallback quote statuses in `apps/web/src/lib/fallback-quotes.ts`:

- `pending` -> `new`
- `responded` -> `contacted`
- `accepted` -> `closed`
- keep `negotiating`

Modify `apps/web/src/app/quotes/page.tsx` status labels:

```ts
const statusLabels: Record<QuoteStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  negotiating: "Negotiating",
  closed: "Closed",
  spam: "Spam",
};
```

- [ ] **Step 5: Verify inquiry tests pass**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
npm run test -- src/lib/postgres/inquiries.test.ts src/lib/strapi/inquiries.test.ts
```

Expected: inquiry tests pass.

- [ ] **Step 6: Commit inquiry migration**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design
git add apps/web/src/lib/postgres/inquiries.ts apps/web/src/lib/postgres/inquiries.test.ts apps/web/src/lib/strapi/inquiries.ts apps/web/src/lib/fallback-quotes.ts apps/web/src/app/quotes/page.tsx
git commit -m "feat: add CMS inquiry statuses"
```

Expected: commit succeeds.

## Task 5: Public Catalog Reads From Postgres First

**Files:**
- Modify: `apps/web/src/lib/strapi/equipment.ts`
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/app/catalog/page.tsx`
- Modify: `apps/web/src/app/equipment/[slug]/page.tsx`
- Modify: `apps/web/src/app/sitemap.ts`
- Modify: `apps/web/src/lib/seo.ts`
- Modify: `apps/web/src/lib/seo.test.ts`

- [ ] **Step 1: Add SEO and data fallback tests**

Extend `apps/web/src/lib/seo.test.ts` with:

```ts
test("admin and quote routes are not included in sitemap urls", () => {
  const urls = ["/", "/catalog", "/admin", "/quotes", "/api/inquiries"];
  const publicUrls = urls.filter(isPublicIndexablePath);

  assert.deepEqual(publicUrls, ["/", "/catalog"]);
});

test("canonical urls use the production www domain", () => {
  assert.equal(getCanonicalUrl("/catalog"), "https://www.plantxchanger.com/catalog");
});
```

If `isPublicIndexablePath` and `getCanonicalUrl` are not exported yet, add them in Step 3.

- [ ] **Step 2: Run affected tests and confirm new assertions fail**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
npm run test -- src/lib/seo.test.ts src/lib/postgres/catalog.test.ts
```

Expected: SEO test fails until helper exports are added.

- [ ] **Step 3: Update SEO helpers**

Modify `apps/web/src/lib/seo.ts` to export:

```ts
const SITE_URL = "https://www.plantxchanger.com";

export function getCanonicalUrl(path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).toString();
}

export function isPublicIndexablePath(path: string): boolean {
  return !path.startsWith("/admin") && !path.startsWith("/api") && path !== "/quotes";
}
```

Keep existing metadata helper behavior and route all canonical construction through `getCanonicalUrl`.

- [ ] **Step 4: Delegate public catalog functions to Postgres-first repository**

Modify `apps/web/src/lib/strapi/equipment.ts`:

- Import `hasPostgresConfig` and `getPostgresSql`.
- Import the Postgres catalog functions from `@/lib/postgres/catalog`.
- Keep the exported function names unchanged:
  - `getSiteSettings`
  - `getCategories`
  - `getFeaturedEquipment`
  - `getEquipmentBySlug`
  - `getCatalogEquipment`
- For each function:
  1. If `hasPostgresConfig()` is true, call the matching Postgres function.
  2. If the Postgres function returns a non-empty list or non-null record, return it.
  3. If the Postgres function throws, fall through to existing Strapi/fallback behavior.
  4. If Postgres returns an empty list, fall through to existing Strapi/fallback behavior.

Use this pattern:

```ts
if (hasPostgresConfig()) {
  try {
    const items = await getCatalogEquipmentFromPostgres(getPostgresSql(), searchParams);
    if (items.length > 0) return items;
  } catch {
    // Public catalog keeps the checked-in sample content available when the database is unavailable.
  }
}
```

- [ ] **Step 5: Update sitemap and route metadata**

Modify `apps/web/src/app/sitemap.ts`:

- Build equipment URLs from `getCatalogEquipment({})`.
- Build category URLs from `getCategories()`.
- Exclude unpublished equipment because `getCatalogEquipment` only returns published rows.
- Exclude `/admin`, `/api`, and `/quotes`.

Modify `apps/web/src/app/equipment/[slug]/page.tsx` metadata so `seoTitle` and `seoDescription` from DB records override defaults.

- [ ] **Step 6: Verify public data tests pass**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
npm run test -- src/lib/seo.test.ts src/lib/postgres/catalog.test.ts
```

Expected: tests pass.

- [ ] **Step 7: Commit public catalog integration**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design
git add apps/web/src/lib/strapi/equipment.ts apps/web/src/app/page.tsx apps/web/src/app/catalog/page.tsx apps/web/src/app/equipment/[slug]/page.tsx apps/web/src/app/sitemap.ts apps/web/src/lib/seo.ts apps/web/src/lib/seo.test.ts
git commit -m "feat: read public catalog from CMS database"
```

Expected: commit succeeds.

## Task 6: Admin API Routes

**Files:**
- Create all `apps/web/src/app/api/admin/**/route.ts` files listed in File Structure.
- Modify: `apps/web/src/lib/env.ts`

- [ ] **Step 1: Add admin env helpers**

Modify `apps/web/src/lib/env.ts`:

```ts
export function hasAdminConfig(): boolean {
  return Boolean(getServerEnv("ADMIN_PASSWORD") && getServerEnv("ADMIN_SESSION_SECRET"));
}
```

Use `getRequiredServerEnv("ADMIN_PASSWORD")` and `getRequiredServerEnv("ADMIN_SESSION_SECRET")` only inside admin route/session checks so missing values fail closed.

- [ ] **Step 2: Create shared route auth helper**

Create `apps/web/src/lib/admin/route-auth.ts`:

```ts
import { cookies } from "next/headers";
import { getRequiredServerEnv } from "@/lib/env";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "./session";

export async function requireAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const result = verifyAdminSessionToken(token, {
    secret: getRequiredServerEnv("ADMIN_SESSION_SECRET"),
  });

  if (!result.valid) {
    throw new Response("Unauthorized", { status: 401 });
  }
}
```

- [ ] **Step 3: Implement login and logout routes**

Create `apps/web/src/app/api/admin/login/route.ts`:

```ts
import { timingSafeEqual } from "node:crypto";
import { getRequiredServerEnv } from "@/lib/env";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
} from "@/lib/admin/session";
import { NextResponse } from "next/server";

function sameSecret(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!sameSecret(password, getRequiredServerEnv("ADMIN_PASSWORD"))) {
    return NextResponse.json({ ok: false, message: "Invalid password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    createAdminSessionToken({ secret: getRequiredServerEnv("ADMIN_SESSION_SECRET") }),
    getAdminSessionCookieOptions(),
  );
  return response;
}
```

Create `apps/web/src/app/api/admin/logout/route.ts`:

```ts
import {
  ADMIN_SESSION_COOKIE,
  getExpiredAdminSessionCookieOptions,
} from "@/lib/admin/session";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", getExpiredAdminSessionCookieOptions());
  return response;
}
```

- [ ] **Step 4: Implement protected CRUD routes**

For each admin route:

1. Call `await requireAdminSession()` at the top of every handler.
2. Use `getPostgresSql()` for database access.
3. Validate request JSON with the matching schema from `admin/validation.ts`.
4. Return `400` for validation errors with `{ ok: false, message: "Please check the form fields." }`.
5. Return `404` for missing equipment/category/inquiry rows.
6. Return `{ ok: true, data: ... }` for successful reads and writes.

Route function mapping:

```ts
// /api/admin/equipment
GET -> listAdminEquipment(sql)
POST -> createAdminEquipment(sql, parsed.data)

// /api/admin/equipment/[id]
GET -> getAdminEquipmentById(sql, params.id)
PUT -> updateAdminEquipment(sql, params.id, parsed.data)
DELETE -> deleteAdminEquipment(sql, params.id)

// /api/admin/categories
GET -> listAdminCategories(sql)
POST -> createAdminCategory(sql, parsed.data)

// /api/admin/categories/[id]
PUT -> updateAdminCategory(sql, params.id, parsed.data)
DELETE -> deleteAdminCategory(sql, params.id)

// /api/admin/inquiries
GET -> getAdminInquiriesFromPostgres(sql, parsed search params)

// /api/admin/inquiries/[id]
PUT -> updateAdminInquiryInPostgres(sql, params.id, parsed.data)

// /api/admin/settings
GET -> getSiteSettingsFromPostgres(sql)
PUT -> updateAdminSettings(sql, parsed.data)

// /api/admin/seed
POST -> seedFallbackCatalog(sql)
```

- [ ] **Step 5: Verify API code typechecks**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
npm run typecheck
```

Expected: TypeScript completes with no errors.

- [ ] **Step 6: Commit admin API routes**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design
git add apps/web/src/app/api/admin apps/web/src/lib/admin/route-auth.ts apps/web/src/lib/env.ts
git commit -m "feat: add admin API routes"
```

Expected: commit succeeds.

## Task 7: Admin UI

**Files:**
- Create all `apps/web/src/app/admin/**` page and layout files listed in File Structure.
- Create all `apps/web/src/components/admin/**` component files listed in File Structure.
- Modify: `apps/web/src/app/globals.css`

- [ ] **Step 1: Add admin layout and noindex metadata**

Create `apps/web/src/app/admin/(protected)/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRequiredServerEnv } from "@/lib/env";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "PlantXchange Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const result = verifyAdminSessionToken(token, {
    secret: getRequiredServerEnv("ADMIN_SESSION_SECRET"),
  });

  if (!result.valid) redirect("/admin/login");

  return <AdminShell>{children}</AdminShell>;
}
```

Create `apps/web/src/app/admin/login/page.tsx` outside the protected route group:

```tsx
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Login | PlantXchange",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
```

The protected route group does not add a URL segment. The final route URLs remain `/admin`, `/admin/equipment`, `/admin/categories`, `/admin/inquiries`, and `/admin/settings`.

- [ ] **Step 2: Create admin shell**

Create `apps/web/src/components/admin/admin-shell.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/equipment", label: "Equipment" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin">PlantXchange CMS</Link>
        <nav>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>
        <button type="button" onClick={logout}>Log out</button>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Create login form**

Create `apps/web/src/components/admin/admin-login-form.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setIsSaving(false);
    if (!response.ok) {
      setMessage("Invalid password.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="admin-login">
      <form onSubmit={submit}>
        <h1>PlantXchange CMS</h1>
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
        {message ? <p role="alert">{message}</p> : null}
        <button type="submit" disabled={isSaving}>{isSaving ? "Signing in" : "Sign in"}</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Create dashboard and seed form**

Create `apps/web/src/app/admin/(protected)/page.tsx`:

```tsx
import { AdminSeedForm } from "@/components/admin/admin-seed-form";
import { getPostgresSql } from "@/lib/postgres/client";
import { getAdminDashboardStats } from "@/lib/postgres/catalog";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats(getPostgresSql());

  return (
    <section className="admin-stack">
      <h1>Dashboard</h1>
      <div className="admin-stat-grid">
        <div>Total equipment <strong>{stats.totalEquipment}</strong></div>
        <div>Published <strong>{stats.publishedEquipment}</strong></div>
        <div>Featured <strong>{stats.featuredEquipment}</strong></div>
        <div>New inquiries <strong>{stats.newInquiries}</strong></div>
      </div>
      <AdminSeedForm />
    </section>
  );
}
```

Create `apps/web/src/components/admin/admin-seed-form.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminSeedForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function seed() {
    const response = await fetch("/api/admin/seed", { method: "POST" });
    const data = await response.json().catch(() => null);
    setMessage(response.ok ? "Sample catalog imported." : data?.message ?? "Import failed.");
    if (response.ok) router.refresh();
  }

  return (
    <section className="admin-panel">
      <h2>Seed catalog</h2>
      <p>Import the checked-in sample equipment and categories into Postgres.</p>
      <button type="button" onClick={seed}>Import sample catalog</button>
      {message ? <p>{message}</p> : null}
    </section>
  );
}
```

- [ ] **Step 5: Create admin tables and forms**

Create these pages and components using the same fetch pattern as `AdminLoginForm`:

- `admin-equipment-form.tsx` posts JSON to `/api/admin/equipment` for create and `/api/admin/equipment/[id]` for update.
- `admin-category-form.tsx` posts JSON to `/api/admin/categories` for create and `/api/admin/categories/[id]` for update.
- `admin-inquiry-status-form.tsx` sends `{ status, internalNote }` to `/api/admin/inquiries/[id]`.
- `admin-settings-form.tsx` sends settings JSON to `/api/admin/settings`.

Every form must:

- Preserve entered values after a failed save.
- Show the server message returned by the route.
- Disable the save button while submitting.
- Call `router.refresh()` after a successful save.

Every table page must:

- Render compact rows with primary fields first.
- Use `Link` for edit pages.
- Avoid card-heavy marketing layout.

- [ ] **Step 6: Add admin CSS**

Append to `apps/web/src/app/globals.css`:

```css
.admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  background: #f5f5f3;
  color: #171717;
}

.admin-sidebar {
  background: #20242b;
  color: #fff;
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.admin-sidebar a,
.admin-sidebar button {
  color: inherit;
  font: inherit;
}

.admin-sidebar nav {
  display: grid;
  gap: 8px;
}

.admin-main {
  padding: 32px;
}

.admin-stack {
  display: grid;
  gap: 24px;
}

.admin-panel,
.admin-table-wrap {
  background: #fff;
  border: 1px solid #dfdfdc;
  padding: 20px;
}

.admin-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.admin-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.admin-form-grid label {
  display: grid;
  gap: 6px;
  font-weight: 700;
}

.admin-form-grid input,
.admin-form-grid textarea,
.admin-form-grid select {
  width: 100%;
  border: 1px solid #cfcfca;
  padding: 10px 12px;
  font: inherit;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  border-bottom: 1px solid #e5e5e0;
  padding: 10px;
  text-align: left;
}

@media (max-width: 800px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }

  .admin-stat-grid,
  .admin-form-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 7: Verify admin UI typechecks**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
npm run typecheck
```

Expected: TypeScript completes with no errors.

- [ ] **Step 8: Commit admin UI**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design
git add apps/web/src/app/admin apps/web/src/components/admin apps/web/src/app/globals.css
git commit -m "feat: add PlantXchange CMS admin UI"
```

Expected: commit succeeds.

## Task 8: Robots, Sitemap, and Google Readiness

**Files:**
- Modify: `apps/web/src/app/robots.ts`
- Modify: `apps/web/src/app/sitemap.ts`
- Modify: `apps/web/src/lib/seo.ts`
- Modify: `apps/web/src/lib/seo.test.ts`
- Modify: `docs/deployment.md`

- [ ] **Step 1: Update robots policy**

Modify `apps/web/src/app/robots.ts` to include:

```ts
disallow: ["/admin", "/api", "/quotes"],
```

Ensure sitemap points to:

```ts
sitemap: "https://www.plantxchanger.com/sitemap.xml",
```

- [ ] **Step 2: Update sitemap**

Modify `apps/web/src/app/sitemap.ts` so it only includes:

- `/`
- `/catalog`
- `/about`
- `/sell`
- category URLs from `getCategories()`
- equipment URLs from `getCatalogEquipment({})`

It must not include `/admin`, `/api`, or `/quotes`.

- [ ] **Step 3: Update deployment docs**

Add this section to `docs/deployment.md`:

```md
## Vercel-Only CMS

Set these Vercel environment variables for Production and Preview:

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL=https://www.plantxchanger.com`
- `NEXT_PUBLIC_FALLBACK_CONTACT_EMAIL=sales@plantxchanger.com`
- `NEXT_PUBLIC_FALLBACK_WHATSAPP_NUMBER=<business WhatsApp number>`
- `ADMIN_PASSWORD=<long private password>`
- `ADMIN_SESSION_SECRET=<32+ character random secret>`

After deployment:

1. Open `https://www.plantxchanger.com/admin/login`.
2. Sign in with `ADMIN_PASSWORD`.
3. Open Dashboard and run "Import sample catalog" once.
4. Create or edit one equipment record and publish it.
5. Open `/catalog` and confirm the published record appears.
6. Open `/sitemap.xml` and confirm it uses `https://www.plantxchanger.com`.
7. Open `/robots.txt` and confirm `/admin`, `/api`, and `/quotes` are disallowed.
```

- [ ] **Step 4: Verify SEO tests pass**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
npm run test -- src/lib/seo.test.ts
```

Expected: SEO tests pass.

- [ ] **Step 5: Commit Google readiness changes**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design
git add apps/web/src/app/robots.ts apps/web/src/app/sitemap.ts apps/web/src/lib/seo.ts apps/web/src/lib/seo.test.ts docs/deployment.md
git commit -m "chore: prepare CMS pages for search launch"
```

Expected: commit succeeds.

## Task 9: Full Verification and Release Handoff

**Files:**
- Modify only files needed to fix failures from the commands in this task.

- [ ] **Step 1: Run unit tests**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
npm run test
```

Expected: all `node --test` suites pass.

- [ ] **Step 2: Run typecheck**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
npm run typecheck
```

Expected: TypeScript completes with no errors.

- [ ] **Step 3: Run lint**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
npm run lint
```

Expected: ESLint completes with no errors.

- [ ] **Step 4: Run production build**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
node node_modules/next/dist/bin/next build
```

Expected: Next.js production build completes successfully.

- [ ] **Step 5: Run local admin smoke test**

Start local dev server:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design\apps\web
$env:DATABASE_URL="postgresql://plantxchange:plantxchange@127.0.0.1:5432/plantxchange"
$env:ADMIN_PASSWORD="local-admin-password-for-manual-smoke-test"
$env:ADMIN_SESSION_SECRET="local-dev-secret-with-at-least-32-characters"
npm run dev
```

Manual checks:

- Open `http://127.0.0.1:3000/admin/login`.
- Sign in.
- Import sample catalog.
- Create a category.
- Create and publish equipment.
- Open `http://127.0.0.1:3000/catalog`.
- Confirm the published equipment appears.
- Submit a buyer inquiry from an equipment page.
- Open `http://127.0.0.1:3000/admin/inquiries`.
- Change the inquiry status to `qualified` and add an internal note.
- Open `http://127.0.0.1:3000/robots.txt` and confirm admin/API/quotes disallow rules.
- Open `http://127.0.0.1:3000/sitemap.xml` and confirm published equipment URLs appear.

- [ ] **Step 6: Commit final verification fixes**

If Step 1 through Step 5 required fixes, run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design
git status --short
git add apps/web/src docs/deployment.md apps/web/.env.example .env.example
git commit -m "fix: stabilize CMS verification"
```

If there are no fixes, run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design
git status --short
```

Expected: working tree is clean.

- [ ] **Step 7: Push branch**

Run:

```powershell
cd C:\Users\Mark\Documents\plantexchange\.worktrees\vercel-only-cms-design
git push origin codex/vercel-only-cms-design
```

Expected: branch is pushed.

## Self-Review

- Spec coverage: The plan covers Vercel-only topology, admin login, equipment CRUD, category CRUD, inquiry management, settings, Postgres schema, fallback seed, SEO fields, sitemap, robots, deployment variables, and verification.
- Scope control: The plan excludes Strapi deployment, Render, buyer accounts, seller accounts, checkout, bidding, escrow, payments, multi-user roles, and file upload.
- Type consistency: `QuoteStatus`, inquiry mapping, validation schemas, route payloads, and admin form fields use the same status and field names across tasks.
- Launch safety: Public pages keep checked-in fallback content when Postgres is empty or unavailable.
