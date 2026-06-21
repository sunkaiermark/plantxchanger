import { hasStrapiReadConfig } from "@/lib/env";
import { fallbackQuotes } from "@/lib/fallback-quotes";
import { buildInquiryCreatePayload } from "@/lib/inquiries/payload";
import type { InquiryInput } from "@/lib/inquiries/validation";
import { strapiFetch } from "./client";
import { normalizeInquiry } from "./normalize";
import type { InquirySummary, QuoteStatus } from "./types";

const quoteStatuses = new Set<QuoteStatus>(["pending", "responded", "negotiating", "accepted"]);

export function isQuoteStatus(status: string): status is QuoteStatus {
  return quoteStatuses.has(status as QuoteStatus);
}

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

export async function createInquiry(
  input: InquiryInput,
  meta: { userAgent?: string | null; ipAddress?: string | null },
): Promise<InquirySummary> {
  const response = await strapiFetch<{ data: any }>("/api/inquiries", {
    mode: "write",
    init: {
      method: "POST",
      body: JSON.stringify(buildInquiryCreatePayload(input, meta)),
    },
  });

  return normalizeInquiry(response.data);
}

export async function updateInquiryStatus(
  documentId: string,
  status: QuoteStatus,
): Promise<InquirySummary> {
  if (!isQuoteStatus(status)) {
    throw new Error(`Unsupported quote status: ${status}`);
  }

  const response = await strapiFetch<{ data: any }>(
    `/api/inquiries/${encodeURIComponent(documentId)}`,
    {
      mode: "write",
      init: {
        method: "PUT",
        body: JSON.stringify({ data: { status } }),
      },
    },
  );

  return normalizeInquiry(response.data);
}
