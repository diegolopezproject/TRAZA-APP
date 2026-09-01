import { describe, expect, it, vi } from "vitest";
import { classifyPlaceCategory } from "../domain/place-category";
import type { NormalizedPlaceCandidate } from "../domain/place-import";
import type { LondonScopeResult } from "../domain/london-scope";
import {
  prepareGoogleMapsPlaceImport,
  type GoogleMapsImportOrchestratorDependencies,
  type GoogleMapsImportPlacesClient,
} from "./google-maps-import-orchestrator";
import type { GoogleMapsRedirectTransport } from "./google-maps-url-resolver";
import { normalizeGooglePlaceDetails } from "./google-place-normalizer";
import { GooglePlacesClientError } from "./google-places-client";
import type {
  GooglePlaceDetails,
  GoogleTextSearchCandidate,
} from "./google-places-types";

const FIXTURE_A = "https://maps.app.goo.gl/EJoMkxSzVytZT5gB9?g_st=ac";
const FIXTURE_B = "https://maps.app.goo.gl/LQMKg8hE9XopoSa68";
const FIXTURE_C = "https://maps.app.goo.gl/NjSorR34a7x1QLqV8?g_st=ac";
const FALLBACK_FIXTURE = "https://maps.app.goo.gl/Ux3ZEovmVFPLA1Ja7?g_st=ac";
const TEXT_SEARCH_FINAL_URL =
  "https://www.google.com/maps/place/Tate+Modern/@51.5076,-0.0994,17z";
const DIRECT_PLACE_ID = "ChIJ_direct_1";
const DIRECT_PLACE_ID_URL =
  `https://www.google.com/maps/search/?api=1&query=Tate+Modern&query_place_id=${DIRECT_PLACE_ID}`;

function searchCandidate(
  id = "ChIJ_text_1",
  displayName = "Tate Modern",
): GoogleTextSearchCandidate {
  return {
    id,
    displayName,
    formattedAddress: `${displayName}, London, UK`,
    location: { latitude: 51.5076, longitude: -0.0994 },
  };
}

function placeDetails(overrides: Partial<GooglePlaceDetails> = {}): GooglePlaceDetails {
  return {
    id: "ChIJ_text_1",
    displayName: "Tate Modern",
    formattedAddress: "Bankside, London SE1 9TG, UK",
    addressComponents: [
      { longText: "United Kingdom", shortText: "GB", types: ["country"] },
    ],
    location: { latitude: 51.5076, longitude: -0.0994 },
    primaryType: "museum",
    types: ["museum", "tourist_attraction"],
    googleMapsUri: "https://maps.google.com/?cid=123",
    ...overrides,
  };
}

type LondonEvaluator = (candidate: NormalizedPlaceCandidate) => LondonScopeResult;

function createHarness() {
  const resolveHop = vi.fn<GoogleMapsRedirectTransport["resolveHop"]>(async () => ({
    status: 302,
    location: TEXT_SEARCH_FINAL_URL,
  }));
  const textSearch = vi.fn<GoogleMapsImportPlacesClient["textSearch"]>(async () => [
    searchCandidate(),
  ]);
  const details = vi.fn<GoogleMapsImportPlacesClient["placeDetails"]>(async () =>
    placeDetails(),
  );
  const evaluateLondonScope = vi.fn<LondonEvaluator>(() => ({ kind: "inside" }));
  const normalizePlaceDetails = vi.fn<typeof normalizeGooglePlaceDetails>((value) =>
    normalizeGooglePlaceDetails(value),
  );
  const classifyCategory = vi.fn<typeof classifyPlaceCategory>((candidate) =>
    classifyPlaceCategory(candidate),
  );

  const dependencies: GoogleMapsImportOrchestratorDependencies = {
    redirectTransport: { resolveHop },
    placesClient: { textSearch, placeDetails: details },
    evaluateLondonScope,
    normalizePlaceDetails,
    classifyCategory,
  };

  return {
    dependencies,
    resolveHop,
    textSearch,
    placeDetails: details,
    evaluateLondonScope,
    normalizePlaceDetails,
    classifyCategory,
  };
}

