# PlantXchange Vercel-Only CMS Design

## Status

Approved for specification on 2026-06-25.

This document defines the next PlantXchange phase after the successful Vercel launch at `https://www.plantxchanger.com`. It supersedes the earlier Strapi deployment direction for the immediate CMS phase. Strapi remains a possible future option, but v1 CMS should run inside the existing Vercel-hosted Next.js app.

## Goal

Build a lightweight admin backend for PlantXchange so equipment content, categories, site settings, SEO fields, and inquiry records can be managed before Google Search Console and Google Ads promotion begins.

The CMS should be operationally simple: no Render, no separate Strapi server, no public user accounts, and no complex marketplace workflow. It should support the current catalog and lead-generation business model.

## Non-Goals

- Do not deploy Strapi for this phase.
- Do not build buyer accounts, seller accounts, checkout, bidding, escrow, or payments.
- Do not build a multi-user role and permission system.
- Do not build file upload in the first CMS version.
- Do not replace the public website design.
- Do not block launch improvements on advanced CRM automation.

## Recommended Architecture

Use the existing Next.js app in `apps/web`.

- Public website: existing routes under `/`, `/catalog`, `/equipment/[slug]`, `/sell`, `/about`.
- Admin UI: new routes under `/admin`.
- Admin API: new server-only route handlers under `/api/admin/*`.
- Database: existing production Postgres connection via `DATABASE_URL`.
- Authentication: simple password login using an `ADMIN_PASSWORD` environment variable and an HTTP-only session cookie.
- Content source: public pages read from Postgres first, then fall back to checked-in sample content if the database has no content.

This keeps the production topology as Vercel plus managed Postgres, which is already the selected deployment path.

## Admin Routes

### `/admin/login`

Purpose: authenticate the site owner.

Behavior:

- Show a password field.
- POST password to a server route.
- If password matches `ADMIN_PASSWORD`, set an HTTP-only, secure session cookie.
- Redirect to `/admin`.
- Use a generic error message for invalid password.

### `/admin`

Purpose: admin overview.

Show:

- Total equipment count.
- Published equipment count.
- Featured equipment count.
- New inquiry count.
- Quick links to equipment, categories, inquiries, and settings.

### `/admin/equipment`

Purpose: manage catalog listings.

Capabilities:

- List equipment with title, category, country, availability, featured status, and updated date.
- Search by title, reference, make, model, country, or category.
- Filter by status: published, draft, sold, under review.
- Create listing.
- Edit listing.
- Delete listing only after confirmation.
- Toggle featured.
- Toggle published.

### `/admin/equipment/new` and `/admin/equipment/[id]`

Purpose: edit one equipment record.

Fields:

- `title`
- `slug`
- `reference`
- `categoryId`
- `condition`
- `availability`
- `country`
- `location`
- `year`
- `make`
- `model`
- `serialNumber`
- `operatingHours`
- `weight`
- `dimensions`
- `price`
- `currency`
- `summary`
- `description`
- `features`
- `specifications`
- `mainImageUrl`
- `galleryImageUrls`
- `sellerDisplayName`
- `isFeatured`
- `isPublished`
- `seoTitle`
- `seoDescription`

Image handling for v1:

- Admin enters image URLs.
- Existing public images in `apps/web/public/images` remain usable.
- Upload can be added later with Vercel Blob, Cloudinary, or another asset store.

### `/admin/categories`

Purpose: manage catalog taxonomy.

Fields:

- `name`
- `slug`
- `description`
- `imageUrl`
- `sortOrder`
- `seoTitle`
- `seoDescription`

Capabilities:

- Create category.
- Edit category.
- Reorder categories with numeric `sortOrder`.
- Hide empty or inactive categories if needed.

### `/admin/inquiries`

Purpose: manage buyer and seller leads.

Capabilities:

- List inquiries newest first.
- Filter by inquiry type: buyer or seller.
- Filter by status.
- Search by buyer name, company, email, phone, equipment reference, or message.
- Open inquiry detail.
- Update status.
- Add internal note.

Statuses:

- `new`
- `contacted`
- `qualified`
- `negotiating`
- `closed`
- `spam`

Inquiry data should not be publicly indexed or exposed.

### `/admin/settings`

Purpose: manage global site settings.

Fields:

- `siteName`
- `contactEmail`
- `whatsappNumber`
- `whatsappDisplayLabel`
- `defaultSeoTitle`
- `defaultSeoDescription`
- `footerSummary`
- `homepageHeadline`
- `homepageIntro`

These values should feed public pages where appropriate, with checked-in defaults as fallback.

## Database Model

Use Postgres tables managed by application code. The app already creates inquiry storage automatically; the CMS phase should extend this pattern with explicit schema initialization.

### `categories`

Columns:

- `id`: UUID primary key.
- `name`: text, required.
- `slug`: text, required, unique.
- `description`: text.
- `image_url`: text.
- `sort_order`: integer, default `0`.
- `seo_title`: text.
- `seo_description`: text.
- `created_at`: timestamp.
- `updated_at`: timestamp.

### `equipment`

Columns:

- `id`: UUID primary key.
- `title`: text, required.
- `slug`: text, required, unique.
- `reference`: text, required, unique.
- `category_id`: UUID nullable foreign key to `categories`.
- `condition`: text.
- `availability`: text.
- `country`: text.
- `location`: text.
- `year`: integer.
- `make`: text.
- `model`: text.
- `serial_number`: text.
- `operating_hours`: text.
- `weight`: text.
- `dimensions`: text.
- `price`: numeric.
- `currency`: text, default `USD`.
- `summary`: text.
- `description`: text.
- `features`: JSONB array.
- `specifications`: JSONB array.
- `main_image_url`: text.
- `gallery_image_urls`: JSONB array.
- `seller_display_name`: text.
- `is_featured`: boolean, default `false`.
- `is_published`: boolean, default `false`.
- `seo_title`: text.
- `seo_description`: text.
- `created_at`: timestamp.
- `updated_at`: timestamp.

