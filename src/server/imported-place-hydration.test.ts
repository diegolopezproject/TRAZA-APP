import { describe, expect, it, vi } from "vitest";
import type { ImportedPlaceIdentity } from "@/domain/place-import";
import {
  hydrateImportedPlaceIdentities,
  loadImportedPlacesForInstallation,
} from "./imported-place-hydration";

const identities: ImportedPlaceIdentity[] = [
  {
    recordId: "018f47f5-4f43-7c8f-8f47-2b9ef863f483",
    provider: "google",
    externalPlaceId: "ChIJ_success",
    category: "museum-culture",
    tripId: "london-2026",
  },
  {
    recordId: "018f47f5-4f43-7c8f-9f47-2b9ef863f484",
    provider: "google",
    externalPlaceId: "ChIJ_failure",
    category: "shopping",
    tripId: "london-2026",
  },
];

function details(id: string) {
  return {
    id,
    displayName: "Tate Modern",
    formattedAddress: "Bankside, London SE1 9TG, UK",
    addressComponents: [{ longText: "United Kingdom", shortText: "GB", types: ["country"] }],
    location: { latitude: 51.5076, longitude: -0.0994 },
    primaryType: "museum",
    types: ["museum", "tourist_attraction"],
    googleMapsUri: "https://maps.google.com/?cid=123",
  };
}

describe("imported place hydration", () => {
  it("isolates one hydration failure and preserves its relationship as a fallback card", async () => {
    const placeDetails = vi.fn(async (id: string) => {
      if (id === "ChIJ_failure") throw new Error("provider failure");
      return details(id);
    });
    const hydrated = await hydrateImportedPlaceIdentities(identities, { placeDetails });
    expect(hydrated[0]).toMatchObject({
      id: "imported:018f47f5-4f43-7c8f-8f47-2b9ef863f483",
      name: "Tate Modern",
      tags: ["Museo", "Atracción"],
      mapsDestination: { kind: "canonical-url" },
    });
    expect(hydrated[1]).toEqual({
      source: "imported-google",
      id: "imported:018f47f5-4f43-7c8f-9f47-2b9ef863f484",
      recordId: "018f47f5-4f43-7c8f-9f47-2b9ef863f484",
      category: "shopping",
      name: "Lugar guardado",
      tags: [],
    });
  });

  it("lists by installation and london trip before hydration", async () => {
    const list = vi.fn(async () => ({ kind: "success" as const, places: identities.slice(0, 1) }));
    await loadImportedPlacesForInstallation("installation", {
      repository: { list },
      placesClient: { placeDetails: async (id) => details(id) },
    });
    expect(list).toHaveBeenCalledWith({ installationId: "installation", tripId: "london-2026" });
  });
});
