import type { GeoPoint } from "../domain/geometry";

export interface GoogleTextSearchCandidate {
  id: string;
  displayName: string;
  formattedAddress: string;
  location: GeoPoint;
}

export interface GoogleAddressComponent {
  longText: string;
  shortText: string;
  types: readonly string[];
}

export interface GooglePlaceDetails {
  id: string;
  displayName: string;
  formattedAddress: string;
  addressComponents: readonly GoogleAddressComponent[];
  location: GeoPoint;
  primaryType?: string;
  types: readonly string[];
  googleMapsUri: string;
}
