import assert from "node:assert/strict";
import test from "node:test";
import type { InquiryInput } from "@/lib/inquiries/validation";
import {
  createInquiryInPostgres,
  getAdminInquiriesFromPostgres,
  getQuoteRequestsFromPostgres,
  updateAdminInquiryInPostgres,
  updateInquiryStatusInPostgres,
} from "./inquiries";

type SqlCall = {
  text: string;
  values: unknown[];
};

function createFakeSql(responses: Array<Record<string, unknown>[]>) {
  const calls: SqlCall[] = [];
  const sql = async (strings: TemplateStringsArray, ...values: unknown[]) => {
    calls.push({ text: strings.join("?"), values });
    return responses.shift() ?? [];
  };

  return { calls, sql };
}

const buyerInquiry: InquiryInput = {
  inquiryType: "buyer",
  relatedEquipmentDocumentId: "equipment-doc-1",
  equipmentReferenceSnapshot: "PX-R-001",
  equipmentTitleSnapshot: "Complete Ammonia Plant 1000 MTPD",
  name: "Mark Buyer",
  company: "Plant Buyer LLC",
  email: "buyer@example.com",
  phone: "+1 555 0100",
  whatsapp: "+1 555 0101",
  country: "United States",
  message: "Please send technical documents.",
  sourcePage: "/equipment/ammonia-plant",
};

const storedRow = {
  document_id: "inq-test-1",
  inquiry_type: "buyer",
  status: "new",
  equipment_reference_snapshot: "PX-R-001",
  equipment_title_snapshot: "Complete Ammonia Plant 1000 MTPD",
  name: "Mark Buyer",
  company: "Plant Buyer LLC",
  email: "buyer@example.com",
  phone: "+1 555 0100",
  whatsapp: "+1 555 0101",
  country: "United States",
  message: "Please send technical documents.",
  source_page: "/equipment/ammonia-plant",
  internal_note: null,
  created_at: "2026-06-24T00:00:00.000Z",
  updated_at: "2026-06-24T00:00:00.000Z",
};

const schemaResponses = () => Array.from({ length: 13 }, () => []);

function assertInquirySchemaMigration(calls: SqlCall[]) {
  assert.match(calls[0]?.text ?? "", /CREATE TABLE IF NOT EXISTS inquiries/);
  assert.match(calls[0]?.text ?? "", /internal_note TEXT/);
  assert.match(calls[0]?.text ?? "", /updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW\(\)/);
  assert.match(calls[1]?.text ?? "", /CREATE INDEX IF NOT EXISTS inquiries_inquiry_type_created_at_idx/);
  assert.match(calls[2]?.text ?? "", /ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS internal_note TEXT/);
  assert.match(calls[3]?.text ?? "", /ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ/);
  assert.match(calls[4]?.text ?? "", /UPDATE inquiries\s+SET updated_at = COALESCE\(updated_at, created_at, NOW\(\)\)\s+WHERE updated_at IS NULL/);
  assert.match(calls[5]?.text ?? "", /ALTER TABLE inquiries ALTER COLUMN updated_at SET DEFAULT NOW\(\)/);
  assert.match(calls[6]?.text ?? "", /ALTER TABLE inquiries ALTER COLUMN updated_at SET NOT NULL/);
  assert.match(calls[7]?.text ?? "", /ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS inquiries_status_check/);
  assert.match(calls[8]?.text ?? "", /UPDATE inquiries SET status = 'new' WHERE status = 'pending'/);
  assert.match(calls[9]?.text ?? "", /UPDATE inquiries SET status = 'contacted' WHERE status = 'responded'/);
  assert.match(calls[10]?.text ?? "", /UPDATE inquiries SET status = 'closed' WHERE status = 'accepted'/);
  assert.match(calls[11]?.text ?? "", /ALTER TABLE inquiries ALTER COLUMN status SET DEFAULT 'new'/);
  assert.match(calls[12]?.text ?? "", /ALTER TABLE inquiries\s+ADD CONSTRAINT inquiries_status_check/);
}

test("createInquiryInPostgres stores an inquiry and returns a normalized summary", async () => {
  const fake = createFakeSql([...schemaResponses(), [storedRow]]);

  const result = await createInquiryInPostgres(
    buyerInquiry,
    { userAgent: "node-test", ipAddress: "127.0.0.1" },
    {
      documentIdFactory: () => "inq-test-1",
      sql: fake.sql,
    },
  );

  assert.equal(result.documentId, "inq-test-1");
  assert.equal(result.status, "new");
  assert.equal(result.internalNote, undefined);
  assert.equal(result.equipmentReferenceSnapshot, "PX-R-001");
  assert.equal(result.name, "Mark Buyer");
  assertInquirySchemaMigration(fake.calls);
  assert.match(fake.calls[13].text, /INSERT INTO inquiries/);
  assert.deepEqual(fake.calls[13].values.slice(0, 4), [
    "inq-test-1",
    "buyer",
    "new",
    "equipment-doc-1",
  ]);
  assert.ok(fake.calls[13].values.includes("node-test"));
  assert.ok(fake.calls[13].values.includes("127.0.0.1"));
});

