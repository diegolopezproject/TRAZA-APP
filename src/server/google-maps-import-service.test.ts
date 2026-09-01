import { describe, expect, it, vi } from "vitest";
import type { LondonScopeResult } from "../domain/london-scope";
import type { GoogleMapsImportPlacesClient } from "./google-maps-import-orchestrator";
import { createGoogleMapsImportService } from "./google-maps-import-service";
import type { GoogleMapsRedirectTransport } from "./google-maps-url-resolver";
import { GooglePlacesClientError } from "./google-places-client";

const SHORT_LINK = "https://maps.app.goo.gl/EJoMkxSzVytZT5gB9?g_st=ac";
const FINAL_MAPS_URL =
  "https://www.google.com/maps/place/Westminster+Abbey/@51.4993,-0.1273,17z";

function createOfflineBoundaries() {
  const redirectTransport: GoogleMapsRedirectTransport = {
    resolveHop: vi.fn(async () => ({ status: 302, location: FINAL_MAPS_URL })),
  };
  const placesClient: GoogleMapsImportPlacesClient = {
    textSearch: vi.fn(async () => [
      {
        id: "ChIJ_fixture_westminster",
        displayName: "Westminster Abbey",
        formattedAddress: "Dean's Yard, London SW1P 3PA, UK",
        location: { latitude: 51.4993, longitude: -0.1273 },
      },
    ]),
    placeDetails: vi.fn(async () => ({
      id: "ChIJ_fixture_westminster",
      displayName: "Westminster Abbey",
      formattedAddress: "Dean's Yard, London SW1P 3PA, UK",
      addressComponents: [
        { longText: "United Kingdom", shortText: "GB", types: ["country"] },
      ],
      location: { latitude: 51.4993, longitude: -0.1273 },
      primaryType: "historical_landmark",
      types: ["historical_landmark", "tourist_attraction"],
      googleMapsUri: "https://maps.google.com/?cid=123",
    })),
  };

  return { redirectTransport, placesClient };
}

describe("createGoogleMapsImportService", () => {
  it("composes offline provider boundaries with the real Greater London evaluator", async () => {
    const boundaries = createOfflineBoundaries();
    const service = createGoogleMapsImportService(boundaries);

    await expect(service.prepare({ sharePayload: { url: SHORT_LINK } })).resolves.toEqual({
      kind: "ready-to-save",
      place: {
        provider: "google",
        externalPlaceId: "ChIJ_fixture_westminster",
        category: "attraction",
      },
      transient: {
        displayName: "Westminster Abbey",
        formattedAddress: "Dean's Yard, London SW1P 3PA, UK",
        googleMapsUri: "https://maps.google.com/?cid=123",
      },
    });
  });

  it("preserves an injected London evaluator as non-blocking context", async () => {
    const boundaries = createOfflineBoundaries();
    const evaluateLondonScope = vi.fn<() => LondonScopeResult>(() => ({
      kind: "outside",
      reason: "boundary",
    }));
    const service = createGoogleMapsImportService({
      ...boundaries,
      evaluateLondonScope,
    });

    await expect(service.prepare({ sharePayload: { url: SHORT_LINK } })).resolves.toMatchObject({
      kind: "ready-to-save",
      place: { externalPlaceId: "ChIJ_fixture_westminster", category: "attraction" },
    });
    expect(evaluateLondonScope).toHaveBeenCalledOnce();
  });

  it("fails at composition when the server credential is absent", () => {
    expect(() =>
      createGoogleMapsImportService({
        environment: {},
        redirectTransport: createOfflineBoundaries().redirectTransport,
      }),
    ).toThrowError(new GooglePlacesClientError("configuration"));
  });
});
