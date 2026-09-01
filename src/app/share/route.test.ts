import { describe, expect, it, vi } from "vitest";
import type { PreparedPlaceImportOutcome } from "@/server/google-maps-import-orchestrator";
import type { ShareRouteDependencies } from "./route";
import type { ImportedPlaceInsertPort } from "@/server/place-import-persistence";
import { createShareRouteHandler, MAX_SHARE_TARGET_BODY_BYTES } from "./route";

const installationId = "018f47f5-4f43-7c8f-8f47-2b9ef863f483";
const externalPlaceId = "ChIJ_test_place";

function multipart(entries: ReadonlyArray<readonly [string, string | Blob]>): Request {
  const form = new FormData();
  for (const [field, value] of entries) {
    if (typeof value === "string") form.append(field, value);
    else form.append(field, value, "file.txt");
  }
  return new Request("https://traza.test/share", { method: "POST", body: form });
}

function harness(prepared: PreparedPlaceImportOutcome) {
  const prepare = vi.fn(async () => prepared);
  const insert = vi.fn<ImportedPlaceInsertPort["insert"]>(async () => ({
    kind: "saved" as const,
    place: {
      recordId: "018f47f5-4f43-7c8f-9f47-2b9ef863f484",
      provider: "google",
      externalPlaceId,
      category: "attraction" as const,
      tripId: "london-2026",
    },
  }));
  const issueTicket = vi.fn(() => "signed-ticket");
  const dependencies: ShareRouteDependencies = {
    installationId: () => installationId,
    prepare,
    repository: () => ({ insert }),
    issueTicket,
  };
  return { handler: createShareRouteHandler(dependencies), dependencies, prepare, insert, issueTicket };
}

function ready(): PreparedPlaceImportOutcome {
  return {
    kind: "ready-to-save",
    place: { provider: "google", externalPlaceId, category: "attraction" },
    transient: {
      displayName: "Fixture",
      formattedAddress: "London",
      googleMapsUri: "https://maps.google.com/?cid=1",
    },
  };
}

async function expectResult(response: Response, result: string) {
  expect(response.status).toBe(303);
  expect(response.headers.get("location")).toBe(
    `https://traza.test/?importResult=${result}#saved`,
  );
}

describe("POST /share end-to-end adapter", () => {
  it("persists a deterministic prepared place in installation/trip scope", async () => {
    const test = harness(ready());
    await expectResult(
      await test.handler(multipart([["url", "https://maps.app.goo.gl/EJoMkxSzVytZT5gB9"]])),
      "saved",
    );
    expect(test.insert).toHaveBeenCalledWith({
      installationId,
      tripId: "london-2026",
      provider: "google",
      externalPlaceId,
      category: "attraction",
    });
  });

  it("maps PostgreSQL duplicate authority without a second insert path", async () => {
    const test = harness(ready());
    test.insert.mockResolvedValueOnce({ kind: "duplicate" });
    await expectResult(
      await test.handler(multipart([["url", "https://maps.app.goo.gl/EJoMkxSzVytZT5gB9"]])),
      "duplicate",
    );
    expect(test.insert).toHaveBeenCalledTimes(1);
  });

  it.each([
    [{ kind: "failed", reason: "external-service-failure" } as PreparedPlaceImportOutcome, "failed"],
  ])("maps %s without a partial row", async (prepared, result) => {
    const test = harness(prepared);
    await expectResult(
      await test.handler(multipart([["url", "https://maps.app.goo.gl/EJoMkxSzVytZT5gB9"]])),
      result,
    );
    expect(test.insert).not.toHaveBeenCalled();
  });

  it("creates a safe pending ticket and no row for ambiguous category", async () => {
    const test = harness({
      kind: "needs-category",
      externalPlaceId,
      transient: {
        displayName: "Fixture",
        formattedAddress: "London",
        googleMapsUri: "https://maps.google.com/?cid=1",
      },
    });
    const response = await test.handler(
      multipart([["url", "https://maps.app.goo.gl/EJoMkxSzVytZT5gB9"]]),
    );
    await expectResult(response, "needs-category");
    expect(test.insert).not.toHaveBeenCalled();
    expect(test.issueTicket).toHaveBeenCalledWith({ installationId, externalPlaceId });
    expect(response.headers.get("set-cookie")).toContain("__Host-traza-import-ticket=");
    expect(response.headers.get("set-cookie")).not.toContain(externalPlaceId);
  });

  it("fails through bootstrap instead of silently creating a share identity", async () => {
    const test = harness(ready());
    test.dependencies.installationId = () => null;
    const response = await test.handler(
      multipart([["url", "https://maps.app.goo.gl/EJoMkxSzVytZT5gB9"]]),
    );
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("/api/installation/bootstrap?");
    expect(test.prepare).not.toHaveBeenCalled();
    expect(test.insert).not.toHaveBeenCalled();
  });

  it.each([
    [multipart([])],
    [multipart([["unknown", "private"]])],
    [multipart([["url", new Blob(["private"]) ]])],
    [new Request("https://traza.test/share", {
      method: "POST",
      headers: {
        "content-type": "multipart/form-data; boundary=x",
        "content-length": String(MAX_SHARE_TARGET_BODY_BYTES + 1),
      },
      body: "--x--",
    })],
  ])("rejects malformed transport without reflecting input", async (request) => {
    const test = harness(ready());
    const response = await test.handler(request);
    await expectResult(response, "failed");
    expect(response.headers.get("location")).not.toContain("private");
    expect(test.prepare).not.toHaveBeenCalled();
  });
});
