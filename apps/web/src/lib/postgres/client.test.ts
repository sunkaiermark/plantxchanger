import assert from "node:assert/strict";
import test from "node:test";
import { createRetryingSqlExecutor } from "./client";

test("createRetryingSqlExecutor retries transient select failures", async () => {
  let attempts = 0;
  const sql = createRetryingSqlExecutor(
    async () => {
      attempts += 1;
      if (attempts === 1) throw new Error("fetch failed");
      return [{ ok: true }];
    },
    { maxAttempts: 2, retryDelayMs: 0 },
  );

  const rows = await sql`SELECT * FROM equipment`;

  assert.deepEqual(rows, [{ ok: true }]);
  assert.equal(attempts, 2);
});

test("createRetryingSqlExecutor does not retry write failures", async () => {
  let attempts = 0;
  const sql = createRetryingSqlExecutor(
    async () => {
      attempts += 1;
      throw new Error("fetch failed");
    },
    { maxAttempts: 2, retryDelayMs: 0 },
  );

  await assert.rejects(() => sql`INSERT INTO equipment (title) VALUES (${"Pump"})`, /fetch failed/);
  assert.equal(attempts, 1);
});
