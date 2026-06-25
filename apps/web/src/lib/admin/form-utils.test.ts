import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { linesToList, optionalNumber, optionalString, specsToText, textToSpecs } from "./form-utils";

describe("admin form utilities", () => {
  it("normalizes textarea lines into non-empty values", () => {
    assert.deepEqual(linesToList("  one\r\n\n two \n"), ["one", "two"]);
  });

  it("round-trips specification key value lines", () => {
    const specs = [
      { label: "Capacity", value: "20,000 L" },
      { label: "Motor", value: "75 kW=variable speed" },
    ];

    assert.equal(specsToText(specs), "Capacity=20,000 L\nMotor=75 kW=variable speed");
    assert.deepEqual(textToSpecs("Capacity=20,000 L\nBroken\nMotor=75 kW=variable speed"), specs);
  });

  it("returns undefined for empty optional form fields", () => {
    assert.equal(optionalString("  "), undefined);
    assert.equal(optionalNumber(""), undefined);
    assert.equal(optionalNumber("42.5"), 42.5);
  });
});
