import Link from "next/link";
import { Activity, ArrowRight, DollarSign, Factory, Package, Search, ShieldCheck, Zap } from "lucide-react";
import { EquipmentCard } from "@/components/equipment-card";
import { getCatalogEquipment, getCategories, getFeaturedEquipment } from "@/lib/strapi/equipment";
import type { EquipmentSummary } from "@/lib/strapi/types";

const categoryFallbacks = [
  { name: "Reactors", slug: "reactors" },
  { name: "Chemical Plant", slug: "chemical-plant" },
  { name: "Compressors & Pumps", slug: "pumps-compressors" },
  { name: "Tanks & Vessels", slug: "tanks-vessels" },
  { name: "Mixers & Agitators", slug: "mixers-agitators" },
  { name: "Dryers & Filters", slug: "dryers-filters" },
  { name: "Plant Packages", slug: "plant-packages" },
  { name: "Generators & Power", slug: "generators-power" },
];

function formatMarketValue(equipment: EquipmentSummary[]) {
  const total = equipment.reduce((sum, item) => sum + (item.price ?? 0), 0);
  if (!total) return "On request";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(total);
}

export default async function Home() {
  const [featuredEquipment, catalogEquipment, categories] = await Promise.all([
    getFeaturedEquipment(),
    getCatalogEquipment({}),
    getCategories(),
  ]);
  const featuredAssets = featuredEquipment.length >= 3 ? featuredEquipment : catalogEquipment.slice(0, 4);
  const mergedCategories = [
    ...categories.map((category) => ({ name: category.name, slug: category.slug })),
    ...categoryFallbacks,
  ].filter(
    (category, index, list) => list.findIndex((item) => item.slug === category.slug) === index,
  );
  const categoryCards = mergedCategories.slice(0, 8).map((category) => ({
    ...category,
    count: catalogEquipment.filter((item) => item.category?.slug === category.slug).length,
  }));
  const primaryEquipment = catalogEquipment[0] ?? featuredAssets[0];
  const countryCount = new Set(catalogEquipment.map((item) => item.country).filter(Boolean)).size;

  return (
    <>
      <section className="relative min-h-[74vh] overflow-hidden bg-[#23272f] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.16)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.16)_75%),linear-gradient(45deg,rgba(0,0,0,0.16)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.16)_75%)] bg-[length:28px_28px] bg-[position:0_0,14px_14px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,61,0,0.10),transparent_34%),linear-gradient(180deg,rgba(35,39,47,0.62),rgba(20,22,27,0.96))]" />
        <div className="relative mx-auto flex min-h-[74vh] max-w-7xl flex-col items-center justify-center px-5 py-20 text-center sm:px-8 lg:px-10">
          <p className="mb-6 font-mono text-sm font-bold uppercase tracking-[0.28em] text-white/55">
            Industrial equipment marketplace
          </p>
          <h1 className="max-w-5xl font-black uppercase leading-[0.95] tracking-tight text-white drop-shadow-[0_5px_0_rgba(0,0,0,0.25)]">
            <span className="block text-[clamp(3rem,7vw,6.5rem)]">The Global Exchange</span>
            <span className="block text-[clamp(2.9rem,6vw,5.8rem)]">For</span>
            <span className="block text-[clamp(3.2rem,7.4vw,7rem)] text-[#ff3d00]">
              Heavy Industry
            </span>
          </h1>
          <p className="mt-8 max-w-3xl font-mono text-lg font-bold leading-8 text-white/58 sm:text-2xl">
            Connect with serious buyers and sellers worldwide. Trade process equipment and plant
            assets with confidence.
          </p>
          <form action="/catalog" className="mt-10 grid w-full max-w-4xl gap-4 sm:grid-cols-[1fr_300px]">
            <label className="relative block">
              <Search
                size={28}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-[#6b6f75]"
              />
              <input
                name="search"
                placeholder="Search reactors, mixers, tanks, pumps..."
                className="h-20 w-full border-0 bg-white pl-16 pr-5 font-mono text-lg font-bold text-[#1f2328] outline-none ring-1 ring-white/10 placeholder:text-[#b0b0b0] focus:ring-2 focus:ring-[#ff3d00]"
              />
            </label>
            <button className="h-20 bg-[#ff3d00] px-8 font-mono text-xl font-black uppercase tracking-[0.06em] text-white transition hover:bg-[#e53600]">
              Find Equipment
            </button>
          </form>
        </div>
      </section>

      <section className="bg-[#ff3d00] text-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-4 font-mono text-sm font-black uppercase tracking-[0.08em] sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:px-8 lg:px-10">
          <span className="inline-flex items-center justify-center gap-2 sm:justify-start">
            <Zap size={18} />
            Live market
          </span>
          <span className="hidden sm:block">.</span>
          <span className="text-center">Active listings: {catalogEquipment.length}</span>
          <span className="hidden sm:block">.</span>
          <span className="text-center">Total value: {formatMarketValue(catalogEquipment)}</span>
          <span className="hidden sm:block">.</span>
          <span className="text-center sm:text-right">Countries: {countryCount}</span>
        </div>
      </section>

      <section className="bg-[#f6f6f6]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h2 className="text-[clamp(2.3rem,4vw,3.3rem)] font-black uppercase leading-none tracking-normal text-[#202329]">
                Equipment Categories
              </h2>
              <p className="mt-4 font-mono text-lg font-black uppercase tracking-[0.18em] text-[#777a7d]">
                Browse by industry sector
              </p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex h-14 items-center justify-center border border-[#dedede] bg-white px-6 font-mono text-sm font-black uppercase tracking-[0.12em] text-[#202329] shadow-sm transition hover:border-[#ff3d00] hover:text-[#ff3d00]"
            >
              View all categories
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {categoryCards.map((category) => (
              <Link
                key={category.slug}
                href={`/catalog?category=${category.slug}`}
                className="group relative min-h-[170px] border border-[#e7e7e7] bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition hover:border-[#ff3d00] hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
              >
                <Factory size={36} strokeWidth={1.9} className="text-[#70757b] group-hover:text-[#ff3d00]" />
                <span className="absolute right-7 top-7 font-mono text-3xl font-light text-[#d5d5d5]">
                  {category.count}
                </span>
                <h3 className="absolute bottom-7 left-7 right-7 text-2xl font-black uppercase leading-tight text-[#202329]">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f6f6]">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-4 sm:px-8 lg:px-10">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-4">
              <h2 className="text-[clamp(2.3rem,4vw,3.3rem)] font-black uppercase leading-none tracking-normal text-[#202329]">
                Featured Assets
              </h2>
              <span className="mt-1 h-8 w-8 bg-[#ff3d00]" />
            </div>
            <p className="mt-4 font-mono text-lg font-black uppercase tracking-[0.18em] text-[#777a7d]">
              High-value equipment vetted by experts
            </p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 font-mono text-sm font-black uppercase tracking-[0.12em] text-[#ff3d00] hover:text-[#202329]"
          >
            View full catalog
            <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredAssets.map((equipment) => (
            <EquipmentCard key={equipment.documentId} equipment={equipment} />
          ))}
        </div>
        </div>
      </section>

      <section className="bg-[#f6f6f6] px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-[clamp(2rem,3vw,2.8rem)] font-black uppercase leading-none tracking-normal text-[#202329]">
            Market Activity
          </h2>
          <div className="border border-[#dedede] bg-white">
            {[
              {
                icon: Package,
                color: "text-[#ff3d00]",
                text: primaryEquipment
                  ? `New listing: ${primaryEquipment.title} from ${primaryEquipment.country ?? "global seller"}`
                  : "New listing: Process equipment available for inspection",
              },
              {
                icon: Activity,
                color: "text-[#287cff]",
                text: "Quote request opened for reactors, tanks, and mixing systems",
              },
              {
                icon: Package,
                color: "text-[#ff3d00]",
                text: "New listing: Complete chemical plant assets available for relocation",
              },
              {
                icon: DollarSign,
                color: "text-[#0aa34a]",
                text: "Inquiry database ready for buyer, seller, email, and WhatsApp leads",
              },
              {
                icon: Package,
                color: "text-[#ff3d00]",
                text: "New listing: Compressor and utility packages under review",
              },
            ].map((item) => (
              <div key={item.text} className="grid gap-4 border-b border-[#eeeeee] p-5 last:border-b-0 sm:grid-cols-[28px_1fr_auto] sm:items-center">
                <item.icon size={24} strokeWidth={2.2} className={item.color} />
                <div>
                  <p className="font-mono text-lg text-[#45484d]">{item.text}</p>
                  <p className="mt-1 font-mono text-sm text-[#aaaaaa]">Live catalog update</p>
                </div>
                <Link href="/catalog" className="font-mono text-sm font-black uppercase tracking-[0.12em] text-[#202329] hover:text-[#ff3d00]">
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:px-10">
          <div>
            <p className="font-mono text-sm font-black uppercase tracking-[0.18em] text-[#ff3d00]">
              V1 operating model
            </p>
            <h2 className="mt-3 text-[clamp(2rem,3vw,2.8rem)] font-black uppercase leading-none tracking-normal text-[#202329]">
              Catalog and lead database now, backend workflow later
            </h2>
            <p className="mt-5 max-w-2xl font-mono text-lg leading-8 text-[#5d6268]">
              PlantXchange keeps equipment content in Strapi and stores every inquiry in the
              database. Email and WhatsApp stay visible on every asset page while the business
              workflow is proven.
            </p>
          </div>
          <div className="border-l-4 border-[#ff3d00] bg-[#f6f6f6] p-7">
            <div className="flex items-center gap-3 text-[#202329]">
              <ShieldCheck size={26} className="text-[#ff3d00]" />
              <h3 className="text-2xl font-black uppercase">Built for first leads</h3>
            </div>
            <p className="mt-4 font-mono leading-7 text-[#5d6268]">
              Public catalog pages drive search visibility. Inquiry forms, email links, and
              WhatsApp links keep buyer and seller requests actionable from day one.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
