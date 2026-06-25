import { hasPostgresConfig, hasStrapiReadConfig } from "@/lib/env";
import { fallbackQuotes } from "@/lib/fallback-quotes";
import type { AdminInquiryUpdateInput } from "@/lib/admin/validation";
import { buildInquiryCreatePayload } from "@/lib/inquiries/payload";
import type { InquiryInput } from "@/lib/inquiries/validation";
import {
  createInquiryInPostgres,
  getAdminInquiriesFromPostgres,
  getQuoteRequestsFromPostgres,
  updateAdminInquiryInPostgres,
  updateInquiryStatusInPostgres,
} from "@/lib/postgres/inquiries";
import { strapiFetch } from "./client";
import { normalizeInquiry } from "./normalize";
import type { InquirySummary, QuoteStatus } from "./types";

const quoteStatuses = new Set<QuoteStatus>(["new", "contacted", "qualified", "negotiating", "closed", "spam"]);

type AdminInquiryFilters = {
  status?: QuoteStatus;
  inquiryType?: "buyer" | "seller";
  search?: string;
};

export function isQuoteStatus(status: string): status is QuoteStatus {
  return quoteStatuses.has(status as QuoteStatus);
}

export async function getQuoteRequests(): Promise<InquirySummary[]> {
  if (hasPostgresConfig()) {
    try {
      return await getQuoteRequestsFromPostgres();
    } catch {
      return fallbackQuotes;
    }
  }

  if (!hasStrapiReadConfig()) {
    return fallbackQuotes;
  }

  try {
    const response = await strapiFetch<{ data: unknown[] }>("/api/inquiries", {
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

export async function getAdminInquiries(
  filters: AdminInquiryFilters = {},
): Promise<InquirySummary[]> {
  if (hasPostgresConfig()) {
    return getAdminInquiriesFromPostgres(filters);
  }

  if (!hasStrapiReadConfig()) {
    return fallbackQuotes;
  }

  const search = filters.search?.trim();
  const query: Record<string, unknown> = {
    filters: {
      ...(filters.status ? { status: { $eq: filters.status } } : {}),
      ...(filters.inquiryType ? { inquiryType: { $eq: filters.inquiryType } } : {}),
      ...(search
        ? {
            $or: [
              { name: { $containsi: search } },
              { company: { $containsi: search } },
              { email: { $containsi: search } },
              { phone: { $containsi: search } },
              { equipmentReferenceSnapshot: { $containsi: search } },
              { equipmentTitleSnapshot: { $containsi: search } },
              { message: { $containsi: search } },
            ],
          }
        : {}),
    },
    sort: ["createdAt:desc"],
    pagination: { pageSize: 100 },
  };

  const response = await strapiFetch<{ data: unknown[] }>("/api/inquiries", {
    query,
    revalidate: 0,
  });

  return response.data.map(normalizeInquiry);
}

export async function createInquiry(
  input: InquiryInput,
  meta: { userAgent?: string | null; ipAddress?: string | null },
): Promise<InquirySummary> {
  if (hasPostgresConfig()) {
    return createInquiryInPostgres(input, meta);
  }

  const response = await strapiFetch<{ data: unknown }>("/api/inquiries", {
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

  if (hasPostgresConfig()) {
    return updateInquiryStatusInPostgres(documentId, status);
  }

  const response = await strapiFetch<{ data: unknown }>(
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

export async function updateAdminInquiry(
  documentId: string,
  input: AdminInquiryUpdateInput,
): Promise<InquirySummary> {
  if (!isQuoteStatus(input.status)) {
    throw new Error(`Unsupported quote status: ${input.status}`);
  }

  if (hasPostgresConfig()) {
    return updateAdminInquiryInPostgres(documentId, input);
  }

  const response = await strapiFetch<{ data: unknown }>(
    `/api/inquiries/${encodeURIComponent(documentId)}`,
    {
      mode: "write",
      init: {
        method: "PUT",
        body: JSON.stringify({
          data: {
            status: input.status,
            internalNote: input.internalNote ?? null,
          },
        }),
      },
    },
  );

  return normalizeInquiry(response.data);
}
