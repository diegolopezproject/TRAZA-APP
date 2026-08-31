import { describe, expect, it } from "vitest";
import { GOOGLE_MAPS_SHARE_FIELD_LIMITS, parseGoogleMapsSharePayload } from "./google-maps-share-parser";
import { validateGoogleMapsUrl } from "./google-maps-url";

const FIXTURES = [
  "https://maps.app.goo.gl/EJoMkxSzVytZT5gB9?g_st=ac",
  "https://maps.app.goo.gl/LQMKg8hE9XopoSa68",
  "https://maps.app.goo.gl/NjSorR34a7x1QLqV8?g_st=ac",
] as const;

describe("parseGoogleMapsSharePayload", () => {
  it("accepts URL-only, prose text, title fallback and surrounding whitespace", () => {
    expect(parseGoogleMapsSharePayload({ url: `  ${FIXTURES[0]}  ` })).toMatchObject({
      kind: "success",
      sourceField: "url",
    });
    expect(parseGoogleMapsSharePayload({ text: `Te recomiendo este sitio: ${FIXTURES[1]}.` })).toMatchObject({
      kind: "success",
      sourceField: "text",
    });
    expect(parseGoogleMapsSharePayload({ title: `Lugar (${FIXTURES[2]})` })).toMatchObject({
      kind: "success",
      sourceField: "title",
    });
  });

  it.each(FIXTURES)("accepts the observed Android fixture without fetching it: %s", (url) => {
    expect(parseGoogleMapsSharePayload({ url })).toMatchObject({ kind: "success" });
  });

  it("does not depend on the optional g_st tracking parameter", () => {
    const withTracking = parseGoogleMapsSharePayload({ url: FIXTURES[0] });
    const withoutTracking = parseGoogleMapsSharePayload({
      url: FIXTURES[0].replace("?g_st=ac", ""),
    });

    expect(withTracking).toMatchObject({ kind: "success" });
    expect(withoutTracking).toMatchObject({ kind: "success" });
  });

  it("deduplicates equivalent URLs across fields, including g_st", () => {
    const base = FIXTURES[0].replace("?g_st=ac", "");
    expect(
      parseGoogleMapsSharePayload({ url: FIXTURES[0], text: `También ${base}` }),
    ).toMatchObject({ kind: "success", sourceField: "url" });
  });

  it("fails rather than choosing between distinct supported URLs", () => {
    expect(parseGoogleMapsSharePayload({ url: FIXTURES[0], text: FIXTURES[1] })).toEqual({
      kind: "failed",
      reason: "multiple-candidates",
    });
  });

  it.each([
    { input: { url: "https://example.com/maps/place/Test" }, reason: "unsupported-source" },
    { input: { text: "No hay ningún enlace aquí" }, reason: "unsupported-source" },
    { input: {}, reason: "unsupported-source" },
    { input: { url: 42 }, reason: "malformed-input" },
  ])("returns a typed failure for $reason", ({ input, reason }) => {
    expect(parseGoogleMapsSharePayload(input)).toMatchObject({ kind: "failed", reason });
  });

  it.each(["url", "text", "title"] as const)("rejects oversized %s input", (field) => {
    expect(
      parseGoogleMapsSharePayload({ [field]: "x".repeat(GOOGLE_MAPS_SHARE_FIELD_LIMITS[field] + 1) }),
    ).toEqual({ kind: "failed", reason: "input-too-long", field });
  });

  it.each([
    "https://google.com.attacker.test/maps/place/Test",
    "https://maps.app.goo.gl.attacker.test/token",
    "https://attacker-google.com/maps/place/Test",
  ])("rejects deceptive host %s", (url) => {
    expect(parseGoogleMapsSharePayload({ url })).toEqual({
      kind: "failed",
      reason: "unsupported-source",
    });
  });
});

describe("validateGoogleMapsUrl", () => {
  it.each([
    "https://google.com/maps",
    "https://www.google.com/maps/place/Test",
    "https://maps.google.com/?q=Test",
    "https://goo.gl/maps/legacy-token",
  ])("accepts an exact reviewed host/path family: %s", (url) => {
    expect(validateGoogleMapsUrl(url)).toMatchObject({ kind: "supported" });
  });

  it.each([
    "http://google.com/maps",
    "https://user:password@google.com/maps",
    "https://google.com/maps#@attacker.test",
    "https://google.com:444/maps",
    "https://localhost/maps",
    "https://127.0.0.1/maps",
    "https://[::1]/maps",
    "https://google.co.uk/maps",
    "https://goo.gl/not-maps",
    "javascript:alert(1)",
  ])("rejects unsafe or unsupported URL %s", (url) => {
    expect(validateGoogleMapsUrl(url)).toMatchObject({ kind: "rejected" });
  });
});
