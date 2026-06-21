import assert from "node:assert/strict";
import test from "node:test";
import { normalizeEquipment } from "./normalize";

test("normalizeEquipment supports Strapi 5 flat responses", () => {
  const result = normalizeEquipment(
    {
      documentId: "eq-doc",
      title: "10,000 L Reactor",
      slug: "reactor",
      reference: "PX-R-001",
      category: {
        documentId: "cat-doc",
        name: "Reactors",
        slug: "reactors",
      },
      mainImage: {
        url: "/uploads/reactor.png",
        alternativeText: "Reactor",
      },
      specifications: [{ label: "Volume", value: "10,000 L" }],
      features: [{ text: "Inspection available" }],
      isFeatured: true,
    },
    "http://127.0.0.1:1337",
  );

  assert.equal(result.documentId, "eq-doc");
  assert.equal(result.category?.slug, "reactors");
  assert.equal(result.mainImage?.url, "http://127.0.0.1:1337/uploads/reactor.png");
  assert.equal(result.specifications[0].label, "Volume");
  assert.equal(result.features[0].text, "Inspection available");
});

test("normalizeEquipment supports Strapi attributes responses", () => {
  const result = normalizeEquipment(
    {
      id: 1,
      attributes: {
        title: "Mixer",
        slug: "mixer",
        reference: "PX-M-001",
        condition: "excellent",
        gallery: {
          data: [
            {
              id: 9,
              attributes: {
                url: "https://cdn.example.com/mixer.jpg",
              },
            },
          ],
        },
      },
    },
    "http://127.0.0.1:1337",
  );

  assert.equal(result.reference, "PX-M-001");
  assert.equal(result.condition, "excellent");
  assert.equal(result.gallery[0].url, "https://cdn.example.com/mixer.jpg");
});
