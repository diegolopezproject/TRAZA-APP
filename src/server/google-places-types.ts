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

export interface GooglePhotoAuthorAttribution {
  displayName: string;
  uri?: string;
  photoUri?: string;
}

export interface GooglePlacePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions: readonly GooglePhotoAuthorAttribution[];
  googleMapsUri: string;
}

export interface GooglePlacePhotoMedia {
  photoUri: string;
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
  photos?: readonly GooglePlacePhoto[];
}
