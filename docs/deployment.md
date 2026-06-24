# PlantXchange Vercel-Only Launch Plan

This plan launches PlantXchange at `https://www.plantxchanger.com` without Render or a live Strapi CMS. Production v1 uses Vercel for the Next.js app and a managed Postgres database for inquiry records.

## Production Topology

| Layer | Service | Purpose |
| --- | --- | --- |
| Frontend and API | Vercel | Public catalog pages, SEO routes, inquiry API routes |
| Inquiry database | Neon or Supabase Postgres | Buyer and seller inquiry records |
| Catalog content | Checked-in catalog data | Equipment, categories, fallback site settings |

Strapi remains in `apps/cms` as an optional future CMS workspace. It is not required for this Vercel-only launch.

## Deployment Order

1. Create a Postgres database using Neon or Supabase.
2. Add the database connection string to Vercel as `DATABASE_URL`.
3. Import the GitHub repository into Vercel.
4. Set the Vercel Root Directory to `apps/web`.
5. Add the public production environment variables.
6. Deploy the Vercel project.
7. Point DNS for `www.plantxchanger.com`.
8. Run the production smoke test.

## 1. Postgres Database

Create a managed Postgres database. Neon is the preferred first choice because its serverless driver is designed for Vercel Functions. Supabase Postgres also works if you use its pooled connection string.

Required output:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

For Neon, use the connection string from the Neon dashboard. It may include `channel_binding=require`; keep it if Neon provides it.

The app creates the `inquiries` table automatically on first inquiry write or quote dashboard read. No manual migration is required for v1.

## 2. Vercel Project

Import the GitHub repository:

```text
sunkaiermark/plantxchanger
```

Use these Vercel settings:

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | `apps/web` |
| Install Command | default |
| Build Command | default, or `npm run build` |
| Output Directory | default |
| Node.js Version | 20 or newer |

Set these Vercel environment variables for Production:

```env
NEXT_PUBLIC_SITE_URL=https://www.plantxchanger.com
NEXT_PUBLIC_FALLBACK_CONTACT_EMAIL=sales@plantxchanger.com
NEXT_PUBLIC_FALLBACK_WHATSAPP_NUMBER=+8613800000000
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

Security rules:

- `DATABASE_URL` must stay server-side only.
- Do not add Strapi tokens for the Vercel-only launch.
- Do not paste database credentials into GitHub issues, PRs, screenshots, or chat.

## 3. DNS

Use this DNS layout:

| Hostname | Target |
| --- | --- |
| `www.plantxchanger.com` | Vercel production domain |
| `plantxchanger.com` | Redirect to `https://www.plantxchanger.com` |

Enable HTTPS for both hostnames in Vercel.

## 4. Pre-Launch Verification

Run from the repository root before deploying:

```powershell
npm run test:web
npm run typecheck:web
npm run build:web
```

The CMS build is not part of the Vercel-only production path.

## 5. Production Smoke Test

After deployment and DNS are live, verify:

```text
https://www.plantxchanger.com/
https://www.plantxchanger.com/catalog
https://www.plantxchanger.com/robots.txt
https://www.plantxchanger.com/sitemap.xml
https://www.plantxchanger.com/quotes
```

Test workflows:

- Open the homepage and catalog.
- Open an equipment detail page.
- Submit a buyer quote request.
- Confirm the form returns a saved inquiry confirmation.
- Open `/quotes` and confirm the new inquiry appears.
- Update a quote status from the quote dashboard if that control is available.
- Confirm email and WhatsApp links are correct.
- Confirm `/quotes` remains `noindex`.

Submit this sitemap in Google Search Console:

```text
https://www.plantxchanger.com/sitemap.xml
```

## 6. Rollback

Before changing DNS, keep the previous Vercel deployment available.

If launch fails:

1. Roll back the Vercel deployment first.
2. Keep the Postgres database unchanged unless a migration caused the failure.
3. Re-test catalog, detail pages, inquiry submission, `/quotes`, sitemap, and robots before retrying.

## 7. Future CMS Phase

When the business workflow is proven, reintroduce CMS in one of these ways:

- Strapi Cloud.
- Render/Railway/Fly.io/VPS for Strapi plus managed Postgres.
- A lighter Vercel-friendly admin panel that writes directly to Postgres.

Do not block the v1 public launch on CMS deployment.
