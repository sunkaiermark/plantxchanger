type StrapiLike = {
  documents: (uid: string) => {
    findMany: (params?: Record<string, unknown>) => Promise<any[]>;
    findFirst: (params?: Record<string, unknown>) => Promise<any | null>;
    create: (params: Record<string, unknown>) => Promise<any>;
  };
};

const categories = [
  {
    name: "Chemical Plant",
    slug: "chemical-plant",
    description: "Complete process plants and large industrial asset packages.",
    sortOrder: 10,
  },
  {
    name: "Reactors",
    slug: "reactors",
    description: "Used glass-lined, stainless, and jacketed reactors for chemical processing.",
    sortOrder: 20,
  },
  {
    name: "Mixers & Agitators",
    slug: "mixers-agitators",
    description: "Used process mixers, agitators, blending systems, and drive packages.",
    sortOrder: 30,
  },
  {
    name: "Tanks & Vessels",
    slug: "tanks-vessels",
    description: "Used tanks, pressure vessels, and stainless process vessels.",
    sortOrder: 40,
  },
  {
    name: "Compressors & Pumps",
    slug: "pumps-compressors",
    description: "Used process pumps, utility compressors, and packaged systems.",
    sortOrder: 50,
  },
  {
    name: "Cranes",
    slug: "cranes",
    description: "Heavy lift cranes for plant relocation and industrial projects.",
    sortOrder: 60,
  },
  {
    name: "Excavators & Loaders",
    slug: "earthmoving",
    description: "Construction and mining equipment for industrial sites.",
    sortOrder: 70,
  },
  {
    name: "Oil & Gas",
    slug: "oil-gas",
    description: "Process, utility, and packaged assets for energy facilities.",
    sortOrder: 80,
  },
];

