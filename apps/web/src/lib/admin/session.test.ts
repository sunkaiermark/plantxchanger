import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  verifyAdminSessionToken,
} from "./session";

const secret = "test-admin-session-secret";
const now = 1_800_000_000;

test("createAdminSessionToken signs a verifiable token", () => {
  const token = createAdminSessionToken({ secret, now });
  const result = verifyAdminSessionToken(token, { secret, now });

  assert.deepEqual(result, {
    valid: true,
    payload: {
      sub: "admin",
      exp: now + 7 * 24 * 60 * 60,
    },
  });
});

test("verifyAdminSessionToken rejects tampered payloads with signature reason", () => {
  const token = createAdminSessionToken({ secret, now });
  const [payload, signature] = token.split(".");
  const tamperedPayload = Buffer.from(
    JSON.stringify({ sub: "admin", exp: now + 7 * 24 * 60 * 60 + 1 }),
  ).toString("base64url");

  const result = verifyAdminSessionToken(`${tamperedPayload}.${signature}`, {
    secret,
    now,
  });

  assert.deepEqual(result, { valid: false, reason: "signature" });
  assert.notEqual(tamperedPayload, payload);
});

test("verifyAdminSessionToken rejects malformed token format with format reason", () => {
  assert.deepEqual(verifyAdminSessionToken("not-a-session-token", { secret, now }), {
    valid: false,
    reason: "format",
  });
});

test("verifyAdminSessionToken rejects signed invalid JSON payloads with payload reason", () => {
  const token = createSignedToken("not json");

  assert.deepEqual(verifyAdminSessionToken(token, { secret, now }), {
    valid: false,
    reason: "payload",
  });
});

test("verifyAdminSessionToken rejects signed wrong subject payloads with payload reason", () => {
  const token = createSignedToken(JSON.stringify({ sub: "editor", exp: now + 60 }));

  assert.deepEqual(verifyAdminSessionToken(token, { secret, now }), {
    valid: false,
    reason: "payload",
  });
});

test("verifyAdminSessionToken rejects signed non-number expiration payloads with payload reason", () => {
  const token = createSignedToken(JSON.stringify({ sub: "admin", exp: "soon" }));

  assert.deepEqual(verifyAdminSessionToken(token, { secret, now }), {
    valid: false,
    reason: "payload",
  });
});

test("verifyAdminSessionToken rejects signed non-finite expiration payloads with payload reason", () => {
  const token = createSignedToken('{ "sub": "admin", "exp": 1e999 }');

  assert.deepEqual(verifyAdminSessionToken(token, { secret, now }), {
    valid: false,
    reason: "payload",
  });
});

test("verifyAdminSessionToken rejects expired tokens with expired reason", () => {
  const token = createAdminSessionToken({ secret, now });
  const result = verifyAdminSessionToken(token, {
    secret,
    now: now + 7 * 24 * 60 * 60 + 1,
  });

  assert.deepEqual(result, { valid: false, reason: "expired" });
});

test("getAdminSessionCookieOptions returns secure admin cookie options", () => {
  assert.equal(ADMIN_SESSION_COOKIE, "plantxchange_admin_session");

  assert.deepEqual(getAdminSessionCookieOptions("production"), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
});

function createSignedToken(payloadJson: string) {
  const payload = Buffer.from(payloadJson).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");

  return `${payload}.${signature}`;
}
