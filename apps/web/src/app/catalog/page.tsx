import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { EquipmentCard } from "@/components/equipment-card";
import { getCatalogEquipment, getCategories } from "@/lib/strapi/equipment";

type CatalogSearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export const metadata = {
  title: "Equipment Exchange",
};

export default async function CatalogPage({ searchParams }: { searchParams: CatalogSearchParams }) {
  const params = await searchParams;
  const filters = {
    search: getParam(params, "search") ?? "",
    category: getParam(params, "category") ?? "",
    condition: getParam(params, "condition") ?? "",
    availability: getParam(params, "availability") ?? "",
    country: getParam(params, "country") ?? "",
  };
  const [equipment, categories] = await Promise.all([
    getCatalogEquipment(filters),
    getCategories(),
  ]);
  const selectedCategory = categories.find((category) => category.slug === filters.category);
  const activeFilters = [
    filters.search ? { label: "Search", value: filters.search } : null,
    filters.category ? { label: "Category", value: selectedCategory?.name ?? filters.category } : null,
    filters.condition ? { label: "Condition", value: filters.condition } : null,
    filters.availability ? { label: "Status", value: filters.availability } : null,
    filters.country ? { label: "Country", value: filters.country } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <section className="bg-[#f6f6f6]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="mb-10">
          <div>
            <h1 className="text-[clamp(2.8rem,5vw,4.8rem)] font-black uppercase leading-none tracking-normal text-[#202329]">
              Equipment Exchange
            </h1>
            <p className="mt-4 font-mono text-lg font-black uppercase tracking-[0.16em] text-[#777a7d]">
              {equipment.length} assets available worldwide
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside>
            <form className="sticky top-28 grid gap-4 border border-[#dedede] bg-white p-5 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between border-b border-[#eeeeee] pb-4">
                <span className="inline-flex items-center gap-2 font-mono text-sm font-black uppercase tracking-[0.12em] text-[#202329]">
                  <SlidersHorizontal size={18} />
                  Filters
                </span>
                <span className="bg-[#ff3d00] px-2 py-1 font-mono text-xs font-black text-white">
                  {activeFilters.length}
                </span>
              </div>

              <label className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777a7d]" size={20} />
                <input
                  name="search"
                  defaultValue={filters.search}
                  placeholder="Search inventory..."
                  className="h-12 w-full border border-[#d7d7d7] bg-white pl-11 pr-3 font-mono text-sm text-[#202329] outline-none placeholder:text-[#8e8e8e] focus:border-[#ff3d00]"
                />
              </label>

              <select name="category" defaultValue={filters.category} className="h-12 border border-[#d7d7d7] bg-white px-3 font-mono text-sm uppercase text-[#45484d]">
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select name="condition" defaultValue={filters.condition} className="h-12 border border-[#d7d7d7] bg-white px-3 font-mono text-sm uppercase text-[#45484d]">
                <option value="">Any condition</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="for-parts">For parts</option>
              </select>
              <select name="availability" defaultValue={filters.availability} className="h-12 border border-[#d7d7d7] bg-white px-3 font-mono text-sm uppercase text-[#45484d]">
                <option value="">Any status</option>
                <option value="available">Available</option>
                <option value="under-review">Under review</option>
                <option value="sold">Sold</option>
              </select>
              <input
                name="country"
                defaultValue={filters.country}
                placeholder="Country"
                className="h-12 border border-[#d7d7d7] bg-white px-3 font-mono text-sm uppercase text-[#45484d] outline-none placeholder:text-[#8e8e8e] focus:border-[#ff3d00]"
              />
              <button className="h-12 bg-[#ff3d00] px-5 font-mono font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#e53600]">
                Apply filters
              </button>
              <Link href="/catalog" className="inline-flex h-10 items-center justify-center gap-2 font-mono text-sm font-black uppercase tracking-[0.1em] text-[#30343a] hover:text-[#ff3d00]">
                Reset
                <X size={16} />
              </Link>
            </form>
          </aside>

          <div>
            {activeFilters.length > 0 ? (
              <div className="mb-7 flex flex-wrap items-center gap-3">
                {activeFilters.map((filter) => (
                  <span key={`${filter.label}-${filter.value}`} className="inline-flex h-10 items-center gap-3 bg-[#30343a] px-4 font-mono text-sm font-black uppercase text-white">
                    <span className="text-[#9ea2a8]">{filter.label}:</span>
                    {filter.value}
                  </span>
                ))}
              </div>
            ) : null}

            {equipment.length > 0 ? (
              <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                {equipment.map((item) => (
                  <EquipmentCard key={item.documentId} equipment={item} />
                ))}
              </div>
            ) : (
              <div className="border border-[#dedede] bg-white p-10 text-center">
                <h2 className="text-2xl font-black uppercase text-[#202329]">No matching equipment</h2>
                <p className="mt-3 font-mono text-[#5d6268]">
                  Adjust filters or send a sourcing request through WhatsApp or email.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
