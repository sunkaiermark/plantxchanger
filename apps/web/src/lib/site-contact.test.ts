import assert from "node:assert/strict";
import test from "node:test";
import {
  buildTelephoneHref,
  buildWhatsAppHref,
  DEFAULT_PHONE_NUMBER,
  DEFAULT_WHATSAPP_NUMBER,
  resolvePhoneNumber,
  resolveWhatsAppNumber,
} from "./site-contact";

test("site contact defaults use the approved Hong Kong numbers", () => {
  assert.equal(resolvePhoneNumber(undefined), DEFAULT_PHONE_NUMBER);
  assert.equal(resolveWhatsAppNumber(undefined), DEFAULT_WHATSAPP_NUMBER);
  assert.equal(resolveWhatsAppNumber("+86 138 0000 0000"), DEFAULT_WHATSAPP_NUMBER);
});

test("site contact helpers preserve custom numbers and build channel links", () => {
  assert.equal(resolvePhoneNumber(" +44 20 7946 0958 "), "+44 20 7946 0958");
  assert.equal(resolveWhatsAppNumber("+44 7700 900123"), "+44 7700 900123");
  assert.equal(buildTelephoneHref("+852 9616 6083"), "tel:+85296166083");
  assert.equal(buildWhatsAppHref("+852 96166083"), "https://wa.me/85296166083");
});
