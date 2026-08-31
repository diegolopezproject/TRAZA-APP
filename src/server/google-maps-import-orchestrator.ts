import "server-only";

import type { GeoPoint } from "../domain/geometry";
import {
  classifyPlaceCategory,
  type PlaceCategoryClassification,
} from "../domain/place-category";
import type {
  ImportFailureReason,
  NormalizedPlaceCandidate,
  TrazaImportCategory,
} from "../domain/place-import";
import type { LondonScopeResult } from "../domain/london-scope";
import { googleMapsUrlToPlaceResolutionInput } from "./google-maps-place-resolution";
import {
  parseGoogleMapsSharePayload,
  type GoogleMapsShareParseResult,
  type GoogleMapsSharePayload,
} from "./google-maps-share-parser";
import {
  resolveGoogleMapsUrl,
  type GoogleMapsRedirectTransport,
  type GoogleMapsUrlResolutionResult,
} from "./google-maps-url-resolver";
import { selectGoogleTextSearchCandidate } from "./google-place-candidate-selection";
import {
  normalizeGooglePlaceDetails,
  type GooglePlacePresentationMetadata,
  type NormalizedGooglePlace,
} from "./google-place-normalizer";
import { GooglePlacesClientError } from "./google-places-client";
import type {
  GooglePlaceDetails,
  GoogleTextSearchCandidate,
} from "./google-places-types";

export interface GoogleMapsImportOrchestratorInput {
  sharePayload: GoogleMapsSharePayload;
}

/** Durable identity and TRAZA-owned state ready for the Phase 2 repository adapter. */
export interface PreparedImportedPlace {
  provider: "google";
  externalPlaceId: string;
  category: TrazaImportCategory;
}

export type PreparedPlaceImportOutcome =
  | {
      kind: "ready-to-save";
      place: PreparedImportedPlace;
      transient: GooglePlacePresentationMetadata;
    }
  | {
      kind: "needs-category";
      externalPlaceId: string;
      transient: GooglePlacePresentationMetadata;
    }
  | { kind: "outside-scope" }
  | { kind: "failed"; reason: ImportFailureReason };

export interface GoogleMapsImportPlacesClient {
  textSearch(input: {
    query: string;
    coordinates?: GeoPoint;
  }): Promise<readonly GoogleTextSearchCandidate[]>;
  placeDetails(placeId: string): Promise<GooglePlaceDetails>;
}

export interface GoogleMapsImportOrchestratorDependencies {
  redirectTransport: GoogleMapsRedirectTransport;
  placesClient: GoogleMapsImportPlacesClient;
  evaluateLondonScope(candidate: NormalizedPlaceCandidate): LondonScopeResult;
  normalizePlaceDetails?: (details: GooglePlaceDetails) => NormalizedGooglePlace;
  classifyCategory?: (candidate: NormalizedPlaceCandidate) => PlaceCategoryClassification;
}

type ShareFailure = Extract<GoogleMapsShareParseResult, { kind: "failed" }>;
type ResolverFailure = Extract<GoogleMapsUrlResolutionResult, { kind: "failed" }>;

function failed(reason: ImportFailureReason): PreparedPlaceImportOutcome {
  return { kind: "failed", reason };
}

function mapShareFailure(result: ShareFailure): ImportFailureReason {
  return result.reason === "unsupported-source" ? "unsupported-source" : "malformed-input";
}

function mapResolverFailure(result: ResolverFailure): ImportFailureReason {
  switch (result.reason) {
    case "not-resolvable":
    case "redirect-rejected":
      return "unsupported-source";
    case "missing-location":
    case "too-many-redirects":
    case "timeout":
    case "transport-failure":
      return "external-service-failure";
  }
}

function mapPlacesFailure(error: unknown): ImportFailureReason {
  return error instanceof GooglePlacesClientError && error.code === "invalid-response"
    ? "invalid-external-response"
    : "external-service-failure";
}

async function resolveCanonicalPlaceId(
  resolutionInput: ReturnType<typeof googleMapsUrlToPlaceResolutionInput>,
  placesClient: GoogleMapsImportPlacesClient,
): Promise<string | PreparedPlaceImportOutcome> {
  if (resolutionInput.kind === "place-id") {
    return resolutionInput.placeId;
  }
  if (resolutionInput.kind === "insufficient") {
    return failed("malformed-input");
  }

  let candidates: readonly GoogleTextSearchCandidate[];
  try {
    candidates = await placesClient.textSearch({
      query: resolutionInput.query,
      ...(resolutionInput.coordinates ? { coordinates: resolutionInput.coordinates } : {}),
    });
  } catch (error) {
    return failed(mapPlacesFailure(error));
  }

  const selection = selectGoogleTextSearchCandidate({
    query: resolutionInput.query,
    ...(resolutionInput.coordinates ? { coordinates: resolutionInput.coordinates } : {}),
    candidates,
  });
  return selection.kind === "selected"
    ? selection.candidate.id
    : failed("identity-ambiguous");
}

/**
 * Prepares a canonical Google import without persistence, UI state or real transport ownership.
 * Network-capable boundaries are supplied by the caller and are faked in Phase 3B tests.
 */
export async function prepareGoogleMapsPlaceImport(
  input: GoogleMapsImportOrchestratorInput,
  dependencies: GoogleMapsImportOrchestratorDependencies,
): Promise<PreparedPlaceImportOutcome> {
  const parsed = parseGoogleMapsSharePayload(input.sharePayload);
  if (parsed.kind === "failed") {
    return failed(mapShareFailure(parsed));
  }

  let resolved: GoogleMapsUrlResolutionResult;
  try {
    resolved = await resolveGoogleMapsUrl(parsed.mapsUrl, dependencies.redirectTransport);
  } catch {
    return failed("external-service-failure");
  }
  if (resolved.kind === "failed") {
    return failed(mapResolverFailure(resolved));
  }

  const resolutionInput = googleMapsUrlToPlaceResolutionInput(resolved.mapsUrl);
  const placeId = await resolveCanonicalPlaceId(resolutionInput, dependencies.placesClient);
  if (typeof placeId !== "string") {
    return placeId;
  }

  let details: GooglePlaceDetails;
  try {
    details = await dependencies.placesClient.placeDetails(placeId);
  } catch (error) {
    return failed(mapPlacesFailure(error));
  }

  let normalized: NormalizedGooglePlace;
  try {
    normalized = (dependencies.normalizePlaceDetails ?? normalizeGooglePlaceDetails)(details);
  } catch {
    return failed("invalid-external-response");
  }

  let londonScope: LondonScopeResult;
  try {
    londonScope = dependencies.evaluateLondonScope(normalized.candidate);
  } catch {
    return failed("invalid-external-response");
  }
  if (londonScope.kind === "outside") {
    return { kind: "outside-scope" };
  }
  if (londonScope.kind === "invalid-or-unknown") {
    return failed("invalid-external-response");
  }

  let classification: PlaceCategoryClassification;
  try {
    classification = (dependencies.classifyCategory ?? classifyPlaceCategory)(
      normalized.candidate,
    );
  } catch {
    return failed("invalid-external-response");
  }

  if (classification.kind === "ambiguous") {
    return {
      kind: "needs-category",
      externalPlaceId: normalized.candidate.externalPlaceId,
      transient: normalized.presentation,
    };
  }

  return {
    kind: "ready-to-save",
    place: {
      provider: "google",
      externalPlaceId: normalized.candidate.externalPlaceId,
      category: classification.category,
    },
    transient: normalized.presentation,
  };
}
