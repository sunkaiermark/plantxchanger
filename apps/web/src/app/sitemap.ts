import { buildSitemapEntries } from "@/lib/seo";
import { getCatalogEquipment } from "@/lib/strapi/equipment";

export default async function sitemap() {
  const equipment = await getCatalogEquipment({});

  return buildSitemapEntries(equipment);
}
