# PlantXchange Catalog Implementation Plan

> **Status:** Superseded on 2026-06-21 by `docs/superpowers/specs/2026-06-21-plantxchange-next-strapi-design.md`. Do not execute this Vite/static-data plan. A new implementation plan is required for the Next.js + Strapi CMS architecture.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone static PlantXchange catalog and lead-generation website from the downloaded Replit project assets, without backend, database, generated API client, or Replit runtime dependencies.

**Architecture:** Use a small Vite + React + TypeScript app with local TypeScript data modules for equipment and categories. Pure helper modules own filtering and inquiry URL generation, so the future backend migration can replace data access without rewriting the page components.

**Tech Stack:** React 19, Vite 7, TypeScript 5.9, Tailwind CSS 4, wouter, lucide-react, Node built-in test runner with tsx.

---

## Source Inputs

- Approved spec: `docs/superpowers/specs/2026-06-21-plantxchange-catalog-design.md`
- Downloaded ZIP: `C:\Users\Mark\Downloads\Equipment-Proposal-main.zip`
- Source app inside ZIP: `Equipment-Proposal-main/artifacts/plantxchange`

## File Structure

- Create `package.json`: standalone npm package scripts and dependencies.
- Create `index.html`: Vite HTML entry.
- Create `tsconfig.json`: browser TypeScript config with path alias.
- Create `vite.config.ts`: Vite config with React and Tailwind plugins.
- Create `src/main.tsx`: React root bootstrap.
- Create `src/App.tsx`: route definitions and site layout.
- Create `src/index.css`: Tailwind import plus PlantXchange theme tokens and global styling.
- Create `src/types/catalog.ts`: shared category, equipment, and filter types.
- Create `src/data/categories.ts`: process equipment category list.
- Create `src/data/equipment.ts`: first static catalog entries.
- Create `src/config/contact.ts`: centralized public contact settings.
- Create `src/lib/catalog.ts`: filtering, detail lookup, category lookup, featured item helpers.
- Create `src/lib/catalog.test.ts`: tests for catalog helper behavior.
- Create `src/lib/inquiry.ts`: email and WhatsApp inquiry helper functions.
- Create `src/lib/inquiry.test.ts`: tests for inquiry helper behavior.
- Create `src/components/layout/Navbar.tsx`: top navigation and CTAs.
- Create `src/components/layout/Footer.tsx`: footer navigation and contact links.
- Create `src/components/EquipmentCard.tsx`: catalog card for one equipment item.
- Create `src/components/InquiryActions.tsx`: email and WhatsApp action buttons.
- Create `src/pages/Home.tsx`: home page.
- Create `src/pages/Catalog.tsx`: filterable catalog page.
- Create `src/pages/EquipmentDetail.tsx`: detail page.
- Create `src/pages/Sell.tsx`: seller lead page.
- Create `src/pages/About.tsx`: trust and process page.
- Create `src/pages/NotFound.tsx`: missing route and missing equipment fallback.
- Copy `public/images/*` from the ZIP source app into `public/images/`.
- Copy `public/favicon.svg`, `public/opengraph.jpg`, and `public/robots.txt` from the ZIP source app into `public/`.

## Contact Defaults

Use these v1 public contact constants during implementation:

- Email: `sales@plantxchange.com`
- WhatsApp E.164 number: `+8613800000000`
- WhatsApp display label: `WhatsApp`

Keep the values centralized in `src/config/contact.ts` so production contact changes require one file edit.

---

### Task 1: Create Standalone Vite Shell And Copy Assets

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Copy: `public/images/*`
- Copy: `public/favicon.svg`
- Copy: `public/opengraph.jpg`
- Copy: `public/robots.txt`

- [ ] **Step 1: Copy public assets from the downloaded ZIP**

Run in PowerShell from `C:\Users\Mark\Documents\plantexchange`:

