import { ClipboardCheck, Factory, Search, ShieldCheck, Truck } from "lucide-react";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <section className="bg-[#f6f6f6]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="max-w-4xl">
          <p className="font-mono text-sm font-black uppercase tracking-[0.18em] text-[#ff3d00]">
            About PlantXchange
          </p>
          <h1 className="mt-4 text-[clamp(2.8rem,5vw,4.8rem)] font-black uppercase leading-none tracking-normal text-[#202329]">
            Global reach for used industrial equipment
          </h1>
          <p className="mt-6 max-w-3xl font-mono text-lg leading-8 text-[#5d6268]">
            PlantXchange connects serious buyers and sellers across process plants, oil and gas,
            petrochemical, construction, and heavy industry. The first version focuses on catalog
            visibility, quote capture, and quote negotiation status tracking.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              value: "14",
              label: "Countries represented",
            },
            {
              value: "$14M+",
              label: "Sample catalog value",
            },
            {
              value: "24h",
              label: "Target inquiry response",
            },
            {
              value: "4",
              label: "Quote workflow stages",
            },
          ].map((stat) => (
            <div key={stat.label} className="border border-[#dedede] bg-white p-6">
              <p className="font-mono text-4xl font-black uppercase text-[#ff3d00]">{stat.value}</p>
              <p className="mt-3 font-mono text-sm font-black uppercase tracking-[0.14em] text-[#777a7d]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <h2 className="text-[clamp(2rem,3vw,2.8rem)] font-black uppercase text-[#202329]">
            How it works
          </h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {[
              {
                icon: Search,
                title: "Browse",
                copy: "Search live inventory by category, condition, country, and keyword.",
              },
              {
                icon: ClipboardCheck,
                title: "Request",
                copy: "Submit a quote request from the listing detail page.",
              },
              {
                icon: ShieldCheck,
                title: "Respond",
                copy: "Sellers share inspection context, technical files, and commercial terms.",
              },
              {
                icon: Factory,
                title: "Negotiate",
                copy: "Quote negotiation moves through pending, responded, negotiating, and accepted.",
              },
              {
                icon: Truck,
                title: "Move",
                copy: "Export packing, logistics, and relocation questions stay tied to the quote.",
              },
            ].map((item) => (
              <div key={item.title} className="border border-[#dedede] bg-white p-5">
                <item.icon className="text-[#ff3d00]" size={26} />
                <h3 className="mt-4 text-xl font-black uppercase text-[#202329]">{item.title}</h3>
                <p className="mt-3 font-mono text-sm leading-6 text-[#5d6268]">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
