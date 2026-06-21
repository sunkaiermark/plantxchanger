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
    <div className="grid gap-3">
      <a
        href={buildEquipmentEmailHref(equipment, settings.contactEmail)}
        className="inline-flex h-12 items-center justify-center gap-2 border border-[#ff3d00] bg-[#ff3d00] px-5 font-mono text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#e53600]"
      >
        <Mail size={18} />
        Email inquiry
      </a>
      <a
        href={buildEquipmentWhatsAppHref(equipment, settings.whatsappNumber)}
        className="inline-flex h-12 items-center justify-center gap-2 border border-[#dedede] bg-white px-5 font-mono text-sm font-black uppercase tracking-[0.08em] text-[#202329] transition hover:border-[#ff3d00] hover:text-[#ff3d00]"
      >
        <MessageCircle size={18} />
        WhatsApp
      </a>
    </div>
  );
}
