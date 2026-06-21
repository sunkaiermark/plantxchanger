# PlantXchange Catalog Design

## Status

Approved for specification on 2026-06-21.

## Goal

PlantXchange will be a public catalog and lead-generation website for used industrial process equipment and chemical plant assets. The first version should help buyers discover available equipment and contact PlantXchange by inquiry form, email, or WhatsApp. It should avoid marketplace complexity until the business workflow is proven.

## Source Material

The starting ZIP is `C:\Users\Mark\Downloads\Equipment-Proposal-main.zip`. It contains a Replit-style pnpm workspace with:

- `artifacts/plantxchange`: React/Vite frontend.
- `artifacts/api-server`: Express API server.
- `lib/api-client-react`, `lib/api-spec`, `lib/api-zod`, and `lib/db`: generated API client, OpenAPI/Zod files, and Drizzle/Postgres schema.

The frontend has useful page structure and visual assets, but the first maintainable version should not depend on the API server, database, generated clients, Replit plugins, or Replit environment variables.

## Product Scope

### In Scope

- Home page with clear PlantXchange positioning.
- Catalog page for used industrial process equipment.
- Equipment detail page with photos, specifications, condition, location, and inquiry actions.
- Sell equipment page for sellers to submit basic asset details.
- Buyer inquiry flow using a front-end form plus direct Email and WhatsApp buttons.
- About/trust messaging explaining inspection, matching, logistics support, and international sourcing.
- Static deployment-ready frontend.

### Out of Scope

- Buyer or seller accounts.
- Live quote dashboard.
- Database-backed inventory management.
- Admin workflow.
- Payment, escrow, bidding, or checkout.
- Generated API client or OpenAPI regeneration.
- Replit-specific runtime tooling.

## Audience

Primary users are industrial buyers, plant managers, project teams, traders, and sellers of used process equipment. The site should feel practical and credible, with enough technical detail for serious buyers to decide whether to inquire.

## Catalog Focus

The first catalog should focus on industrial process equipment and chemical plant assets:

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

Construction equipment can be removed from the primary navigation and sample inventory unless it is needed later.

## User Experience

### Home

The home page should make PlantXchange visible immediately and position the site as a used process equipment sourcing channel. It should include:

- Search entry for equipment type, industry, or keyword.
- Featured equipment.
- Category entry points.
- Buyer CTA: request availability or quote.
- Seller CTA: list equipment for sale.
- Short trust/process section.

### Catalog

The catalog page should support client-side filtering over local data:

- Category.
- Condition.
- Country or region.
- Price range when available.
- Keyword search over title, make/model, and description.

Cards should show photo, title, category, condition, country, year when available, and a clear inquiry/detail action.

### Equipment Detail

Each equipment detail page should include:

- Main image and optional image gallery.
- Title and reference ID.
- Category, make/model, year, condition, location, and availability.
- Technical specifications relevant to process equipment.
- Description, included accessories, and inspection/logistics notes.
- Email and WhatsApp inquiry buttons.
- Inquiry form that includes the equipment reference in the generated message.

### Sell Equipment

The sell page should collect:

- Equipment type.
- Make/model or description.
- Location.
- Condition.
- Photo availability note and instructions for sending photos by email or WhatsApp.
- Seller name/company.
- Contact email or phone.
- Message.

For v1, submission can prepare an email or display clear contact instructions. A backend form service can be added later.

## Data Model

Use local TypeScript data files:

- `src/data/categories.ts`
- `src/data/equipment.ts`

Suggested equipment fields:

- `id`
- `reference`
- `title`
- `category`
- `condition`
- `country`
- `location`
- `year`
- `make`
- `model`
- `price`
- `currency`
- `imageUrl`
- `images`
- `summary`
- `description`
- `specs`
- `features`
- `availability`
- `seller`
- `isFeatured`

The model should be simple enough to edit by hand while leaving room to migrate to an API later.

## Technical Design

### Application Shape

Build a static React/Vite site from the existing `artifacts/plantxchange` frontend. Keep useful layout, pages, visual style, and images, but remove runtime dependencies that require the Replit workspace backend.

### Routing

Keep client-side routes:

- `/`
- `/catalog` or `/browse`
- `/equipment/:id` or `/listing/:id`
- `/sell`
- `/about`
- `/contact` if a separate contact page is useful.

Prefer stable SEO-readable route names if the existing code can be adapted without excessive churn.

### Data Flow

Components read from local data modules. Filtering and detail lookup happen in browser memory. Inquiry buttons generate email and WhatsApp URLs using the selected equipment reference and title.

### Forms

Forms should be front-end only in v1. They should either:

- Open a prefilled `mailto:` link, or
- Generate a WhatsApp URL with the inquiry message.

The implementation should avoid pretending that form data is saved if there is no backend.

### Styling

Use the existing React/Tailwind visual system as the base. The UI should feel like a credible industrial catalog: restrained, technical, readable, and focused on equipment photos and specifications. Avoid decorative marketing excess.

### Deployment

The app should build as a static Vite site. It should run with ordinary local commands and not require `DATABASE_URL`, API server startup, or Replit-only environment variables.

## Error Handling

- Missing equipment IDs should show a clear not-found page with a link back to the catalog.
- Empty filtered catalog results should show a helpful empty state and reset/search actions.
- Inquiry links should safely encode message text.
- Optional fields such as price, year, and model should render gracefully when unavailable.

## Testing And Verification

Before implementation is considered complete:

- Install dependencies successfully.
- Run TypeScript typecheck.
- Run production build.
- Start a local preview server.
- Verify home, catalog, detail, sell, and inquiry paths in a browser.
- Confirm Email and WhatsApp links include the equipment reference and title.
- Confirm the app does not require backend or database environment variables.

## Future Backend Path

When the business workflow is proven, the static catalog can migrate to a backend without changing the public concept:

- Move `equipment.ts` data into a database.
- Add admin inventory editing.
- Add real inquiry persistence.
- Add quote tracking.
- Add seller accounts only if sellers need self-service listing management.

The v1 code should keep data access centralized enough that this migration remains straightforward.
