import { Mail, MessageCircle } from "lucide-react";
import { buildEquipmentEmailHref, buildEquipmentWhatsAppHref } from "@/lib/contact";
import type { EquipmentSummary, SiteSettings } from "@/lib/strapi/types";

export function InquiryActions({
  equipment,
  settings,
}: {
  equipment: EquipmentSummary;
  settings: SiteSettings;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a
        href={buildEquipmentEmailHref(equipment, settings.contactEmail)}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#17463a] px-5 font-semibold text-white transition hover:bg-[#27566b]"
      >
        <Mail size={18} />
        Email inquiry
      </a>
      <a
        href={buildEquipmentWhatsAppHref(equipment, settings.whatsappNumber)}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#17463a] px-5 font-semibold text-[#17463a] transition hover:bg-[#e9efec]"
      >
        <MessageCircle size={18} />
        WhatsApp
      </a>
    </div>
  );
}