describe("prepareGoogleMapsPlaceImport", () => {
  it("continues through strict Text Search when a validated short link has an availability failure", async () => {
    const harness = createHarness();
    harness.resolveHop.mockResolvedValue({ status: 404, location: null });
    harness.textSearch.mockResolvedValue([searchCandidate("ChIJ_flat_iron", "Flat Iron")]);
    harness.placeDetails.mockResolvedValue(placeDetails({
      id: "ChIJ_flat_iron",
      displayName: "Flat Iron",
      primaryType: "restaurant",
      types: ["restaurant", "food", "establishment"],
    }));

    const result = await prepareGoogleMapsPlaceImport(
      {
        sharePayload: {
          title: "Shared from Google Maps — Flat Iron",
          text: `Flat Iron, 17 Beak Street ${FALLBACK_FIXTURE}`,
          url: FALLBACK_FIXTURE,
        },
      },
      harness.dependencies,
    );

    expect(result).toMatchObject({
      kind: "ready-to-save",
      place: { externalPlaceId: "ChIJ_flat_iron", category: "food-drink" },
    });
    expect(harness.textSearch).toHaveBeenCalledWith({ query: "Flat Iron" });
    expect(harness.placeDetails).toHaveBeenCalledWith("ChIJ_flat_iron");
    expect(JSON.stringify(result)).not.toContain("17 Beak Street");
    expect(JSON.stringify(result)).not.toContain(FALLBACK_FIXTURE);
  });

  it("uses useful share text when title is absent after a validated short-link availability failure", async () => {
    const harness = createHarness();
    harness.resolveHop.mockResolvedValue({ status: 404, location: null });

    await prepareGoogleMapsPlaceImport(
      { sharePayload: { text: `Flat Iron, 17 Beak Street\n${FALLBACK_FIXTURE}` } },
      harness.dependencies,
    );

    expect(harness.textSearch).toHaveBeenCalledWith({
      query: "Flat Iron, 17 Beak Street",
    });
  });

  it("does not use share fallback after an attacker redirect", async () => {
    const harness = createHarness();
    harness.resolveHop.mockResolvedValue({
      status: 302,
      location: "https://attacker.test/maps/place/Flat+Iron",
    });

    await expect(
      prepareGoogleMapsPlaceImport(
        { sharePayload: { title: "Flat Iron", url: FALLBACK_FIXTURE } },
        harness.dependencies,
      ),
    ).resolves.toEqual({ kind: "failed", reason: "unsupported-source" });
    expect(harness.textSearch).not.toHaveBeenCalled();
  });

  it("does not make an unsupported source eligible through title-only fallback", async () => {
    const harness = createHarness();

    await expect(
      prepareGoogleMapsPlaceImport(
        { sharePayload: { title: "Flat Iron", url: "https://attacker.test/place" } },
        harness.dependencies,
      ),
    ).resolves.toEqual({ kind: "failed", reason: "unsupported-source" });
    expect(harness.resolveHop).not.toHaveBeenCalled();
    expect(harness.textSearch).not.toHaveBeenCalled();
  });

  it("keeps fallback Text Search identity-ambiguous instead of choosing the first result", async () => {
    const harness = createHarness();
    harness.resolveHop.mockResolvedValue({ status: 404, location: null });
    harness.textSearch.mockResolvedValue([
      searchCandidate("ChIJ_first", "Flat Iron Soho"),
      searchCandidate("ChIJ_second", "Flat Iron Covent Garden"),
    ]);

    await expect(
      prepareGoogleMapsPlaceImport(
        { sharePayload: { title: "Flat Iron", url: FALLBACK_FIXTURE } },
        harness.dependencies,
      ),
    ).resolves.toEqual({ kind: "failed", reason: "identity-ambiguous" });
    expect(harness.placeDetails).not.toHaveBeenCalled();
  });

  it("prepares a Text Search import end-to-end from observed Fixture A", async () => {
    const harness = createHarness();

    const result = await prepareGoogleMapsPlaceImport(
      { sharePayload: { url: FIXTURE_A } },
      harness.dependencies,
    );

    expect(result).toEqual({
      kind: "ready-to-save",
      place: {
        provider: "google",
        externalPlaceId: "ChIJ_text_1",
        category: "museum-culture",
      },
      transient: {
        displayName: "Tate Modern",
        formattedAddress: "Bankside, London SE1 9TG, UK",
        googleMapsUri: "https://maps.google.com/?cid=123",
      },
    });
    expect(harness.resolveHop).toHaveBeenCalledTimes(1);
    expect(harness.textSearch).toHaveBeenCalledWith({
      query: "Tate Modern",
      coordinates: { latitude: 51.5076, longitude: -0.0994 },
    });
    expect(harness.placeDetails).toHaveBeenCalledWith("ChIJ_text_1");
    expect(harness.evaluateLondonScope).toHaveBeenCalledTimes(1);
    expect(harness.classifyCategory).toHaveBeenCalledTimes(1);

    if (result.kind !== "ready-to-save") {
      throw new Error("Expected ready-to-save outcome");
    }
    expect(Object.keys(result.place).sort()).toEqual([
      "category",
      "externalPlaceId",
      "provider",
    ]);
    expect(Object.keys(result.transient).sort()).toEqual([
      "displayName",
      "formattedAddress",
      "googleMapsUri",
    ]);
    expect(result).not.toHaveProperty("recordId");
    expect(Object.keys(harness.dependencies)).not.toContain("repository");
  });

  it("uses a documented direct Place ID and skips Text Search and redirect transport", async () => {
    const harness = createHarness();
    harness.placeDetails.mockResolvedValue(placeDetails({ id: DIRECT_PLACE_ID }));

    const result = await prepareGoogleMapsPlaceImport(
      { sharePayload: { url: DIRECT_PLACE_ID_URL } },
      harness.dependencies,
    );

    expect(result).toMatchObject({
      kind: "ready-to-save",
      place: { externalPlaceId: DIRECT_PLACE_ID, category: "museum-culture" },
    });
    expect(harness.resolveHop).not.toHaveBeenCalled();
    expect(harness.textSearch).not.toHaveBeenCalled();
    expect(harness.placeDetails).toHaveBeenCalledOnce();
    expect(harness.placeDetails).toHaveBeenCalledWith(DIRECT_PLACE_ID);
  });

  it("treats outside Greater London as context and continues to classification", async () => {
    const harness = createHarness();
    harness.placeDetails.mockResolvedValue(placeDetails({ id: DIRECT_PLACE_ID }));
    harness.evaluateLondonScope.mockReturnValue({ kind: "outside", reason: "boundary" });

    await expect(
      prepareGoogleMapsPlaceImport(
        { sharePayload: { url: DIRECT_PLACE_ID_URL } },
        harness.dependencies,
      ),
    ).resolves.toMatchObject({
      kind: "ready-to-save",
      place: { externalPlaceId: DIRECT_PLACE_ID, category: "museum-culture" },
    });

    expect(harness.normalizePlaceDetails).toHaveBeenCalledTimes(1);
    expect(harness.classifyCategory).toHaveBeenCalledTimes(1);
  });

  it("returns needs-category with canonical identity and transient metadata for Fixture C", async () => {
    const harness = createHarness();
    harness.placeDetails.mockResolvedValue(
      placeDetails({
        id: "ChIJ_ambiguous_category",
        primaryType: "unknown_primary",
        types: ["unknown_secondary"],
      }),
    );

    const result = await prepareGoogleMapsPlaceImport(
      { sharePayload: { url: FIXTURE_C } },
      harness.dependencies,
    );

    expect(result).toEqual({
      kind: "needs-category",
      externalPlaceId: "ChIJ_ambiguous_category",
      transient: {
        displayName: "Tate Modern",
        formattedAddress: "Bankside, London SE1 9TG, UK",
        googleMapsUri: "https://maps.google.com/?cid=123",
      },
    });
    expect(result).not.toHaveProperty("recordId");
  });

  it("fails identity-ambiguous without requesting Details", async () => {
    const harness = createHarness();
    harness.textSearch.mockResolvedValue([
      searchCandidate("ChIJ_first", "Museum One"),
      searchCandidate("ChIJ_second", "Museum Two"),
    ]);

    await expect(
      prepareGoogleMapsPlaceImport(
        { sharePayload: { url: "https://www.google.com/maps/place/Museum" } },
        harness.dependencies,
      ),
    ).resolves.toEqual({ kind: "failed", reason: "identity-ambiguous" });

    expect(harness.placeDetails).not.toHaveBeenCalled();
    expect(harness.normalizePlaceDetails).not.toHaveBeenCalled();
    expect(harness.evaluateLondonScope).not.toHaveBeenCalled();
    expect(harness.classifyCategory).not.toHaveBeenCalled();
  });

  it("fails an unsupported share before resolver or Places boundaries", async () => {
    const harness = createHarness();

    await expect(
      prepareGoogleMapsPlaceImport(
        { sharePayload: { text: "No hay ningún enlace compatible" } },
        harness.dependencies,
      ),
    ).resolves.toEqual({ kind: "failed", reason: "unsupported-source" });

    expect(harness.resolveHop).not.toHaveBeenCalled();
    expect(harness.textSearch).not.toHaveBeenCalled();
    expect(harness.placeDetails).not.toHaveBeenCalled();
  });

  it("maps a rejected Fixture B resolution safely and stops before Places", async () => {
    const harness = createHarness();
    harness.resolveHop.mockResolvedValue({
      status: 302,
      location: "https://attacker.test/maps/place/Private",
    });

    await expect(
      prepareGoogleMapsPlaceImport(
        { sharePayload: { url: FIXTURE_B } },
        harness.dependencies,
      ),
    ).resolves.toEqual({ kind: "failed", reason: "unsupported-source" });

    expect(harness.resolveHop).toHaveBeenCalledTimes(1);
    expect(harness.textSearch).not.toHaveBeenCalled();
    expect(harness.placeDetails).not.toHaveBeenCalled();
  });

  it("maps a Google Text Search transport failure safely", async () => {
    const harness = createHarness();
    harness.textSearch.mockRejectedValue(new GooglePlacesClientError("transport"));

    await expect(
      prepareGoogleMapsPlaceImport(
        { sharePayload: { url: "https://www.google.com/maps/place/Tate+Modern" } },
        harness.dependencies,
      ),
    ).resolves.toEqual({ kind: "failed", reason: "external-service-failure" });

    expect(harness.placeDetails).not.toHaveBeenCalled();
    expect(harness.evaluateLondonScope).not.toHaveBeenCalled();
  });

  it("maps a Google Details invalid response safely", async () => {
    const harness = createHarness();
    harness.placeDetails.mockRejectedValue(new GooglePlacesClientError("invalid-response"));

    await expect(
      prepareGoogleMapsPlaceImport(
        { sharePayload: { url: DIRECT_PLACE_ID_URL } },
        harness.dependencies,
      ),
    ).resolves.toEqual({ kind: "failed", reason: "invalid-external-response" });

    expect(harness.textSearch).not.toHaveBeenCalled();
    expect(harness.normalizePlaceDetails).not.toHaveBeenCalled();
    expect(harness.evaluateLondonScope).not.toHaveBeenCalled();
  });

  it("maps a normalization failure safely and stops before London evaluation", async () => {
    const harness = createHarness();
    harness.placeDetails.mockResolvedValue(placeDetails({ id: DIRECT_PLACE_ID }));
    harness.normalizePlaceDetails.mockImplementation(() => {
      throw new Error("unsafe raw provider detail");
    });

    await expect(
      prepareGoogleMapsPlaceImport(
        { sharePayload: { url: DIRECT_PLACE_ID_URL } },
        harness.dependencies,
      ),
    ).resolves.toEqual({ kind: "failed", reason: "invalid-external-response" });

    expect(harness.evaluateLondonScope).not.toHaveBeenCalled();
    expect(harness.classifyCategory).not.toHaveBeenCalled();
  });

  it("fails safely when the authoritative London boundary is unavailable", async () => {
    const harness = createHarness();
    harness.placeDetails.mockResolvedValue(placeDetails({ id: DIRECT_PLACE_ID }));
    harness.evaluateLondonScope.mockReturnValue({
      kind: "invalid-or-unknown",
      reason: "boundary-unavailable",
    });

    await expect(
      prepareGoogleMapsPlaceImport(
        { sharePayload: { url: DIRECT_PLACE_ID_URL } },
        harness.dependencies,
      ),
    ).resolves.toEqual({ kind: "failed", reason: "invalid-external-response" });

    expect(harness.classifyCategory).not.toHaveBeenCalled();
  });

  it("produces equivalent canonical identity for repeated equivalent inputs", async () => {
    const firstHarness = createHarness();
    const secondHarness = createHarness();

    const first = await prepareGoogleMapsPlaceImport(
      { sharePayload: { url: FIXTURE_A } },
      firstHarness.dependencies,
    );
    const second = await prepareGoogleMapsPlaceImport(
      { sharePayload: { text: `Compartido desde Maps: ${FIXTURE_A}` } },
      secondHarness.dependencies,
    );

    expect(first).toMatchObject({ kind: "ready-to-save" });
    expect(second).toMatchObject({ kind: "ready-to-save" });
    if (first.kind !== "ready-to-save" || second.kind !== "ready-to-save") {
      throw new Error("Expected equivalent prepared outcomes");
    }
    expect(second.place).toEqual(first.place);
  });
});
