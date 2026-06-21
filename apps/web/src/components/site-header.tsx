import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/lib/strapi/types";

const navItems = [
  { href: "/catalog", label: "Catalog" },
  { href: "/sell", label: "Sell equipment" },
  { href: "/about", label: "About" },
];

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d8ded8] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#17463a] text-sm font-bold text-white">
            PX
          </span>
          <span className="text-lg font-semibold text-[#18211f]">{settings.siteName}</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[#4b5a55] md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#17463a]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={`mailto:${settings.contactEmail}`}
            aria-label="Email PlantXchange"
            title="Email PlantXchange"
            className="hidden h-10 w-10 items-center justify-center rounded-lg border border-[#d8ded8] text-[#17463a] transition hover:bg-[#e9efec] sm:flex"
          >
            <Mail size={18} />
          </a>
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
            aria-label="WhatsApp PlantXchange"
            title="WhatsApp PlantXchange"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#17463a] text-white transition hover:bg-[#27566b]"
          >
            <MessageCircle size={18} />
          </a>
        </div>
      </div>
    </header>
  );
}
