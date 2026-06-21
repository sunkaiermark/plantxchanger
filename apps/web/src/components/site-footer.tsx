import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import type { CategorySummary, SiteSettings } from "@/lib/strapi/types";

export function SiteFooter({
  settings,
}: {
  settings: SiteSettings;
  categories: CategorySummary[];
}) {
  return (
    <footer className="bg-[#2f3339] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.7fr_0.7fr]">
          <div>
            <BrandLogo siteName={settings.siteName} variant="inverse" showTagline={false} />
            <p className="mt-7 max-w-xl font-mono text-lg leading-8 text-white/58">
              {settings.footerSummary ??
                "The global B2B marketplace for buying and selling second-hand industrial equipment. Connecting serious buyers and sellers worldwide with confidence and transparency."}
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-black">Marketplace</h3>
            <div className="mt-6 grid gap-3 font-mono text-lg text-white/58">
              <Link href="/catalog" className="hover:text-[#ff6a2a]">
                Browse All Equipment
              </Link>
              <Link href="/sell" className="hover:text-[#ff6a2a]">
                Sell Equipment
              </Link>
              <Link href="/quotes" className="hover:text-[#ff6a2a]">
                Manage Quotes
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black">Company</h3>
            <div className="mt-6 grid gap-3 font-mono text-lg text-white/58">
              <Link href="/about" className="hover:text-[#ff6a2a]">
                About Us
              </Link>
              <a className="inline-flex items-center gap-2 hover:text-[#ff6a2a]" href={`mailto:${settings.contactEmail}`}>
                <Mail size={16} />
                Email
              </a>
              <a
                className="inline-flex items-center gap-2 hover:text-[#ff6a2a]"
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/8 pt-8 font-mono text-sm font-black uppercase tracking-[0.12em] text-white/38 md:flex-row">
          <span>© 2026 PlantXchange. All rights reserved.</span>
          <span>Global reach. Industrial strength. Proven reliability.</span>
        </div>
      </div>
    </footer>
  );
}
