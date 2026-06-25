import { timingSafeEqual } from "node:crypto";
import { getRequiredServerEnv, hasAdminConfig } from "@/lib/env";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
} from "@/lib/admin/session";
import { NextResponse } from "next/server";

const unauthorized = () =>
  NextResponse.json({ ok: false, error: "Invalid password." }, { status: 401 });

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const password = readPassword(json);

  if (!hasAdminConfig() || !passwordsMatch(password, getRequiredServerEnv("ADMIN_PASSWORD"))) {
    return unauthorized();
  }

  const token = createAdminSessionToken({
    secret: getRequiredServerEnv("ADMIN_SESSION_SECRET"),
  });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, getAdminSessionCookieOptions());

  return response;
}

function readPassword(value: unknown): string | undefined {
  if (!value || typeof value !== "object" || !("password" in value)) {
    return undefined;
  }

  const password = value.password;
  return typeof password === "string" ? password : undefined;
}

function passwordsMatch(input: string | undefined, expected: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const inputBuffer = Buffer.from(input ?? "");
  const sameLength = inputBuffer.length === expectedBuffer.length;
  const comparableInput = sameLength ? inputBuffer : expectedBuffer;

  return timingSafeEqual(comparableInput, expectedBuffer) && sameLength;
}
