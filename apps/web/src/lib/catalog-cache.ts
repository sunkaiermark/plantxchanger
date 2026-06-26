import type { CatalogSearchParams } from "@/lib/catalog/types";

export const PUBLIC_CATALOG_CACHE_TAG = "public-catalog";
export const PUBLIC_CATALOG_CACHE_REVALIDATE_SECONDS = 60;

export function catalogSearchParamsCacheArgs(searchParams: CatalogSearchParams) {
  return [
    searchParams.search ?? "",
    searchParams.category ?? "",
    searchParams.condition ?? "",
    searchParams.availability ?? "",
    searchParams.country ?? "",
  ] as const;
}
