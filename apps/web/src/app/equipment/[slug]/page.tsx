import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Factory, Info, MapPin, ShieldCheck, Tag } from "lucide-react";
import { InquiryActions } from "@/components/inquiry-actions";
import { QuoteRequestModal } from "@/components/quote-request-modal";
import { buildBreadcrumbJsonLd, buildEquipmentJsonLd, buildEquipmentMetadata, canonicalUrl } from "@/lib/seo";
import { getEquipmentBySlug, getSiteSettings } from "@/lib/strapi/equipment";
import type { EquipmentSummary } from "@/lib/strapi/types";

type EquipmentPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: EquipmentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const equipment = await getEquipmentBySlug(slug);

  if (!equipment) {
    return {
      title: "Equipment not found",
      robots: {
        follow: false,
        index: false,
      },
    };
  }

  return buildEquipmentMetadata(equipment);
}

const availabilityLabels: Record<string, string> = {
  available: "Available",
  "under-review": "Under review",
  sold: "Sold",
};

const conditionLabels: Record<string, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  "for-parts": "For parts",
};

function formatPrice(equipment: EquipmentSummary) {
  if (!equipment.price) return "Price on request";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: equipment.currency,
    maximumFractionDigits: 0,
  }).format(equipment.price);
}

function specRows(equipment: EquipmentSummary) {
  return [
    { icon: Factory, label: "Make", value: equipment.make },
    { icon: Info, label: "Model", value: equipment.model },
    { icon: Calendar, label: "Year", value: equipment.year?.toString() },
    { icon: MapPin, label: "Location", value: equipment.country ?? equipment.location },
    { icon: ShieldCheck, label: "Condition", value: conditionLabels[equipment.condition] },
    { icon: Tag, label: "Serial number", value: equipment.serialNumber },
    { icon: Info, label: "Operating hours", value: equipment.operatingHours },
    { icon: Info, label: "Weight", value: equipment.weight },
    { icon: Info, label: "Dimensions", value: equipment.dimensions },
  ].filter((item) => item.value);
}

export default async function EquipmentDetailPage({ params }: EquipmentPageProps) {
  const { slug } = await params;
  const [equipment, settings] = await Promise.all([getEquipmentBySlug(slug), getSiteSettings()]);

  if (!equipment) {
    notFound();
  }

  const images = [equipment.mainImage, ...equipment.gallery].filter(Boolean);
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: canonicalUrl("/") },
      { name: "Equipment Exchange", url: canonicalUrl("/catalog") },
      { name: equipment.title, url: canonicalUrl(`/equipment/${equipment.slug}`) },
    ]),
    buildEquipmentJsonLd(equipment),
  ];

  return (
    <section className="bg-[#f6f6f6]">
      {jsonLd.map((schema) => (
        <script
          key={schema["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <Link
          href="/catalog"
          className="mb-8 inline-flex items-center gap-2 font-mono text-sm font-black uppercase tracking-[0.12em] text-[#202329] hover:text-[#ff3d00]"
        >
          <ArrowLeft size={16} />
          Back to equipment exchange
        </Link>

        <div className="grid gap-9 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="border border-[#d7d7d7] bg-white p-4 shadow-[0_2px_5px_rgba(0,0,0,0.08)]">
              <div className="aspect-[16/11] bg-[#e9efec]">
                {equipment.mainImage ? (
                  <img
                    src={equipment.mainImage.url}
                    alt={equipment.mainImage.alternativeText ?? equipment.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-mono text-[#777a7d]">
                    Image pending
                  </div>
                )}
              </div>
              {images.length > 0 ? (
                <div className="mt-4 flex gap-3 overflow-x-auto">
                  {images.slice(0, 5).map((image) => (
                    <div
                      key={image!.url}
                      className="h-28 w-40 shrink-0 border-2 border-[#ff3d00] bg-white p-1"
                    >
                      <img
                        src={image!.url}
                        alt={image!.alternativeText ?? equipment.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <section className="mt-9">
              <h2 className="text-[clamp(1.9rem,3vw,2.6rem)] font-black uppercase leading-none tracking-normal text-[#202329]">
                Equipment Description
              </h2>
              <div className="mt-5 border-t-4 border-[#d7d7d7] pt-6">
                <p className="max-w-4xl font-mono text-lg leading-8 text-[#4f545b]">
                  {equipment.description ?? equipment.summary}
                </p>
                {equipment.features.length > 0 ? (
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {equipment.features.map((feature) => (
                      <div
                        key={feature.text}
                        className="border-l-4 border-[#ff3d00] bg-white px-5 py-4 font-mono text-sm font-bold text-[#45484d]"
                      >
                        {feature.text}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="border border-[#ffc8b8] bg-white p-7 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
              <div className="flex flex-wrap gap-2 font-mono text-xs font-black uppercase text-white">
                <span className="bg-[#2f343b] px-3 py-2">{availabilityLabels[equipment.availability]}</span>
                <span className="bg-[#ff3d00] px-3 py-2">{equipment.reference}</span>
              </div>
              <h1 className="mt-6 text-[clamp(2.2rem,4vw,3.4rem)] font-black uppercase leading-tight tracking-normal text-[#101318]">
                {equipment.title}
              </h1>
              <p className="mt-8 font-mono text-[clamp(2rem,4vw,3rem)] font-black uppercase tracking-[0.05em] text-[#ff3d00]">
                {formatPrice(equipment)}
              </p>
              <div className="my-8 border-t border-[#dedede]" />
              <QuoteRequestModal equipment={equipment} />
              <div className="mt-8 flex items-center justify-center gap-2 font-mono text-sm font-black uppercase tracking-[0.16em] text-[#777a7d]">
                <ShieldCheck size={18} />
                Secure B2B platform
              </div>
            </section>

            <section className="border border-[#dedede] bg-white">
              <h2 className="border-b border-[#dedede] px-6 py-5 text-2xl font-black uppercase tracking-[0.08em] text-[#202329]">
                Technical Specifications
              </h2>
              <dl>
                {specRows(equipment).map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[1fr_1.25fr] gap-4 border-b border-[#eeeeee] px-6 py-5 last:border-b-0"
                  >
                    <dt className="inline-flex items-center gap-3 font-mono text-sm font-black uppercase tracking-[0.12em] text-[#777a7d]">
                      <row.icon size={19} />
                      {row.label}
                    </dt>
                    <dd className="text-right font-mono text-base font-black uppercase text-[#202329]">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="border border-[#dedede] bg-white p-6">
              <p className="font-mono text-sm font-black uppercase tracking-[0.18em] text-[#777a7d]">
                Seller Profile
              </p>
              <h2 className="mt-5 text-2xl font-black text-[#202329]">
                {equipment.sellerDisplayName ?? "Verified industrial seller"}
              </h2>
              <p className="mt-2 font-mono text-[#777a7d]">Member since 2026</p>
              <div className="mt-6">
                <InquiryActions equipment={equipment} settings={settings} />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
