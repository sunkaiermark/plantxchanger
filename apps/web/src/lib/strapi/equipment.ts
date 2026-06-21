import { hasStrapiReadConfig } from "@/lib/env";
import { fallbackCategories, fallbackEquipment, fallbackSiteSettings } from "@/lib/fallback-data";
import { getStrapiUrl, strapiFetch } from "./client";
import { normalizeCategory, normalizeEquipment, normalizeSiteSettings } from "./normalize";
import type { CategorySummary, EquipmentSummary, SiteSettings } from "./types";

const EQUIPMENT_POPULATE = {
  category: true,
  mainImage: true,
  gallery: true,
  specifications: true,
  features: true,
};

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

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!hasStrapiReadConfig()) {
    return fallbackSiteSettings;
  }

  try {
    const response = await strapiFetch<{ data: any }>("/api/site-setting", {
      revalidate: 120,
    });
    return normalizeSiteSettings(response.data);
  } catch {
    return fallbackSiteSettings;
  }
}

export async function getCategories(): Promise<CategorySummary[]> {
  if (!hasStrapiReadConfig()) {
    return fallbackCategories;
  }

  try {
    const response = await strapiFetch<{ data: any[] }>("/api/categories", {
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
}

export async function getFeaturedEquipment(): Promise<EquipmentSummary[]> {
  if (!hasStrapiReadConfig()) {
    return fallbackEquipment.filter((equipment) => equipment.isFeatured);
  }

  try {
    const response = await strapiFetch<{ data: any[] }>("/api/equipment", {
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
}

export async function getEquipmentBySlug(slug: string): Promise<EquipmentSummary | null> {
  if (!hasStrapiReadConfig()) {
    return fallbackEquipment.find((equipment) => equipment.slug === slug) ?? null;
  }

  try {
    const response = await strapiFetch<{ data: any[] }>("/api/equipment", {
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
}

export async function getCatalogEquipment(searchParams: {
  search?: string;
  category?: string;
  condition?: string;
  availability?: string;
  country?: string;
}): Promise<EquipmentSummary[]> {
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
    const response = await strapiFetch<{ data: any[] }>("/api/equipment", {
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
}
