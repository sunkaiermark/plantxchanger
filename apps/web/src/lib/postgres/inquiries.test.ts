import assert from "node:assert/strict";
import test from "node:test";
import type { InquiryInput } from "@/lib/inquiries/validation";
import {
  createInquiryInPostgres,
  getQuoteRequestsFromPostgres,
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
  status: "pending",
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
  created_at: "2026-06-24T00:00:00.000Z",
  updated_at: "2026-06-24T00:00:00.000Z",
};

test("createInquiryInPostgres stores an inquiry and returns a normalized summary", async () => {
  const fake = createFakeSql([[], [], [storedRow]]);

  const result = await createInquiryInPostgres(
    buyerInquiry,
    { userAgent: "node-test", ipAddress: "127.0.0.1" },
    {
      documentIdFactory: () => "inq-test-1",
      sql: fake.sql,
    },
  );

  assert.equal(result.documentId, "inq-test-1");
  assert.equal(result.status, "pending");
  assert.equal(result.equipmentReferenceSnapshot, "PX-R-001");
  assert.equal(result.name, "Mark Buyer");
  assert.match(fake.calls[0].text, /CREATE TABLE IF NOT EXISTS inquiries/);
  assert.match(fake.calls[2].text, /INSERT INTO inquiries/);
  assert.deepEqual(fake.calls[2].values.slice(0, 4), [
    "inq-test-1",
    "buyer",
    "pending",
    "equipment-doc-1",
  ]);
  assert.ok(fake.calls[2].values.includes("node-test"));
  assert.ok(fake.calls[2].values.includes("127.0.0.1"));
});

test("getQuoteRequestsFromPostgres reads buyer inquiries newest first", async () => {
  const fake = createFakeSql([[], [], [storedRow]]);

  const result = await getQuoteRequestsFromPostgres({ sql: fake.sql });

  assert.equal(result.length, 1);
  assert.equal(result[0]?.documentId, "inq-test-1");
  assert.equal(result[0]?.inquiryType, "buyer");
  assert.match(fake.calls[2].text, /WHERE inquiry_type = 'buyer'/);
  assert.match(fake.calls[2].text, /ORDER BY created_at DESC/);
});

test("updateInquiryStatusInPostgres updates status by document id", async () => {
  const fake = createFakeSql([[], [], [{ ...storedRow, status: "negotiating" }]]);

  const result = await updateInquiryStatusInPostgres("inq-test-1", "negotiating", {
    sql: fake.sql,
  });

  assert.equal(result.documentId, "inq-test-1");
  assert.equal(result.status, "negotiating");
  assert.match(fake.calls[2].text, /UPDATE inquiries/);
  assert.deepEqual(fake.calls[2].values, ["negotiating", "inq-test-1"]);
});

test("updateInquiryStatusInPostgres throws when the inquiry does not exist", async () => {
  const fake = createFakeSql([[], [], []]);

  await assert.rejects(
    () => updateInquiryStatusInPostgres("missing", "responded", { sql: fake.sql }),
    /Inquiry not found: missing/,
  );
});
