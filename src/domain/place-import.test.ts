import { describe, expect, it } from "vitest";
import {
  importedPlaceViewId,
  type ImportedPlaceIdentity,
  type ImportedPlaceViewModel,
  type NormalizedPlaceCandidate,
  type PlaceImportOutcome,
} from "./place-import";

function outcomeKind(outcome: PlaceImportOutcome): PlaceImportOutcome["kind"] {
  switch (outcome.kind) {
    case "saved":
    case "duplicate":
    case "outside-scope":
    case "needs-category":
    case "failed":
      return outcome.kind;
    default: {
      const unreachable: never = outcome;
      return unreachable;
    }
  }
}

describe("place import contracts", () => {
  it("represents every provider-independent outcome as a discriminated union", () => {
    const outcomes = [
      { kind: "saved", recordId: "record-1" },
      { kind: "duplicate" },
      { kind: "duplicate", recordId: "record-1" },
      { kind: "outside-scope" },
      { kind: "needs-category" },
      { kind: "failed", reason: "identity-ambiguous" },
    ] satisfies readonly PlaceImportOutcome[];

    expect(outcomes.map(outcomeKind)).toEqual([
      "saved",
      "duplicate",
      "duplicate",
      "outside-scope",
      "needs-category",
      "failed",
    ]);
  });

  it("keeps durable identity separate from transient presentation", () => {
    const identity: ImportedPlaceIdentity = {
      recordId: "record-1",
      provider: "provider-a",
      externalPlaceId: "external-1",
      category: "museum-culture",
      tripId: "trip-1",
    };
    const presentation: ImportedPlaceViewModel = {
      source: "imported-google",
      id: importedPlaceViewId(identity.recordId),
      recordId: identity.recordId,
      category: identity.category,
      name: "Hydrated name",
      tags: ["Museo"],
    };

    expect(Object.keys(identity).sort()).toEqual([
      "category",
      "externalPlaceId",
      "provider",
      "recordId",
      "tripId",
    ]);
    expect(presentation).toMatchObject({ id: "imported:record-1", name: "Hydrated name" });
  });

  it("defines a provider-neutral normalized candidate without an external DTO", () => {
    const candidate: NormalizedPlaceCandidate = {
      provider: "provider-a",
      externalPlaceId: "external-1",
      location: { latitude: 51.5, longitude: -0.1 },
      countryCode: "GB",
      primaryType: "museum",
      types: ["museum", "tourist_attraction"],
    };

    expect(candidate.provider).toBe("provider-a");
    expect(candidate.types).toEqual(["museum", "tourist_attraction"]);
  });
});

describe("importedPlaceViewId", () => {
  it("is deterministic and uses the imported namespace", () => {
    expect(importedPlaceViewId("record-1")).toBe("imported:record-1");
    expect(importedPlaceViewId("record-1")).toBe(importedPlaceViewId("record-1"));
    expect(importedPlaceViewId("record-1")).not.toBe("record-1");
  });

  it("produces different IDs for different records", () => {
    expect(importedPlaceViewId("record-1")).not.toBe(importedPlaceViewId("record-2"));
  });

  it("derives the UI ID from the internal record ID, not the external place ID", () => {
    const identity: ImportedPlaceIdentity = {
      recordId: "database-record",
      provider: "provider-a",
      externalPlaceId: "provider-place-id",
      category: "attraction",
      tripId: "trip-1",
    };

    expect(importedPlaceViewId(identity.recordId)).toBe("imported:database-record");
    expect(importedPlaceViewId(identity.recordId)).not.toContain(identity.externalPlaceId);
  });

  it("rejects an empty record ID", () => {
    expect(() => importedPlaceViewId("")).toThrow(RangeError);
  });
});
