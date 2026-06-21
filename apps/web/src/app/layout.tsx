import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildOrganizationJsonLd, buildWebsiteJsonLd, getPublicSiteUrl } from "@/lib/seo";
import { getCategories, getSiteSettings } from "@/lib/strapi/equipment";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteUrl()),
  title: {
    default: "PlantXchange | Used Industrial Process Equipment",
    template: "%s | PlantXchange",
  },
  description:
    "Source used tanks, reactors, mixers, pumps, compressors, and chemical plant assets through PlantXchange.",
  keywords: [
    "used industrial equipment",
    "used process equipment",
    "used chemical plant",
    "used reactors",
    "used tanks",
    "used mixers",
    "used pumps",
    "used compressors",
    "second hand plant equipment",
  ],
  openGraph: {
    title: "PlantXchange",
    description: "Used industrial process equipment catalog and inquiry platform.",
    images: ["/opengraph.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, categories] = await Promise.all([getSiteSettings(), getCategories()]);
  const jsonLd = [buildOrganizationJsonLd(), buildWebsiteJsonLd()];

  return (
    <html lang="en">
      <body>
        {jsonLd.map((schema) => (
          <script
            key={schema["@type"]}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <SiteHeader settings={settings} />
        <main>{children}</main>
        <SiteFooter settings={settings} categories={categories} />
      </body>
    </html>
  );
}
