import "server-only";

import { isValidGeoPoint, type GeoPoint } from "../domain/geometry";
import type {
  GoogleAddressComponent,
  GooglePlaceDetails,
  GoogleTextSearchCandidate,
} from "./google-places-types";

export const GOOGLE_PLACES_ENDPOINTS = {
  textSearch: "https://places.googleapis.com/v1/places:searchText",
  detailsBase: "https://places.googleapis.com/v1/places",
} as const;

export const GOOGLE_PLACES_FIELD_MASKS = {
  textSearch: "places.id,places.displayName,places.formattedAddress,places.location",
  details:
    "id,displayName,formattedAddress,addressComponents,location,primaryType,types,googleMapsUri",
} as const;

export const GOOGLE_TEXT_SEARCH_LONDON_RESTRICTION = {
  rectangle: {
    low: { latitude: 51.2868, longitude: -0.5104 },
    high: { latitude: 51.6919, longitude: 0.334 },
  },
} as const;

export type GooglePlacesClientErrorCode =
  | "configuration"
  | "timeout"
  | "transport"
  | "http-error"
  | "invalid-response";

export class GooglePlacesClientError extends Error {
  constructor(
    readonly code: GooglePlacesClientErrorCode,
    readonly status?: number,
  ) {
    super(code === "http-error" ? "Google Places request failed" : `Google Places ${code}`);
    this.name = "GooglePlacesClientError";
  }
}

export interface GooglePlacesHttpRequest {
  url: string;
  method: "GET" | "POST";
  headers: Readonly<Record<string, string>>;
  body?: string;
  signal: AbortSignal;
}

export interface GooglePlacesHttpResponse {
  status: number;
  json(): Promise<unknown>;
}

export interface GooglePlacesHttpTransport {
  request(request: GooglePlacesHttpRequest): Promise<GooglePlacesHttpResponse>;
}

export interface GooglePlacesClientOptions {
  apiKey: string;
  transport: GooglePlacesHttpTransport;
  timeoutMs?: number;
}

export type GooglePlacesServerEnvironment = Readonly<Record<string, string | undefined>>;

