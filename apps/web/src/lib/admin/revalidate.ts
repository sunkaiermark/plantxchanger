import { revalidateTag } from "next/cache";
import { PUBLIC_CATALOG_CACHE_TAG } from "@/lib/catalog-cache";

export function revalidatePublicCatalog() {
  revalidateTag(PUBLIC_CATALOG_CACHE_TAG, "max");
}
