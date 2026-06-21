import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import type { CategorySummary, SiteSettings } from "@/lib/strapi/types";

export function SiteFooter({
  settings,
  categories,
}: {
  settings: SiteSettings;
  categories: CategorySummary[];
}) {
  return (
    <footer className="border-t border-[#d8ded8] bg-[#15211f] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <BrandLogo siteName={settings.siteName} variant="inverse" />
          <p className="mt-3 max-w-md text-sm leading-6 text-white/72">{settings.footerSummary}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f1c66d]">
            Inventory
          </h3>
          <div className="mt-4 grid gap-2 text-sm text-white/75">
            {categories.slice(0, 5).map((category) => (
              <Link key={category.slug} href={`/catalog?category=${category.slug}`}>
                {category.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f1c66d]">
            Contact
          </h3>
          <div className="mt-4 grid gap-3 text-sm text-white/75">
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
      </div>
    </footer>
  );
}
