import { describe, expect, it, vi } from "vitest";
import { createDeleteImportedPlaceHandler } from "./route";

const recordId = "018f47f5-4f43-7c8f-8f47-2b9ef863f483";
const installationId = "018f47f5-4f43-7c8f-9f47-2b9ef863f484";

function request(origin = "https://traza.test") {
  return new Request(`https://traza.test/api/imported-places/${recordId}`, {
    method: "DELETE",
    headers: { origin },
  });
}

describe("DELETE imported place", () => {
  it("hard-deletes by record, installation and trip ownership scope", async () => {
    const remove = vi.fn(async () => ({ kind: "deleted" as const, recordId }));
    const handler = createDeleteImportedPlaceHandler({
      installationId: () => installationId,
      repository: () => ({ delete: remove }),
    });
    const response = await handler(request(), { params: Promise.resolve({ id: recordId }) });
    expect(response.status).toBe(200);
    expect(remove).toHaveBeenCalledWith({
      recordId,
      installationId,
      tripId: "london-2026",
    });
  });

  it("does not delete by Google Place ID or across origins", async () => {
    const remove = vi.fn();
    const handler = createDeleteImportedPlaceHandler({
      installationId: () => installationId,
      repository: () => ({ delete: remove }),
    });
    expect((await handler(request(), {
      params: Promise.resolve({ id: "ChIJ_google_place" }),
    })).status).toBe(400);
    expect((await handler(request("https://evil.test"), {
      params: Promise.resolve({ id: recordId }),
    })).status).toBe(403);
    expect(remove).not.toHaveBeenCalled();
  });

  it("maps another installation's missing row to not-found", async () => {
    const handler = createDeleteImportedPlaceHandler({
      installationId: () => installationId,
      repository: () => ({ delete: async () => ({ kind: "not-found" }) }),
    });
    expect((await handler(request(), {
      params: Promise.resolve({ id: recordId }),
    })).status).toBe(404);
  });
});
