import "server-only";

import type { ImportResultCode } from "@/domain/import-result";
import { TRAZA_TRIP_ID } from "@/domain/trip-scope";
import type { PreparedPlaceImportOutcome } from "./google-maps-import-orchestrator";
import type {
  ImportedPlaceRepository,
  InsertImportedPlaceResult,
} from "./imported-place-repository";

export type PersistedPreparedImportResult =
  | { kind: Exclude<ImportResultCode, "needs-category"> }
  | { kind: "needs-category"; externalPlaceId: string };

export interface ImportedPlaceInsertPort {
  insert: ImportedPlaceRepository["insert"];
}

export async function persistPreparedPlaceImport(
  prepared: PreparedPlaceImportOutcome,
  input: {
    installationId: string;
    repository: ImportedPlaceInsertPort;
  },
): Promise<PersistedPreparedImportResult> {
  if (prepared.kind === "failed") return { kind: "failed" };
  if (prepared.kind === "needs-category") {
    return { kind: "needs-category", externalPlaceId: prepared.externalPlaceId };
  }

  let inserted: InsertImportedPlaceResult;
  try {
    inserted = await input.repository.insert({
      installationId: input.installationId,
      tripId: TRAZA_TRIP_ID,
      provider: prepared.place.provider,
      externalPlaceId: prepared.place.externalPlaceId,
      category: prepared.place.category,
    });
  } catch {
    return { kind: "failed" };
  }

  if (inserted.kind === "saved") return { kind: "saved" };
  if (inserted.kind === "duplicate") return { kind: "duplicate" };
  return { kind: "failed" };
}
