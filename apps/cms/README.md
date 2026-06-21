# PlantXchange CMS

This Strapi app manages PlantXchange equipment catalog content and inquiry records.

## Content Types

- Category: equipment families such as reactors, mixers, tanks, pumps, compressors, and plant packages.
- Equipment: used industrial process equipment listings with specs, features, images, and availability.
- Inquiry: buyer and seller lead records submitted from the Next.js site.
- Site Settings: public contact email, WhatsApp number, default SEO text, and footer summary.

## Local Development

```powershell
Copy-Item apps/cms/.env.example apps/cms/.env
npm run dev:cms
```

Strapi runs at `http://127.0.0.1:1337`.

When `PLANTXCHANGE_SEED=true`, the bootstrap creates sample categories, sample equipment, and site settings if they do not already exist.

## API Tokens

Create two Strapi API tokens for the Next.js app:

- Read token: read access to Category, Equipment, and Site Settings.
- Write token: create and update access for Inquiry.

Keep both tokens only in `apps/web/.env.local`; never expose the write token to browser code.
