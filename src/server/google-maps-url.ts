export type GoogleMapsUrlFamily = "application-short-link" | "legacy-short-link" | "maps";

export interface SupportedGoogleMapsUrl {
  readonly url: URL;
  readonly family: GoogleMapsUrlFamily;
  readonly remotelyResolvable: boolean;
  readonly canonicalKey: string;
}

export type GoogleMapsUrlValidationResult =
  | { kind: "supported"; value: SupportedGoogleMapsUrl }
  | {
      kind: "rejected";
      reason:
        | "malformed-url"
        | "unsupported-protocol"
        | "credentials"
        | "fragment"
        | "unsupported-port"
        | "ip-literal"
        | "localhost"
        | "unsupported-host-or-path";
    };

const SHORT_HOSTS = new Set(["maps.app.goo.gl", "goo.gl"]);
const FINAL_HOSTS = new Set(["google.com", "www.google.com", "maps.google.com"]);
const TRACKING_PARAMETERS = new Set(["g_st"]);

function isIpLiteral(hostname: string): boolean {
  const host = hostname.startsWith("[") && hostname.endsWith("]")
    ? hostname.slice(1, -1)
    : hostname;

  if (host.includes(":")) {
    return /^[0-9a-f:.]+$/i.test(host);
  }

  const parts = host.split(".");
  return (
    parts.length === 4 &&
    parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255)
  );
}

function mapsGooglePathIsSupported(url: URL): boolean {
  if (url.pathname === "/" || url.pathname.length === 0) {
    return url.searchParams.has("q");
  }

  return url.pathname === "/maps" || url.pathname.startsWith("/maps/");
}

function classifySupportedUrl(url: URL): GoogleMapsUrlFamily | null {
  const hostname = url.hostname.toLowerCase();

  if (hostname === "maps.app.goo.gl" && url.pathname.length > 1) {
    return "application-short-link";
  }
  if (hostname === "goo.gl" && url.pathname.startsWith("/maps/")) {
    return "legacy-short-link";
  }
  if (
    (hostname === "google.com" || hostname === "www.google.com") &&
    (url.pathname === "/maps" || url.pathname.startsWith("/maps/"))
  ) {
    return "maps";
  }
  if (hostname === "maps.google.com" && mapsGooglePathIsSupported(url)) {
    return "maps";
  }

  return null;
}

function canonicalize(url: URL): string {
  const normalized = new URL(url.toString());
  normalized.hostname = normalized.hostname.toLowerCase();
  normalized.hash = "";

  const entries = [...normalized.searchParams.entries()]
    .filter(([name]) => !TRACKING_PARAMETERS.has(name.toLowerCase()))
    .sort(([leftName, leftValue], [rightName, rightValue]) =>
      leftName.localeCompare(rightName) || leftValue.localeCompare(rightValue),
    );
  normalized.search = "";
  for (const [name, value] of entries) {
    normalized.searchParams.append(name, value);
  }

  return normalized.toString();
}

export function validateGoogleMapsUrl(input: string | URL): GoogleMapsUrlValidationResult {
  let url: URL;
  try {
    url = input instanceof URL ? new URL(input.toString()) : new URL(input);
  } catch {
    return { kind: "rejected", reason: "malformed-url" };
  }

  if (url.protocol !== "https:") {
    return { kind: "rejected", reason: "unsupported-protocol" };
  }
  if (url.username || url.password) {
    return { kind: "rejected", reason: "credentials" };
  }
  if (url.hash) {
    return { kind: "rejected", reason: "fragment" };
  }
  if (url.port) {
    return { kind: "rejected", reason: "unsupported-port" };
  }

  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return { kind: "rejected", reason: "localhost" };
  }
  if (isIpLiteral(hostname)) {
    return { kind: "rejected", reason: "ip-literal" };
  }

  const family = classifySupportedUrl(url);
  if (!family) {
    return { kind: "rejected", reason: "unsupported-host-or-path" };
  }

  url.hostname = hostname;
  return {
    kind: "supported",
    value: {
      url,
      family,
      remotelyResolvable: SHORT_HOSTS.has(hostname),
      canonicalKey: canonicalize(url),
    },
  };
}

export function isFinalGoogleMapsHost(hostname: string): boolean {
  return FINAL_HOSTS.has(hostname.toLowerCase());
}