const DEFAULT_TIMEOUT_MS = 4_000;
const PLACE_ID = /^[A-Za-z0-9_-]{3,255}$/u;
const GOOGLE_MAPS_URI_HOSTS = new Set(["google.com", "www.google.com", "maps.google.com"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseLocation(value: unknown): GeoPoint | null {
  if (!isRecord(value)) {
    return null;
  }
  if (typeof value.latitude !== "number" || typeof value.longitude !== "number") {
    return null;
  }

  const point: GeoPoint = { latitude: value.latitude, longitude: value.longitude };
  return isValidGeoPoint(point) ? point : null;
}

function parseDisplayName(value: unknown): string | null {
  return isRecord(value) ? nonEmptyString(value.text) : null;
}

function parseStringArray(value: unknown): readonly string[] | null {
  if (!Array.isArray(value) || value.some((item) => nonEmptyString(item) === null)) {
    return null;
  }
  return value.map((item) => (item as string).trim());
}

function parseSearchCandidate(value: unknown): GoogleTextSearchCandidate | null {
  if (!isRecord(value)) {
    return null;
  }
  const id = nonEmptyString(value.id);
  const displayName = parseDisplayName(value.displayName);
  const formattedAddress = nonEmptyString(value.formattedAddress);
  const location = parseLocation(value.location);
  return id && PLACE_ID.test(id) && displayName && formattedAddress && location
    ? { id, displayName, formattedAddress, location }
    : null;
}

export function parseGoogleTextSearchResponse(value: unknown): readonly GoogleTextSearchCandidate[] {
  if (!isRecord(value)) {
    throw new GooglePlacesClientError("invalid-response");
  }
  if (value.places === undefined) {
    return [];
  }
  if (!Array.isArray(value.places)) {
    throw new GooglePlacesClientError("invalid-response");
  }

  const candidates = value.places.map(parseSearchCandidate);
  if (candidates.some((candidate) => candidate === null)) {
    throw new GooglePlacesClientError("invalid-response");
  }
  return candidates as GoogleTextSearchCandidate[];
}

function parseAddressComponent(value: unknown): GoogleAddressComponent | null {
  if (!isRecord(value)) {
    return null;
  }
  const longText = nonEmptyString(value.longText);
  const shortText = nonEmptyString(value.shortText);
  const types = parseStringArray(value.types);
  return longText && shortText && types ? { longText, shortText, types } : null;
}

function isSafeGoogleMapsUri(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      GOOGLE_MAPS_URI_HOSTS.has(url.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

export function parseGooglePlaceDetailsResponse(value: unknown): GooglePlaceDetails {
  if (!isRecord(value)) {
    throw new GooglePlacesClientError("invalid-response");
  }

  const id = nonEmptyString(value.id);
  const displayName = parseDisplayName(value.displayName);
  const formattedAddress = nonEmptyString(value.formattedAddress);
  const location = parseLocation(value.location);
  const types = parseStringArray(value.types);
  const primaryType = value.primaryType === undefined ? undefined : nonEmptyString(value.primaryType);
  const googleMapsUri = nonEmptyString(value.googleMapsUri);
  const addressComponents = Array.isArray(value.addressComponents)
    ? value.addressComponents.map(parseAddressComponent)
    : null;

  if (
    !id ||
    !PLACE_ID.test(id) ||
    !displayName ||
    !formattedAddress ||
    !location ||
    !types ||
    (value.primaryType !== undefined && !primaryType) ||
    !googleMapsUri ||
    !isSafeGoogleMapsUri(googleMapsUri) ||
    !addressComponents ||
    addressComponents.some((component) => component === null)
  ) {
    throw new GooglePlacesClientError("invalid-response");
  }

  return {
    id,
    displayName,
    formattedAddress,
    addressComponents: addressComponents as GoogleAddressComponent[],
    location,
    ...(primaryType ? { primaryType } : {}),
    types,
    googleMapsUri,
  };
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

export function readGooglePlacesServerApiKey(
  environment: GooglePlacesServerEnvironment = process.env,
): string {
  const apiKey = environment.GOOGLE_MAPS_PLATFORM_API_KEY?.trim();
  if (!apiKey) {
    throw new GooglePlacesClientError("configuration");
  }
  return apiKey;
}

export class GooglePlacesClient {
  private readonly apiKey: string;
  private readonly transport: GooglePlacesHttpTransport;
  private readonly timeoutMs: number;

  constructor(options: GooglePlacesClientOptions) {
    const apiKey = options.apiKey.trim();
    if (!apiKey) {
      throw new GooglePlacesClientError("configuration");
    }
    this.apiKey = apiKey;
    this.transport = options.transport;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  private async requestJson(
    request: Omit<GooglePlacesHttpRequest, "signal">,
  ): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.transport.request({ ...request, signal: controller.signal });
      if (response.status < 200 || response.status >= 300) {
        throw new GooglePlacesClientError("http-error", response.status);
      }
      try {
        return await response.json();
      } catch (error) {
        if (isAbortError(error)) {
          throw new GooglePlacesClientError("timeout");
        }
        throw new GooglePlacesClientError("invalid-response");
      }
    } catch (error) {
      if (error instanceof GooglePlacesClientError) {
        throw error;
      }
      throw new GooglePlacesClientError(isAbortError(error) ? "timeout" : "transport");
    } finally {
      clearTimeout(timeout);
    }
  }

  async textSearch(input: {
    query: string;
    coordinates?: GeoPoint;
  }): Promise<readonly GoogleTextSearchCandidate[]> {
    const query = input.query.trim();
    if (!query) {
      throw new GooglePlacesClientError("invalid-response");
    }

    const response = await this.requestJson({
      url: GOOGLE_PLACES_ENDPOINTS.textSearch,
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask": GOOGLE_PLACES_FIELD_MASKS.textSearch,
      },
      body: JSON.stringify({
        textQuery: query,
        pageSize: 5,
        locationRestriction: GOOGLE_TEXT_SEARCH_LONDON_RESTRICTION,
      }),
    });
    return parseGoogleTextSearchResponse(response);
  }

  async placeDetails(placeId: string): Promise<GooglePlaceDetails> {
    const normalizedPlaceId = placeId.trim();
    if (!PLACE_ID.test(normalizedPlaceId)) {
      throw new GooglePlacesClientError("invalid-response");
    }

    const response = await this.requestJson({
      url: `${GOOGLE_PLACES_ENDPOINTS.detailsBase}/${encodeURIComponent(normalizedPlaceId)}`,
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask": GOOGLE_PLACES_FIELD_MASKS.details,
      },
    });
    return parseGooglePlaceDetailsResponse(response);
  }
}

export function createNativeGooglePlacesHttpTransport(): GooglePlacesHttpTransport {
  return {
    async request(request) {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        credentials: "omit",
        redirect: "error",
        cache: "no-store",
        signal: request.signal,
      });
      return { status: response.status, json: () => response.json() as Promise<unknown> };
    },
  };
}

export function createGooglePlacesClient(
  environment: GooglePlacesServerEnvironment = process.env,
): GooglePlacesClient {
  return new GooglePlacesClient({
    apiKey: readGooglePlacesServerApiKey(environment),
    transport: createNativeGooglePlacesHttpTransport(),
  });
}
