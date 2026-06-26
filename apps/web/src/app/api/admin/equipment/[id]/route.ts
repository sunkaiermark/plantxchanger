import { requireAdminSession, isAdminUnauthorizedError, unauthorizedAdminResponse } from "@/lib/admin/route-auth";
import { revalidatePublicCatalog } from "@/lib/admin/revalidate";
import { adminEquipmentSchema } from "@/lib/admin/validation";
import {
  deleteAdminEquipment,
  getAdminEquipmentById,
  updateAdminEquipment,
} from "@/lib/postgres/catalog";
import { getPostgresSql } from "@/lib/postgres/client";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const validationError = () =>
  NextResponse.json({ ok: false, error: "Please check the form fields." }, { status: 400 });

const notFound = () =>
  NextResponse.json({ ok: false, error: "Equipment not found." }, { status: 404 });

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    const data = await getAdminEquipmentById(getPostgresSql(), id);

    return data ? NextResponse.json({ ok: true, data }) : notFound();
  } catch (error) {
    if (isAdminUnauthorizedError(error)) return unauthorizedAdminResponse();
    return NextResponse.json({ ok: false, error: "Could not load equipment." }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const parsed = adminEquipmentSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return validationError();

    const { id } = await context.params;
    const data = await updateAdminEquipment(getPostgresSql(), id, parsed.data);
    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    if (isAdminUnauthorizedError(error)) return unauthorizedAdminResponse();
    if (isNotFoundError(error)) return notFound();
    return NextResponse.json({ ok: false, error: "Could not save equipment." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    await deleteAdminEquipment(getPostgresSql(), id);
    revalidatePublicCatalog();

    return NextResponse.json({ ok: true, data: { id } });
  } catch (error) {
    if (isAdminUnauthorizedError(error)) return unauthorizedAdminResponse();
    if (isNotFoundError(error)) return notFound();
    return NextResponse.json({ ok: false, error: "Could not delete equipment." }, { status: 500 });
  }
}

function isNotFoundError(error: unknown) {
  return error instanceof Error && error.message.includes("not found");
}
