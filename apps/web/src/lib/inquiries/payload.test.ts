import assert from "node:assert/strict";
import test from "node:test";
import { buildInquiryCreatePayload } from "./payload";

test("buildInquiryCreatePayload maps buyer inquiry to Strapi data envelope", () => {
  const payload = buildInquiryCreatePayload(
    {
      inquiryType: "buyer",
      relatedEquipmentDocumentId: "equipment-doc-id",
      equipmentReferenceSnapshot: "PX-R-001",
      equipmentTitleSnapshot: "10,000 L Reactor",
      name: "Mark",
      email: "buyer@example.com",
      message: "Please quote",
      sourcePage: "/equipment/10000l-reactor",
    },
    {
      userAgent: "node-test",
      ipAddress: "127.0.0.1",
    },
  );

  assert.equal(payload.data.status, "new");
  assert.equal(payload.data.relatedEquipment, "equipment-doc-id");
  assert.equal(payload.data.equipmentReferenceSnapshot, "PX-R-001");
  assert.equal(payload.data.userAgent, "node-test");
});
