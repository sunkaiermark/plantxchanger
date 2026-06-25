import { requireAdminSession, isAdminUnauthorizedError, unauthorizedAdminResponse } from "@/lib/admin/route-auth";
import { adminSettingsSchema } from "@/lib/admin/validation";
import { getPostgresSql } from "@/lib/postgres/client";
import { getSiteSettingsFromPostgres, updateAdminSettings } from "@/lib/postgres/catalog";
import { NextResponse } from "next/server";

const validationError = () =>
  NextResponse.json({ ok: false, message: "Please check the form fields." }, { status: 400 });

export async function GET() {
  try {
    await requireAdminSession();
    const data = await getSiteSettingsFromPostgres(getPostgresSql());

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (isAdminUnauthorizedError(error)) return unauthorizedAdminResponse();
    return NextResponse.json({ ok: false, message: "Could not load settings." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminSession();
    const parsed = adminSettingsSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return validationError();

    const data = await updateAdminSettings(getPostgresSql(), parsed.data);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (isAdminUnauthorizedError(error)) return unauthorizedAdminResponse();
    return NextResponse.json({ ok: false, message: "Could not save settings." }, { status: 500 });
  }
}
