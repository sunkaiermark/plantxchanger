import assert from "node:assert/strict";
import test from "node:test";
import { validateInquiryInput } from "./validation";

test("validateInquiryInput accepts buyer inquiry with email", () => {
  const result = validateInquiryInput({
    inquiryType: "buyer",
    name: "Mark",
    email: "buyer@example.com",
    message: "Please quote PX-R-001",
    sourcePage: "/equipment/10000l-reactor",
  });
  assert.equal(result.success, true);
});

test("validateInquiryInput rejects missing contact method", () => {
  const result = validateInquiryInput({
    inquiryType: "buyer",
    name: "Mark",
    message: "Please quote PX-R-001",
  });
  assert.equal(result.success, false);
});

test("validateInquiryInput rejects honeypot value", () => {
  const result = validateInquiryInput({
    inquiryType: "seller",
    name: "Spammer",
    email: "spam@example.com",
    message: "Hello",
    website: "filled by bot",
  });
  assert.equal(result.success, false);
});
