import Link from "next/link";
import { ArrowRight, Clock, FileText } from "lucide-react";
import { getQuoteRequests } from "@/lib/strapi/inquiries";
import type { QuoteStatus } from "@/lib/strapi/types";

export const metadata = {
  title: "My Quotes",
  robots: {
    follow: false,
    index: false,
  },
};

export const dynamic = "force-dynamic";

const statusStyles: Record<QuoteStatus, string> = {
  pending: "bg-[#2f343b] text-white",
  responded: "bg-[#287cff] text-white",
  negotiating: "bg-[#ff3d00] text-white",
  accepted: "bg-[#0aa34a] text-white",
};

function formatDate(value?: string) {
  if (!value) return "Recent";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function QuotesPage() {
  const quotes = await getQuoteRequests();

  return (
    <section className="bg-[#f6f6f6]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="mb-10 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="text-[clamp(2.8rem,5vw,4.6rem)] font-black uppercase leading-none tracking-normal text-[#202329]">
              My Quotes
            </h1>
            <p className="mt-4 font-mono text-lg font-black uppercase tracking-[0.16em] text-[#777a7d]">
              Pending - Responded - Negotiating - Accepted
            </p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex h-14 items-center justify-center gap-2 bg-[#ff3d00] px-6 font-mono text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#e53600]"
          >
            Browse equipment
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="overflow-hidden border border-[#dedede] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
          <div className="hidden grid-cols-[1fr_160px_150px_160px] border-b border-[#eeeeee] bg-[#30343a] px-6 py-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-white md:grid">
            <span>Quote request</span>
            <span>Status</span>
            <span>Date</span>
            <span>Action</span>
          </div>
          {quotes.map((quote) => (
            <div
              key={quote.documentId}
              className="grid gap-4 border-b border-[#eeeeee] px-6 py-5 last:border-b-0 md:grid-cols-[1fr_160px_150px_160px] md:items-center"
            >
              <div className="flex gap-4">
                <FileText size={26} className="mt-1 shrink-0 text-[#ff3d00]" />
                <div>
                  <p className="font-mono text-lg text-[#45484d]">
                    {quote.equipmentTitleSnapshot ?? "Equipment quote request"}
                  </p>
                  <p className="mt-1 font-mono text-sm text-[#9a9a9a]">
                    {quote.company ?? quote.name} / {quote.equipmentReferenceSnapshot ?? "PX request"}
                  </p>
                </div>
              </div>
              <span className={`w-fit px-3 py-2 font-mono text-xs font-black uppercase tracking-[0.12em] ${statusStyles[quote.status]}`}>
                {quote.status}
              </span>
              <span className="inline-flex items-center gap-2 font-mono text-sm text-[#777a7d]">
                <Clock size={16} />
                {formatDate(quote.createdAt)}
              </span>
              {quote.sourcePage ? (
                <Link
                  href={quote.sourcePage}
                  className="font-mono text-sm font-black uppercase tracking-[0.12em] text-[#202329] hover:text-[#ff3d00]"
                >
                  View listing
                </Link>
              ) : (
                <span className="font-mono text-sm uppercase tracking-[0.12em] text-[#9a9a9a]">
                  Manual request
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
