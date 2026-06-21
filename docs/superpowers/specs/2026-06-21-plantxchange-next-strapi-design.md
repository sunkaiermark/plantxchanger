# PlantXchange Next.js + Strapi Design

## Status

Approved for specification on 2026-06-21. This document supersedes `docs/superpowers/specs/2026-06-21-plantxchange-catalog-design.md` for implementation.

## Goal

PlantXchange will be a maintainable catalog and lead-generation website for used industrial process equipment and chemical plant assets. The public website will be built with Next.js. Equipment content, categories, media, and inquiry records will be managed in Strapi.

The first version should let buyers browse used equipment, submit inquiries, and contact PlantXchange by email or WhatsApp. It should not include buyer accounts, seller accounts, quote workflow, payment, escrow, or a marketplace transaction layer.

## Source Material

The starting ZIP is `C:\Users\Mark\Downloads\Equipment-Proposal-main.zip`. It contains a Replit-style React/Vite marketplace prototype with useful page ideas and equipment images, but the implementation should move to a new Next.js + Strapi structure rather than preserve the Replit workspace.

Reusable source assets:

- `artifacts/plantxchange/public/images/*`
- `artifacts/plantxchange/public/favicon.svg`
- `artifacts/plantxchange/public/opengraph.jpg`
- Existing page copy and layout ideas from the React prototype, adapted to the new stack.

## Architecture

Use a monorepo:

- `apps/web`: Next.js public website.
- `apps/cms`: Strapi headless CMS and admin panel.
- `packages/shared`: optional shared TypeScript types or validation helpers, added only if duplication becomes meaningful.

Next.js is responsible for public routing, SEO, rendering, Strapi data fetching, and inquiry form submission through server-side route handlers. Strapi is responsible for content editing, media management, and storing inquiry records.

## Product Scope

### In Scope

- Home page with PlantXchange positioning.
- Equipment catalog page.
- Equipment detail page.
- Sell equipment lead page.
- About/process page.
- Strapi admin content management for equipment, categories, media, and inquiries.
- Inquiry form submission stored in Strapi.
- Email and WhatsApp quick-contact buttons.
- SEO fields for equipment and core pages.

### Out of Scope

- Buyer accounts.
- Seller accounts.
- Login on the public website.
- Quote dashboard.
- Payment, escrow, bidding, checkout, or order management.
- Public seller self-service upload workflow.
- CRM-grade pipeline automation.

## Catalog Focus

The first catalog focuses on industrial process equipment and chemical plant assets:

- Tanks and vessels.
- Reactors.
- Mixers and agitators.
- Pumps.
- Compressors.
- Heat exchangers.
- Dryers.
- Centrifuges.
- Filters and separation equipment.
- Skid packages and used plant sections.

Construction equipment should not be part of the primary taxonomy unless explicitly added later.

## Strapi Content Model

### Category

Collection type used for catalog navigation and filtering.

Fields:

- `name`: text, required.
- `slug`: UID, required, generated from name.
- `description`: long text.
- `heroImage`: media, single image.
- `sortOrder`: integer.
- `seoTitle`: text.
- `seoDescription`: text.

### Equipment

Collection type for public equipment pages.

Fields:

- `title`: text, required.
- `slug`: UID, required, generated from title.
- `reference`: text, required, unique where practical.
- `category`: relation to Category, many-to-one.
- `condition`: enumeration: `excellent`, `good`, `fair`, `for-parts`.
- `availability`: enumeration: `available`, `under-review`, `sold`.
- `country`: text.
- `location`: text.
- `year`: integer.
- `make`: text.
- `model`: text.
- `price`: decimal or integer.
- `currency`: enumeration: `USD`, `EUR`, `CNY`.
- `summary`: long text.
- `description`: rich text.
- `specifications`: repeatable component with `label` and `value`.
- `features`: repeatable component or JSON list.
- `mainImage`: media, single image.
- `gallery`: media, multiple images.
- `sellerDisplayName`: text.
- `isFeatured`: boolean.
- `seoTitle`: text.
- `seoDescription`: text.

Draft and Publish should be enabled so unfinished listings do not appear publicly.

### Inquiry

Collection type for buyer and seller lead records. Public users do not log in; Next.js writes records to Strapi from a server-side route handler.

Fields:

- `inquiryType`: enumeration: `buyer`, `seller`.
- `status`: enumeration: `new`, `contacted`, `qualified`, `closed`, `spam`.
- `relatedEquipment`: relation to Equipment, optional.
- `equipmentReferenceSnapshot`: text.
- `equipmentTitleSnapshot`: text.
- `name`: text, required.
- `company`: text.
- `email`: email.
- `phone`: text.
- `whatsapp`: text.
- `country`: text.
- `message`: long text, required.
- `sourcePage`: text.
- `utmSource`: text.
- `utmMedium`: text.
- `utmCampaign`: text.
- `userAgent`: text.
- `ipAddress`: text or masked text if collected.

Inquiry records are managed in Strapi Admin. They are not publicly readable.

### Site Settings

Single type for contact and global display settings.

Fields:

- `siteName`: text, default `PlantXchange`.
- `contactEmail`: email.
- `whatsappNumber`: text in international format.
- `whatsappDisplayLabel`: text.
- `defaultSeoTitle`: text.
- `defaultSeoDescription`: text.
- `footerSummary`: long text.

## Public Website UX

### Home

The home page should immediately signal PlantXchange and used process equipment. It should include:

