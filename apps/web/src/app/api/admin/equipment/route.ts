import { requireAdminSession, isAdminUnauthorizedError, unauthorizedAdminResponse } from "@/lib/admin/route-auth";
import { adminEquipmentSchema } from "@/lib/admin/validation";
import { createAdminEquipment, listAdminEquipment } from "@/lib/postgres/catalog";
import { getPostgresSql } from "@/lib/postgres/client";
import { NextResponse } from "next/server";

const validationError = () =>
  NextResponse.json({ ok: false, error: "Please check the form fields." }, { status: 400 });

export async function GET() {
  try {
    await requireAdminSession();
    const data = await listAdminEquipment(getPostgresSql());

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (isAdminUnauthorizedError(error)) return unauthorizedAdminResponse();
    return NextResponse.json({ ok: false, error: "Could not load equipment." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const parsed = adminEquipmentSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return validationError();

    const data = await createAdminEquipment(getPostgresSql(), parsed.data);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (isAdminUnauthorizedError(error)) return unauthorizedAdminResponse();
    return NextResponse.json({ ok: false, error: "Could not save equipment." }, { status: 500 });
  }
}