```powershell
$zip = 'C:\Users\Mark\Downloads\Equipment-Proposal-main.zip'
$tmp = Join-Path $env:TEMP 'plantxchange-plan-import'
if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force }
Expand-Archive -LiteralPath $zip -DestinationPath $tmp -Force
New-Item -ItemType Directory -Force -Path 'public' | Out-Null
Copy-Item -LiteralPath (Join-Path $tmp 'Equipment-Proposal-main\artifacts\plantxchange\public\images') -Destination 'public\images' -Recurse -Force
Copy-Item -LiteralPath (Join-Path $tmp 'Equipment-Proposal-main\artifacts\plantxchange\public\favicon.svg') -Destination 'public\favicon.svg' -Force
Copy-Item -LiteralPath (Join-Path $tmp 'Equipment-Proposal-main\artifacts\plantxchange\public\opengraph.jpg') -Destination 'public\opengraph.jpg' -Force
Copy-Item -LiteralPath (Join-Path $tmp 'Equipment-Proposal-main\artifacts\plantxchange\public\robots.txt') -Destination 'public\robots.txt' -Force
```

Expected: `public\images\chemical-plant.png`, `public\images\compressor.png`, and the other source images exist.

- [ ] **Step 2: Create standalone `package.json`**

Write `package.json`:

```json
{
  "name": "plantxchange",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -p tsconfig.json --noEmit && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "node --import tsx --test src/lib/catalog.test.ts src/lib/inquiry.test.ts"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "lucide-react": "^0.545.0",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "tailwindcss": "^4.1.14",
    "wouter": "^3.3.5"
  },
  "devDependencies": {
    "@types/node": "^25.3.3",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "tsx": "^4.21.0",
    "typescript": "~5.9.3",
    "vite": "^7.3.2"
  }
}
```

- [ ] **Step 3: Create Vite entry files**

Write `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="PlantXchange connects buyers and sellers of used industrial process equipment and chemical plant assets."
    />
    <meta property="og:title" content="PlantXchange" />
    <meta property="og:description" content="Used process equipment and chemical plant assets." />
    <meta property="og:image" content="/opengraph.jpg" />
    <title>PlantXchange | Used Process Equipment</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Write `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "vite.config.ts"]
}
```

Write `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "src"),
    },
  },
});
```

Write `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Write minimal `src/App.tsx` for this task:

```tsx
export default function App() {
  return (
    <main className="min-h-screen bg-stone-50 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            PlantXchange
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-tight">
            Used industrial process equipment and chemical plant assets.
          </h1>
        </div>
      </div>
    </main>
  );
}
```

Write minimal `src/index.css` for this task:

```css
@import "tailwindcss";

:root {
  color-scheme: light;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  background: #f8f7f3;
  color: #111827;
}

body {
  margin: 0;
  min-width: 320px;
}

button,
input,
select,
textarea {
  font: inherit;
}
```

- [ ] **Step 4: Install and verify shell**

Run:

```powershell
npm install
npm run typecheck
npm run build
```

Expected: install completes, typecheck exits `0`, build exits `0`, and `dist` is created.

- [ ] **Step 5: Commit shell**

Run:

```powershell
git add package.json package-lock.json index.html tsconfig.json vite.config.ts src public
git commit -m "build: add standalone PlantXchange site shell"
```

Expected: commit succeeds.

---

### Task 2: Add Catalog Types, Data, Filtering Helpers, And Tests

**Files:**
- Create: `src/types/catalog.ts`
- Create: `src/data/categories.ts`
- Create: `src/data/equipment.ts`
- Create: `src/lib/catalog.ts`
- Create: `src/lib/catalog.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write failing catalog helper tests**

Write `src/lib/catalog.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { equipmentItems } from "@/data/equipment";
import {
  filterEquipment,
  findEquipmentById,
  getCategoryBySlug,
  getFeaturedEquipment,
} from "@/lib/catalog";

test("findEquipmentById returns the matching equipment item", () => {
  const item = findEquipmentById("px-reactor-001");
  assert.equal(item?.reference, "PX-R-001");
});

test("getFeaturedEquipment returns only featured items", () => {
  const featured = getFeaturedEquipment();
  assert.ok(featured.length > 0);
  assert.equal(featured.every((item) => item.isFeatured), true);
});

