import { boundaryContainsPoint, isValidGeoPoint, type BoundaryGeometry } from "./geometry";
import type { NormalizedPlaceCandidate } from "./place-import";

export interface BoundarySourceMetadata {
  publisher: string;
  portal: string;
  dataset: string;
  resource: string;
  maintainer: string;
  license: string;
}

export interface VersionedGreaterLondonBoundary {
  id: "greater-london";
  version: string;
  source: BoundarySourceMetadata;
  geometry: BoundaryGeometry | null;
}

export const GREATER_LONDON_BOUNDARY_SOURCE = {
  publisher: "Greater London Authority",
  portal: "London Datastore",
  dataset: "Statistical GIS Boundary Files for London",
  resource: "Greater London boundary",
  maintainer: "GLA GIS",
  license: "Open Government Licence v2",
} as const satisfies BoundarySourceMetadata;

/** No production geometry is supplied until the approved authoritative asset is added. */
export const GREATER_LONDON_BOUNDARY: VersionedGreaterLondonBoundary = {
  id: "greater-london",
  version: "authoritative-asset-pending",
  source: GREATER_LONDON_BOUNDARY_SOURCE,
  geometry: null,
};

export type LondonScopeResult =
  | { kind: "inside" }
  | { kind: "outside"; reason: "country" | "boundary" }
  | {
      kind: "invalid-or-unknown";
      reason: "missing-country" | "missing-location" | "invalid-location" | "boundary-unavailable";
    };

type ScopeCandidate = Pick<NormalizedPlaceCandidate, "countryCode" | "location">;

export function validateGreaterLondonScope(
  candidate: ScopeCandidate,
  boundary: VersionedGreaterLondonBoundary = GREATER_LONDON_BOUNDARY,
): LondonScopeResult {
  const countryCode = candidate.countryCode?.trim().toUpperCase();
  if (!countryCode) {
    return { kind: "invalid-or-unknown", reason: "missing-country" };
  }
  if (countryCode !== "GB" && countryCode !== "UK") {
    return { kind: "outside", reason: "country" };
  }
  if (!candidate.location) {
    return { kind: "invalid-or-unknown", reason: "missing-location" };
  }
  if (!isValidGeoPoint(candidate.location)) {
    return { kind: "invalid-or-unknown", reason: "invalid-location" };
  }
  if (!boundary.geometry) {
    return { kind: "invalid-or-unknown", reason: "boundary-unavailable" };
  }
  if (!boundaryContainsPoint(boundary.geometry, candidate.location)) {
    return { kind: "outside", reason: "boundary" };
  }

  return { kind: "inside" };
}
