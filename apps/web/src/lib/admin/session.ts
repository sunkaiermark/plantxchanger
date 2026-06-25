import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "plantxchange_admin_session";

const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60;

type AdminSessionPayload = {
  sub: "admin";
  exp: number;
};

type CreateAdminSessionTokenOptions = {
  secret: string;
  now?: number;
};

type VerifyAdminSessionTokenOptions = {
  secret: string;
  now?: number;
};

type VerifyAdminSessionTokenResult =
  | { valid: true; payload: AdminSessionPayload }
  | { valid: false; reason: "format" | "signature" | "payload" | "expired" };

type AdminSessionCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
};

function currentUnixTime() {
  return Math.floor(Date.now() / 1000);
}

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function signaturesMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "base64url");
  const rightBuffer = Buffer.from(right, "base64url");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function parsePayload(payload: string): AdminSessionPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

    if (parsed?.sub !== "admin" || !Number.isSafeInteger(parsed.exp)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function createAdminSessionToken({
  secret,
  now = currentUnixTime(),
}: CreateAdminSessionTokenOptions) {
  const payload = Buffer.from(
    JSON.stringify({ sub: "admin", exp: now + SESSION_DURATION_SECONDS }),
  ).toString("base64url");
  const signature = signPayload(payload, secret);

  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(
  token: string,
  { secret, now = currentUnixTime() }: VerifyAdminSessionTokenOptions,
): VerifyAdminSessionTokenResult {
  const [payload, signature, extra] = token.split(".");

  if (!payload || !signature || extra !== undefined) {
    return { valid: false, reason: "format" };
  }

  const expectedSignature = signPayload(payload, secret);

  if (!signaturesMatch(signature, expectedSignature)) {
    return { valid: false, reason: "signature" };
  }

  const parsedPayload = parsePayload(payload);

  if (!parsedPayload) {
    return { valid: false, reason: "payload" };
  }

  if (parsedPayload.exp <= now) {
    return { valid: false, reason: "expired" };
  }

  return { valid: true, payload: parsedPayload };
}

export function getAdminSessionCookieOptions(
  nodeEnv = process.env.NODE_ENV,
): AdminSessionCookieOptions {
  return {
    httpOnly: true,
    secure: nodeEnv === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}

export function getExpiredAdminSessionCookieOptions(): AdminSessionCookieOptions {
  return {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  };
}
