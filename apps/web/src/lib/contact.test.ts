import assert from "node:assert/strict";
import test from "node:test";
import { buildEquipmentEmailHref, buildEquipmentWhatsAppHref } from "./contact";

const equipment = {
  reference: "PX-R-001",
  title: "10,000 L Stainless Steel Jacketed Reactor",
  slug: "10000l-stainless-steel-jacketed-reactor",
};

test("buildEquipmentEmailHref includes equipment reference and title", () => {
  const href = buildEquipmentEmailHref(equipment, "sales@plantxchange.com");
  const decoded = decodeURIComponent(href);
  assert.ok(href.startsWith("mailto:sales@plantxchange.com?"));
  assert.match(decoded, /Hello PlantXchanger,/);
  assert.match(decoded, /PX-R-001/);
  assert.match(decoded, /10,000 L Stainless Steel Jacketed Reactor/);
});

test("buildEquipmentWhatsAppHref strips non-digits from phone number", () => {
  const href = buildEquipmentWhatsAppHref(equipment, "+852 96166083");
  assert.ok(href.startsWith("https://wa.me/85296166083?text="));
  assert.match(decodeURIComponent(href), /PX-R-001/);
});
