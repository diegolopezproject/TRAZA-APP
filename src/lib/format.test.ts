import { describe, expect, it } from "vitest";
import { mapsDestinationUrl, mapsUrl, placeMapsUrl } from "./format";

describe("Maps destinations", () => {
  it("keeps the existing manual query helper byte-for-byte", () => {
    expect(mapsUrl("Tate Modern, London")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Tate%20Modern%2C%20London",
    );
  });

  it("uses a validated canonical Google Maps URI for imported places", () => {
    expect(
      placeMapsUrl({
        mapsDestination: { kind: "canonical-url", value: "https://maps.google.com/?cid=123" },
      }),
    ).toBe("https://maps.google.com/?cid=123");
  });

  it.each([
    "http://maps.google.com/?cid=1",
    "https://attacker.test/maps",
    "https://maps.google.com.evil.test/",
    "https://user@maps.google.com/",
  ])("rejects an unsafe canonical URI: %s", (value) => {
    expect(mapsDestinationUrl({ kind: "canonical-url", value })).toBeUndefined();
  });
});
