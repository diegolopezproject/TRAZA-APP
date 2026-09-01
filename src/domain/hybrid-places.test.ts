import { describe, expect, it } from "vitest";
import type { Place } from "./models";
import { importedPlaceViewId } from "./place-import";
import { mergeHybridPlaces } from "./hybrid-places";

const local: Place = {
  id: "local-place",
  name: "Manual",
  category: "neighbourhood",
  status: "saved",
  tags: [],
  mapsQuery: "Manual, London",
};

describe("hybrid Guardados", () => {
  it("preserves local places and appends imported places deterministically", () => {
    const id = importedPlaceViewId("018f47f5-4f43-7c8f-8f47-2b9ef863f483");
    const merged = mergeHybridPlaces([local], [{
      source: "imported-google",
      id,
      recordId: "018f47f5-4f43-7c8f-8f47-2b9ef863f483",
      category: "attraction",
      name: "Imported",
      tags: ["Atracción"],
      mapsDestination: { kind: "canonical-url", value: "https://maps.google.com/?cid=1" },
    }]);
    expect(merged.map((place) => place.id)).toEqual(["local-place", id]);
    expect(merged[0]).toEqual(local);
    expect(merged[1]).toMatchObject({
      source: "imported-google",
      importedRecordId: "018f47f5-4f43-7c8f-8f47-2b9ef863f483",
      status: "saved",
    });
  });
});
