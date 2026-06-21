import { Search } from "lucide-react";
import { EquipmentCard } from "@/components/equipment-card";
import { getCatalogEquipment, getCategories } from "@/lib/strapi/equipment";

type CatalogSearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export const metadata = {
  title: "Used Equipment Catalog",
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

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b7791f]">
          Catalog
        </p>
        <h1 className="text-4xl font-semibold text-[#18211f]">Used process equipment</h1>
        <p className="max-w-3xl leading-7 text-[#66736d]">
          Search used industrial process assets by category, condition, availability, and country.
        </p>
      </div>

      <form className="mb-8 grid gap-3 rounded-lg border border-[#d8ded8] bg-white p-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66736d]" size={18} />
          <input
            name="search"
            defaultValue={filters.search}
            placeholder="Search reference, title, or keyword"
            className="h-11 w-full rounded-lg border border-[#cfd8d2] pl-10 pr-3"
          />
        </div>
        <select name="category" defaultValue={filters.category} className="h-11 rounded-lg border border-[#cfd8d2] px-3">
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <select name="condition" defaultValue={filters.condition} className="h-11 rounded-lg border border-[#cfd8d2] px-3">
          <option value="">Any condition</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="for-parts">For parts</option>
        </select>
        <select name="availability" defaultValue={filters.availability} className="h-11 rounded-lg border border-[#cfd8d2] px-3">
          <option value="">Any status</option>
          <option value="available">Available</option>
          <option value="under-review">Under review</option>
          <option value="sold">Sold</option>
        </select>
        <input
          name="country"
          defaultValue={filters.country}
          placeholder="Country"
          className="h-11 rounded-lg border border-[#cfd8d2] px-3"
        />
        <button className="h-11 rounded-lg bg-[#17463a] px-5 font-semibold text-white transition hover:bg-[#27566b]">
          Apply
        </button>
      </form>

      <div className="mb-5 flex items-center justify-between text-sm text-[#66736d]">
        <p>{equipment.length} listing{equipment.length === 1 ? "" : "s"}</p>
        <a href="/catalog" className="font-semibold text-[#17463a]">
          Reset filters
        </a>
      </div>

      {equipment.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {equipment.map((item) => (
            <EquipmentCard key={item.documentId} equipment={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[#d8ded8] bg-white p-8 text-center">
          <h2 className="text-xl font-semibold text-[#18211f]">No matching equipment</h2>
          <p className="mt-2 text-[#66736d]">
            Adjust filters or send a sourcing request through WhatsApp or email.
          </p>
        </div>
      )}
    </section>
  );
}
