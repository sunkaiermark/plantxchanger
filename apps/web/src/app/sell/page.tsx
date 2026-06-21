import { Database, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { SellEquipmentForm } from "@/components/sell-equipment-form";
import { getSiteSettings } from "@/lib/strapi/equipment";

export const metadata = {
  title: "Sell Equipment",
};

export default async function SellPage() {
  const settings = await getSiteSettings();

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b7791f]">
          Seller intake
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-[#18211f]">Sell used plant equipment</h1>
        <p className="mt-5 leading-7 text-[#66736d]">
          Submit equipment details for review. PlantXchange v1 stores seller leads in Strapi so
          the business can qualify inventory before adding public seller accounts later.
        </p>
        <div className="mt-8 grid gap-4">
          {[
            {
              icon: Database,
              title: "Inquiry database",
              copy: "Seller requests are stored as inquiry records for follow-up.",
            },
            {
              icon: ShieldCheck,
              title: "Manual qualification",
              copy: "Keep first-version control over which assets become public listings.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 rounded-lg border border-[#d8ded8] bg-white p-5">
              <item.icon className="mt-1 shrink-0 text-[#17463a]" size={22} />
              <div>
                <h2 className="font-semibold text-[#18211f]">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-[#66736d]">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-3 text-sm text-[#4b5a55]">
          <a className="inline-flex items-center gap-2" href={`mailto:${settings.contactEmail}`}>
            <Mail size={16} />
            {settings.contactEmail}
          </a>
          <a
            className="inline-flex items-center gap-2"
            href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
          >
            <MessageCircle size={16} />
            {settings.whatsappDisplayLabel}
          </a>
        </div>
      </div>
      <SellEquipmentForm />
    </section>
  );
}
