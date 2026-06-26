import { requireAdminSession, isAdminUnauthorizedError, unauthorizedAdminResponse } from "@/lib/admin/route-auth";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate";
import { getPostgresSql } from "@/lib/postgres/client";
import { seedFallbackCatalog } from "@/lib/postgres/catalog";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await requireAdminSession();
    const data = await seedFallbackCatalog(getPostgresSql());
    revalidatePublicCatalog();

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (isAdminUnauthorizedError(error)) return unauthorizedAdminResponse();
    return NextResponse.json({ ok: false, error: "Could not seed catalog." }, { status: 500 });
  }
}
