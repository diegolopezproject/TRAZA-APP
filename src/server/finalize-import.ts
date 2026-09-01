import "server-only";

import type { ImportResultCode } from "@/domain/import-result";
import type { TrazaImportCategory } from "@/domain/place-import";
import { TRAZA_TRIP_ID } from "@/domain/trip-scope";
import {
  evaluateProductionGreaterLondonScope,
  type LondonScopeResult,
} from "@/domain/london-scope";
import { normalizeGooglePlaceDetails } from "./google-place-normalizer";
import {
  createGooglePlacesClient,
} from "./google-places-client";
import type { GooglePlaceDetails } from "./google-places-types";
import type { ImportTicketPayload } from "./import-ticket";
import type { ImportedPlaceInsertPort } from "./place-import-persistence";
import { createImportedPlaceRepository } from "./supabase";

export interface FinalizeImportDependencies {
  placeDetails(placeId: string): Promise<GooglePlaceDetails>;
  evaluateLondonScope?: typeof evaluateProductionGreaterLondonScope;
  repository: ImportedPlaceInsertPort;
}

export async function finalizePendingImport(
  input: {
    installationId: string;
    ticket: ImportTicketPayload;
    category: TrazaImportCategory;
  },
  dependencies: FinalizeImportDependencies,
): Promise<Exclude<ImportResultCode, "needs-category">> {
  try {
    const details = await dependencies.placeDetails(input.ticket.externalPlaceId);
    if (details.id !== input.ticket.externalPlaceId) return "failed";
    const normalized = normalizeGooglePlaceDetails(details);
    const scope: LondonScopeResult = (
      dependencies.evaluateLondonScope ?? evaluateProductionGreaterLondonScope
    )(normalized.candidate);
    if (scope.kind === "outside") return "outside-scope";
    if (scope.kind !== "inside") return "failed";

    const inserted = await dependencies.repository.insert({
      installationId: input.installationId,
      tripId: TRAZA_TRIP_ID,
      provider: "google",
      externalPlaceId: input.ticket.externalPlaceId,
      category: input.category,
    });
    if (inserted.kind === "saved") return "saved";
    if (inserted.kind === "duplicate") return "duplicate";
    return "failed";
  } catch {
    return "failed";
  }
}

export function finalizePendingImportWithProductionDependencies(input: {
  installationId: string;
  ticket: ImportTicketPayload;
  category: TrazaImportCategory;
}) {
  const placesClient = createGooglePlacesClient();
  return finalizePendingImport(input, {
    placeDetails: (placeId) => placesClient.placeDetails(placeId),
    repository: createImportedPlaceRepository(),
  });
}
