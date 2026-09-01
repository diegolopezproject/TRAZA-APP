import { isValidGeoPoint, type GeoPoint } from "../domain/geometry";
import type { SupportedGoogleMapsUrl } from "./google-maps-url";

export type GooglePlaceResolutionInput =
  | { kind: "place-id"; placeId: string }
  | { kind: "text-search"; query: string; coordinates?: GeoPoint }
  | { kind: "insufficient"; reason: "short-link-unresolved" | "unrecognized-context" };

const DOCUMENTED_PLACE_ID = /^[A-Za-z0-9_-]{3,255}$/u;
const COORDINATE_PATH = /@(-?\d{1,3}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)(?:,|\/|$)/u;
const SHARE_URL_TOKEN = /https:\/\/[^\s<>"'`]+/giu;
const SHARE_QUERY_MAX_LENGTH = 256;
const MAPS_SHARE_PREFIX = /^(?:(?:shared|sent)\s+(?:from|via)|compartido\s+(?:desde|mediante|a\s+trav[eé]s\s+de)|enviado\s+desde)\s+google\s+maps\s*(?:[-–—:|]\s*)?/iu;
const MAPS_ONLY = /^(?:google\s+maps|maps)$/iu;

function normalizedShareQuery(value: string | undefined): string | undefined {
  if (!value) return undefined;

  let query = value.replace(SHARE_URL_TOKEN, " ").replace(/\s+/gu, " ").trim();
  query = query.replace(MAPS_SHARE_PREFIX, "").trim();
  query = query.replace(/^[\s\-–—:|,.;]+|[\s\-–—:|,.;]+$/gu, "").trim();

  if (
    query.length < 2 ||
    query.length > SHARE_QUERY_MAX_LENGTH ||
    !/[\p{Letter}\p{Number}]/u.test(query) ||
    MAPS_ONLY.test(query)
  ) {
    return undefined;
  }
  return query;
}

function decodedPlaceName(pathname: string): string | undefined {
  const segments = pathname.split("/");
  const placeIndex = segments.indexOf("place");
  const encodedName = placeIndex >= 0 ? segments[placeIndex + 1] : undefined;
  if (!encodedName || encodedName.startsWith("data=")) {
    return undefined;
  }

  try {
    const name = decodeURIComponent(encodedName.replaceAll("+", " ")).trim();
    return name.length > 0 ? name : undefined;
  } catch {
    return undefined;
  }
}

function recognizedQuery(url: URL): string | undefined {
  const query = url.searchParams.get("query") ?? url.searchParams.get("q");
  const trimmed = query?.trim();
  return trimmed ? trimmed : undefined;
}

function recognizedCoordinates(pathname: string): GeoPoint | undefined {
  const match = COORDINATE_PATH.exec(pathname);
  if (!match) {
    return undefined;
  }

  const point = { latitude: Number(match[1]), longitude: Number(match[2]) };
  return isValidGeoPoint(point) ? point : undefined;
}

export function googleMapsUrlToPlaceResolutionInput(
  mapsUrl: SupportedGoogleMapsUrl,
): GooglePlaceResolutionInput {
  if (mapsUrl.remotelyResolvable) {
    return { kind: "insufficient", reason: "short-link-unresolved" };
  }

  const url = mapsUrl.url;
  const documentedPlaceId = url.searchParams.get("query_place_id")?.trim();
  if (
    url.searchParams.get("api") === "1" &&
    documentedPlaceId &&
    DOCUMENTED_PLACE_ID.test(documentedPlaceId)
  ) {
    return { kind: "place-id", placeId: documentedPlaceId };
  }

  const query = recognizedQuery(url) ?? decodedPlaceName(url.pathname);
  const coordinates = recognizedCoordinates(url.pathname);
  if (query) {
    return {
      kind: "text-search",
      query,
      ...(coordinates ? { coordinates } : {}),
    };
  }
  if (coordinates) {
    return {
      kind: "text-search",
      query: `${coordinates.latitude}, ${coordinates.longitude}`,
      coordinates,
    };
  }

  return { kind: "insufficient", reason: "unrecognized-context" };
}

/**
 * Derives provider-specific search context only after the caller has validated a Maps source.
 * URLs and common share boilerplate are excluded so untrusted transport data is never reflected.
 */
export function googleMapsShareContextToPlaceResolutionInput(input: {
  title?: string;
  text?: string;
}): GooglePlaceResolutionInput {
  const query = normalizedShareQuery(input.title) ?? normalizedShareQuery(input.text);
  return query
    ? { kind: "text-search", query }
    : { kind: "insufficient", reason: "unrecognized-context" };
}
