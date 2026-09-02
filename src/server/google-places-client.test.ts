import { describe, expect, it } from "vitest";
import {
  GOOGLE_PLACES_ENDPOINTS,
  GOOGLE_PLACES_FIELD_MASKS,
  GooglePlacesClient,
  GooglePlacesClientError,
  readGooglePlacesServerApiKey,
  type GooglePlacesHttpRequest,
  type GooglePlacesHttpResponse,
  type GooglePlacesHttpTransport,
} from "./google-places-client";

const FAKE_API_KEY = "FAKE_GOOGLE_PLACES_TEST_KEY";

const searchPlace = {
  id: "ChIJ_search_1",
  displayName: { text: "Tate Modern", languageCode: "en" },
  formattedAddress: "Bankside, London SE1 9TG, UK",
  location: { latitude: 51.5076, longitude: -0.0994 },
};

const placeDetails = {
  id: "ChIJ_details_1",
  displayName: { text: "Tate Modern", languageCode: "en" },
  formattedAddress: "Bankside, London SE1 9TG, UK",
  addressComponents: [
    { longText: "United Kingdom", shortText: "GB", types: ["country"] },
  ],
  location: { latitude: 51.5076, longitude: -0.0994 },
  primaryType: "art_museum",
  types: ["art_museum", "museum"],
  googleMapsUri: "https://maps.google.com/?cid=123",
};

const placePhoto = {
  name: "places/ChIJ_details_1/photos/AUc7tXX_photo_1",
  widthPx: 1600,
  heightPx: 1200,
  authorAttributions: [{
    displayName: "Google contributor",
    uri: "//maps.google.com/maps/contrib/123",
    photoUri: "//lh3.googleusercontent.com/a-/author-avatar",
  }],
  googleMapsUri: "https://www.google.com/maps/contrib/123/photo/456",
};

class FakeGoogleTransport implements GooglePlacesHttpTransport {
  calls: GooglePlacesHttpRequest[] = [];

  constructor(private readonly responses: readonly GooglePlacesHttpResponse[]) {}

  async request(request: GooglePlacesHttpRequest) {
    this.calls.push(request);
    const response = this.responses[this.calls.length - 1];
    if (!response) {
      throw new Error("Unexpected request");
    }
    return response;
  }
}

function jsonResponse(value: unknown, status = 200): GooglePlacesHttpResponse {
  return { status, json: async () => value };
}

describe("GooglePlacesClient Text Search", () => {
  it("constructs the Places API (New) POST with a minimal mask and fake internal key", async () => {
    const transport = new FakeGoogleTransport([jsonResponse({ places: [searchPlace] })]);
    const client = new GooglePlacesClient({ apiKey: FAKE_API_KEY, transport });

    await expect(client.textSearch({ query: "Tate Modern" })).resolves.toEqual([
      {
        id: "ChIJ_search_1",
        displayName: "Tate Modern",
        formattedAddress: "Bankside, London SE1 9TG, UK",
        location: { latitude: 51.5076, longitude: -0.0994 },
      },
    ]);

    const request = transport.calls[0];
    expect(request.url).toBe(GOOGLE_PLACES_ENDPOINTS.textSearch);
    expect(request.method).toBe("POST");
    expect(request.headers["X-Goog-FieldMask"]).toBe(GOOGLE_PLACES_FIELD_MASKS.textSearch);
    expect(request.headers["X-Goog-Api-Key"]).toBe(FAKE_API_KEY);
    expect(request.url).not.toContain(FAKE_API_KEY);
    expect(JSON.parse(request.body ?? "{}")).toMatchObject({
      textQuery: "Tate Modern",
      pageSize: 5,
      locationRestriction: { rectangle: { low: expect.any(Object), high: expect.any(Object) } },
    });
  });

  it("accepts a valid zero-result response", async () => {
    const client = new GooglePlacesClient({
      apiKey: FAKE_API_KEY,
      transport: new FakeGoogleTransport([jsonResponse({})]),
    });
    await expect(client.textSearch({ query: "No result" })).resolves.toEqual([]);
  });
});

describe("GooglePlacesClient Place Details", () => {
  it("constructs the Places API (New) GET with the details field mask", async () => {
    const transport = new FakeGoogleTransport([jsonResponse(placeDetails)]);
    const client = new GooglePlacesClient({ apiKey: FAKE_API_KEY, transport });

    await expect(client.placeDetails("ChIJ_details_1")).resolves.toMatchObject({
      id: "ChIJ_details_1",
      displayName: "Tate Modern",
      primaryType: "art_museum",
    });
    expect(transport.calls[0]).toMatchObject({
      url: `${GOOGLE_PLACES_ENDPOINTS.detailsBase}/ChIJ_details_1`,
      method: "GET",
      headers: {
        "X-Goog-Api-Key": FAKE_API_KEY,
        "X-Goog-FieldMask": GOOGLE_PLACES_FIELD_MASKS.details,
      },
    });
    expect(transport.calls[0].body).toBeUndefined();
  });

  it("parses current photo metadata and author attribution without persisting it", async () => {
    const transport = new FakeGoogleTransport([
      jsonResponse({ ...placeDetails, photos: [placePhoto] }),
    ]);
    const client = new GooglePlacesClient({ apiKey: FAKE_API_KEY, transport });

    await expect(client.placeDetails("ChIJ_details_1")).resolves.toMatchObject({
      photos: [{
        name: placePhoto.name,
        widthPx: 1600,
        heightPx: 1200,
        authorAttributions: [{
          displayName: "Google contributor",
          uri: "https://maps.google.com/maps/contrib/123",
          photoUri: "https://lh3.googleusercontent.com/a-/author-avatar",
        }],
        googleMapsUri: placePhoto.googleMapsUri,
      }],
    });
  });

  it("ignores malformed optional photo data while preserving valid place details", async () => {
    const transport = new FakeGoogleTransport([
      jsonResponse({
        ...placeDetails,
        photos: [{ ...placePhoto, authorAttributions: undefined }],
      }),
    ]);
    const client = new GooglePlacesClient({ apiKey: FAKE_API_KEY, transport });

    const parsed = await client.placeDetails("ChIJ_details_1");
    expect(parsed.displayName).toBe("Tate Modern");
    expect(parsed.photos).toBeUndefined();
  });
});