- Search entry for equipment type, process, or keyword.
- Featured equipment from Strapi.
- Category entry points.
- Buyer CTA to browse equipment.
- Seller CTA to submit equipment details.
- Short trust/process section covering sourcing, inspection support, and logistics support.

### Catalog

The catalog page should query published equipment from Strapi and support:

- Category filter.
- Condition filter.
- Availability filter.
- Country or region filter.
- Keyword search.

Filters may be implemented through URL search params and Strapi REST query parameters. If a filter is not supported in Strapi during the first implementation, it can be applied in Next.js after fetching a bounded result set.

### Equipment Detail

The detail page should show:

- Main image and gallery.
- Title, reference, category, condition, availability, location, and price if available.
- Specifications table.
- Description and features.
- Inquiry form.
- Email and WhatsApp quick-contact links with the equipment reference and title included.

### Sell Equipment

The sell page should collect seller lead data and write an Inquiry record with `inquiryType = seller`. It should explain that photos can be sent by email or WhatsApp in v1 unless upload is explicitly added later.

## Inquiry Flow

Buyer equipment inquiry:

1. User submits the inquiry form on an equipment detail page.
2. Next.js validates required fields.
3. Next.js sends a server-side authenticated POST request to Strapi.
4. Strapi stores an Inquiry record with equipment relation and title/reference snapshots.
5. Next.js returns a success or validation error response.
6. Page shows a confirmation state and keeps Email/WhatsApp options visible.

Seller inquiry:

1. User submits the sell equipment form.
2. Next.js validates required fields.
3. Next.js stores a seller Inquiry in Strapi.
4. Page shows confirmation and direct contact options.

The Strapi API token must remain server-side only. The browser must never receive a token that can write to Strapi.

## Data Access

Next.js should use a small Strapi client module, for example:

- `apps/web/src/lib/strapi/client.ts`
- `apps/web/src/lib/strapi/equipment.ts`
- `apps/web/src/lib/strapi/inquiries.ts`
- `apps/web/src/lib/contact.ts`

Public read queries should fetch only published content. Equipment queries that need media or relations should explicitly populate required fields because Strapi REST does not include relations/media by default.

Recommended environment variables:

- `NEXT_PUBLIC_SITE_URL`
- `STRAPI_URL`
- `STRAPI_READ_TOKEN`
- `STRAPI_WRITE_TOKEN`
- `NEXT_PUBLIC_FALLBACK_CONTACT_EMAIL`
- `NEXT_PUBLIC_FALLBACK_WHATSAPP_NUMBER`

`STRAPI_READ_TOKEN` and `STRAPI_WRITE_TOKEN` are server-only variables.

## Rendering And Caching

Use Next.js App Router. Prefer server components for content pages and fetch from Strapi on the server.

Recommended behavior:

- Home and catalog pages use cached Strapi fetches with time-based revalidation.
- Equipment detail pages use dynamic slugs and can be statically generated or revalidated.
- Inquiry submission uses a Next.js route handler at `app/api/inquiries/route.ts`.
- Missing or unpublished equipment should render a not-found page.

On-demand revalidation from Strapi webhooks can be added later. It is not required for v1.

## Security And Abuse Controls

V1 should include basic protections:

- Server-side validation for inquiry payloads.
- Required name, message, and at least one contact method.
- Honeypot field in public forms.
- Maximum message length.
- Strapi write token used only in the Next.js server route.
- Strapi Inquiry collection permissions should not allow public read.
- Generic success/error messages that do not expose Strapi internals.

Rate limiting can be added later if spam appears.

## Deployment Assumptions

Development:

- Run Next.js and Strapi locally.
- Strapi can use SQLite for local development.

Production:

- Deploy Next.js to a Node-capable host.
- Deploy Strapi separately with persistent file/media storage and a supported SQL database.
- PostgreSQL is preferred for production if available.

The final deployment target is not required for the first implementation plan, but the repo should keep environment configuration clear.

## Error Handling

- If Strapi is unavailable, public pages should show a controlled error or empty state rather than crashing with raw API errors.
- If an inquiry cannot be saved, the page should tell the user to contact by email or WhatsApp.
- Missing media should fall back to a neutral equipment image.
- Missing optional fields such as price, year, make, or model should be hidden rather than showing blanks.

## Testing And Verification

Before implementation is considered complete:

- Next.js typecheck passes.
- Next.js build passes.
- Strapi starts locally.
- Strapi content types are present.
- Seed or sample content is available for at least one category and one equipment item.
- Catalog page renders Strapi equipment.
- Equipment detail page renders media and specifications.
- Buyer inquiry form creates a Strapi Inquiry record.
- Seller inquiry form creates a Strapi Inquiry record.
- Email and WhatsApp links include relevant context.
- Public browser bundle does not expose Strapi write token.

## Future Extensions

Possible future steps after v1:

- Strapi webhook to trigger Next.js revalidation.
- Inquiry email notification.
- CSV import for equipment.
- Image upload from seller form.
- Admin workflow fields for lead owner and next follow-up.
- Public seller accounts only if seller self-service becomes necessary.

## References

- Next.js App Router: https://nextjs.org/docs/app
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Strapi REST API: https://docs.strapi.io/cms/api/rest
- Strapi REST population and field selection: https://docs.strapi.io/cms/api/rest/populate-select
- Strapi database configuration: https://docs.strapi.io/cms/configurations/database
