import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Factory, MapPin, Tag } from "lucide-react";
import { InquiryActions } from "@/components/inquiry-actions";
import { InquiryForm } from "@/components/inquiry-form";
import { getEquipmentBySlug, getSiteSettings } from "@/lib/strapi/equipment";

type EquipmentPageProps = {
  params: Promise<{ slug: string }>;
};

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

function formatPrice(price: number | undefined, currency: string) {
  if (!price) return "Price on request";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function EquipmentDetailPage({ params }: EquipmentPageProps) {
  const { slug } = await params;
  const [equipment, settings] = await Promise.all([getEquipmentBySlug(slug), getSiteSettings()]);

  if (!equipment) {
    notFound();
  }

  const images = [equipment.mainImage, ...equipment.gallery].filter(Boolean);

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <Link href="/catalog" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#17463a]">
        <ArrowLeft size={16} />
        Back to catalog
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="overflow-hidden rounded-lg border border-[#d8ded8] bg-white">
            <div className="aspect-[16/10] bg-[#e9efec]">
              {equipment.mainImage ? (
                <img
                  src={equipment.mainImage.url}
                  alt={equipment.mainImage.alternativeText ?? equipment.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[#66736d]">
                  Image pending
                </div>
              )}
            </div>
          </div>
          {images.length > 1 ? (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {images.slice(1, 4).map((image) => (
                <div key={image!.url} className="aspect-[4/3] overflow-hidden rounded-lg border border-[#d8ded8] bg-white">
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

        <aside className="space-y-5">
          <div className="rounded-lg border border-[#d8ded8] bg-white p-6">
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded bg-[#e9efec] px-2 py-1 text-[#17463a]">{equipment.reference}</span>
              <span className="rounded bg-[#f4ead7] px-2 py-1 text-[#7c4b10]">
                {availabilityLabels[equipment.availability]}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#18211f]">
              {equipment.title}
            </h1>
            <p className="mt-4 text-lg font-semibold text-[#17463a]">
              {formatPrice(equipment.price, equipment.currency)}
            </p>
            <p className="mt-4 leading-7 text-[#66736d]">{equipment.summary}</p>
            <div className="mt-5 grid gap-3 text-sm text-[#4b5a55]">
              <span className="inline-flex items-center gap-2">
                <Factory size={16} />
                {equipment.category?.name ?? "Process equipment"}
              </span>
              <span className="inline-flex items-center gap-2">
                <Tag size={16} />
                {conditionLabels[equipment.condition] ?? equipment.condition}
              </span>
              {equipment.location ? (
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} />
                  {equipment.location}
                </span>
              ) : null}
              {equipment.year ? (
                <span className="inline-flex items-center gap-2">
                  <Calendar size={16} />
                  {equipment.year}
                </span>
              ) : null}
            </div>
            <div className="mt-6">
              <InquiryActions equipment={equipment} settings={settings} />
            </div>
          </div>

          <InquiryForm equipment={equipment} />
        </aside>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border border-[#d8ded8] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#18211f]">Specifications</h2>
          <dl className="mt-5 grid gap-3">
            {equipment.specifications.map((spec) => (
              <div key={`${spec.label}-${spec.value}`} className="grid grid-cols-[0.8fr_1fr] gap-4 border-b border-[#edf1ee] pb-3 text-sm last:border-b-0">
                <dt className="font-semibold text-[#4b5a55]">{spec.label}</dt>
                <dd className="text-[#18211f]">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-lg border border-[#d8ded8] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#18211f]">Equipment notes</h2>
          <p className="mt-4 leading-7 text-[#66736d]">{equipment.description}</p>
          {equipment.features.length > 0 ? (
            <ul className="mt-5 grid gap-2 text-sm text-[#4b5a55]">
              {equipment.features.map((feature) => (
                <li key={feature.text} className="border-l-2 border-[#b7791f] pl-3">
                  {feature.text}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </section>
  );
}
