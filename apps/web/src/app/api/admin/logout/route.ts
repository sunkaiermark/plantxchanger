import { ADMIN_SESSION_COOKIE, getExpiredAdminSessionCookieOptions } from "@/lib/admin/session";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", getExpiredAdminSessionCookieOptions());

  return response;
}
