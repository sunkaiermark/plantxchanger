import Link from "next/link";
import { Box, Factory, FileText, PlusCircle, Search } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import type { SiteSettings } from "@/lib/strapi/types";

const navItems = [
  { href: "/catalog", label: "Browse Equipment", icon: Search },
  { href: "/sell", label: "Sell", icon: PlusCircle },
  { href: "/quotes", label: "My Quotes", icon: FileText },
  { href: "/about", label: "About", icon: Box },
];

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e3e3e3] bg-white shadow-sm">
      <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
        <Link href="/" className="min-w-0" aria-label={`${settings.siteName} home`}>
          <BrandLogo siteName={settings.siteName} />
        </Link>
        <nav className="hidden items-center gap-7 text-[15px] font-bold text-[#1f2328] md:flex">
          {navItems.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href} className="inline-flex items-center gap-2 hover:text-[#ff3d00]">
              <item.icon size={18} strokeWidth={2.2} />
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/quotes"
          className="hidden h-12 items-center justify-center border border-[#dedede] px-5 font-mono text-sm font-bold uppercase tracking-[0.14em] text-[#1f2328] transition hover:border-[#ff3d00] hover:text-[#ff3d00] lg:inline-flex"
        >
          <Factory size={16} className="mr-2" />
          Quote Requests
        </Link>
      </div>
    </header>
  );
}
