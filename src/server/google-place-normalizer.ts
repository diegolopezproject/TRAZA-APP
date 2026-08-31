import type { NormalizedPlaceCandidate } from "../domain/place-import";
import type { GooglePlaceDetails } from "./google-places-types";

export interface GooglePlacePresentationMetadata {
  displayName: string;
  formattedAddress: string;
  googleMapsUri: string;
}

export interface NormalizedGooglePlace {
  candidate: NormalizedPlaceCandidate;
  presentation: GooglePlacePresentationMetadata;
}

export function normalizeGooglePlaceDetails(details: GooglePlaceDetails): NormalizedGooglePlace {
  const country = details.addressComponents.find((component) => component.types.includes("country"));
  const countryCode = country?.shortText.trim().toUpperCase();

  return {
    candidate: {
      provider: "google",
      externalPlaceId: details.id,
      location: details.location,
      ...(countryCode ? { countryCode } : {}),
      ...(details.primaryType ? { primaryType: details.primaryType } : {}),
      types: [...details.types],
    },
    presentation: {
      displayName: details.displayName,
      formattedAddress: details.formattedAddress,
      googleMapsUri: details.googleMapsUri,
    },
  };
}
