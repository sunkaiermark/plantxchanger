import qs from "qs";
import { getRequiredServerEnv } from "@/lib/env";

type StrapiRequestMode = "read" | "write";

export function getStrapiUrl(): string {
  return getRequiredServerEnv("STRAPI_URL").replace(/\/$/, "");
}

export async function strapiFetch<T>(
  path: string,
  options: {
    mode?: StrapiRequestMode;
    query?: Record<string, unknown>;
    init?: RequestInit;
    revalidate?: number;
  } = {},
): Promise<T> {
  const mode = options.mode ?? "read";
  const token = getRequiredServerEnv(mode === "read" ? "STRAPI_READ_TOKEN" : "STRAPI_WRITE_TOKEN");
  const query = options.query ? `?${qs.stringify(options.query, { encodeValuesOnly: true })}` : "";
  const url = `${getStrapiUrl()}${path}${query}`;

  const response = await fetch(url, {
    ...options.init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.init?.headers ?? {}),
    },
    next: options.revalidate ? { revalidate: options.revalidate } : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Strapi ${response.status} for ${path}: ${text.slice(0, 240)}`);
  }

  return (await response.json()) as T;
}
