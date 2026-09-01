export const IMPORT_RESULT_CODES = [
  "saved",
  "duplicate",
  "needs-category",
  "failed",
] as const;

export type ImportResultCode = (typeof IMPORT_RESULT_CODES)[number];

export const IMPORT_RESULT_MESSAGES: Readonly<
  Record<Exclude<ImportResultCode, "needs-category">, string>
> = {
  saved: "Lugar guardado",
  duplicate: "Ya tienes guardado este sitio",
  failed: "No hemos podido guardar este sitio. Inténtalo de nuevo.",
};

export function parseImportResult(value: string | null | undefined): ImportResultCode | null {
  return IMPORT_RESULT_CODES.includes(value as ImportResultCode)
    ? (value as ImportResultCode)
    : null;
}

export interface ConsumedImportResult {
  result: ImportResultCode;
  cleanedUrl: string;
}

export function consumeImportResultUrl(value: string): ConsumedImportResult | null {
  const url = new URL(value, "https://traza.invalid");
  const result = parseImportResult(url.searchParams.get("importResult"));
  if (!result) return null;

  url.searchParams.delete("importResult");
  const query = url.searchParams.toString();
  return {
    result,
    cleanedUrl: `${url.pathname}${query ? `?${query}` : ""}${url.hash || "#saved"}`,
  };
}
