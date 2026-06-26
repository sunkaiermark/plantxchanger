import { unstable_cache } from "next/cache";
import { hasPostgresConfig, hasStrapiReadConfig } from "@/lib/env";
import { fallbackCategories, fallbackEquipment, fallbackSiteSettings } from "@/lib/fallback-data";
import { getPostgresSql } from "@/lib/postgres/client";
import {
  catalogSearchParamsCacheArgs,
  PUBLIC_CATALOG_CACHE_REVALIDATE_SECONDS,
  PUBLIC_CATALOG_CACHE_TAG,
} from "@/lib/catalog-cache";
import {
  getCatalogEquipmentFromPostgres,
  getCategoriesFromPostgres,
  getEquipmentBySlugFromPostgres,
  getFeaturedEquipmentFromPostgres,
  getSiteSettingsFromPostgres,
} from "@/lib/postgres/catalog";
import { getStrapiUrl, strapiFetch } from "./client";
import { normalizeCategory, normalizeEquipment, normalizeSiteSettings } from "./normalize";
import type { CategorySummary, EquipmentSummary, SiteSettings } from "./types";

const publicCatalogCacheOptions = {
  revalidate: PUBLIC_CATALOG_CACHE_REVALIDATE_SECONDS,
  tags: [PUBLIC_CATALOG_CACHE_TAG],
};

const EQUIPMENT_POPULATE = {
  category: true,
  mainImage: true,
  gallery: true,
  specifications: true,
  features: true,
};
const EQUIPMENT_API_PATH = "/api/equipment-items";

function filterFallbackEquipment(searchParams: {
  search?: string;
  category?: string;
  condition?: string;
  availability?: string;
  country?: string;
}) {
  const query = searchParams.search?.toLowerCase();

  return fallbackEquipment.filter((equipment) => {
    if (searchParams.category && equipment.category?.slug !== searchParams.category) return false;
    if (searchParams.condition && equipment.condition !== searchParams.condition) return false;
    if (searchParams.availability && equipment.availability !== searchParams.availability) {
      return false;
    }
    if (searchParams.country && equipment.country !== searchParams.country) return false;
    if (!query) return true;

    return [equipment.title, equipment.reference, equipment.summary, equipment.description]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(query));
  });
}

export async function readPostgresFirst<T>({
  hasPostgres,
  readPostgres,
  readFallback,
}: {
  hasPostgres: boolean;
  readPostgres: () => Promise<T>;
  readFallback: () => Promise<T>;
}): Promise<T> {
  if (hasPostgres) {
    try {
      return await readPostgres();
    } catch {
      return readFallback();
    }
  }

  return readFallback();
}

const readCachedSiteSettingsFromPostgres = unstable_cache(
  async () => getSiteSettingsFromPostgres(getPostgresSql()),
  ["postgres-site-settings"],
  publicCatalogCacheOptions,
);

const readCachedCategoriesFromPostgres = unstable_cache(
  async () => getCategoriesFromPostgres(getPostgresSql()),
  ["postgres-categories"],
  publicCatalogCacheOptions,
);

const readCachedFeaturedEquipmentFromPostgres = unstable_cache(
  async () => getFeaturedEquipmentFromPostgres(getPostgresSql()),
  ["postgres-featured-equipment"],
  publicCatalogCacheOptions,
);

const readCachedEquipmentBySlugFromPostgres = unstable_cache(
  async (slug: string) => getEquipmentBySlugFromPostgres(getPostgresSql(), slug),
  ["postgres-equipment-by-slug"],
  publicCatalogCacheOptions,
);

const readCachedCatalogEquipmentFromPostgres = unstable_cache(
  async (
    search: string,
    category: string,
    condition: string,
    availability: string,
    country: string,
  ) =>
    getCatalogEquipmentFromPostgres(getPostgresSql(), {
      search,
      category,
      condition,
      availability,
      country,
    }),
  ["postgres-catalog-equipment"],
  publicCatalogCacheOptions,
);

export async function getSiteSettings(): Promise<SiteSettings> {
  return readPostgresFirst({
    hasPostgres: hasPostgresConfig(),
    readPostgres: () => readCachedSiteSettingsFromPostgres(),
    readFallback: async () => {
      if (!hasStrapiReadConfig()) {
        return fallbackSiteSettings;
      }

      try {
        const response = await strapiFetch<{ data: unknown }>("/api/site-setting", {
          revalidate: 120,
        });
        return normalizeSiteSettings(response.data);
      } catch {
        return fallbackSiteSettings;
      }
    },
  });
}

