import { neon } from "@neondatabase/serverless";
import { getRequiredServerEnv, getServerEnv } from "@/lib/env";

export type SqlExecutor = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Array<Record<string, unknown>>>;

let sqlClient: SqlExecutor | undefined;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatement(strings: TemplateStringsArray) {
  const statement = strings.join("?").trimStart().toLowerCase();
  return /^(select|with|create|alter)\b/.test(statement);
}

function isTransientPostgresError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /fetch failed|failed to fetch|network|timeout|timed out|terminated|connection.*(closed|reset|refused|terminated)|econnreset|etimedout|socket/i.test(
    message,
  );
}

export function createRetryingSqlExecutor(
  sql: SqlExecutor,
  options: { maxAttempts?: number; retryDelayMs?: number } = {},
): SqlExecutor {
  const maxAttempts = Math.max(1, options.maxAttempts ?? 3);
  const retryDelayMs = Math.max(0, options.retryDelayMs ?? 250);

  return async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const retryable = isRetryableStatement(strings);
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await sql(strings, ...values);
      } catch (error) {
        lastError = error;
        if (!retryable || attempt >= maxAttempts || !isTransientPostgresError(error)) {
          throw error;
        }
        if (retryDelayMs > 0) await wait(retryDelayMs);
      }
    }

    throw lastError;
  };
}

export function hasPostgresConfig(): boolean {
  return Boolean(getServerEnv("DATABASE_URL"));
}

export function getPostgresSql(): SqlExecutor {
  if (!sqlClient) {
    sqlClient = createRetryingSqlExecutor(neon(getRequiredServerEnv("DATABASE_URL")) as SqlExecutor);
  }

  return sqlClient;
}
