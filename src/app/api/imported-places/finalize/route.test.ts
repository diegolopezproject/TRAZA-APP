import { describe, expect, it, vi } from "vitest";
import type { TrazaImportCategory } from "@/domain/place-import";
import type { ImportTicketPayload } from "@/server/import-ticket";
import { createFinalizeRouteHandlers } from "./route";

const installationId = "018f47f5-4f43-7c8f-8f47-2b9ef863f483";
const ticket: ImportTicketPayload = {
  installationId,
  tripId: "london-2026",
  provider: "google",
  externalPlaceId: "ChIJ_test",
  issuedAt: 1,
  expiresAt: 601,
  nonce: "018f47f5-4f43-7c8f-9f47-2b9ef863f484",
};

function request(category: string, origin = "https://traza.test") {
  return new Request("https://traza.test/api/imported-places/finalize", {
    method: "POST",
    headers: { origin, "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ category }),
  });
}

describe("category finalization route", () => {
  it.each(["food-drink", "museum-culture", "attraction", "shopping"] as const)(
    "accepts the closed category %s and consumes the ticket",
    async (category) => {
      const finalize = vi.fn(async () => "saved" as const);
      const handlers = createFinalizeRouteHandlers({
        installationId: () => installationId,
        ticket: () => ticket,
        finalize,
      });
      const response = await handlers.POST(request(category));
      expect(response.status).toBe(303);
      expect(response.headers.get("location")).toBe("https://traza.test/?importResult=saved#saved");
      expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
      expect(finalize).toHaveBeenCalledWith({ installationId, ticket, category });
    },
  );

  it.each([
    ["invalid category", "neighbourhood", ticket, installationId],
    ["expired/tampered ticket", "attraction", null, installationId],
    ["wrong installation", "attraction", null, "other"],
  ])("rejects %s without finalization", async (_label, category, resolvedTicket, resolvedInstallation) => {
    const finalize = vi.fn<() => Promise<"saved">>(async () => "saved");
    const handlers = createFinalizeRouteHandlers({
      installationId: () => resolvedInstallation,
      ticket: () => resolvedTicket,
      finalize,
    });
    const response = await handlers.POST(request(category));
    expect(response.headers.get("location")).toContain("importResult=failed");
    expect(finalize).not.toHaveBeenCalled();
  });

  it("rejects a body over the physical limit even without Content-Length", async () => {
    const finalize = vi.fn<() => Promise<"saved">>(async () => "saved");
    const handlers = createFinalizeRouteHandlers({
      installationId: () => installationId,
      ticket: () => ticket,
      finalize,
    });
    const response = await handlers.POST(request("x".repeat(2_000)));
    expect(response.headers.get("location")).toContain("importResult=failed");
    expect(finalize).not.toHaveBeenCalled();
  });

  it("rejects cross-origin finalization and clears a cancelled same-origin ticket", async () => {
    const handlers = createFinalizeRouteHandlers({
      installationId: () => installationId,
      ticket: () => ticket,
      finalize: async (input: { category: TrazaImportCategory }) => input.category === "shopping" ? "saved" : "failed",
    });
    expect((await handlers.POST(request("shopping", "https://evil.test"))).status).toBe(403);
    const cancelled = await handlers.DELETE(new Request(
      "https://traza.test/api/imported-places/finalize",
      { method: "DELETE", headers: { origin: "https://traza.test" } },
    ));
    expect(cancelled.status).toBe(204);
    expect(cancelled.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
