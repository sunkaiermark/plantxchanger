# PlantXchange

PlantXchange is a Next.js + Strapi catalog and lead-generation site for used industrial process equipment and chemical plant assets.

## Apps

- `apps/web`: Next.js public website.
- `apps/cms`: Strapi CMS for equipment, categories, media, site settings, and inquiry records.

## Local Setup

```powershell
npm install
Copy-Item apps/cms/.env.example apps/cms/.env
Copy-Item apps/web/.env.local.example apps/web/.env.local
```

Start Strapi:

```powershell
npm run dev:cms
```

Start Next.js:

```powershell
npm run dev:web
```

## Verification

```powershell
npm run test:web
npm run typecheck:web
npm run build:web
npm run build:cms
```

## Deployment

Use [docs/deployment.md](docs/deployment.md) for the production launch checklist, required environment variables, DNS setup, and post-launch SEO checks for `https://www.plantxchanger.com`.

## Content Operations

- Manage equipment and categories in Strapi Admin.
- Manage site contact details in Site Settings.
- View and update buyer and seller inquiry records in Strapi Admin.
- Keep `STRAPI_WRITE_TOKEN` server-side only.

## API Tokens

Create two Strapi API tokens:

- Read token: read access to Category, Equipment, and Site Settings.
- Write token: create and update access for Inquiry.

Put token values in `apps/web/.env.local`.

## Current Scope

This v1 intentionally excludes buyer accounts, seller accounts, quote dashboards, payment, escrow, public seller uploads, and CRM automation. The active architecture is documented in `docs/superpowers/specs/2026-06-21-plantxchange-next-strapi-design.md`.
