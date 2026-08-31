import { describe, expect, it } from "vitest";
import {
  ImportedPlaceRepository,
  mapImportedPlaceRow,
  type DeleteImportedPlaceInput,
  type ImportedPlaceDataResult,
  type ImportedPlaceDataSource,
  type ImportedPlaceInsertRow,
  type ImportedPlaceScope,
  type InsertImportedPlaceInput,
} from "./imported-place-repository";

const FIRST_RECORD_ID = "00000000-0000-4000-8000-000000000001";
const SECOND_RECORD_ID = "00000000-0000-4000-8000-000000000002";

function importedPlaceRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: FIRST_RECORD_ID,
    trip_id: "london-2026",
    provider: "google",
    external_place_id: "google-place-1",
    traza_category: "museum-culture",
    created_at: "2026-08-31T10:00:00.000Z",
    ...overrides,
  };
}

class FakeImportedPlaceDataSource implements ImportedPlaceDataSource {
  listCalls: ImportedPlaceScope[] = [];
  insertCalls: ImportedPlaceInsertRow[] = [];
  deleteCalls: DeleteImportedPlaceInput[] = [];

  listResult: ImportedPlaceDataResult<readonly unknown[]> = { data: [], error: null };
  insertResult: ImportedPlaceDataResult<unknown> = {
    data: importedPlaceRow(),
    error: null,
  };
  deleteResult: ImportedPlaceDataResult<unknown> = {
    data: { id: FIRST_RECORD_ID },
    error: null,
  };

  async list(scope: ImportedPlaceScope) {
    this.listCalls.push(scope);
    return this.listResult;
  }

  async insert(row: ImportedPlaceInsertRow) {
    this.insertCalls.push(row);
    return this.insertResult;
  }

  async delete(scope: DeleteImportedPlaceInput) {
    this.deleteCalls.push(scope);
    return this.deleteResult;
  }
}

const scope: ImportedPlaceScope = {
  installationId: "00000000-0000-4000-8000-000000000010",
  tripId: "london-2026",
};

const insertInput: InsertImportedPlaceInput = {
  ...scope,
  provider: "google",
  externalPlaceId: "google-place-1",
  category: "museum-culture",
};

describe("mapImportedPlaceRow", () => {
  it("maps database snake_case fields into durable domain identity", () => {
    expect(mapImportedPlaceRow(importedPlaceRow())).toEqual({
      recordId: FIRST_RECORD_ID,
      tripId: "london-2026",
      provider: "google",
      externalPlaceId: "google-place-1",
      category: "museum-culture",
    });
  });

  it.each([
    { provider: "other-provider" },
    { traza_category: "neighbourhood" },
    { traza_category: "unknown" },
  ])("rejects an invalid provider or category", (overrides) => {
    expect(mapImportedPlaceRow(importedPlaceRow(overrides))).toBeNull();
  });
});

describe("ImportedPlaceRepository.list", () => {
  it("scopes the query and returns deterministic created-at order", async () => {
    const dataSource = new FakeImportedPlaceDataSource();
    dataSource.listResult = {
      data: [
        importedPlaceRow({
          id: SECOND_RECORD_ID,
          external_place_id: "google-place-2",
          created_at: "2026-08-31T11:00:00.000Z",
        }),
        importedPlaceRow(),
      ],
      error: null,
    };

    const result = await new ImportedPlaceRepository(dataSource).list(scope);

    expect(dataSource.listCalls).toEqual([scope]);
    expect(result).toMatchObject({
      kind: "success",
      places: [{ recordId: FIRST_RECORD_ID }, { recordId: SECOND_RECORD_ID }],
    });
  });

  it("maps database and malformed-row failures to persistence failure", async () => {
    const dataSource = new FakeImportedPlaceDataSource();
    const repository = new ImportedPlaceRepository(dataSource);

    dataSource.listResult = { data: null, error: { code: "08006" } };
    await expect(repository.list(scope)).resolves.toEqual({
      kind: "failed",
      reason: "persistence-failure",
    });

    dataSource.listResult = { data: [importedPlaceRow({ provider: "invalid" })], error: null };
    await expect(repository.list(scope)).resolves.toEqual({
      kind: "failed",
      reason: "persistence-failure",
    });
  });
});

describe("ImportedPlaceRepository.insert", () => {
  it("directly inserts durable fields and returns the imported identity", async () => {
    const dataSource = new FakeImportedPlaceDataSource();
    const result = await new ImportedPlaceRepository(dataSource).insert(insertInput);

    expect(dataSource.listCalls).toHaveLength(0);
    expect(dataSource.insertCalls).toEqual([
      {
        installation_id: scope.installationId,
        trip_id: scope.tripId,
        provider: "google",
        external_place_id: "google-place-1",
        traza_category: "museum-culture",
      },
    ]);
    expect(result).toMatchObject({ kind: "saved", place: { recordId: FIRST_RECORD_ID } });
  });

  it("maps a unique-constraint conflict to duplicate", async () => {
    const dataSource = new FakeImportedPlaceDataSource();
    dataSource.insertResult = { data: null, error: { code: "23505" } };

    await expect(new ImportedPlaceRepository(dataSource).insert(insertInput)).resolves.toEqual({
      kind: "duplicate",
    });
  });

  it("maps other database errors to persistence failure", async () => {
    const dataSource = new FakeImportedPlaceDataSource();
    dataSource.insertResult = { data: null, error: { code: "08006" } };

    await expect(new ImportedPlaceRepository(dataSource).insert(insertInput)).resolves.toEqual({
      kind: "failed",
      reason: "persistence-failure",
    });
  });
});

describe("ImportedPlaceRepository.delete", () => {
  const input: DeleteImportedPlaceInput = { ...scope, recordId: FIRST_RECORD_ID };

  it("uses record and ownership scope and reports success", async () => {
    const dataSource = new FakeImportedPlaceDataSource();

    await expect(new ImportedPlaceRepository(dataSource).delete(input)).resolves.toEqual({
      kind: "deleted",
      recordId: FIRST_RECORD_ID,
    });
    expect(dataSource.deleteCalls).toEqual([input]);
  });

  it("treats not-owned or missing rows as not found", async () => {
    const dataSource = new FakeImportedPlaceDataSource();
    dataSource.deleteResult = { data: null, error: null };

    await expect(new ImportedPlaceRepository(dataSource).delete(input)).resolves.toEqual({
      kind: "not-found",
    });
  });

  it("maps database errors to persistence failure", async () => {
    const dataSource = new FakeImportedPlaceDataSource();
    dataSource.deleteResult = { data: null, error: { code: "08006" } };

    await expect(new ImportedPlaceRepository(dataSource).delete(input)).resolves.toEqual({
      kind: "failed",
      reason: "persistence-failure",
    });
  });
});
