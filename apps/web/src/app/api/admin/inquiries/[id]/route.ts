import { requireAdminSession, isAdminUnauthorizedError, unauthorizedAdminResponse } from "@/lib/admin/route-auth";
import { adminInquiryUpdateSchema } from "@/lib/admin/validation";
import { getPostgresSql } from "@/lib/postgres/client";
import { updateAdminInquiryInPostgres } from "@/lib/postgres/inquiries";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const validationError = () =>
  NextResponse.json({ ok: false, message: "Please check the form fields." }, { status: 400 });

const notFound = () =>
  NextResponse.json({ ok: false, message: "Inquiry not found." }, { status: 404 });

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const parsed = adminInquiryUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return validationError();

    const { id } = await context.params;
    const data = await updateAdminInquiryInPostgres(id, parsed.data, { sql: getPostgresSql() });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (isAdminUnauthorizedError(error)) return unauthorizedAdminResponse();
    if (isNotFoundError(error)) return notFound();
    return NextResponse.json({ ok: false, message: "Could not save inquiry." }, { status: 500 });
  }
}

function isNotFoundError(error: unknown) {
  return error instanceof Error && error.message.includes("not found");
}
