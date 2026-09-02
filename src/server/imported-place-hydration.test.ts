import { describe, expect, it, vi } from "vitest";
import type { ImportedPlaceIdentity } from "@/domain/place-import";
import type { GooglePlaceDetails } from "./google-places-types";
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

function details(id: string, photos?: GooglePlaceDetails["photos"]): GooglePlaceDetails {
  return {
    id,
    displayName: "Tate Modern",
    formattedAddress: "Bankside, London SE1 9TG, UK",
    addressComponents: [{ longText: "United Kingdom", shortText: "GB", types: ["country"] }],
    location: { latitude: 51.5076, longitude: -0.0994 },
    primaryType: "museum",
    types: ["museum", "tourist_attraction"],
    googleMapsUri: "https://maps.google.com/?cid=123",
    ...(photos ? { photos } : {}),
  };
}

const photo = {
  name: "places/ChIJ_success/photos/AUc7tXX_photo_1",
  widthPx: 1600,
  heightPx: 1200,
  authorAttributions: [{
    displayName: "Google contributor",
    uri: "https://maps.google.com/maps/contrib/123",
    photoUri: "https://lh3.googleusercontent.com/a-/author-avatar",
  }],
  googleMapsUri: "https://www.google.com/maps/contrib/123/photo/456",
};

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
    expect(hydrated[1]).toMatchObject({
      source: "imported-google",
      id: "imported:018f47f5-4f43-7c8f-9f47-2b9ef863f484",
      recordId: "018f47f5-4f43-7c8f-9f47-2b9ef863f484",
      category: "shopping",
      name: "Lugar guardado",
      tags: [],
      media: { kind: "fallback", classification: "graphic-fallback" },
    });
  });

  it("maps the first provider-ranked photo URI, dimensions, source and authors transiently", async () => {
    const placePhoto = vi.fn(async () => ({
      photoUri: "https://lh3.googleusercontent.com/places/first-photo",
    }));
    const identity = identities[0];
    const hydrated = await hydrateImportedPlaceIdentities([identity], {
      placeDetails: async (id) => details(id, [photo, { ...photo, name: `${photo.name}_second` }]),
      placePhoto,
    });

    expect(placePhoto).toHaveBeenCalledTimes(1);
    expect(placePhoto).toHaveBeenCalledWith(photo.name);
    expect(hydrated[0].media).toEqual({
      src: "https://lh3.googleusercontent.com/places/first-photo",
      alt: "Foto de Tate Modern",
      width: 1600,
      height: 1200,
      focalPoint: "50% 50%",
      source: "Google Maps",
      sourceUrl: photo.googleMapsUri,
      kind: "photo",
      classification: "real-photo",
      googleMapsAttribution: {
        sourcePhotoUrl: photo.googleMapsUri,
        authors: [{
          displayName: "Google contributor",
          profileUrl: "https://maps.google.com/maps/contrib/123",
          avatarUrl: "https://lh3.googleusercontent.com/a-/author-avatar",
        }],
      },
    });
    expect(identity).toEqual(identities[0]);
    expect(Object.keys(identity)).not.toContain("photos");
  });

  it("uses the existing TRAZA fallback when no current photo exists", async () => {
    const placePhoto = vi.fn();
    const hydrated = await hydrateImportedPlaceIdentities([identities[0]], {
      placeDetails: async (id) => details(id),
      placePhoto,
    });
    expect(placePhoto).not.toHaveBeenCalled();
    expect(hydrated[0].media).toMatchObject({
      kind: "fallback",
      source: "TRAZA deterministic editorial fallback",
    });
  });

  it.each(["timeout", "api-error", "missing-uri"])(
    "keeps the imported place and falls back when Place Photos reports %s",
    async () => {
      const hydrated = await hydrateImportedPlaceIdentities([identities[0]], {
        placeDetails: async (id) => details(id, [photo]),
        placePhoto: async () => { throw new Error("photo unavailable"); },
      });
      expect(hydrated[0]).toMatchObject({
        name: "Tate Modern",
        media: { kind: "fallback", classification: "graphic-fallback" },
      });
    },
  );

  it("supports a valid provider photo with no author attribution", async () => {
    const hydrated = await hydrateImportedPlaceIdentities([identities[0]], {
      placeDetails: async (id) => details(id, [{ ...photo, authorAttributions: [] }]),
      placePhoto: async () => ({
        photoUri: "https://lh3.googleusercontent.com/places/no-author",
      }),
    });
    expect(hydrated[0].media?.googleMapsAttribution).toEqual({
      sourcePhotoUrl: photo.googleMapsUri,
      authors: [],
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
