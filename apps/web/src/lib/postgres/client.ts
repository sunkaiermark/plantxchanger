import { neon } from "@neondatabase/serverless";
import { getRequiredServerEnv, getServerEnv } from "@/lib/env";

export type SqlExecutor = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Array<Record<string, unknown>>>;

let sqlClient: SqlExecutor | undefined;

export function hasPostgresConfig(): boolean {
  return Boolean(getServerEnv("DATABASE_URL"));
}

export function getPostgresSql(): SqlExecutor {
  if (!sqlClient) {
    sqlClient = neon(getRequiredServerEnv("DATABASE_URL")) as SqlExecutor;
  }

  return sqlClient;
}
