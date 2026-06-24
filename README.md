# PlantXchange

PlantXchange is a Next.js catalog and lead-generation site for used industrial process equipment and chemical plant assets. Production v1 deploys on Vercel with Postgres-backed inquiry storage.

## Apps

- `apps/web`: Next.js public website.
- `apps/cms`: Optional Strapi CMS workspace kept for a later content-management phase.

## Local Setup

```powershell
npm install
Copy-Item apps/web/.env.local.example apps/web/.env.local
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
```

## Deployment

Use [docs/deployment.md](docs/deployment.md) for the production launch checklist, required environment variables, DNS setup, and post-launch SEO checks for `https://www.plantxchanger.com`.

## Content And Inquiry Operations

- Equipment content for v1 comes from the checked-in catalog data.
- Buyer and seller inquiry records are stored in Postgres when `DATABASE_URL` is configured.
- Keep `DATABASE_URL` server-side only.
- Email and WhatsApp links remain available as fallback contact paths.

## Production Database

Set `DATABASE_URL` in Vercel to a Neon or Supabase Postgres connection string:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

## Current Scope

This v1 intentionally excludes buyer accounts, seller accounts, payment, escrow, public seller uploads, and CRM automation. Strapi CMS remains available in the repo for a later phase, but it is not required for the Vercel-only launch.