const equipmentRecords = [
  {
    title: "Liebherr LR 1350 Crawler Crane 350t",
    slug: "liebherr-lr-1350-crawler-crane-350t",
    reference: "PX-CR-1350",
    categorySlug: "cranes",
    condition: "excellent",
    availability: "available",
    country: "Germany",
    location: "Hamburg, Germany",
    year: 2019,
    make: "Liebherr",
    model: "LR 1350",
    serialNumber: "LR1350-DE-2019",
    operatingHours: "4,200",
    weight: "350 t class",
    dimensions: "Crawler crane package",
    price: 2850000,
    currency: "USD",
    summary: "Heavy lift crawler crane suitable for petrochemical, refinery, and plant relocation work.",
    description:
      "Liebherr LR 1350 crawler crane in excellent operating condition. Full inspection package available by request, including maintenance files, lift configuration, and export logistics notes.",
    specifications: [
      { label: "Capacity", value: "350 t" },
      { label: "Boom", value: "Heavy lift configuration" },
      { label: "Serial number", value: "LR1350-DE-2019" },
      { label: "Operating hours", value: "4,200" },
      { label: "Weight", value: "350 t class" },
      { label: "Dimensions", value: "Crawler crane package" },
    ],
    features: [
      { text: "Inspection available in Germany" },
      { text: "Maintenance records available" },
      { text: "Export planning support" },
    ],
    sellerDisplayName: "European Heavy Lift Partner",
    isFeatured: true,
  },
  {
    title: "Caterpillar 390F Large Hydraulic Excavator",
    slug: "caterpillar-390f-large-hydraulic-excavator",
    reference: "PX-EX-390F",
    categorySlug: "earthmoving",
    condition: "good",
    availability: "available",
    country: "United Kingdom",
    location: "Teesside, United Kingdom",
    year: 2018,
    make: "Caterpillar",
    model: "390F",
    serialNumber: "CAT390F-UK-2018",
    operatingHours: "8,700",
    weight: "90 t",
    dimensions: "Site transport configuration",
    price: 485000,
    currency: "USD",
    summary: "Large hydraulic excavator for industrial demolition, earthmoving, and plant site preparation.",
    description:
      "Caterpillar 390F with service history, suitable for heavy civil, quarry, and industrial plant projects. Buyer inspection and shipping coordination available.",
    specifications: [
      { label: "Operating weight", value: "90 t" },
      { label: "Serial number", value: "CAT390F-UK-2018" },
      { label: "Operating hours", value: "8,700" },
      { label: "Engine", value: "Cat diesel" },
      { label: "Dimensions", value: "Site transport configuration" },
    ],
    features: [{ text: "Good undercarriage" }, { text: "Inspection available" }],
    sellerDisplayName: "UK Industrial Equipment Seller",
    isFeatured: true,
  },
  {
    title: "Complete Ammonia Plant 1000 MTPD - Haldor Topsoe",
    slug: "complete-ammonia-plant-1000-mtpd-haldor-topsoe",
    reference: "PX-CP-NH3-1000",
    categorySlug: "chemical-plant",
    condition: "good",
    availability: "available",
    country: "Netherlands",
    location: "Rotterdam, Netherlands",
    year: 2008,
    make: "Haldor Topsoe",
    model: "Ammonia 1000 MTPD",
    serialNumber: "NH3-1000-NL",
    operatingHours: "N/A",
    weight: "Complete plant package",
    dimensions: "Plot plan available under NDA",
    currency: "USD",
    summary: "Complete ammonia plant package available for in-situ acquisition or relocation.",
    description:
      "Complete ammonia plant, 1000 MTPD capacity. Engineering documentation, operating manuals, and P&IDs are available to qualified buyers. Inspection available by appointment.",
    specifications: [
      { label: "Capacity", value: "1000 MTPD" },
      { label: "Technology", value: "Haldor Topsoe" },
      { label: "Serial number", value: "NH3-1000-NL" },
      { label: "Operating hours", value: "N/A" },
      { label: "Weight", value: "Complete plant package" },
      { label: "Dimensions", value: "Plot plan available under NDA" },
    ],
    features: [
      { text: "Engineering documents available" },
      { text: "Operating manuals available" },
      { text: "In-situ acquisition possible" },
    ],
    sellerDisplayName: "International Process Plants",
    isFeatured: true,
  },
  {
    title: "Manitowoc 18000 Ring Crane 2250t",
    slug: "manitowoc-18000-ring-crane-2250t",
    reference: "PX-CR-18000",
    categorySlug: "cranes",
    condition: "excellent",
    availability: "available",
    country: "United Arab Emirates",
    location: "Abu Dhabi, UAE",
    year: 2016,
    make: "Manitowoc",
    model: "18000 Ring Crane",
    serialNumber: "M18000-UAE-2016",
    operatingHours: "9,800",
    weight: "2250 t class",
    dimensions: "Ring crane package",
    price: 8500000,
    currency: "USD",
    summary: "High-capacity ring crane for refinery, offshore module, and heavy industrial lifting.",
    description:
      "Manitowoc 18000 ring crane package with documented operating history. Suitable for qualified heavy-lift buyers requiring large module handling capacity.",
    specifications: [
      { label: "Capacity", value: "2250 t" },
      { label: "Serial number", value: "M18000-UAE-2016" },
      { label: "Operating hours", value: "9,800" },
      { label: "Weight", value: "2250 t class" },
      { label: "Dimensions", value: "Ring crane package" },
    ],
    features: [{ text: "Heavy lift package" }, { text: "Export documentation review" }],
    sellerDisplayName: "Middle East Lift Assets",
    isFeatured: true,
  },
  {
    title: "Natural Gas Compressor 5000HP Ariel JGT/4",
    slug: "natural-gas-compressor-5000hp-ariel-jgt-4",
    reference: "PX-OG-COMP-5000",
    categorySlug: "oil-gas",
    condition: "good",
    availability: "available",
    country: "United States",
    location: "Texas, United States",
    year: 2014,
    make: "Ariel",
    model: "JGT/4",
    serialNumber: "ARL-JGT4-US-2014",
    operatingHours: "18,500",
    weight: "Packaged compressor skid",
    dimensions: "Skid drawings available",
    price: 1950000,
    currency: "USD",
    summary: "Natural gas compressor package for upstream or midstream service.",
    description:
      "5000HP Ariel JGT/4 natural gas compressor package with auxiliary systems. Maintenance file and skid drawings available to qualified buyers.",
    specifications: [
      { label: "Power", value: "5000 HP" },
      { label: "Type", value: "Natural gas compressor" },
      { label: "Serial number", value: "ARL-JGT4-US-2014" },
      { label: "Operating hours", value: "18,500" },
      { label: "Weight", value: "Packaged compressor skid" },
      { label: "Dimensions", value: "Skid drawings available" },
    ],
    features: [{ text: "Skid drawings available" }, { text: "Oil and gas application" }],
    sellerDisplayName: "US Energy Equipment Group",
    isFeatured: true,
  },
  {
    title: "ICI Low-Pressure Methanol Plant 800,000 MT/YR",
    slug: "ici-low-pressure-methanol-plant-800000-mt-yr",
    reference: "PX-CP-MEOH-800",
    categorySlug: "chemical-plant",
    condition: "fair",
    availability: "available",
    country: "United States",
    location: "Louisiana, United States",
    year: 2001,
    make: "ICI / Johnson Matthey",
    model: "MeOH 800K MTPA",
    serialNumber: "ICI-MEOH-800-US",
    operatingHours: "N/A",
    weight: "Complete plant package",
    dimensions: "Plot plan available under NDA",
    currency: "USD",
    summary: "World-scale methanol plant available for in-situ acquisition or full relocation.",
    description:
      "ICI low-pressure methanol plant, 800,000 MT/yr world-scale capacity. Currently operational. Complete engineering documentation, operating manuals, and P&IDs available to qualified buyers.",
    specifications: [
      { label: "Capacity", value: "800,000 MT/YR" },
      { label: "Technology", value: "ICI / Johnson Matthey" },
      { label: "Serial number", value: "ICI-MEOH-800-US" },
      { label: "Operating hours", value: "N/A" },
      { label: "Weight", value: "Complete plant package" },
      { label: "Dimensions", value: "Plot plan available under NDA" },
    ],
    features: [{ text: "P&IDs available" }, { text: "Inspection by appointment" }],
    sellerDisplayName: "International Process Plants",
    isFeatured: true,
  },
];

