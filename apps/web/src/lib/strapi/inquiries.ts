import { hasStrapiReadConfig } from "@/lib/env";
import { fallbackQuotes } from "@/lib/fallback-quotes";
import { strapiFetch } from "./client";
import { normalizeInquiry } from "./normalize";
import type { InquirySummary } from "./types";

export async function getQuoteRequests(): Promise<InquirySummary[]> {
  if (!hasStrapiReadConfig()) {
    return fallbackQuotes;
  }

  try {
    const response = await strapiFetch<{ data: any[] }>("/api/inquiries", {
      query: {
        filters: { inquiryType: { $eq: "buyer" } },
        sort: ["createdAt:desc"],
        pagination: { pageSize: 50 },
      },
      revalidate: 30,
    });

    return response.data.map(normalizeInquiry);
  } catch {
    return fallbackQuotes;
  }
}
