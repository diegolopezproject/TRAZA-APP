import greaterLondonBoundaryAsset from "../data/greater-london-boundary.json";
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
  crs: "EPSG:4326";
  geometry: BoundaryGeometry | null;
}

export const GREATER_LONDON_BOUNDARY_VERSION = "gla-greater-london-boundary-2025-03-13";
export const GREATER_LONDON_BOUNDARY_RUNTIME_CRS = "EPSG:4326";

export const GREATER_LONDON_BOUNDARY_SOURCE = {
  publisher: "Greater London Authority",
  portal: "London Datastore",
  dataset: "Statistical GIS Boundary Files for London",
  resource: "Greater London boundary",
  maintainer: "GLA GIS",
  license: "Open Government Licence v2",
} as const satisfies BoundarySourceMetadata;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLongitudeLatitude(value: unknown): value is readonly [number, number] {
  if (!Array.isArray(value) || value.length !== 2) {
    return false;
  }

  const [longitude, latitude] = value;
  return (
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90
  );
}

function isLinearRing(value: unknown): boolean {
  if (!Array.isArray(value) || value.length < 4 || !value.every(isLongitudeLatitude)) {
    return false;
  }

  const first = value[0];
  const last = value[value.length - 1];
  return first[0] === last[0] && first[1] === last[1];
}

function isPolygonCoordinates(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0 && value.every(isLinearRing);
}

function loadBoundaryGeometry(value: unknown): BoundaryGeometry | null {
  if (!isRecord(value)) {
    return null;
  }
  if (value.type === "Polygon" && isPolygonCoordinates(value.coordinates)) {
    return value as unknown as BoundaryGeometry;
  }
  if (
    value.type === "MultiPolygon" &&
    Array.isArray(value.coordinates) &&
    value.coordinates.length > 0 &&
    value.coordinates.every(isPolygonCoordinates)
  ) {
    return value as unknown as BoundaryGeometry;
  }
  return null;
}

function hasApprovedSourceMetadata(value: unknown): value is BoundarySourceMetadata {
  if (!isRecord(value)) {
    return false;
  }

  return Object.entries(GREATER_LONDON_BOUNDARY_SOURCE).every(
    ([key, expected]) => value[key] === expected,
  );
}

/** Loads only the reviewed, WGS84 runtime asset and rejects malformed or substituted data. */
export function loadGreaterLondonBoundaryAsset(
  value: unknown,
): VersionedGreaterLondonBoundary | null {
  if (
    !isRecord(value) ||
    value.id !== "greater-london" ||
    value.version !== GREATER_LONDON_BOUNDARY_VERSION ||
    value.crs !== GREATER_LONDON_BOUNDARY_RUNTIME_CRS ||
    !hasApprovedSourceMetadata(value.source)
  ) {
    return null;
  }

  const geometry = loadBoundaryGeometry(value.geometry);
  if (!geometry) {
    return null;
  }

  return {
    id: "greater-london",
    version: GREATER_LONDON_BOUNDARY_VERSION,
    source: GREATER_LONDON_BOUNDARY_SOURCE,
    crs: GREATER_LONDON_BOUNDARY_RUNTIME_CRS,
    geometry,
  };
}

const loadedGreaterLondonBoundary = loadGreaterLondonBoundaryAsset(greaterLondonBoundaryAsset);

export const GREATER_LONDON_BOUNDARY: VersionedGreaterLondonBoundary =
  loadedGreaterLondonBoundary ?? {
    id: "greater-london",
    version: GREATER_LONDON_BOUNDARY_VERSION,
    source: GREATER_LONDON_BOUNDARY_SOURCE,
    crs: GREATER_LONDON_BOUNDARY_RUNTIME_CRS,
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

/** Production evaluator for injection into the pre-persistence import orchestrator. */
export function evaluateProductionGreaterLondonScope(candidate: ScopeCandidate): LondonScopeResult {
  return validateGreaterLondonScope(candidate, GREATER_LONDON_BOUNDARY);
}
