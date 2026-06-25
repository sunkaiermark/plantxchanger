import { requireAdminSession, isAdminUnauthorizedError, unauthorizedAdminResponse } from "@/lib/admin/route-auth";
import { adminCategorySchema } from "@/lib/admin/validation";
import { deleteAdminCategory, updateAdminCategory } from "@/lib/postgres/catalog";
import { getPostgresSql } from "@/lib/postgres/client";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const validationError = () =>
  NextResponse.json({ ok: false, message: "Please check the form fields." }, { status: 400 });

const notFound = () =>
  NextResponse.json({ ok: false, message: "Category not found." }, { status: 404 });

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const parsed = adminCategorySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return validationError();

    const { id } = await context.params;
    const data = await updateAdminCategory(getPostgresSql(), id, parsed.data);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (isAdminUnauthorizedError(error)) return unauthorizedAdminResponse();
    if (isNotFoundError(error)) return notFound();
    return NextResponse.json({ ok: false, message: "Could not save category." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    await deleteAdminCategory(getPostgresSql(), id);

    return NextResponse.json({ ok: true, data: { id } });
  } catch (error) {
    if (isAdminUnauthorizedError(error)) return unauthorizedAdminResponse();
    return NextResponse.json({ ok: false, message: "Could not delete category." }, { status: 500 });
  }
}

function isNotFoundError(error: unknown) {
  return error instanceof Error && error.message.includes("not found");
}