describe("GooglePlacesClient Place Photos", () => {
  it("requests a short-lived URI with bounded dimensions and keeps the key in a server header", async () => {
    const photoUri = "https://lh3.googleusercontent.com/places/photo=w1200-h1200";
    const transport = new FakeGoogleTransport([jsonResponse({ photoUri })]);
    const client = new GooglePlacesClient({ apiKey: FAKE_API_KEY, transport });

    await expect(client.placePhoto(placePhoto.name)).resolves.toEqual({ photoUri });
    const request = transport.calls[0];
    const url = new URL(request.url);
    expect(url.origin + url.pathname).toBe(
      `${GOOGLE_PLACES_ENDPOINTS.photoMediaBase}/${placePhoto.name}/media`,
    );
    expect(url.searchParams.get("maxWidthPx")).toBe("1200");
    expect(url.searchParams.get("maxHeightPx")).toBe("1200");
    expect(url.searchParams.get("skipHttpRedirect")).toBe("true");
    expect(request.headers["X-Goog-Api-Key"]).toBe(FAKE_API_KEY);
    expect(request.url).not.toContain(FAKE_API_KEY);
    expect(photoUri).not.toContain(FAKE_API_KEY);
  });

  it("rejects malformed names and non-Google short-lived photo URIs", async () => {
    const transport = new FakeGoogleTransport([
      jsonResponse({ photoUri: "https://evil.test/photo" }),
    ]);
    const client = new GooglePlacesClient({ apiKey: FAKE_API_KEY, transport });
    await expect(client.placePhoto("https://evil.test/photo")).rejects.toMatchObject({
      code: "invalid-response",
    });
    await expect(client.placePhoto(placePhoto.name)).rejects.toMatchObject({
      code: "invalid-response",
    });
    const missingUriClient = new GooglePlacesClient({
      apiKey: FAKE_API_KEY,
      transport: new FakeGoogleTransport([jsonResponse({})]),
    });
    await expect(missingUriClient.placePhoto(placePhoto.name)).rejects.toMatchObject({
      code: "invalid-response",
    });
  });
});

describe("GooglePlacesClient failures", () => {
  it("does not require a real key in tests and fails safely when server config is missing", () => {
    expect(() => readGooglePlacesServerApiKey({})).toThrowError(GooglePlacesClientError);
    expect(readGooglePlacesServerApiKey({ GOOGLE_MAPS_PLATFORM_API_KEY: FAKE_API_KEY })).toBe(
      FAKE_API_KEY,
    );
  });

  it("returns a typed timeout", async () => {
    const transport: GooglePlacesHttpTransport = {
      request: ({ signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => {
            const error = new Error("aborted");
            error.name = "AbortError";
            reject(error);
          });
        }),
    };
    const client = new GooglePlacesClient({ apiKey: FAKE_API_KEY, transport, timeoutMs: 5 });

    await expect(client.textSearch({ query: "Timeout" })).rejects.toMatchObject({ code: "timeout" });
  });

  it.each([400, 401, 429, 500, 503])("maps HTTP %i to a typed failure", async (status) => {
    const client = new GooglePlacesClient({
      apiKey: FAKE_API_KEY,
      transport: new FakeGoogleTransport([jsonResponse({ private: "raw-body" }, status)]),
    });
    await expect(client.textSearch({ query: "Error" })).rejects.toMatchObject({
      code: "http-error",
      status,
    });
  });

  it.each([
    { places: "not-an-array", privatePayload: "DO_NOT_LEAK_RAW_GOOGLE_BODY" },
    { places: [{ ...searchPlace, id: "invalid place id" }] },
    { places: [{ ...searchPlace, location: { latitude: "invalid", longitude: 0 } }] },
  ])("rejects malformed runtime response shapes without leaking the raw body", async (body) => {
    const client = new GooglePlacesClient({
      apiKey: FAKE_API_KEY,
      transport: new FakeGoogleTransport([jsonResponse(body)]),
    });
    try {
      await client.textSearch({ query: "Malformed" });
      throw new Error("Expected failure");
    } catch (error) {
      expect(error).toMatchObject({ code: "invalid-response" });
      expect((error as Error).message).not.toContain("DO_NOT_LEAK_RAW_GOOGLE_BODY");
      expect((error as Error).message).not.toContain(FAKE_API_KEY);
    }
  });

  it("rejects malformed JSON without exposing parser details", async () => {
    const client = new GooglePlacesClient({
      apiKey: FAKE_API_KEY,
      transport: new FakeGoogleTransport([
        { status: 200, json: async () => { throw new SyntaxError("secret raw response"); } },
      ]),
    });
    await expect(client.textSearch({ query: "Malformed JSON" })).rejects.toMatchObject({
      code: "invalid-response",
      message: "Google Places invalid-response",
    });
  });
});
