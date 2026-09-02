import "server-only";

import {
  importedPlaceViewId,
  type ImportedPlaceIdentity,
  type ImportedPlaceViewModel,
} from "@/domain/place-import";
import { fallbackPlaceMedia } from "@/data/media-catalog";
import type { MediaAsset } from "@/domain/models";
import { TRAZA_TRIP_ID } from "@/domain/trip-scope";
import { normalizeGooglePlaceDetails } from "./google-place-normalizer";
import { createGooglePlacesClient } from "./google-places-client";
import type { GooglePlaceDetails, GooglePlacePhoto } from "./google-places-types";
import type { ImportedPlaceRepository } from "./imported-place-repository";
import { createImportedPlaceRepository } from "./supabase";

const FACTUAL_TYPE_LABELS: Readonly<Record<string, string>> = {
  restaurant: "Restaurante",
  cafe: "Cafetería",
  bakery: "Panadería",
  bar: "Bar",
  museum: "Museo",
  art_gallery: "Galería",
  historical_landmark: "Lugar histórico",
  tourist_attraction: "Atracción",
  park: "Parque",
  shopping_mall: "Centro comercial",
  clothing_store: "Tienda de ropa",
  book_store: "Librería",
  store: "Tienda",
};

export interface ImportedPlaceHydrationClient {
  placeDetails(placeId: string): Promise<GooglePlaceDetails>;
  placePhoto?(photoName: string): Promise<{ photoUri: string }>;
}

export interface ImportedPlaceListPort {
  list: ImportedPlaceRepository["list"];
}

export function factualTagsForGoogleTypes(types: readonly string[]): string[] {
  return [...new Set(types.map((type) => FACTUAL_TYPE_LABELS[type]).filter(Boolean))].slice(0, 3);
}

export function degradedImportedPlace(
  identity: ImportedPlaceIdentity,
): ImportedPlaceViewModel {
  return {
    source: "imported-google",
    id: importedPlaceViewId(identity.recordId),
    recordId: identity.recordId,
    category: identity.category,
    name: "Lugar guardado",
    tags: [],
    media: fallbackPlaceMedia("Lugar guardado"),
  };
}

async function importedPlaceMedia(
  name: string,
  photo: GooglePlacePhoto | undefined,
  client: ImportedPlaceHydrationClient,
): Promise<MediaAsset> {
  if (!photo || !client.placePhoto) return fallbackPlaceMedia(name);
  try {
    const { photoUri } = await client.placePhoto(photo.name);
    return {
      src: photoUri,
      alt: `Foto de ${name}`,
      width: photo.widthPx,
      height: photo.heightPx,
      focalPoint: "50% 50%",
      source: "Google Maps",
      sourceUrl: photo.googleMapsUri,
      kind: "photo",
      classification: "real-photo",
      googleMapsAttribution: {
        sourcePhotoUrl: photo.googleMapsUri,
        authors: photo.authorAttributions.map((author) => ({
          displayName: author.displayName,
          ...(author.uri ? { profileUrl: author.uri } : {}),
          ...(author.photoUri ? { avatarUrl: author.photoUri } : {}),
        })),
      },
    };
  } catch {
    return fallbackPlaceMedia(name);
  }
}

export async function hydrateImportedPlaceIdentities(
  identities: readonly ImportedPlaceIdentity[],
  client: ImportedPlaceHydrationClient,
): Promise<ImportedPlaceViewModel[]> {
  return Promise.all(
    identities.map(async (identity) => {
      try {
        const details = await client.placeDetails(identity.externalPlaceId);
        if (details.id !== identity.externalPlaceId) return degradedImportedPlace(identity);
        const normalized = normalizeGooglePlaceDetails(details);
        const media = await importedPlaceMedia(
          normalized.presentation.displayName,
          details.photos?.[0],
          client,
        );
        return {
          source: "imported-google" as const,
          id: importedPlaceViewId(identity.recordId),
          recordId: identity.recordId,
          category: identity.category,
          name: normalized.presentation.displayName,
          area: normalized.presentation.formattedAddress,
          tags: factualTagsForGoogleTypes(normalized.candidate.types),
          media,
          mapsDestination: {
            kind: "canonical-url" as const,
            value: normalized.presentation.googleMapsUri,
          },
        };
      } catch {
        return degradedImportedPlace(identity);
      }
    }),
  );
}

export async function loadImportedPlacesForInstallation(
  installationId: string,
  options: {
    repository?: ImportedPlaceListPort;
    placesClient?: ImportedPlaceHydrationClient;
  } = {},
): Promise<ImportedPlaceViewModel[]> {
  const repository = options.repository ?? createImportedPlaceRepository();
  const listed = await repository.list({ installationId, tripId: TRAZA_TRIP_ID });
  if (listed.kind !== "success") return [];
  if (!listed.places.length) return [];

  let placesClient: ImportedPlaceHydrationClient;
  try {
    placesClient = options.placesClient ?? createGooglePlacesClient();
  } catch {
    return listed.places.map(degradedImportedPlace);
  }
  return hydrateImportedPlaceIdentities(listed.places, placesClient);
}
