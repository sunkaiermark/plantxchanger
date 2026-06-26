import assert from "node:assert/strict";
import test from "node:test";
import { catalogSearchParamsCacheArgs } from "./catalog-cache";

test("catalogSearchParamsCacheArgs normalizes missing search filters for stable cache keys", () => {
  assert.deepEqual(catalogSearchParamsCacheArgs({}), ["", "", "", "", ""]);
  assert.deepEqual(
    catalogSearchParamsCacheArgs({
      search: "reactor",
      category: "reactors",
      condition: "good",
      availability: "available",
      country: "Germany",
    }),
    ["reactor", "reactors", "good", "available", "Germany"],
  );
});
