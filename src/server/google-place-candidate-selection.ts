import type { GeoPoint } from "../domain/geometry";
import type { GoogleTextSearchCandidate } from "./google-places-types";

export type GoogleCandidateSelectionResult =
  | {
      kind: "selected";
      candidate: GoogleTextSearchCandidate;
      evidence: "single" | "exact-name" | "coordinates";
    }
  | { kind: "failed"; reason: "no-candidates" | "identity-ambiguous" };

function normalizeIdentityText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("en-GB")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

function distanceMetres(left: GeoPoint, right: GeoPoint): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusMetres = 6_371_000;
  const latitudeDelta = toRadians(right.latitude - left.latitude);
  const longitudeDelta = toRadians(right.longitude - left.longitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(left.latitude)) *
      Math.cos(toRadians(right.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 2 * earthRadiusMetres * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function uniqueCoordinateMatch(
  candidates: readonly GoogleTextSearchCandidate[],
  coordinates: GeoPoint,
): GoogleTextSearchCandidate | null {
  const ordered = candidates
    .map((candidate) => ({ candidate, distance: distanceMetres(coordinates, candidate.location) }))
    .sort((left, right) => left.distance - right.distance || left.candidate.id.localeCompare(right.candidate.id));
  const nearest = ordered[0];
  const second = ordered[1];
  if (!nearest || nearest.distance > 250) {
    return null;
  }
  if (!second || second.distance - nearest.distance >= 150) {
    return nearest.candidate;
  }
  return null;
}

export function selectGoogleTextSearchCandidate(input: {
  query: string;
  coordinates?: GeoPoint;
  candidates: readonly GoogleTextSearchCandidate[];
}): GoogleCandidateSelectionResult {
  if (input.candidates.length === 0) {
    return { kind: "failed", reason: "no-candidates" };
  }
  if (input.candidates.length === 1) {
    return { kind: "selected", candidate: input.candidates[0], evidence: "single" };
  }

  const normalizedQuery = normalizeIdentityText(input.query);
  const exactMatches = input.candidates.filter(
    (candidate) => normalizeIdentityText(candidate.displayName) === normalizedQuery,
  );
  if (exactMatches.length === 1) {
    return { kind: "selected", candidate: exactMatches[0], evidence: "exact-name" };
  }

  if (input.coordinates) {
    const coordinateMatch = uniqueCoordinateMatch(
      exactMatches.length > 1 ? exactMatches : input.candidates,
      input.coordinates,
    );
    if (coordinateMatch) {
      return { kind: "selected", candidate: coordinateMatch, evidence: "coordinates" };
    }
  }

  return { kind: "failed", reason: "identity-ambiguous" };
}
