import { isValidGeoPoint, type GeoPoint } from "../domain/geometry";
import type { SupportedGoogleMapsUrl } from "./google-maps-url";

export type GooglePlaceResolutionInput =
  | { kind: "place-id"; placeId: string }
  | { kind: "text-search"; query: string; coordinates?: GeoPoint }
  | { kind: "insufficient"; reason: "short-link-unresolved" | "unrecognized-context" };

const DOCUMENTED_PLACE_ID = /^[A-Za-z0-9_-]{3,255}$/u;
const COORDINATE_PATH = /@(-?\d{1,3}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)(?:,|\/|$)/u;

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
