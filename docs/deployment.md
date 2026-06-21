# PlantXchange Deployment Checklist

This checklist is for launching PlantXchange at `https://www.plantxchanger.com`.

## 1. Publish The Code

The current production-ready branch is:

```powershell
codex/plantxchange-catalog
```

Before connecting a deployment platform, push this branch to GitHub or merge it into the production branch.

Required verification before deployment:

```powershell
npm run test:web
npm run typecheck:web
npm run build:web
npm run build:cms
```

## 2. Deploy Strapi CMS

Strapi should be deployed first because the Next.js website reads equipment, category, site settings, and inquiry records from it.

Recommended production settings:

- Use PostgreSQL for production data if the hosting provider supports it.
- Keep the Strapi admin URL private or protected.
- Turn off sample seeding after the first production seed if real content is already entered.

Required CMS environment variables:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=replace-with-production-random-values
API_TOKEN_SALT=replace-with-production-random-value
ADMIN_JWT_SECRET=replace-with-production-random-value
TRANSFER_TOKEN_SALT=replace-with-production-random-value
ENCRYPTION_KEY=replace-with-production-random-value
JWT_SECRET=replace-with-production-random-value
DATABASE_CLIENT=postgres
DATABASE_URL=replace-with-production-postgres-url
PLANTXCHANGE_SEED=false
```

After Strapi is live, create two API tokens:

- Read token: read access for Category, Equipment, Media, and Site Settings.
- Write token: create and update access for Inquiry.

## 3. Deploy Next.js Web

Set the app root to `apps/web` if the deployment platform asks for a project directory.

Build command:

```powershell
npm --workspace apps/web run build
```

Start command:

```powershell
npm --workspace apps/web run start
```

Required web environment variables:

```env
NEXT_PUBLIC_SITE_URL=https://www.plantxchanger.com
NEXT_PUBLIC_FALLBACK_CONTACT_EMAIL=sales@plantxchange.com
NEXT_PUBLIC_FALLBACK_WHATSAPP_NUMBER=+8613800000000
STRAPI_URL=https://replace-with-your-live-strapi-url
STRAPI_READ_TOKEN=replace-with-strapi-read-token
STRAPI_WRITE_TOKEN=replace-with-strapi-write-token
```

Keep `STRAPI_READ_TOKEN` and `STRAPI_WRITE_TOKEN` server-side only. Do not expose them in browser code or public docs.

## 4. Connect The Domain

Point the domain to the web deployment:

- `www.plantxchanger.com` should point to the Next.js web app.
- Redirect `plantxchanger.com` to `https://www.plantxchanger.com`.
- Enable HTTPS for both root and `www`.

If Strapi uses a subdomain, use something like:

```text
cms.plantxchanger.com
```

Do not put Strapi admin under the main public website path.

## 5. Post-Launch SEO Checks

After DNS and HTTPS are live, verify these URLs in a browser:

```text
https://www.plantxchanger.com/
https://www.plantxchanger.com/robots.txt
https://www.plantxchanger.com/sitemap.xml
https://www.plantxchanger.com/catalog
```

The sitemap and canonical tags must use:

```text
https://www.plantxchanger.com
```

Then submit the sitemap in Google Search Console:

```text
https://www.plantxchanger.com/sitemap.xml
```

## 6. Production Smoke Test

Test these workflows after launch:

- Browse catalog.
- Open an equipment detail page.
- Submit a buyer quote request.
- Confirm the inquiry appears in Strapi.
- Confirm email and WhatsApp links are correct.
- Check `/quotes` is still `noindex`.

## 7. Rollback Plan

Before changing DNS or promoting production, keep the previous deployment available.

If launch fails:

1. Roll back the web deployment to the previous build.
2. Keep Strapi database unchanged unless a migration caused the failure.
3. Re-test `/robots.txt`, `/sitemap.xml`, catalog, and inquiry submission before trying again.
