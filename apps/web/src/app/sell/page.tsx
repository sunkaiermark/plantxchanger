import { Database, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { SellEquipmentForm } from "@/components/sell-equipment-form";
import { getSiteSettings } from "@/lib/strapi/equipment";

export const metadata = {
  title: "Sell Equipment",
};

export default async function SellPage() {
  const settings = await getSiteSettings();

  return (
    <section className="bg-[#f6f6f6]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
        <div>
          <p className="font-mono text-sm font-black uppercase tracking-[0.18em] text-[#ff3d00]">
            Seller intake
          </p>
          <h1 className="mt-4 text-[clamp(2.8rem,5vw,4.6rem)] font-black uppercase leading-none tracking-normal text-[#202329]">
            Sell used plant equipment
          </h1>
          <p className="mt-6 max-w-xl font-mono text-lg leading-8 text-[#5d6268]">
            Post a listing for review. PlantXchange stores seller submissions in the inquiry
            database first, then publishes qualified equipment into the catalog.
          </p>

          <div className="mt-9 grid gap-4">
            {[
              {
                icon: Database,
                title: "Inquiry database",
                copy: "Every seller listing request is saved for follow-up and qualification.",
              },
              {
                icon: ShieldCheck,
                title: "Manual qualification",
                copy: "Keep control over which assets become public while the workflow is proven.",
              },
            ].map((item) => (
              <div key={item.title} className="border border-[#dedede] bg-white p-5">
                <item.icon className="text-[#ff3d00]" size={26} />
                <h2 className="mt-4 text-xl font-black uppercase text-[#202329]">{item.title}</h2>
                <p className="mt-2 font-mono text-sm leading-6 text-[#5d6268]">{item.copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-3 font-mono text-sm text-[#45484d]">
            <a className="inline-flex items-center gap-2 hover:text-[#ff3d00]" href={`mailto:${settings.contactEmail}`}>
              <Mail size={16} />
              {settings.contactEmail}
            </a>
            <a
              className="inline-flex items-center gap-2 hover:text-[#ff3d00]"
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
            >
              <MessageCircle size={16} />
              {settings.whatsappDisplayLabel}
            </a>
          </div>
        </div>
        <SellEquipmentForm />
      </div>
    </section>
  );
}
