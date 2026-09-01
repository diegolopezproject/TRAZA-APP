import "server-only";

import type { NormalizedPlaceCandidate } from "../domain/place-import";
import {
  evaluateProductionGreaterLondonScope,
  type LondonScopeResult,
} from "../domain/london-scope";
import {
  prepareGoogleMapsPlaceImport,
  type GoogleMapsImportOrchestratorInput,
  type GoogleMapsImportPlacesClient,
  type PreparedPlaceImportOutcome,
} from "./google-maps-import-orchestrator";
import {
  createNativeGoogleMapsRedirectTransport,
  type GoogleMapsRedirectTransport,
} from "./google-maps-url-resolver";
import {
  createGooglePlacesClient,
  type GooglePlacesServerEnvironment,
} from "./google-places-client";

export interface GoogleMapsImportService {
  prepare(input: GoogleMapsImportOrchestratorInput): Promise<PreparedPlaceImportOutcome>;
}

export interface GoogleMapsImportServiceOptions {
  environment?: GooglePlacesServerEnvironment;
  redirectTransport?: GoogleMapsRedirectTransport;
  placesClient?: GoogleMapsImportPlacesClient;
  evaluateLondonScope?: (candidate: NormalizedPlaceCandidate) => LondonScopeResult;
}

/**
 * Production composition root for the pre-persistence Google import pipeline.
 * Every network-capable boundary remains injectable for offline tests and controlled validation.
 */
export function createGoogleMapsImportService(
  options: GoogleMapsImportServiceOptions = {},
): GoogleMapsImportService {
  const redirectTransport =
    options.redirectTransport ?? createNativeGoogleMapsRedirectTransport();
  const placesClient = options.placesClient ?? createGooglePlacesClient(options.environment);
  const evaluateLondonScope =
    options.evaluateLondonScope ?? evaluateProductionGreaterLondonScope;

  return {
    prepare(input) {
      return prepareGoogleMapsPlaceImport(input, {
        redirectTransport,
        placesClient,
        evaluateLondonScope,
      });
    },
  };
}
