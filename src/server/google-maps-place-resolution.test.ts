import { describe, expect, it } from "vitest";
import { validateGoogleMapsUrl, type SupportedGoogleMapsUrl } from "./google-maps-url";
import { googleMapsUrlToPlaceResolutionInput } from "./google-maps-place-resolution";

function supported(url: string): SupportedGoogleMapsUrl {
  const result = validateGoogleMapsUrl(url);
  if (result.kind !== "supported") {
    throw new Error(`Unsupported test URL: ${url}`);
  }
  return result.value;
}

describe("googleMapsUrlToPlaceResolutionInput", () => {
  it("uses a human-readable Maps place path as text-search context", () => {
    expect(
      googleMapsUrlToPlaceResolutionInput(
        supported("https://www.google.com/maps/place/Natural+History+Museum/data=!opaque"),
      ),
    ).toEqual({ kind: "text-search", query: "Natural History Museum" });
  });

  it.each([
    ["https://maps.google.com/?q=Tower+Bridge", "Tower Bridge"],
    ["https://www.google.com/maps/search/?api=1&query=British+Museum", "British Museum"],
  ])("recognizes an explicit supported query form", (url, query) => {
    expect(googleMapsUrlToPlaceResolutionInput(supported(url))).toEqual({
      kind: "text-search",
      query,
    });
  });

  it("carries recognized coordinates alongside place context", () => {
    expect(
      googleMapsUrlToPlaceResolutionInput(
        supported("https://www.google.com/maps/place/Tate+Modern/@51.5076,-0.0994,17z/data=!opaque"),
      ),
    ).toEqual({
      kind: "text-search",
      query: "Tate Modern",
      coordinates: { latitude: 51.5076, longitude: -0.0994 },
    });
  });

  it("accepts only the documented api=1 query_place_id form as a direct Place ID", () => {
    expect(
      googleMapsUrlToPlaceResolutionInput(
        supported(
          "https://www.google.com/maps/search/?api=1&query=Tate+Modern&query_place_id=ChIJ123_test",
        ),
      ),
    ).toEqual({ kind: "place-id", placeId: "ChIJ123_test" });
  });

  it("ignores opaque data payloads and undocumented internal-looking IDs", () => {
    expect(
      googleMapsUrlToPlaceResolutionInput(
        supported("https://www.google.com/maps/place/Tate+Modern/data=!4m2!3m1!1sOpaqueInternalId"),
      ),
    ).toEqual({ kind: "text-search", query: "Tate Modern" });
    expect(
      googleMapsUrlToPlaceResolutionInput(
        supported("https://www.google.com/maps/search/?query=Tate&query_place_id=ChIJ_not_without_api"),
      ),
    ).toEqual({ kind: "text-search", query: "Tate" });
  });

  it("returns a typed insufficient result for an unresolved short link or opaque-only URL", () => {
    expect(
      googleMapsUrlToPlaceResolutionInput(supported("https://maps.app.goo.gl/test-token")),
    ).toEqual({ kind: "insufficient", reason: "short-link-unresolved" });
    expect(
      googleMapsUrlToPlaceResolutionInput(supported("https://www.google.com/maps/data=!opaque")),
    ).toEqual({ kind: "insufficient", reason: "unrecognized-context" });
  });
});
