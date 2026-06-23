import Link from "next/link";
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

function compactModel(equipment: EquipmentSummary) {
  const parts = [equipment.make, equipment.model].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : equipment.reference;
}

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
    <article className="group overflow-hidden border border-[#e2e2e2] bg-white shadow-[0_2px_5px_rgba(0,0,0,0.10)] transition hover:border-[#ff3d00] hover:shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
      <Link href={`/equipment/${equipment.slug}`} className="block">
        <div className="relative aspect-[4/3] bg-[#e9efec]">
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
          <div className="absolute left-6 top-5 flex gap-2 font-mono text-xs font-black uppercase text-white">
            <span className="bg-[#2f343b] px-3 py-2">
              {conditionLabels[equipment.condition] ?? equipment.condition}
            </span>
            {equipment.isFeatured ? <span className="bg-[#ff3d00] px-3 py-2">Featured</span> : null}
          </div>
        </div>
      </Link>
      <div className="p-6">
        <h3 className="min-h-[3.8rem] text-[clamp(1.15rem,1.55vw,1.4rem)] font-black uppercase leading-tight tracking-normal text-[#202329]">
          <Link href={`/equipment/${equipment.slug}`}>{equipment.title}</Link>
        </h3>
        <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 font-mono">
          <div>
            <p className="text-[11px] font-black uppercase text-[#a8a8a8]">Make/model</p>
            <p className="mt-1 break-words text-sm text-[#4a4d52]">{compactModel(equipment)}</p>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-[#a8a8a8]">Year</p>
            <p className="mt-1 text-sm text-[#4a4d52]">{equipment.year ?? "Review"}</p>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-[#a8a8a8]">Location</p>
            <p className="mt-1 truncate text-sm text-[#4a4d52]">{equipment.country ?? "Global"}</p>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-[#a8a8a8]">Status</p>
            <p className="mt-1 text-sm text-[#4a4d52]">
              {availabilityLabels[equipment.availability] ?? equipment.availability}
            </p>
          </div>
        </div>
      </div>
      <div className="flex min-h-14 items-center justify-between gap-4 border-t border-[#eeeeee] bg-[#fbfbfb] px-6 py-4">
        <p className="font-mono text-[clamp(1.05rem,1.25vw,1.35rem)] font-black uppercase text-[#202329]">
          {formatPrice(equipment)}
        </p>
        <Link
          href={`/equipment/${equipment.slug}`}
          className="hidden shrink-0 font-mono text-xs font-black uppercase tracking-[0.12em] text-[#ff7a55] group-hover:inline-flex"
        >
          View details -&gt;
        </Link>
      </div>
    </article>
  );
}
