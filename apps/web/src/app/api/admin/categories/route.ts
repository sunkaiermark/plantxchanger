import { requireAdminSession, isAdminUnauthorizedError, unauthorizedAdminResponse } from "@/lib/admin/route-auth";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate";
import { adminCategorySchema } from "@/lib/admin/validation";
import { createAdminCategory, listAdminCategories } from "@/lib/postgres/catalog";
import { getPostgresSql } from "@/lib/postgres/client";
import { NextResponse } from "next/server";

const validationError = () =>
  NextResponse.json({ ok: false, error: "Please check the form fields." }, { status: 400 });

export async function GET() {
  try {
    await requireAdminSession();
    const data = await listAdminCategories(getPostgresSql());

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (isAdminUnauthorizedError(error)) return unauthorizedAdminResponse();
    return NextResponse.json({ ok: false, error: "Could not load categories." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const parsed = adminCategorySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return validationError();

    const data = await createAdminCategory(getPostgresSql(), parsed.data);
    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (isAdminUnauthorizedError(error)) return unauthorizedAdminResponse();
    return NextResponse.json({ ok: false, error: "Could not save category." }, { status: 500 });
  }
}