export async function getCategories(): Promise<CategorySummary[]> {
  return readPostgresFirst({
    hasPostgres: hasPostgresConfig(),
    readPostgres: () => readCachedCategoriesFromPostgres(),
    readFallback: async () => {
      if (!hasStrapiReadConfig()) {
        return fallbackCategories;
      }

      try {
        const response = await strapiFetch<{ data: unknown[] }>("/api/categories", {
          query: {
            sort: ["sortOrder:asc", "name:asc"],
            pagination: { pageSize: 50 },
          },
          revalidate: 120,
        });
        return response.data.map(normalizeCategory);
      } catch {
        return fallbackCategories;
      }
    },
  });
}

export async function getFeaturedEquipment(): Promise<EquipmentSummary[]> {
  return readPostgresFirst({
    hasPostgres: hasPostgresConfig(),
    readPostgres: () => readCachedFeaturedEquipmentFromPostgres(),
    readFallback: async () => {
      if (!hasStrapiReadConfig()) {
        return fallbackEquipment.filter((equipment) => equipment.isFeatured);
      }

      try {
        const response = await strapiFetch<{ data: unknown[] }>(EQUIPMENT_API_PATH, {
          query: {
            filters: { isFeatured: { $eq: true } },
            populate: EQUIPMENT_POPULATE,
            sort: ["updatedAt:desc"],
            pagination: { pageSize: 6 },
          },
          revalidate: 120,
        });
        return response.data.map((item) => normalizeEquipment(item, getStrapiUrl()));
      } catch {
        return fallbackEquipment.filter((equipment) => equipment.isFeatured);
      }
    },
  });
}

export async function getEquipmentBySlug(slug: string): Promise<EquipmentSummary | null> {
  return readPostgresFirst({
    hasPostgres: hasPostgresConfig(),
    readPostgres: () => readCachedEquipmentBySlugFromPostgres(slug),
    readFallback: async () => {
      if (!hasStrapiReadConfig()) {
        return fallbackEquipment.find((equipment) => equipment.slug === slug) ?? null;
      }

      try {
        const response = await strapiFetch<{ data: unknown[] }>(EQUIPMENT_API_PATH, {
          query: {
            filters: { slug: { $eq: slug } },
            populate: EQUIPMENT_POPULATE,
            pagination: { pageSize: 1 },
          },
          revalidate: 120,
        });
        return response.data[0] ? normalizeEquipment(response.data[0], getStrapiUrl()) : null;
      } catch {
        return fallbackEquipment.find((equipment) => equipment.slug === slug) ?? null;
      }
    },
  });
}

export async function getCatalogEquipment(searchParams: {
  search?: string;
  category?: string;
  condition?: string;
  availability?: string;
  country?: string;
}): Promise<EquipmentSummary[]> {
  const [search, category, condition, availability, country] =
    catalogSearchParamsCacheArgs(searchParams);

  return readPostgresFirst({
    hasPostgres: hasPostgresConfig(),
    readPostgres: () =>
      readCachedCatalogEquipmentFromPostgres(search, category, condition, availability, country),
    readFallback: async () => {
      if (!hasStrapiReadConfig()) {
        return filterFallbackEquipment(searchParams);
      }

      const filters: Record<string, unknown> = {};
      if (searchParams.category) filters.category = { slug: { $eq: searchParams.category } };
      if (searchParams.condition) filters.condition = { $eq: searchParams.condition };
      if (searchParams.availability) filters.availability = { $eq: searchParams.availability };
      if (searchParams.country) filters.country = { $eq: searchParams.country };
      if (searchParams.search) {
        filters.$or = [
          { title: { $containsi: searchParams.search } },
          { reference: { $containsi: searchParams.search } },
          { summary: { $containsi: searchParams.search } },
          { description: { $containsi: searchParams.search } },
        ];
      }

      try {
        const response = await strapiFetch<{ data: unknown[] }>(EQUIPMENT_API_PATH, {
          query: {
            filters,
            populate: EQUIPMENT_POPULATE,
            sort: ["updatedAt:desc"],
            pagination: { pageSize: 48 },
          },
          revalidate: 120,
        });
        return response.data.map((item) => normalizeEquipment(item, getStrapiUrl()));
      } catch {
        return filterFallbackEquipment(searchParams);
      }
    },
  });
}
