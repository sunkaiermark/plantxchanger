import assert from "node:assert/strict";
import test from "node:test";
import { hasAdminConfig } from "../env";
import { createAdminSessionToken } from "./session";
import { assertValidAdminSessionToken, AdminUnauthorizedError } from "./route-auth";

test("hasAdminConfig requires password and session secret", () => {
  const originalPassword = process.env.ADMIN_PASSWORD;
  const originalSecret = process.env.ADMIN_SESSION_SECRET;

  try {
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_SESSION_SECRET;
    assert.equal(hasAdminConfig(), false);

    process.env.ADMIN_PASSWORD = "password";
    assert.equal(hasAdminConfig(), false);

    process.env.ADMIN_SESSION_SECRET = "secret";
    assert.equal(hasAdminConfig(), true);
  } finally {
    restoreEnv("ADMIN_PASSWORD", originalPassword);
    restoreEnv("ADMIN_SESSION_SECRET", originalSecret);
  }
});

test("assertValidAdminSessionToken accepts signed admin tokens", () => {
  const token = createAdminSessionToken({ secret: "secret" });

  assert.doesNotThrow(() => assertValidAdminSessionToken(token, "secret"));
});

test("assertValidAdminSessionToken rejects missing or invalid tokens consistently", () => {
  assert.throws(() => assertValidAdminSessionToken(undefined, "secret"), AdminUnauthorizedError);
  assert.throws(() => assertValidAdminSessionToken("invalid", "secret"), AdminUnauthorizedError);
});

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
