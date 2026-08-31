import { describe, expect, it } from "vitest";
import { normalizeGooglePlaceDetails } from "./google-place-normalizer";
import type { GooglePlaceDetails } from "./google-places-types";

const details: GooglePlaceDetails = {
  id: "ChIJ_details_1",
  displayName: "Tate Modern",
  formattedAddress: "Bankside, London SE1 9TG, UK",
  addressComponents: [
    { longText: "United Kingdom", shortText: "gb", types: ["country"] },
  ],
  location: { latitude: 51.5076, longitude: -0.0994 },
  primaryType: "art_museum",
  types: ["art_museum", "museum"],
  googleMapsUri: "https://maps.google.com/?cid=123",
};

describe("normalizeGooglePlaceDetails", () => {
  it("adapts validated Google details into the Phase 1 provider-neutral candidate", () => {
    expect(normalizeGooglePlaceDetails(details)).toEqual({
      candidate: {
        provider: "google",
        externalPlaceId: "ChIJ_details_1",
        location: { latitude: 51.5076, longitude: -0.0994 },
        countryCode: "GB",
        primaryType: "art_museum",
        types: ["art_museum", "museum"],
      },
      presentation: {
        displayName: "Tate Modern",
        formattedAddress: "Bankside, London SE1 9TG, UK",
        googleMapsUri: "https://maps.google.com/?cid=123",
      },
    });
  });

  it("keeps Google presentation metadata separate and does not persist anything", () => {
    const normalized = normalizeGooglePlaceDetails({ ...details, addressComponents: [] });
    expect(normalized.candidate.countryCode).toBeUndefined();
    expect(Object.keys(normalized.candidate)).not.toContain("displayName");
    expect(Object.keys(normalized.candidate)).not.toContain("formattedAddress");
    expect(Object.keys(normalized.candidate)).not.toContain("googleMapsUri");
  });
});
