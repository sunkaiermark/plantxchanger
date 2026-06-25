import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { createInquiry, getQuoteRequests, updateInquiryStatus } from "./inquiries";

const originalFetch = globalThis.fetch;
const originalEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  STRAPI_READ_TOKEN: process.env.STRAPI_READ_TOKEN,
  STRAPI_URL: process.env.STRAPI_URL,
  STRAPI_WRITE_TOKEN: process.env.STRAPI_WRITE_TOKEN,
};

function restoreEnv() {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function setStrapiEnv() {
  delete process.env.DATABASE_URL;
  process.env.STRAPI_URL = "https://cms.example.test";
  process.env.STRAPI_READ_TOKEN = "read-token";
  process.env.STRAPI_WRITE_TOKEN = "write-token";
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  restoreEnv();
});

test("createInquiry saves a new buyer inquiry to Strapi and returns the saved record", async () => {
  setStrapiEnv();
  let capturedUrl = "";
  let capturedInit: RequestInit | undefined;

  globalThis.fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedInit = init;

    return new Response(
      JSON.stringify({
        data: {
          documentId: "inq-doc-1",
          inquiryType: "buyer",
          status: "new",
          equipmentReferenceSnapshot: "PX-R-001",
          equipmentTitleSnapshot: "10,000 L Reactor",
          name: "Mark",
          email: "buyer@example.com",
          message: "Please quote this unit.",
          createdAt: "2026-06-21T10:00:00.000Z",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  const inquiry = await createInquiry(
    {
      inquiryType: "buyer",
      relatedEquipmentDocumentId: "equipment-doc-id",
      equipmentReferenceSnapshot: "PX-R-001",
      equipmentTitleSnapshot: "10,000 L Reactor",
      name: "Mark",
      email: "buyer@example.com",
      message: "Please quote this unit.",
      sourcePage: "/equipment/reactor",
    },
    { ipAddress: "127.0.0.1", userAgent: "node-test" },
  );

  assert.equal(capturedUrl, "https://cms.example.test/api/inquiries");
  assert.equal(capturedInit?.method, "POST");
  assert.equal((capturedInit?.headers as Record<string, string>).Authorization, "Bearer write-token");
  assert.deepEqual(JSON.parse(String(capturedInit?.body)).data.status, "new");
  assert.equal(inquiry.documentId, "inq-doc-1");
  assert.equal(inquiry.status, "new");
  assert.equal(inquiry.equipmentReferenceSnapshot, "PX-R-001");
});

test("getQuoteRequests reads buyer inquiries from Strapi before falling back to sample quotes", async () => {
  setStrapiEnv();
  let capturedUrl = "";

  globalThis.fetch = async (input) => {
    capturedUrl = String(input);

    return new Response(
      JSON.stringify({
        data: [
          {
            documentId: "inq-doc-2",
            inquiryType: "buyer",
            status: "contacted",
            equipmentReferenceSnapshot: "PX-C-5000",
            equipmentTitleSnapshot: "Natural Gas Compressor 5000HP",
            name: "Aisha",
            company: "Gulf Energy",
            message: "Please share inspection records.",
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  const quotes = await getQuoteRequests();

  assert.match(capturedUrl, /^https:\/\/cms\.example\.test\/api\/inquiries\?/);
  assert.match(capturedUrl, /filters%5BinquiryType%5D%5B%24eq%5D=buyer|filters\[inquiryType\]\[\$eq\]=buyer/);
  assert.equal(quotes.length, 1);
  assert.equal(quotes[0].documentId, "inq-doc-2");
  assert.equal(quotes[0].status, "contacted");
});

test("updateInquiryStatus updates negotiation status in Strapi and returns the saved record", async () => {
  setStrapiEnv();
  let capturedUrl = "";
  let capturedInit: RequestInit | undefined;

  globalThis.fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedInit = init;

    return new Response(
      JSON.stringify({
        data: {
          documentId: "inq-doc-3",
          inquiryType: "buyer",
          status: "negotiating",
          equipmentReferenceSnapshot: "PX-AM-1000",
          equipmentTitleSnapshot: "Complete Ammonia Plant 1000 MTPD",
          name: "Procurement Team",
          company: "Saudi Aramco",
          message: "Commercial terms received.",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  const inquiry = await updateInquiryStatus("inq-doc-3", "negotiating");

  assert.equal(capturedUrl, "https://cms.example.test/api/inquiries/inq-doc-3");
  assert.equal(capturedInit?.method, "PUT");
  assert.equal((capturedInit?.headers as Record<string, string>).Authorization, "Bearer write-token");
  assert.deepEqual(JSON.parse(String(capturedInit?.body)), { data: { status: "negotiating" } });
  assert.equal(inquiry.documentId, "inq-doc-3");
  assert.equal(inquiry.status, "negotiating");
});
