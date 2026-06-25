import type { Metadata, MetadataRoute } from "next";
import type { CategorySummary, EquipmentSummary } from "@/lib/strapi/types";

const defaultSiteUrl = "https://www.plantxchanger.com";
const canonicalSiteUrl = "https://www.plantxchanger.com";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizePath(path: string) {
  if (!path || path === "/") {
    return "/";
  }

  if (/^https?:\/\//i.test(path)) {
    const url = new URL(path);
    return `${url.pathname}${url.search}`;
  }

  const [pathWithoutHash] = path.split("#", 1);
  const searchStart = pathWithoutHash.indexOf("?");
  const pathname = searchStart >= 0 ? pathWithoutHash.slice(0, searchStart) : pathWithoutHash;
  const search = searchStart >= 0 ? pathWithoutHash.slice(searchStart) : "";
  const normalizedPathname = pathname ? `/${pathname.replace(/^\/+/, "")}` : "/";

  return `${normalizedPathname}${search}`;
}

function compactDescription(value?: string) {
  return value?.replace(/\s+/g, " ").trim();
}

function usedCategoryLabel(equipment: EquipmentSummary) {
  return equipment.category?.name ? `Used ${equipment.category.name}` : "Used Industrial Equipment";
}

function absoluteAssetUrl(url?: string) {
  if (!url) {
    return undefined;
  }

  if (/^https?:\/\//.test(url)) {
    return url;
  }

  return `${getPublicSiteUrl()}${normalizePath(url)}`;
}

export function getPublicSiteUrl() {
  return trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl);
}

export function getCanonicalUrl(path = "/") {
  const normalizedPath = normalizePath(path);
  return `${canonicalSiteUrl}${normalizedPath}`;
}

export const canonicalUrl = getCanonicalUrl;

function isPrivatePath(pathname: string, segment: string) {
  return pathname === segment || pathname.startsWith(`${segment}/`);
}

export function isPublicIndexablePath(path: string) {
  const pathname = normalizePath(path).split(/[?#]/, 1)[0] ?? "/";
  return !(
    isPrivatePath(pathname, "/admin") ||
    isPrivatePath(pathname, "/api") ||
    isPrivatePath(pathname, "/quotes")
  );
}

export function buildEquipmentMetadata(equipment: EquipmentSummary): Metadata {
  const categoryLabel = usedCategoryLabel(equipment);
  const location = equipment.country ?? equipment.location ?? "global seller";
  const description =
    compactDescription(equipment.seoDescription) ??
    `${equipment.title} (${equipment.reference}) ${categoryLabel.toLowerCase()} available from ${location}. Request quote, inspection details, technical specifications, and export support through PlantXchange.`;
  const title = equipment.seoTitle ?? `${equipment.title} | ${categoryLabel}`;
  const image = absoluteAssetUrl(equipment.mainImage?.url);
  const url = canonicalUrl(`/equipment/${equipment.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
      type: "website",
      url,
    },
  };
}

export function buildEquipmentJsonLd(equipment: EquipmentSummary) {
  const url = canonicalUrl(`/equipment/${equipment.slug}`);
  const image = absoluteAssetUrl(equipment.mainImage?.url);
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    availability:
      equipment.availability === "sold"
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    priceCurrency: equipment.currency,
    seller: {
      "@type": "Organization",
      name: equipment.sellerDisplayName ?? "PlantXchange verified seller",
    },
    url,
  };

  if (equipment.price) {
    offer.price = equipment.price;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    additionalProperty: equipment.specifications.map((spec) => ({
      "@type": "PropertyValue",
      name: spec.label,
      value: spec.value,
    })),
    brand: {
      "@type": "Brand",
      name: equipment.make ?? equipment.sellerDisplayName ?? "PlantXchange",
    },
    category: equipment.category?.name,
    condition: "https://schema.org/UsedCondition",
    description: compactDescription(equipment.description ?? equipment.summary),
    image: image ? [image] : undefined,
    model: equipment.model,
    name: equipment.title,
    offers: offer,
    sku: equipment.reference,
    url,
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PlantXchange",
    url: canonicalUrl("/"),
    description:
      "B2B marketplace for used industrial process equipment, chemical plant assets, tanks, reactors, mixers, pumps, and compressors.",
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PlantXchange",
    potentialAction: {
      "@type": "SearchAction",
      queryInput: "required name=search_term_string",
      target: `${canonicalUrl("/catalog")}?search={search_term_string}`,
    },
    url: canonicalUrl("/"),
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: item.url,
      name: item.name,
      position: index + 1,
    })),
  };
}

export function buildSitemapEntries(
  equipment: EquipmentSummary[],
  categories: CategorySummary[] = [],
): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = ["/", "/catalog", "/sell", "/about"];

  return [
    ...staticPaths.map((path) => ({
      changeFrequency: path === "/" ? ("daily" as const) : ("weekly" as const),
      lastModified: now,
      priority: path === "/" ? 1 : 0.8,
      url: canonicalUrl(path),
    })),
    ...equipment.map((item) => ({
      changeFrequency: "weekly" as const,
      lastModified: now,
      priority: item.isFeatured ? 0.9 : 0.7,
      url: canonicalUrl(`/equipment/${item.slug}`),
    })),
    ...categories.map((category) => ({
      changeFrequency: "weekly" as const,
      lastModified: now,
      priority: 0.6,
      url: canonicalUrl(`/catalog?category=${category.slug}`),
    })),
  ].filter((entry) => isPublicIndexablePath(new URL(entry.url).pathname));
}

export function buildRobotsPolicy(): MetadataRoute.Robots {
  const privatePaths = ["/admin", "/admin/", "/api", "/api/", "/quotes"];

  return {
    host: getPublicSiteUrl(),
    rules: [
      {
        allow: "/",
        disallow: privatePaths,
        userAgent: "*",
      },
      {
        allow: "/",
        disallow: privatePaths,
        userAgent: [
          "Googlebot",
          "Bingbot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "GPTBot",
          "Google-Extended",
          "PerplexityBot",
          "ClaudeBot",
        ],
      },
    ],
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
