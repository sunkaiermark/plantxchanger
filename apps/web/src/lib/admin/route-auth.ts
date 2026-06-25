import { getRequiredServerEnv } from "@/lib/env";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "./session";

export class AdminUnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "AdminUnauthorizedError";
  }
}

export function assertValidAdminSessionToken(token: string | undefined, secret: string): void {
  if (!token) {
    throw new AdminUnauthorizedError();
  }

  const result = verifyAdminSessionToken(token, { secret });
  if (!result.valid) {
    throw new AdminUnauthorizedError();
  }
}

export async function requireAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const secret = getRequiredServerEnv("ADMIN_SESSION_SECRET");

  assertValidAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value, secret);
}

export function isAdminUnauthorizedError(error: unknown): error is AdminUnauthorizedError {
  return error instanceof AdminUnauthorizedError;
}

export function unauthorizedAdminResponse() {
  return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
}
