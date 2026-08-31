import {
  validateGoogleMapsUrl,
  type SupportedGoogleMapsUrl,
} from "./google-maps-url";

export const GOOGLE_MAPS_SHARE_FIELD_LIMITS = {
  title: 2_048,
  text: 4_096,
  url: 4_096,
} as const;

export interface GoogleMapsSharePayload {
  title?: string;
  text?: string;
  url?: string;
}

export type GoogleMapsShareField = keyof GoogleMapsSharePayload;

export type GoogleMapsShareParseResult =
  | {
      kind: "success";
      sourceField: GoogleMapsShareField;
      mapsUrl: SupportedGoogleMapsUrl;
      title?: string;
    }
  | {
      kind: "failed";
      reason: "malformed-input" | "input-too-long" | "unsupported-source" | "multiple-candidates";
      field?: GoogleMapsShareField;
    };

const URL_TOKEN = /https:\/\/[^\s<>"'`]+/giu;
const TRAILING_PUNCTUATION = /[.,;!?]+$/u;
const CLOSING_PAIRS: Readonly<Record<string, string>> = {
  ")": "(",
  "]": "[",
  "}": "{",
};

function trimSharePunctuation(token: string): string {
  let value = token.replace(TRAILING_PUNCTUATION, "");
  while (value.length > 0) {
    const closing = value.at(-1);
    const opening = closing ? CLOSING_PAIRS[closing] : undefined;
    if (!opening) {
      break;
    }

    const openingCount = [...value].filter((character) => character === opening).length;
    const closingCount = [...value].filter((character) => character === closing).length;
    if (closingCount <= openingCount) {
      break;
    }
    value = value.slice(0, -1);
  }
  return value;
}

function parsePayload(input: unknown):
  | { kind: "valid"; fields: Required<GoogleMapsSharePayload> }
  | Extract<GoogleMapsShareParseResult, { kind: "failed" }> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { kind: "failed", reason: "malformed-input" };
  }

  const record = input as Record<string, unknown>;
  const fields: Required<GoogleMapsSharePayload> = { title: "", text: "", url: "" };
  for (const field of ["title", "text", "url"] as const) {
    const value = record[field];
    if (value === undefined) {
      continue;
    }
    if (typeof value !== "string") {
      return { kind: "failed", reason: "malformed-input", field };
    }

    const trimmed = value.trim();
    if (trimmed.length > GOOGLE_MAPS_SHARE_FIELD_LIMITS[field]) {
      return { kind: "failed", reason: "input-too-long", field };
    }
    fields[field] = trimmed;
  }

  return { kind: "valid", fields };
}

export function parseGoogleMapsSharePayload(input: unknown): GoogleMapsShareParseResult {
  const parsedPayload = parsePayload(input);
  if (parsedPayload.kind === "failed") {
    return parsedPayload;
  }

  const candidates = new Map<
    string,
    { sourceField: GoogleMapsShareField; mapsUrl: SupportedGoogleMapsUrl }
  >();

  for (const field of ["url", "text", "title"] as const) {
    for (const match of parsedPayload.fields[field].matchAll(URL_TOKEN)) {
      const candidate = validateGoogleMapsUrl(trimSharePunctuation(match[0]));
      if (candidate.kind === "supported" && !candidates.has(candidate.value.canonicalKey)) {
        candidates.set(candidate.value.canonicalKey, { sourceField: field, mapsUrl: candidate.value });
      }
    }
  }

  if (candidates.size === 0) {
    return { kind: "failed", reason: "unsupported-source" };
  }
  if (candidates.size > 1) {
    return { kind: "failed", reason: "multiple-candidates" };
  }

  const selected = [...candidates.values()][0];
  return {
    kind: "success",
    ...selected,
    ...(parsedPayload.fields.title ? { title: parsedPayload.fields.title } : {}),
  };
}
