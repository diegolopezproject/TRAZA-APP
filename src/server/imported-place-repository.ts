import type { SupabaseClient } from "@supabase/supabase-js";
import {
  TRAZA_IMPORT_CATEGORIES,
  type ImportedPlaceIdentity,
  type TrazaImportCategory,
} from "../domain/place-import";

const IMPORTED_PLACE_COLUMNS =
  "id,trip_id,provider,external_place_id,traza_category,created_at";
const UNIQUE_VIOLATION_CODE = "23505";

export interface ImportedPlaceScope {
  installationId: string;
  tripId: string;
}

export interface InsertImportedPlaceInput extends ImportedPlaceScope {
  provider: "google";
  externalPlaceId: string;
  category: TrazaImportCategory;
}

export interface DeleteImportedPlaceInput extends ImportedPlaceScope {
  recordId: string;
}

export interface ImportedPlaceInsertRow {
  installation_id: string;
  trip_id: string;
  provider: "google";
  external_place_id: string;
  traza_category: TrazaImportCategory;
}

export interface ImportedPlacePersistenceError {
  code?: string;
}

export interface ImportedPlaceDataResult<T> {
  data: T | null;
  error: ImportedPlacePersistenceError | null;
}

export interface ImportedPlaceDataSource {
  list(scope: ImportedPlaceScope): Promise<ImportedPlaceDataResult<readonly unknown[]>>;
  insert(row: ImportedPlaceInsertRow): Promise<ImportedPlaceDataResult<unknown>>;
  delete(scope: DeleteImportedPlaceInput): Promise<ImportedPlaceDataResult<unknown>>;
}

export type ListImportedPlacesResult =
  | { kind: "success"; places: readonly ImportedPlaceIdentity[] }
  | { kind: "failed"; reason: "persistence-failure" };

export type InsertImportedPlaceResult =
  | { kind: "saved"; place: ImportedPlaceIdentity }
  | { kind: "duplicate" }
  | { kind: "failed"; reason: "persistence-failure" };

export type DeleteImportedPlaceResult =
  | { kind: "deleted"; recordId: string }
  | { kind: "not-found" }
  | { kind: "failed"; reason: "persistence-failure" };

interface ParsedImportedPlaceRow {
  identity: ImportedPlaceIdentity;
  createdAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isImportCategory(value: unknown): value is TrazaImportCategory {
  return (
    typeof value === "string" &&
    TRAZA_IMPORT_CATEGORIES.includes(value as TrazaImportCategory)
  );
}

function parseImportedPlaceRow(row: unknown): ParsedImportedPlaceRow | null {
  if (
    !isRecord(row) ||
    !isNonEmptyString(row.id) ||
    !isNonEmptyString(row.trip_id) ||
    row.provider !== "google" ||
    !isNonEmptyString(row.external_place_id) ||
    !isImportCategory(row.traza_category) ||
    !isNonEmptyString(row.created_at) ||
    Number.isNaN(Date.parse(row.created_at))
  ) {
    return null;
  }

  return {
    identity: {
      recordId: row.id,
      provider: row.provider,
      externalPlaceId: row.external_place_id,
      category: row.traza_category,
      tripId: row.trip_id,
    },
    createdAt: row.created_at,
  };
}

export function mapImportedPlaceRow(row: unknown): ImportedPlaceIdentity | null {
  return parseImportedPlaceRow(row)?.identity ?? null;
}

function normalizeError(error: { code?: string } | null): ImportedPlacePersistenceError | null {
  if (!error) {
    return null;
  }

  return typeof error.code === "string" ? { code: error.code } : {};
}

export function createSupabaseImportedPlaceDataSource(
  client: SupabaseClient,
): ImportedPlaceDataSource {
  return {
    async list(scope) {
      const result = await client
        .from("imported_places")
        .select(IMPORTED_PLACE_COLUMNS)
        .eq("installation_id", scope.installationId)
        .eq("trip_id", scope.tripId)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true });

      return { data: result.data, error: normalizeError(result.error) };
    },

    async insert(row) {
      const result = await client
        .from("imported_places")
        .insert(row)
        .select(IMPORTED_PLACE_COLUMNS)
        .single();

      return { data: result.data, error: normalizeError(result.error) };
    },

    async delete(scope) {
      const result = await client
        .from("imported_places")
        .delete()
        .eq("id", scope.recordId)
        .eq("installation_id", scope.installationId)
        .eq("trip_id", scope.tripId)
        .select("id")
        .maybeSingle();

      return { data: result.data, error: normalizeError(result.error) };
    },
  };
}

export class ImportedPlaceRepository {
  constructor(private readonly dataSource: ImportedPlaceDataSource) {}

  async list(scope: ImportedPlaceScope): Promise<ListImportedPlacesResult> {
    try {
      const result = await this.dataSource.list(scope);
      if (result.error || !Array.isArray(result.data)) {
        return { kind: "failed", reason: "persistence-failure" };
      }

      const parsed = result.data.map(parseImportedPlaceRow);
      if (parsed.some((row) => row === null)) {
        return { kind: "failed", reason: "persistence-failure" };
      }

      const ordered = (parsed as ParsedImportedPlaceRow[]).sort(
        (left, right) =>
          left.createdAt.localeCompare(right.createdAt) ||
          left.identity.recordId.localeCompare(right.identity.recordId),
      );

      return { kind: "success", places: ordered.map((row) => row.identity) };
    } catch {
      return { kind: "failed", reason: "persistence-failure" };
    }
  }

  async insert(input: InsertImportedPlaceInput): Promise<InsertImportedPlaceResult> {
    try {
      const result = await this.dataSource.insert({
        installation_id: input.installationId,
        trip_id: input.tripId,
        provider: input.provider,
        external_place_id: input.externalPlaceId,
        traza_category: input.category,
      });

      if (result.error?.code === UNIQUE_VIOLATION_CODE) {
        return { kind: "duplicate" };
      }
      if (result.error) {
        return { kind: "failed", reason: "persistence-failure" };
      }

      const place = mapImportedPlaceRow(result.data);
      return place
        ? { kind: "saved", place }
        : { kind: "failed", reason: "persistence-failure" };
    } catch {
      return { kind: "failed", reason: "persistence-failure" };
    }
  }

  async delete(input: DeleteImportedPlaceInput): Promise<DeleteImportedPlaceResult> {
    try {
      const result = await this.dataSource.delete(input);
      if (result.error) {
        return { kind: "failed", reason: "persistence-failure" };
      }
      if (result.data === null) {
        return { kind: "not-found" };
      }
      if (!isRecord(result.data) || result.data.id !== input.recordId) {
        return { kind: "failed", reason: "persistence-failure" };
      }

      return { kind: "deleted", recordId: input.recordId };
    } catch {
      return { kind: "failed", reason: "persistence-failure" };
    }
  }
}