test("getQuoteRequestsFromPostgres reads buyer inquiries newest first", async () => {
  const fake = createFakeSql([...schemaResponses(), [storedRow]]);

  const result = await getQuoteRequestsFromPostgres({ sql: fake.sql });

  assert.equal(result.length, 1);
  assert.equal(result[0]?.documentId, "inq-test-1");
  assert.equal(result[0]?.inquiryType, "buyer");
  assertInquirySchemaMigration(fake.calls);
  assert.match(fake.calls[13].text, /WHERE inquiry_type = 'buyer'/);
  assert.match(fake.calls[13].text, /ORDER BY created_at DESC/);
});

test("getAdminInquiriesFromPostgres filters and searches inquiries for admin use", async () => {
  const rowWithNote = {
    ...storedRow,
    internal_note: "Called buyer and requested NDA.",
  };
  const fake = createFakeSql([...schemaResponses(), [rowWithNote]]);

  const result = await getAdminInquiriesFromPostgres(
    { status: "qualified", inquiryType: "buyer", search: "ammonia" },
    { sql: fake.sql },
  );

  assert.equal(result.length, 1);
  assert.equal(result[0]?.documentId, "inq-test-1");
  assert.equal(result[0]?.internalNote, "Called buyer and requested NDA.");
  assertInquirySchemaMigration(fake.calls);
  assert.match(fake.calls[13].text, /FROM inquiries/);
  assert.match(fake.calls[13].text, /status = \?/);
  assert.match(fake.calls[13].text, /inquiry_type = \?/);
  assert.match(fake.calls[13].text, /name ILIKE \?/);
  assert.match(fake.calls[13].text, /company ILIKE \?/);
  assert.match(fake.calls[13].text, /email ILIKE \?/);
  assert.match(fake.calls[13].text, /phone ILIKE \?/);
  assert.match(fake.calls[13].text, /equipment_reference_snapshot ILIKE \?/);
  assert.match(fake.calls[13].text, /message ILIKE \?/);
  assert.match(fake.calls[13].text, /ORDER BY created_at DESC/);
  assert.ok(fake.calls[13].values.includes("qualified"));
  assert.ok(fake.calls[13].values.includes("buyer"));
  assert.equal(fake.calls[13].values.filter((value) => value === "%ammonia%").length, 8);
});

test("updateAdminInquiryInPostgres updates status and internal note", async () => {
  const fake = createFakeSql([
    ...schemaResponses(),
    [{ ...storedRow, status: "contacted", internal_note: "Left voicemail." }],
  ]);

  const result = await updateAdminInquiryInPostgres(
    "inq-test-1",
    { status: "contacted", internalNote: "Left voicemail." },
    { sql: fake.sql },
  );

  assert.equal(result.documentId, "inq-test-1");
  assert.equal(result.status, "contacted");
  assert.equal(result.internalNote, "Left voicemail.");
  assertInquirySchemaMigration(fake.calls);
  assert.match(fake.calls[13].text, /UPDATE inquiries/);
  assert.match(fake.calls[13].text, /internal_note = \?/);
  assert.match(fake.calls[13].text, /updated_at = NOW\(\)/);
  assert.deepEqual(fake.calls[13].values, ["contacted", "Left voicemail.", "inq-test-1"]);
});

test("updateAdminInquiryInPostgres throws when the inquiry does not exist", async () => {
  const fake = createFakeSql([...schemaResponses(), []]);

  await assert.rejects(
    () =>
      updateAdminInquiryInPostgres(
        "missing",
        { status: "spam", internalNote: "Not a real inquiry." },
        { sql: fake.sql },
      ),
    /Inquiry not found: missing/,
  );
  assertInquirySchemaMigration(fake.calls);
});

test("updateInquiryStatusInPostgres updates status by document id", async () => {
  const fake = createFakeSql([...schemaResponses(), [{ ...storedRow, status: "negotiating" }]]);

  const result = await updateInquiryStatusInPostgres("inq-test-1", "negotiating", {
    sql: fake.sql,
  });

  assert.equal(result.documentId, "inq-test-1");
  assert.equal(result.status, "negotiating");
  assertInquirySchemaMigration(fake.calls);
  assert.match(fake.calls[13].text, /UPDATE inquiries/);
  assert.deepEqual(fake.calls[13].values, ["negotiating", "inq-test-1"]);
});

test("updateInquiryStatusInPostgres throws when the inquiry does not exist", async () => {
  const fake = createFakeSql([...schemaResponses(), []]);

  await assert.rejects(
    () => updateInquiryStatusInPostgres("missing", "contacted", { sql: fake.sql }),
    /Inquiry not found: missing/,
  );
  assertInquirySchemaMigration(fake.calls);
});
