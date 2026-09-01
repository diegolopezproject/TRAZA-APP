import { describe, expect, it, vi } from "vitest";
import type { ImportTicketPayload } from "./import-ticket";
import { finalizePendingImport } from "./finalize-import";

const ticket: ImportTicketPayload = {
  installationId: "018f47f5-4f43-7c8f-8f47-2b9ef863f483",
  tripId: "london-2026",
  provider: "google",
  externalPlaceId: "ChIJ_test",
  issuedAt: 1,
  expiresAt: 601,
  nonce: "018f47f5-4f43-7c8f-9f47-2b9ef863f484",
};

function details() {
  return {
    id: "ChIJ_test",
    displayName: "Test",
    formattedAddress: "London, UK",
    addressComponents: [{ longText: "United Kingdom", shortText: "GB", types: ["country"] }],
    location: { latitude: 51.5, longitude: -0.1 },
    types: ["point_of_interest"],
    googleMapsUri: "https://maps.google.com/?cid=1",
  };
}

describe("finalizePendingImport", () => {
  it("rehydrates, revalidates London and inserts only the selected closed category", async () => {
    const insert = vi.fn(async () => ({
      kind: "saved" as const,
      place: { recordId: "record", provider: "google", externalPlaceId: "ChIJ_test", category: "shopping" as const, tripId: "london-2026" },
    }));
    await expect(finalizePendingImport(
      { installationId: ticket.installationId, ticket, category: "shopping" },
      { placeDetails: async () => details(), evaluateLondonScope: () => ({ kind: "inside" }), repository: { insert } },
    )).resolves.toBe("saved");
    expect(insert).toHaveBeenCalledWith({
      installationId: ticket.installationId,
      tripId: "london-2026",
      provider: "google",
      externalPlaceId: "ChIJ_test",
      category: "shopping",
    });
  });

  it("allows a non-London UK place after contextual scope evaluation", async () => {
    const insert = vi.fn(async () => ({
      kind: "saved" as const,
      place: { recordId: "record", provider: "google", externalPlaceId: "ChIJ_test", category: "attraction" as const, tripId: "london-2026" },
    }));
    await expect(finalizePendingImport(
      { installationId: ticket.installationId, ticket, category: "attraction" },
      { placeDetails: async () => details(), evaluateLondonScope: () => ({ kind: "outside", reason: "boundary" }), repository: { insert } },
    )).resolves.toBe("saved");
    expect(insert).toHaveBeenCalledOnce();
  });

  it("maps duplicate and provider failure safely", async () => {
    await expect(finalizePendingImport(
      { installationId: ticket.installationId, ticket, category: "museum-culture" },
      { placeDetails: async () => details(), evaluateLondonScope: () => ({ kind: "inside" }), repository: { insert: async () => ({ kind: "duplicate" }) } },
    )).resolves.toBe("duplicate");
    await expect(finalizePendingImport(
      { installationId: ticket.installationId, ticket, category: "museum-culture" },
      { placeDetails: async () => { throw new Error("provider"); }, repository: { insert: vi.fn() } },
    )).resolves.toBe("failed");
  });
});
