import type { GeoPoint } from "./geometry";
import type { MapsDestination, MediaAsset } from "./models";

export const TRAZA_IMPORT_CATEGORIES = [
  "food-drink",
  "museum-culture",
  "attraction",
  "shopping",
] as const;

export type TrazaImportCategory = (typeof TRAZA_IMPORT_CATEGORIES)[number];

export type ImportFailureReason =
  | "malformed-input"
  | "unsupported-source"
  | "identity-ambiguous"
  | "external-service-failure"
  | "invalid-external-response"
  | "persistence-failure"
  | "installation-unavailable";

export type PlaceImportOutcome =
  | { kind: "saved"; recordId: string }
  | { kind: "duplicate"; recordId?: string }
  | { kind: "outside-scope" }
  | { kind: "needs-category" }
  | { kind: "failed"; reason: ImportFailureReason };

/** Durable identity and TRAZA-owned state. Provider display data is excluded. */
export interface ImportedPlaceIdentity {
  recordId: string;
  provider: string;
  externalPlaceId: string;
  category: TrazaImportCategory;
  tripId: string;
}

export type ImportedPlaceViewId = `imported:${string}`;

/** Transient hydrated presentation. This contract is never a persistence DTO. */
export interface ImportedPlaceViewModel {
  source: "imported-google";
  id: ImportedPlaceViewId;
  recordId: string;
  category: TrazaImportCategory;
  name: string;
  area?: string;
  tags: readonly string[];
  mapsDestination?: MapsDestination;
  media?: MediaAsset;
}

/** Provider-neutral scalar candidate produced after an external adapter validates its response. */
export interface NormalizedPlaceCandidate {
  provider: string;
  externalPlaceId: string;
  location?: GeoPoint;
  countryCode?: string;
  primaryType?: string;
  types: readonly string[];
}

export function importedPlaceViewId(recordId: string): ImportedPlaceViewId {
  if (recordId.length === 0) {
    throw new RangeError("Imported place record ID cannot be empty");
  }

  return `imported:${recordId}`;
}

export function isTrazaImportCategory(value: unknown): value is TrazaImportCategory {
  return (
    typeof value === "string" &&
    TRAZA_IMPORT_CATEGORIES.includes(value as TrazaImportCategory)
  );
}
