import { describe, expect, it } from "vitest";
import {
  consumeImportResultUrl,
  IMPORT_RESULT_MESSAGES,
  parseImportResult,
} from "./import-result";

describe("import result adapter", () => {
  it.each([
    ["saved", "Lugar guardado"],
    ["duplicate", "Ya tienes guardado este sitio"],
    ["failed", "No hemos podido guardar este sitio. Inténtalo de nuevo."],
  ] as const)("owns the exact %s toast copy in the UI boundary", (result, message) => {
    expect(IMPORT_RESULT_MESSAGES[result]).toBe(message);
  });

  it("removes only importResult once and preserves Guardados plus other query state", () => {
    expect(
      consumeImportResultUrl("https://traza.test/?foo=1&importResult=saved#saved"),
    ).toEqual({ result: "saved", cleanedUrl: "/?foo=1#saved" });
    expect(consumeImportResultUrl("https://traza.test/?foo=1#saved")).toBeNull();
  });

  it("rejects open-ended presentation values", () => {
    expect(parseImportResult("Places API failed: secret")).toBeNull();
  });
});
