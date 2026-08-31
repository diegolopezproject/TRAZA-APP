import { describe, expect, it } from "vitest";
import { classifyPlaceCategory, factualPlaceTags } from "./place-category";

describe("classifyPlaceCategory", () => {
  it.each([
    ["restaurant", "food-drink"],
    ["cafe", "food-drink"],
    ["bakery", "food-drink"],
    ["bar", "food-drink"],
    ["pub", "food-drink"],
    ["pizza_restaurant", "food-drink"],
    ["museum", "museum-culture"],
    ["art_gallery", "museum-culture"],
    ["store", "shopping"],
    ["shopping_mall", "shopping"],
    ["clothing_store", "shopping"],
    ["book_store", "shopping"],
    ["tourist_attraction", "attraction"],
    ["park", "attraction"],
    ["landmark", "attraction"],
    ["neighborhood", "attraction"],
  ] as const)("maps the reviewed %s type to %s", (type, category) => {
    expect(classifyPlaceCategory({ primaryType: type, types: [] })).toEqual({
      kind: "classified",
      category,
    });
  });

  it("gives a recognized primary type precedence over conflicting secondary types", () => {
    expect(
      classifyPlaceCategory({
        primaryType: "museum",
        types: ["museum", "store", "restaurant"],
      }),
    ).toEqual({ kind: "classified", category: "museum-culture" });
  });

  it("uses secondary types when the primary type is unknown", () => {
    expect(
      classifyPlaceCategory({
        primaryType: "unknown_primary",
        types: ["cafe", "restaurant", "unknown_secondary"],
      }),
    ).toEqual({ kind: "classified", category: "food-drink" });
  });

  it("returns ambiguous when recognized secondary types cross categories", () => {
    expect(
      classifyPlaceCategory({ primaryType: "unknown_primary", types: ["museum", "store"] }),
    ).toEqual({ kind: "ambiguous" });
  });

  it.each([
    {},
    { primaryType: undefined, types: [] },
    { primaryType: "unknown_primary", types: ["unknown_secondary"] },
    { primaryType: "mystery_store", types: [] },
    { primaryType: "neighbourhood", types: [] },
  ])("returns ambiguous for missing or unreviewed types", (candidate) => {
    expect(classifyPlaceCategory(candidate)).toEqual({ kind: "ambiguous" });
  });

  it("never emits the legacy neighbourhood category", () => {
    const results = [
      classifyPlaceCategory({ primaryType: "neighborhood", types: [] }),
      classifyPlaceCategory({ primaryType: "neighbourhood", types: [] }),
    ];

    expect(JSON.stringify(results)).not.toContain('"category":"neighbourhood"');
  });
});

describe("factualPlaceTags", () => {
  it("returns at most two allow-listed factual tags in primary-first order", () => {
    expect(
      factualPlaceTags({ primaryType: "restaurant", types: ["restaurant", "cafe", "bakery"] }),
    ).toEqual(["Restaurante", "Cafetería"]);
  });

  it("deduplicates equivalent factual labels", () => {
    expect(factualPlaceTags({ primaryType: "cafe", types: ["coffee_shop", "cafe"] })).toEqual([
      "Cafetería",
    ]);
  });

  it("does not derive tags from unknown or editorial-looking types", () => {
    expect(
      factualPlaceTags({ primaryType: "hidden_gem", types: ["romantic", "must_see"] }),
    ).toEqual([]);
  });
});
