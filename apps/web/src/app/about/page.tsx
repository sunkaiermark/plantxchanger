import { ClipboardCheck, Factory, Search, Truck } from "lucide-react";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b7791f]">
          About PlantXchange
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-[#18211f]">
          A focused catalog for used process equipment
        </h1>
        <p className="mt-5 leading-7 text-[#66736d]">
          PlantXchange starts with the workflow that matters first: publish searchable equipment,
          capture buyer interest, collect seller leads, and learn which back-office process should
          be automated next.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Search,
            title: "Source",
            copy: "Browse industrial tanks, reactors, mixers, pumps, compressors, and plant assets.",
          },
          {
            icon: ClipboardCheck,
            title: "Review",
            copy: "Use reference numbers, specs, location, and condition to qualify options.",
          },
          {
            icon: Factory,
            title: "Inspect",
            copy: "Request photos, inspection files, and technical context before quoting.",
          },
          {
            icon: Truck,
            title: "Move",
            copy: "Keep export packing and logistics questions attached to each inquiry.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-[#d8ded8] bg-white p-5">
            <item.icon className="text-[#17463a]" size={24} />
            <h2 className="mt-4 font-semibold text-[#18211f]">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#66736d]">{item.copy}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section className="border-l-4 border-[#17463a] bg-white p-6">
          <h2 className="text-2xl font-semibold text-[#18211f]">Why CMS first</h2>
          <p className="mt-4 leading-7 text-[#66736d]">
            A headless CMS keeps equipment content maintainable while the business validates how
            buyers inquire, what sellers provide, and which internal follow-up steps repeat often.
          </p>
        </section>
        <section className="border-l-4 border-[#b7791f] bg-white p-6">
          <h2 className="text-2xl font-semibold text-[#18211f]">What comes later</h2>
          <p className="mt-4 leading-7 text-[#66736d]">
            Seller accounts, quote dashboards, CRM automation, payment, and escrow should wait
            until the inquiry workflow is proven with real used-equipment leads.
          </p>
        </section>
      </div>
    </section>
  );
}
