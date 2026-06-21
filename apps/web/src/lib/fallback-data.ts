import type { CategorySummary, EquipmentSummary, SiteSettings } from "./strapi/types";

export const fallbackCategories: CategorySummary[] = [
  {
    documentId: "fallback-reactors",
    name: "Reactors",
    slug: "reactors",
    description: "Used glass-lined, stainless, and jacketed reactors.",
    sortOrder: 10,
  },
  {
    documentId: "fallback-mixers",
    name: "Mixers & Agitators",
    slug: "mixers-agitators",
    description: "Used process mixers, agitators, and blending systems.",
    sortOrder: 20,
  },
  {
    documentId: "fallback-tanks",
    name: "Tanks & Vessels",
    slug: "tanks-vessels",
    description: "Used tanks, pressure vessels, and process storage assets.",
    sortOrder: 30,
  },
  {
    documentId: "fallback-pumps",
    name: "Pumps & Compressors",
    slug: "pumps-compressors",
    description: "Used process pumps, compressors, and utility packages.",
    sortOrder: 40,
  },
];

export const fallbackEquipment: EquipmentSummary[] = [
  {
    documentId: "fallback-reactor",
    title: "10,000 L Stainless Steel Jacketed Reactor",
    slug: "10000l-stainless-steel-jacketed-reactor",
    reference: "PX-R-001",
    category: fallbackCategories[0],
    condition: "good",
    availability: "available",
    country: "China",
    location: "Jiangsu, China",
    year: 2018,
    make: "Local Fabrication",
    model: "SS316L-JR-10000",
    price: 68000,
    currency: "USD",
    summary: "Used stainless steel jacketed reactor for specialty chemical production.",
    description:
      "Used 10,000 L stainless steel jacketed reactor with top-entry agitator, manway, and heating/cooling jacket.",
    specifications: [
      { label: "Material", value: "SS316L contact parts" },
      { label: "Working volume", value: "10,000 L" },
      { label: "Drive", value: "22 kW" },
    ],
    features: [{ text: "Inspection available" }, { text: "Export packing support" }],
    mainImage: {
      url: "/images/chemical-plant.png",
      alternativeText: "Chemical process plant equipment",
    },
    gallery: [
      { url: "/images/petrochemical.png", alternativeText: "Petrochemical assets" },
      { url: "/images/oil-gas.png", alternativeText: "Industrial process assets" },
    ],
    sellerDisplayName: "Verified industrial seller",
    isFeatured: true,
  },
  {
    documentId: "fallback-mixer",
    title: "High-Viscosity Mixer With Hydraulic Lifting",
    slug: "high-viscosity-mixer-hydraulic-lifting",
    reference: "PX-M-001",
    category: fallbackCategories[1],
    condition: "excellent",
    availability: "available",
    country: "China",
    location: "Zhejiang, China",
    year: 2021,
    make: "ProcessMix",
    model: "PM-HV-5000",
    price: 42000,
    currency: "USD",
    summary: "Used industrial mixer for coatings, adhesives, sealants, and viscous batches.",
    description:
      "Used high-viscosity mixer with hydraulic lifting frame and variable speed control.",
    specifications: [
      { label: "Batch capacity", value: "5,000 L" },
      { label: "Drive", value: "Variable speed" },
      { label: "Lift", value: "Hydraulic" },
    ],
    features: [{ text: "Video inspection available" }, { text: "Short lead time" }],
    mainImage: { url: "/images/crane.png", alternativeText: "Industrial lifting equipment" },
    gallery: [],
    sellerDisplayName: "Verified industrial seller",
    isFeatured: true,
  },
  {
    documentId: "fallback-compressor",
    title: "Oil-Free Screw Compressor Package",
    slug: "oil-free-screw-compressor-package",
    reference: "PX-C-001",
    category: fallbackCategories[3],
    condition: "good",
    availability: "under-review",
    country: "China",
    location: "Guangdong, China",
    year: 2019,
    make: "Atlas Copco",
    model: "ZR Series",
    price: 52000,
    currency: "USD",
    summary: "Used oil-free screw compressor package for process air and plant utilities.",
    description:
      "Used compressor package with controls and auxiliary equipment. Availability is pending seller inspection files.",
    specifications: [
      { label: "Type", value: "Oil-free screw" },
      { label: "Application", value: "Plant utility air" },
    ],
    features: [{ text: "Known global brand" }, { text: "Utility package" }],
    mainImage: { url: "/images/compressor.png", alternativeText: "Compressor package" },
    gallery: [],
    sellerDisplayName: "Verified industrial seller",
    isFeatured: false,
  },
];

export const fallbackSiteSettings: SiteSettings = {
  siteName: "PlantXchange",
  contactEmail: "sales@plantxchange.com",
  whatsappNumber: "+8613800000000",
  whatsappDisplayLabel: "WhatsApp",
  defaultSeoTitle: "PlantXchange | Used Industrial Process Equipment",
  defaultSeoDescription:
    "Source used tanks, reactors, mixers, pumps, compressors, and chemical plant assets through PlantXchange.",
  footerSummary:
    "PlantXchange connects buyers and sellers of used industrial process equipment with fast inquiry capture.",
};
