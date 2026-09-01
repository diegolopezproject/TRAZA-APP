import { describe, expect, it, vi } from "vitest";
import { persistPreparedPlaceImport } from "./place-import-persistence";

const prepared = {
  kind: "ready-to-save" as const,
  place: { provider: "google" as const, externalPlaceId: "ChIJ_test", category: "food-drink" as const },
  transient: { displayName: "Test", formattedAddress: "London", googleMapsUri: "https://maps.google.com/?cid=1" },
};

describe("prepared import persistence", () => {
  it.each([
    ["saved", "saved"],
    ["duplicate", "duplicate"],
    ["failed", "failed"],
  ] as const)("maps repository %s to the closed %s result", async (repositoryKind, expected) => {
    const insert = vi.fn(async () => repositoryKind === "saved"
      ? { kind: "saved" as const, place: {
          recordId: "record", provider: "google", externalPlaceId: "ChIJ_test",
          category: "food-drink" as const, tripId: "london-2026",
        } }
      : repositoryKind === "duplicate"
        ? { kind: "duplicate" as const }
        : { kind: "failed" as const, reason: "persistence-failure" as const });
    await expect(
      persistPreparedPlaceImport(prepared, {
        installationId: "installation",
        repository: { insert },
      }),
    ).resolves.toEqual({ kind: expected });
  });
});
