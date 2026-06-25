import { buildSitemapEntries } from "@/lib/seo";
import { getCatalogEquipment, getCategories } from "@/lib/strapi/equipment";

export default async function sitemap() {
  const [equipment, categories] = await Promise.all([getCatalogEquipment({}), getCategories()]);

  return buildSitemapEntries(equipment, categories);
}
