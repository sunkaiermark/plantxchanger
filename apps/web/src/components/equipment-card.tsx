import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { EquipmentSummary } from "@/lib/strapi/types";

const conditionLabels: Record<string, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  "for-parts": "For parts",
};

const availabilityLabels: Record<string, string> = {
  available: "Available",
  "under-review": "Under review",
  sold: "Sold",
};

function formatPrice(equipment: EquipmentSummary) {
  if (!equipment.price) {
    return "Price on request";
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: equipment.currency,
    maximumFractionDigits: 0,
  }).format(equipment.price);
}

export function EquipmentCard({ equipment }: { equipment: EquipmentSummary }) {
  return (
    <article className="overflow-hidden rounded-lg border border-[#d8ded8] bg-white shadow-sm">
      <Link href={`/equipment/${equipment.slug}`} className="block">
        <div className="aspect-[4/3] bg-[#e9efec]">
          {equipment.mainImage ? (
            <img
              src={equipment.mainImage.url}
              alt={equipment.mainImage.alternativeText ?? equipment.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#66736d]">
              Image pending
            </div>
          )}
        </div>
      </Link>
      <div className="p-5">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded bg-[#e9efec] px-2 py-1 text-[#17463a]">{equipment.reference}</span>
          <span className="rounded bg-[#f4ead7] px-2 py-1 text-[#7c4b10]">
            {availabilityLabels[equipment.availability] ?? equipment.availability}
          </span>
        </div>
        <h3 className="mt-4 text-xl font-semibold leading-snug text-[#18211f]">
          <Link href={`/equipment/${equipment.slug}`}>{equipment.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#66736d]">{equipment.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#66736d]">
          <span>{equipment.category?.name ?? "Equipment"}</span>
          <span>{conditionLabels[equipment.condition] ?? equipment.condition}</span>
          {equipment.country ? (
            <span className="inline-flex items-center gap-1">
              <MapPin size={15} />
              {equipment.country}
            </span>
          ) : null}
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="font-semibold text-[#18211f]">{formatPrice(equipment)}</p>
          <Link
            href={`/equipment/${equipment.slug}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#17463a] hover:text-[#27566b]"
          >
            Details
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
