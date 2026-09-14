import assert from "node:assert/strict";
import test from "node:test";
import { canonicalizeBrandText, SITE_BRAND_NAME } from "./brand";

test("canonicalizeBrandText maps legacy site-name spellings to PlantXchanger", () => {
  for (const legacyName of ["PlantXchange", "Plantxchange", "Plant Xchange", "plant-xchanger"]) {
    assert.equal(canonicalizeBrandText(legacyName), SITE_BRAND_NAME);
  }

  assert.equal(
    canonicalizeBrandText("About PlantXchange and the Plant Xchange marketplace"),
    "About PlantXchanger and the PlantXchanger marketplace",
  );
});

test("canonicalizeBrandText leaves URLs and email addresses unchanged", () => {
  assert.equal(
    canonicalizeBrandText("https://www.plantxchange.com sales@plantxchange.com"),
    "https://www.plantxchange.com sales@plantxchange.com",
  );
});
