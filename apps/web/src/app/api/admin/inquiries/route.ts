import { requireAdminSession, isAdminUnauthorizedError, unauthorizedAdminResponse } from "@/lib/admin/route-auth";
import { getPostgresSql } from "@/lib/postgres/client";
import { getAdminInquiriesFromPostgres } from "@/lib/postgres/inquiries";
import type { QuoteStatus } from "@/lib/strapi/types";
import { NextResponse } from "next/server";

const statuses = new Set(["new", "contacted", "qualified", "negotiating", "closed", "spam"]);
const inquiryTypes = new Set(["buyer", "seller"]);

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const url = new URL(request.url);
    const data = await getAdminInquiriesFromPostgres(
      {
        status: readStatus(url.searchParams.get("status")),
        inquiryType: readInquiryType(url.searchParams.get("inquiryType")),
        search: url.searchParams.get("search") ?? undefined,
      },
      { sql: getPostgresSql() },
    );

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (isAdminUnauthorizedError(error)) return unauthorizedAdminResponse();
    return NextResponse.json({ ok: false, error: "Could not load inquiries." }, { status: 500 });
  }
}

function readStatus(value: string | null): QuoteStatus | undefined {
  return value && statuses.has(value) ? (value as QuoteStatus) : undefined;
}

function readInquiryType(value: string | null): "buyer" | "seller" | undefined {
  return value && inquiryTypes.has(value) ? (value as "buyer" | "seller") : undefined;
}