### `inquiries`

Keep the existing inquiry storage and extend only if needed.

Required CMS fields:

- `status`
- `internal_note`
- `updated_at`

Do not expose inquiry records to search engines.

### `site_settings`

Single-row table.

Columns:

- `id`: text primary key, use fixed value `global`.
- `site_name`: text.
- `contact_email`: text.
- `whatsapp_number`: text.
- `whatsapp_display_label`: text.
- `default_seo_title`: text.
- `default_seo_description`: text.
- `footer_summary`: text.
- `homepage_headline`: text.
- `homepage_intro`: text.
- `updated_at`: timestamp.

## Public Data Flow

Equipment pages should read from database-backed catalog data first.

Recommended behavior:

1. Query published equipment from Postgres.
2. If rows exist, render database records.
3. If no rows exist, render existing fallback data.
4. Keep current sample catalog available as a safety net.

This lets production continue to work even before the admin has entered all content.

## Admin API

All admin API routes must require a valid admin session.

Suggested routes:

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/equipment`
- `POST /api/admin/equipment`
- `GET /api/admin/equipment/[id]`
- `PUT /api/admin/equipment/[id]`
- `DELETE /api/admin/equipment/[id]`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/[id]`
- `DELETE /api/admin/categories/[id]`
- `GET /api/admin/inquiries`
- `PUT /api/admin/inquiries/[id]`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`

Validation:

- Use `zod` schemas for request payloads.
- Enforce required fields server-side.
- Normalize slugs.
- Prevent duplicate slugs and references.
- Cap long text field length where practical.

## Authentication And Security

Use a simple single-admin password for v1.

Environment variables:

- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Session behavior:

- On successful login, create a signed session token.
- Store it in an HTTP-only cookie.
- Cookie must be `secure` in production.
- Session should expire after a reasonable duration, such as 7 days.
- Logout clears the cookie.

Security rules:

- Admin pages are `noindex`.
- Admin API routes require authentication.
- Public website never exposes `DATABASE_URL`, `ADMIN_PASSWORD`, or session secret.
- Inquiry list is not public.
- Failed login should not reveal whether a password is close or valid.

## UI Direction

The admin UI should be utilitarian and dense, not marketing-like.

Style:

- Simple sidebar navigation.
- Tables for listing equipment, categories, and inquiries.
- Compact forms with clear labels.
- Save, cancel, delete, publish, and featured actions.
- Minimal decoration.
- Good mobile usability, but desktop editing is the primary workflow.

Use the existing PlantXchange visual language only lightly. Admin should prioritize clarity and speed.

## SEO And Google Promotion Readiness

Before Google promotion starts, the CMS should support:

- Editing equipment SEO title and description.
- Editing category SEO title and description.
- Editing global default SEO.
- Generating sitemap from database-backed published equipment.
- Keeping `/admin`, `/api`, and `/quotes` out of indexing.
- Ensuring canonical URLs use `https://www.plantxchanger.com`.

After content is edited and reviewed:

1. Submit `https://www.plantxchanger.com/sitemap.xml` in Google Search Console.
2. Verify important equipment pages are indexable.
3. Start Google Ads with landing pages that have complete equipment content.

## Deployment

Vercel environment variables:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SITE_URL=https://www.plantxchanger.com
NEXT_PUBLIC_FALLBACK_CONTACT_EMAIL=sales@plantxchanger.com
NEXT_PUBLIC_FALLBACK_WHATSAPP_NUMBER=+8613800000000
ADMIN_PASSWORD=...
ADMIN_SESSION_SECRET=...
```

`ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` must never be committed.

## Migration And Seeding

The implementation should include a safe way to create required tables.

Acceptable v1 approach:

- Add idempotent schema creation helpers similar to the current inquiry table initialization.
- Add a one-time seed path or script to import current fallback catalog into Postgres.

Seed behavior:

- Do not duplicate records if run twice.
- Use `reference` and `slug` as stable uniqueness keys.
- Preserve current published site behavior.

## Error Handling

Admin errors:

- Show validation errors next to fields.
- Show save failure messages without exposing database credentials or stack traces.
- Keep unsaved form input after failed submit.

Public errors:

- If database query fails, use fallback catalog where possible.
- If an inquiry save fails, tell the user to contact by email or WhatsApp.
- If a record is unpublished or missing, show the existing not-found page.

## Testing And Verification

Required checks:

- Unit tests for admin validation schemas.
- Unit tests for database mapping and normalization.
- Route handler tests where existing tooling supports them.
- Build check: `npm run build` in `apps/web`.
- Typecheck: `npm run typecheck` in `apps/web`.
- Existing inquiry tests continue to pass.

Manual verification:

- Log in to `/admin/login`.
- Create a category.
- Create and publish equipment.
- Confirm equipment appears in catalog.
- Confirm equipment detail page renders.
- Edit SEO title and confirm metadata changes after deploy/revalidation.
- Submit a buyer inquiry.
- Confirm inquiry appears in admin.
- Update inquiry status and note.
- Confirm `/admin` is not indexable.

## Future Extensions

Possible later improvements:

- Image upload using Vercel Blob or Cloudinary.
- Multiple admin users.
- Email notifications for new inquiries.
- CSV equipment import.
- Strapi Cloud migration if the content workflow becomes too complex for the custom admin.
- On-demand revalidation after content saves.
