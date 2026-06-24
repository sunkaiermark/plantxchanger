import { randomUUID } from "node:crypto";
import type { InquiryInput } from "@/lib/inquiries/validation";
import { getPostgresSql, type SqlExecutor } from "./client";
import type { InquirySummary, QuoteStatus } from "@/lib/strapi/types";

type InquiryRow = Record<string, unknown>;

type StoreOptions = {
  sql?: SqlExecutor;
  documentIdFactory?: () => string;
};

const schemaReady = new WeakSet<SqlExecutor>();

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function stringOrDefault(value: unknown, fallback: string): string {
  return optionalString(value) ?? fallback;
}

function statusOrDefault(value: unknown): QuoteStatus {
  return value === "responded" || value === "negotiating" || value === "accepted"
    ? value
    : "pending";
}

function timestampToString(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString();
  return optionalString(value);
}

function normalizeInquiryRow(row: InquiryRow): InquirySummary {
  return {
    documentId: stringOrDefault(row.document_id, ""),
    inquiryType: row.inquiry_type === "seller" ? "seller" : "buyer",
    status: statusOrDefault(row.status),
    equipmentReferenceSnapshot: optionalString(row.equipment_reference_snapshot),
    equipmentTitleSnapshot: optionalString(row.equipment_title_snapshot),
    name: stringOrDefault(row.name, "Unknown"),
    company: optionalString(row.company),
    email: optionalString(row.email),
    phone: optionalString(row.phone),
    whatsapp: optionalString(row.whatsapp),
    country: optionalString(row.country),
    message: stringOrDefault(row.message, ""),
    sourcePage: optionalString(row.source_page),
    createdAt: timestampToString(row.created_at),
    updatedAt: timestampToString(row.updated_at),
  };
}

async function ensureInquirySchema(sql: SqlExecutor): Promise<void> {
  if (schemaReady.has(sql)) return;

  await sql`
    CREATE TABLE IF NOT EXISTS inquiries (
      id BIGSERIAL PRIMARY KEY,
      document_id TEXT UNIQUE NOT NULL,
      inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('buyer', 'seller')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'negotiating', 'accepted')),
      related_equipment_document_id TEXT,
      equipment_reference_snapshot TEXT,
      equipment_title_snapshot TEXT,
      name TEXT NOT NULL,
      company TEXT,
      email TEXT,
      phone TEXT,
      whatsapp TEXT,
      country TEXT,
      message TEXT NOT NULL,
      source_page TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      user_agent TEXT,
      ip_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS inquiries_inquiry_type_created_at_idx
    ON inquiries (inquiry_type, created_at DESC)
  `;

  schemaReady.add(sql);
}

function getSql(options?: StoreOptions): SqlExecutor {
  return options?.sql ?? getPostgresSql();
}

export async function createInquiryInPostgres(
  input: InquiryInput,
  meta: { userAgent?: string | null; ipAddress?: string | null },
  options?: StoreOptions,
): Promise<InquirySummary> {
  const sql = getSql(options);
  await ensureInquirySchema(sql);

  const documentId = options?.documentIdFactory?.() ?? `inq-${randomUUID()}`;
  const rows = await sql`
    INSERT INTO inquiries (
      document_id,
      inquiry_type,
      status,
      related_equipment_document_id,
      equipment_reference_snapshot,
      equipment_title_snapshot,
      name,
      company,
      email,
      phone,
      whatsapp,
      country,
      message,
      source_page,
      utm_source,
      utm_medium,
      utm_campaign,
      user_agent,
      ip_address
    )
    VALUES (
      ${documentId},
      ${input.inquiryType},
      ${"pending"},
      ${input.relatedEquipmentDocumentId ?? null},
      ${input.equipmentReferenceSnapshot ?? null},
      ${input.equipmentTitleSnapshot ?? null},
      ${input.name},
      ${input.company ?? null},
      ${input.email ?? null},
      ${input.phone ?? null},
      ${input.whatsapp ?? null},
      ${input.country ?? null},
      ${input.message},
      ${input.sourcePage ?? null},
      ${input.utmSource ?? null},
      ${input.utmMedium ?? null},
      ${input.utmCampaign ?? null},
      ${meta.userAgent ?? null},
      ${meta.ipAddress ?? null}
    )
    RETURNING *
  `;

  return normalizeInquiryRow(rows[0] ?? {});
}

export async function getQuoteRequestsFromPostgres(
  options?: StoreOptions,
): Promise<InquirySummary[]> {
  const sql = getSql(options);
  await ensureInquirySchema(sql);

  const rows = await sql`
    SELECT *
    FROM inquiries
    WHERE inquiry_type = 'buyer'
    ORDER BY created_at DESC
    LIMIT 50
  `;

  return rows.map(normalizeInquiryRow);
}

export async function updateInquiryStatusInPostgres(
  documentId: string,
  status: QuoteStatus,
  options?: StoreOptions,
): Promise<InquirySummary> {
  const sql = getSql(options);
  await ensureInquirySchema(sql);

  const rows = await sql`
    UPDATE inquiries
    SET status = ${status}, updated_at = NOW()
    WHERE document_id = ${documentId}
    RETURNING *
  `;

  if (!rows[0]) {
    throw new Error(`Inquiry not found: ${documentId}`);
  }

  return normalizeInquiryRow(rows[0]);
}