async function findFirstBySlug(strapi: StrapiLike, uid: string, slug: string) {
  const records = await strapi.documents(uid).findMany({
    filters: { slug },
    limit: 1,
  });

  return records[0] ?? null;
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: StrapiLike }) {
    if (process.env.PLANTXCHANGE_SEED !== "true") {
      return;
    }

    const categoryBySlug: Record<string, any> = {};

    for (const category of categories) {
      categoryBySlug[category.slug] =
        (await findFirstBySlug(strapi, "api::category.category", category.slug)) ??
        (await strapi.documents("api::category.category").create({
          data: category,
          status: "published",
        }));
    }

    for (const equipment of equipmentRecords) {
      const existing = await findFirstBySlug(strapi, "api::equipment.equipment", equipment.slug);

      if (existing) {
        continue;
      }

      const { categorySlug, ...data } = equipment;

      await strapi.documents("api::equipment.equipment").create({
        data: {
          ...data,
          category: categoryBySlug[categorySlug].documentId,
        },
        status: "published",
      });
    }

    const settings = await strapi.documents("api::site-setting.site-setting").findFirst();

    if (!settings) {
      await strapi.documents("api::site-setting.site-setting").create({
        data: {
          siteName: "PlantXchange",
          contactEmail: "sales@plantxchanger.com",
          whatsappNumber: "+8613800000000",
          whatsappDisplayLabel: "WhatsApp",
          defaultSeoTitle: "PlantXchange | Used Industrial Process Equipment",
          defaultSeoDescription:
            "Source used tanks, reactors, mixers, pumps, compressors, and chemical plant assets through PlantXchange.",
          footerSummary:
            "The global B2B marketplace for buying and selling second-hand industrial equipment. Connecting serious buyers and sellers worldwide with confidence and transparency.",
        },
        status: "published",
      });
    }
  },
};