test("filterEquipment filters by category and condition", () => {
  const results = filterEquipment({
    category: "reactors",
    condition: "good",
  });
  assert.ok(results.length > 0);
  assert.equal(results.every((item) => item.category === "reactors"), true);
  assert.equal(results.every((item) => item.condition === "good"), true);
});

test("filterEquipment searches title, make, model, and description", () => {
  const results = filterEquipment({ search: "stainless" });
  assert.ok(results.length > 0);
  assert.ok(
    results.some((item) =>
      [item.title, item.make, item.model, item.description].join(" ").toLowerCase().includes("stainless"),
    ),
  );
});

test("getCategoryBySlug returns process equipment category data", () => {
  const category = getCategoryBySlug("mixers-agitators");
  assert.equal(category?.name, "Mixers & Agitators");
});

test("equipment data has unique ids and references", () => {
  const ids = new Set(equipmentItems.map((item) => item.id));
  const refs = new Set(equipmentItems.map((item) => item.reference));
  assert.equal(ids.size, equipmentItems.length);
  assert.equal(refs.size, equipmentItems.length);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npm test
```

Expected: FAIL because `src/data/equipment.ts` and `src/lib/catalog.ts` do not exist yet.

- [ ] **Step 3: Add catalog types and data**

Write `src/types/catalog.ts`:

```ts
export type EquipmentCondition = "excellent" | "good" | "fair" | "for-parts";
export type EquipmentAvailability = "available" | "under-review" | "sold";

export interface EquipmentCategory {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface EquipmentSpec {
  label: string;
  value: string;
}

export interface EquipmentItem {
  id: string;
  reference: string;
  title: string;
  category: string;
  condition: EquipmentCondition;
  country: string;
  location: string;
  year?: number;
  make: string;
  model: string;
  price?: number;
  currency: "USD" | "EUR" | "CNY";
  imageUrl: string;
  images: string[];
  summary: string;
  description: string;
  specs: EquipmentSpec[];
  features: string[];
  availability: EquipmentAvailability;
  seller: string;
  isFeatured: boolean;
}

export interface EquipmentFilters {
  search?: string;
  category?: string;
  condition?: EquipmentCondition | "all";
  country?: string;
  minPrice?: number;
  maxPrice?: number;
}
```

Write `src/data/categories.ts`:

```ts
import type { EquipmentCategory } from "@/types/catalog";

export const categories: EquipmentCategory[] = [
  {
    slug: "tanks-vessels",
    name: "Tanks & Vessels",
    description: "Used storage tanks, pressure vessels, and stainless process vessels.",
    imageUrl: "/images/chemical-plant.png",
  },
  {
    slug: "reactors",
    name: "Reactors",
    description: "Glass-lined, stainless steel, and jacketed reactors for chemical production.",
    imageUrl: "/images/petrochemical.png",
  },
  {
    slug: "mixers-agitators",
    name: "Mixers & Agitators",
    description: "Industrial mixers, agitators, blending tanks, and drive systems.",
    imageUrl: "/images/chemical-plant.png",
  },
  {
    slug: "pumps-compressors",
    name: "Pumps & Compressors",
    description: "Process pumps, air compressors, gas compressors, and utility packages.",
    imageUrl: "/images/compressor.png",
  },
  {
    slug: "heat-transfer",
    name: "Heat Transfer",
    description: "Heat exchangers, condensers, evaporators, and thermal equipment.",
    imageUrl: "/images/oil-gas.png",
  },
  {
    slug: "dryers-separation",
    name: "Dryers & Separation",
    description: "Dryers, filters, centrifuges, separators, and dewatering systems.",
    imageUrl: "/images/drilling.png",
  },
];
```

Write `src/data/equipment.ts` with at least these six records:

```ts
import type { EquipmentItem } from "@/types/catalog";

export const equipmentItems: EquipmentItem[] = [
  {
    id: "px-reactor-001",
    reference: "PX-R-001",
    title: "10,000 L Stainless Steel Jacketed Reactor",
    category: "reactors",
    condition: "good",
    country: "China",
    location: "Jiangsu, China",
    year: 2018,
    make: "Local Fabrication",
    model: "SS316L-JR-10000",
    price: 68000,
    currency: "USD",
    imageUrl: "/images/petrochemical.png",
    images: ["/images/petrochemical.png", "/images/chemical-plant.png"],
    summary: "Stainless steel jacketed reactor suitable for resin, chemical, and specialty material production.",
    description:
      "Used 10,000 L stainless steel jacketed reactor with top-entry agitator, manway, support legs, and heating/cooling jacket. Equipment is suitable for buyer inspection before shipment.",
    specs: [
      { label: "Material", value: "SS316L contact parts" },
      { label: "Working volume", value: "10,000 L" },
      { label: "Agitator", value: "Top-entry anchor type" },
      { label: "Jacket", value: "Heating and cooling jacket" },
      { label: "Power", value: "22 kW drive" },
    ],
    features: ["Inspection available", "Export packing support", "Process plant use"],
    availability: "available",
    seller: "Verified industrial seller",
    isFeatured: true,
  },
  {
    id: "px-mixer-001",
    reference: "PX-M-001",
    title: "High-Viscosity Mixer With Hydraulic Lifting",
    category: "mixers-agitators",
    condition: "excellent",
    country: "China",
    location: "Zhejiang, China",
    year: 2021,
    make: "ProcessMix",
    model: "PM-HV-5000",
    price: 42000,
    currency: "USD",
    imageUrl: "/images/chemical-plant.png",
    images: ["/images/chemical-plant.png"],
    summary: "Industrial mixer for coatings, adhesives, sealants, and high-viscosity chemical batches.",
    description:
      "Used high-viscosity mixer with hydraulic lifting frame and variable speed control. Good fit for buyers needing fast commissioning of mixing capacity.",
    specs: [
      { label: "Batch capacity", value: "5,000 L" },
      { label: "Drive", value: "Variable speed" },
      { label: "Lift", value: "Hydraulic" },
      { label: "Material", value: "Carbon steel frame, stainless contact parts" },
    ],
    features: ["Short lead time", "Video inspection available", "Suitable for viscous material"],
    availability: "available",
    seller: "Verified industrial seller",
    isFeatured: true,
  },
  {
    id: "px-compressor-001",
    reference: "PX-C-001",
    title: "Oil-Free Screw Air Compressor Package",
    category: "pumps-compressors",
    condition: "good",
    country: "Malaysia",
    location: "Selangor, Malaysia",
    year: 2017,
    make: "Atlas Copco",
    model: "ZR Series",
    price: 36000,
    currency: "USD",
    imageUrl: "/images/compressor.png",
    images: ["/images/compressor.png"],
    summary: "Oil-free screw compressor package for plant air and process utility service.",
    description:
      "Used oil-free screw air compressor package removed from a running facility. Maintenance records can be requested during inquiry.",
    specs: [
      { label: "Type", value: "Oil-free screw compressor" },
      { label: "Cooling", value: "Water-cooled" },
      { label: "Use", value: "Plant air and utility service" },
      { label: "Voltage", value: "380 V / 50 Hz" },
    ],
    features: ["Maintenance records available", "International logistics support", "Utility package"],
    availability: "available",
    seller: "Plant owner",
    isFeatured: true,
  },
  {
    id: "px-heat-001",
    reference: "PX-H-001",
    title: "Shell And Tube Heat Exchanger",
    category: "heat-transfer",
    condition: "fair",
    country: "Thailand",
    location: "Rayong, Thailand",
    year: 2015,
    make: "Thermal Systems",
    model: "STHE-250",
    price: 18500,
    currency: "USD",
    imageUrl: "/images/oil-gas.png",
    images: ["/images/oil-gas.png"],
    summary: "Shell and tube heat exchanger for chemical process heating and cooling duties.",
    description:
      "Used shell and tube heat exchanger available from a process plant upgrade. Buyer should confirm duty, metallurgy, and pressure requirements before purchase.",
    specs: [
      { label: "Type", value: "Shell and tube" },
      { label: "Area", value: "Approx. 250 m2" },
      { label: "Orientation", value: "Horizontal" },
      { label: "Documentation", value: "Nameplate photos available" },
    ],
    features: ["Nameplate review", "Inspection recommended", "Plant upgrade surplus"],
    availability: "under-review",
    seller: "Plant owner",
    isFeatured: false,
  },
  {
    id: "px-tank-001",
    reference: "PX-T-001",
    title: "50 m3 Stainless Steel Storage Tank",
    category: "tanks-vessels",
    condition: "good",
    country: "China",
    location: "Guangdong, China",
    year: 2019,
    make: "Local Fabrication",
    model: "SST-50",
    price: 24000,
    currency: "USD",
    imageUrl: "/images/chemical-plant.png",
    images: ["/images/chemical-plant.png"],
    summary: "Vertical stainless steel storage tank for liquid raw materials or finished products.",
    description:
      "Used vertical stainless storage tank with manway, nozzles, support legs, and level instrument connections.",
    specs: [
      { label: "Capacity", value: "50 m3" },
      { label: "Material", value: "SS304" },
      { label: "Orientation", value: "Vertical" },
      { label: "Use", value: "Liquid storage" },
    ],
    features: ["Cleaned before loading", "Container loading support", "Photo inspection available"],
    availability: "available",
    seller: "Verified industrial seller",
    isFeatured: false,
  },
  {
    id: "px-centrifuge-001",
    reference: "PX-S-001",
    title: "Horizontal Peeler Centrifuge",
    category: "dryers-separation",
    condition: "good",
    country: "India",
    location: "Gujarat, India",
    year: 2016,
    make: "Process Separation",
    model: "HPC-1250",
    price: 31000,
    currency: "USD",
    imageUrl: "/images/drilling.png",
    images: ["/images/drilling.png"],
    summary: "Used peeler centrifuge for solid-liquid separation in chemical production.",
    description:
      "Horizontal peeler centrifuge available from a chemical facility. Suitable for buyers sourcing separation equipment with inspection before export.",
    specs: [
      { label: "Basket diameter", value: "1,250 mm" },
      { label: "Discharge", value: "Peeler knife" },
      { label: "Material", value: "Stainless contact parts" },
      { label: "Application", value: "Solid-liquid separation" },
    ],
    features: ["Inspection available", "Export documentation support", "Chemical plant surplus"],
    availability: "available",
    seller: "Industrial trader",
    isFeatured: false,
  },
];
```

- [ ] **Step 4: Add catalog helper implementation**

Write `src/lib/catalog.ts`:

```ts
import { categories } from "@/data/categories";
import { equipmentItems } from "@/data/equipment";
import type { EquipmentFilters, EquipmentItem } from "@/types/catalog";

export function getFeaturedEquipment(): EquipmentItem[] {
  return equipmentItems.filter((item) => item.isFeatured);
}

export function findEquipmentById(id: string): EquipmentItem | undefined {
  return equipmentItems.find((item) => item.id === id);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getCountries(): string[] {
  return [...new Set(equipmentItems.map((item) => item.country))].sort();
}

export function filterEquipment(filters: EquipmentFilters): EquipmentItem[] {
  const search = normalize(filters.search);

  return equipmentItems.filter((item) => {
    if (filters.category && filters.category !== "all" && item.category !== filters.category) {
      return false;
    }

    if (filters.condition && filters.condition !== "all" && item.condition !== filters.condition) {
      return false;
    }

    if (filters.country && filters.country !== "all" && item.country !== filters.country) {
      return false;
    }

    if (typeof filters.minPrice === "number" && (item.price ?? 0) < filters.minPrice) {
      return false;
    }

    if (typeof filters.maxPrice === "number" && (item.price ?? Number.POSITIVE_INFINITY) > filters.maxPrice) {
      return false;
    }

    if (!search) {
      return true;
    }

    const haystack = normalize(
      [
        item.title,
        item.reference,
        item.category,
        item.country,
        item.location,
        item.make,
        item.model,
        item.summary,
        item.description,
        item.specs.map((spec) => `${spec.label} ${spec.value}`).join(" "),
      ].join(" "),
    );

    return haystack.includes(search);
  });
}

function normalize(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}
```

- [ ] **Step 5: Run tests and typecheck**

Run:

```powershell
npm test
npm run typecheck
```

Expected: both commands exit `0`.

- [ ] **Step 6: Commit catalog data layer**

Run:

```powershell
git add src/types src/data src/lib package.json package-lock.json
git commit -m "feat: add static catalog data layer"
```

Expected: commit succeeds.

---

### Task 3: Add Inquiry Helpers And Tests

**Files:**
- Create: `src/config/contact.ts`
- Create: `src/lib/inquiry.ts`
- Create: `src/lib/inquiry.test.ts`

- [ ] **Step 1: Write failing inquiry tests**

Write `src/lib/inquiry.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { equipmentItems } from "@/data/equipment";
import { buildInquiryMessage, buildMailtoHref, buildWhatsAppHref } from "@/lib/inquiry";

const item = equipmentItems[0];

test("buildInquiryMessage includes reference and title", () => {
  const message = buildInquiryMessage(item, "Buyer message");
  assert.match(message, /PX-R-001/);
  assert.match(message, /10,000 L Stainless Steel Jacketed Reactor/);
  assert.match(message, /Buyer message/);
});

test("buildMailtoHref encodes subject and body", () => {
  const href = buildMailtoHref(item, "Need CIF price");
  assert.ok(href.startsWith("mailto:sales@plantxchange.com?"));
  assert.match(decodeURIComponent(href), /PX-R-001/);
  assert.match(decodeURIComponent(href), /Need CIF price/);
});

test("buildWhatsAppHref uses digits-only WhatsApp number and encoded message", () => {
  const href = buildWhatsAppHref(item, "Please send photos");
  assert.ok(href.startsWith("https://wa.me/8613800000000?text="));
  assert.match(decodeURIComponent(href), /Please send photos/);
});
```

- [ ] **Step 2: Run tests to verify inquiry helper tests fail**

Run:

```powershell
npm test
```

Expected: FAIL because `src/lib/inquiry.ts` and `src/config/contact.ts` do not exist yet.

- [ ] **Step 3: Add contact config and inquiry implementation**

Write `src/config/contact.ts`:

```ts
export const contactConfig = {
  email: "sales@plantxchange.com",
  whatsappNumber: "+8613800000000",
  whatsappLabel: "WhatsApp",
};
```

Write `src/lib/inquiry.ts`:

```ts
import { contactConfig } from "@/config/contact";
import type { EquipmentItem } from "@/types/catalog";

export function buildInquiryMessage(item: EquipmentItem, note = ""): string {
  const lines = [
    `Hello PlantXchange,`,
    ``,
    `I am interested in this used process equipment:`,
    `Reference: ${item.reference}`,
    `Title: ${item.title}`,
    `Location: ${item.location}`,
    ``,
    note.trim() ? `Message: ${note.trim()}` : `Please send availability, inspection details, and a current quote.`,
  ];

  return lines.join("\n");
}

export function buildMailtoHref(item: EquipmentItem, note = ""): string {
  const subject = `Inquiry for ${item.reference} - ${item.title}`;
  const body = buildInquiryMessage(item, note);

  return `mailto:${contactConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildWhatsAppHref(item: EquipmentItem, note = ""): string {
  const phone = contactConfig.whatsappNumber.replace(/\D/g, "");
  const text = buildInquiryMessage(item, note);

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
```

- [ ] **Step 4: Run tests and typecheck**

Run:

```powershell
npm test
npm run typecheck
```

Expected: both commands exit `0`.

- [ ] **Step 5: Commit inquiry helpers**

Run:

```powershell
git add src/config src/lib package.json package-lock.json
git commit -m "feat: add equipment inquiry helpers"
```

Expected: commit succeeds.

---

### Task 4: Build Layout And Shared Catalog Components

**Files:**
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/EquipmentCard.tsx`
- Create: `src/components/InquiryActions.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Implement global styles**

Extend `src/index.css` with these rules below the existing content:

```css
a {
  color: inherit;
  text-decoration: none;
}

.industrial-shell {
  background:
    linear-gradient(180deg, rgba(248, 247, 243, 0.96), rgba(248, 247, 243, 1)),
    radial-gradient(circle at top left, rgba(16, 185, 129, 0.16), transparent 34rem);
}

.container-x {
  width: min(1180px, calc(100% - 32px));
  margin-inline: auto;
}

.focus-ring {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus-ring:focus-visible {
  outline-color: #047857;
}
```

- [ ] **Step 2: Create navigation and footer**

Write `src/components/layout/Navbar.tsx` with links to `/`, `/catalog`, `/sell`, and `/about`. Include a primary "Email Inquiry" link with `href="mailto:sales@plantxchange.com"`.

Write `src/components/layout/Footer.tsx` with the PlantXchange description, catalog category links, and Email/WhatsApp contact links using `contactConfig`.

- [ ] **Step 3: Create `EquipmentCard`**

Write `src/components/EquipmentCard.tsx` to accept `{ item: EquipmentItem }`, render image, reference, title, category name, condition, location, year, price when present, and a link to `/equipment/${item.id}`.

Use `getCategoryBySlug(item.category)?.name ?? item.category` for category labels.

- [ ] **Step 4: Create `InquiryActions`**

Write `src/components/InquiryActions.tsx` to accept `{ item: EquipmentItem; note?: string }`, call `buildMailtoHref` and `buildWhatsAppHref`, and render two accessible anchor buttons labeled `Email inquiry` and `WhatsApp`.

- [ ] **Step 5: Wire routes with layout**

Replace `src/App.tsx` with a route shell using `wouter`:

```tsx
import { Route, Switch } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import EquipmentDetail from "@/pages/EquipmentDetail";
import Sell from "@/pages/Sell";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <div className="industrial-shell flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/catalog" component={Catalog} />
          <Route path="/browse" component={Catalog} />
          <Route path="/equipment/:id" component={EquipmentDetail} />
          <Route path="/sell" component={Sell} />
          <Route path="/about" component={About} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 6: Add temporary page modules for route compilation**

Create each page file with a simple default component returning the page name: `src/pages/Home.tsx`, `src/pages/Catalog.tsx`, `src/pages/EquipmentDetail.tsx`, `src/pages/Sell.tsx`, `src/pages/About.tsx`, and `src/pages/NotFound.tsx`.

- [ ] **Step 7: Run typecheck and build**

Run:

```powershell
npm run typecheck
npm run build
```

Expected: both commands exit `0`.

- [ ] **Step 8: Commit layout and shared components**

Run:

```powershell
git add src
git commit -m "feat: add PlantXchange layout components"
```

Expected: commit succeeds.

---

### Task 5: Implement Home, Catalog, And Equipment Detail Pages

**Files:**
- Modify: `src/pages/Home.tsx`
- Modify: `src/pages/Catalog.tsx`
- Modify: `src/pages/EquipmentDetail.tsx`

- [ ] **Step 1: Implement home page**

Replace `src/pages/Home.tsx` with a page that:

- Shows PlantXchange as the first-viewport brand signal.
- Uses `/images/chemical-plant.png` or `/images/petrochemical.png` as the primary visual asset.
- Links buyer flow to `/catalog`.
- Links seller flow to `/sell`.
- Renders categories from `categories`.
- Renders featured equipment from `getFeaturedEquipment()`.

- [ ] **Step 2: Implement catalog page**

Replace `src/pages/Catalog.tsx` with a page that:

- Reads URL search params using `window.location.search`.
- Tracks `search`, `category`, `condition`, `country`, `minPrice`, and `maxPrice` in React state.
- Calls `filterEquipment`.
- Renders filter controls as labeled inputs/selects.
- Renders an empty state with a reset button when no equipment matches.
- Renders `EquipmentCard` for results.

- [ ] **Step 3: Implement equipment detail page**

Replace `src/pages/EquipmentDetail.tsx` with a page that:

- Reads `id` from `useRoute("/equipment/:id")`.
- Calls `findEquipmentById`.
- Shows `NotFound` content when missing.
- Renders image, gallery thumbnails, title, reference, specs, features, condition, availability, location, price, seller, and inquiry actions.
- Includes a textarea for buyer notes and passes the note into `InquiryActions`.

- [ ] **Step 4: Run verification**

Run:

```powershell
npm run typecheck
npm run build
```

Expected: both commands exit `0`.

- [ ] **Step 5: Commit catalog pages**

Run:

```powershell
git add src/pages src/components src/lib
git commit -m "feat: implement catalog browsing pages"
```

Expected: commit succeeds.

---

### Task 6: Implement Sell, About, And Not Found Pages

**Files:**
- Modify: `src/pages/Sell.tsx`
- Modify: `src/pages/About.tsx`
- Modify: `src/pages/NotFound.tsx`

- [ ] **Step 1: Implement sell page**

Replace `src/pages/Sell.tsx` with a front-end seller lead page that:

- Collects equipment type, make/model, location, condition, seller company, contact details, and message.
- Does not claim the submission is stored.
- Generates a prefilled email link to `sales@plantxchange.com`.
- Provides a WhatsApp link using the configured number.
- Explains that photos can be sent by email or WhatsApp.

- [ ] **Step 2: Implement about page**

Replace `src/pages/About.tsx` with a credibility page covering:

- Used process equipment focus.
- Buyer sourcing process.
- Seller matching process.
- Inspection and logistics support.
- International equipment trade positioning.

- [ ] **Step 3: Implement not-found page**

Replace `src/pages/NotFound.tsx` with a compact page that links back to `/catalog` and `/`.

- [ ] **Step 4: Run verification**

Run:

```powershell
npm run typecheck
npm run build
```

Expected: both commands exit `0`.

- [ ] **Step 5: Commit secondary pages**

Run:

```powershell
git add src/pages
git commit -m "feat: add seller lead and trust pages"
```

Expected: commit succeeds.

---

### Task 7: Final Static-Site Verification And Browser Preview

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add usage documentation**

Write `README.md`:

````md
# PlantXchange

PlantXchange is a static catalog and lead-generation website for used industrial process equipment and chemical plant assets.

## Run Locally

```powershell
npm install
npm run dev
```

## Verify

```powershell
npm test
npm run typecheck
npm run build
```

## Edit Catalog Data

- Categories: `src/data/categories.ts`
- Equipment: `src/data/equipment.ts`
- Contact buttons: `src/config/contact.ts`

The first version does not require a database, backend API server, user accounts, or Replit environment variables.
````

- [ ] **Step 2: Run full verification**

Run:

```powershell
npm test
npm run typecheck
npm run build
```

Expected: all commands exit `0`.

- [ ] **Step 3: Start local preview**

Run:

```powershell
npm run dev -- --port 5173
```

Expected: Vite prints a local URL at `http://127.0.0.1:5173/`.

- [ ] **Step 4: Browser-check main workflows**

Open `http://127.0.0.1:5173/` and verify:

- Home page shows PlantXchange immediately.
- Catalog page renders equipment records.
- Search for `stainless` returns matching equipment.
- Category filter for `Reactors` returns reactor equipment.
- Detail page for `px-reactor-001` renders specs and inquiry actions.
- Email inquiry URL includes `PX-R-001`.
- WhatsApp URL starts with `https://wa.me/8613800000000`.
- Sell page provides email and WhatsApp paths.
- About page renders trust/process content.

- [ ] **Step 5: Stop preview server**

Stop the dev server with `Ctrl+C`.

- [ ] **Step 6: Commit documentation and final verified state**

Run:

```powershell
git add README.md
git commit -m "docs: add PlantXchange maintenance notes"
git status --short --branch
```

Expected: commit succeeds and status is clean.

---

## Self-Review Notes

- Spec coverage: the plan covers static frontend setup, local data, catalog filtering, equipment detail pages, seller lead page, inquiry Email and WhatsApp actions, browser verification, and no backend/database runtime.
- Scope control: live accounts, quote dashboard, admin tools, database, generated API clients, and Replit-specific plugins are excluded from implementation.
- Type consistency: category slugs and equipment fields are defined in `src/types/catalog.ts` before helpers and pages consume them.
- Migration path: all catalog data access is centralized through `src/data/*` and `src/lib/catalog.ts`, and inquiry logic is centralized through `src/lib/inquiry.ts`.
