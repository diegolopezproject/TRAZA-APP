import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GOOGLE_MAPS_SHARE_FIELD_LIMITS } from "@/server/google-maps-share-parser";
import { MAX_SHARE_TARGET_BODY_BYTES, POST } from "./route";

const FIXTURES = {
  A: "https://maps.app.goo.gl/EJoMkxSzVytZT5gB9?g_st=ac",
  B: "https://maps.app.goo.gl/LQMKg8hE9XopoSa68",
  C: "https://maps.app.goo.gl/NjSorR34a7x1QLqV8?g_st=ac",
} as const;

function multipartRequest(entries: ReadonlyArray<readonly [string, string | Blob]>): Request {
  const formData = new FormData();
  for (const [field, value] of entries) {
    if (typeof value === "string") formData.append(field, value);
    else formData.append(field, value, "shared-file.txt");
  }
  return new Request("https://traza.test/share", { method: "POST", body: formData });
}

async function expectRedirect(
  request: Request,
  result: "accepted" | "invalid",
): Promise<Response> {
  const response = await POST(request);
  expect(response.status).toBe(303);
  expect(response.headers.get("location")).toBe(
    `https://traza.test/?shareTarget=${result}#saved`,
  );
  return response;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /share", () => {
  it("accepts a valid Google Maps URL field without external transport", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await expectRedirect(multipartRequest([["url", FIXTURES.A]]), "accepted");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("accepts a supported URL contained in shared text", async () => {
    await expectRedirect(
      multipartRequest([["text", `Te recomiendo este sitio: ${FIXTURES.B}`]]),
      "accepted",
    );
  });

  it.each([
    ["A", [["title", "Fixture A"], ["url", FIXTURES.A]]],
    ["B", [["title", "Fixture B"], ["text", `Lugar recomendado\n${FIXTURES.B}`]]],
    ["C", [["title", `Fixture C ${FIXTURES.C}`], ["text", "Compartido desde Maps"]]],
  ] as const)("accepts the observed Android Fixture %s form", async (_name, entries) => {
    await expectRedirect(multipartRequest([...entries]), "accepted");
  });

  it("does not require the optional g_st parameter", async () => {
    await expectRedirect(
      multipartRequest([["url", FIXTURES.A.replace("?g_st=ac", "")]]),
      "accepted",
    );
  });

  it.each([
    ["unsupported host", [["url", "https://example.com/maps/place/Test"]]],
    ["missing payload", []],
    ["multiple distinct Maps URLs", [["url", FIXTURES.A], ["text", FIXTURES.B]]],
  ] as const)("redirects an %s payload as invalid", async (_name, entries) => {
    await expectRedirect(multipartRequest([...entries]), "invalid");
  });

  it("rejects fields over the parser limit and bodies over 16 KiB", async () => {
    await expectRedirect(
      multipartRequest([["text", "x".repeat(GOOGLE_MAPS_SHARE_FIELD_LIMITS.text + 1)]]),
      "invalid",
    );
    await expectRedirect(
      new Request("https://traza.test/share", {
        method: "POST",
        headers: {
          "content-length": String(MAX_SHARE_TARGET_BODY_BYTES + 1),
          "content-type": "multipart/form-data; boundary=oversized",
        },
        body: "--oversized--",
      }),
      "invalid",
    );
  });

  it("rejects File entries and unrecognized fields", async () => {
    await expectRedirect(
      multipartRequest([["url", new Blob([FIXTURES.A], { type: "text/plain" })]]),
      "invalid",
    );
    await expectRedirect(multipartRequest([["unknown", FIXTURES.A]]), "invalid");
  });

  it("rejects the wrong content type through the same safe 303 destination", async () => {
    await expectRedirect(
      new Request("https://traza.test/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: FIXTURES.A }),
      }),
      "invalid",
    );
  });

  it("uses the first non-empty duplicate field without reflecting shared input", async () => {
    const sharedTitle = "Secret title that must never reach history";
    const response = await expectRedirect(
      multipartRequest([
        ["url", ""],
        ["url", FIXTURES.A],
        ["title", sharedTitle],
      ]),
      "accepted",
    );
    const location = response.headers.get("location") ?? "";
    expect(location).not.toContain(sharedTitle);
    expect(location).not.toContain(encodeURIComponent(sharedTitle));
    expect(location).not.toContain("maps.app.goo.gl");
  });

  it("imports only the Phase 3A parser and has no Google, Places or Supabase boundary", async () => {
    const source = await readFile(path.resolve("src", "app", "share", "route.ts"), "utf8");
    expect(source).toContain('from "@/server/google-maps-share-parser"');
    expect(source).not.toMatch(
      /google-maps-(?:url-resolver|import-orchestrator)|google-places|imported-place|supabase/iu,
    );
  });
});
