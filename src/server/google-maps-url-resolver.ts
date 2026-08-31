import {
  isFinalGoogleMapsHost,
  validateGoogleMapsUrl,
  type SupportedGoogleMapsUrl,
} from "./google-maps-url";

export const GOOGLE_MAPS_RESOLVER_LIMITS = {
  maxRedirects: 3,
  perHopTimeoutMs: 2_000,
  totalTimeoutMs: 5_000,
} as const;

export interface GoogleMapsRedirectResponse {
  status: number;
  location: string | null;
}

export interface GoogleMapsRedirectTransport {
  resolveHop(
    source: SupportedGoogleMapsUrl,
    options: { signal: AbortSignal },
  ): Promise<GoogleMapsRedirectResponse>;
}

export type GoogleMapsUrlResolutionResult =
  | { kind: "resolved"; mapsUrl: SupportedGoogleMapsUrl; redirectCount: number }
  | {
      kind: "failed";
      reason:
        | "not-resolvable"
        | "redirect-rejected"
        | "missing-location"
        | "too-many-redirects"
        | "timeout"
        | "transport-failure";
    };

interface GoogleMapsResolverOptions {
  maxRedirects?: number;
  perHopTimeoutMs?: number;
  totalTimeoutMs?: number;
}

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

async function requestWithTimeout(
  transport: GoogleMapsRedirectTransport,
  source: SupportedGoogleMapsUrl,
  timeoutMs: number,
): Promise<GoogleMapsRedirectResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await transport.resolveHop(source, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function resolveGoogleMapsUrl(
  initial: SupportedGoogleMapsUrl,
  transport: GoogleMapsRedirectTransport,
  options: GoogleMapsResolverOptions = {},
): Promise<GoogleMapsUrlResolutionResult> {
  const limits = {
    maxRedirects: options.maxRedirects ?? GOOGLE_MAPS_RESOLVER_LIMITS.maxRedirects,
    perHopTimeoutMs: options.perHopTimeoutMs ?? GOOGLE_MAPS_RESOLVER_LIMITS.perHopTimeoutMs,
    totalTimeoutMs: options.totalTimeoutMs ?? GOOGLE_MAPS_RESOLVER_LIMITS.totalTimeoutMs,
  };
  const startedAt = Date.now();

  if (!initial.remotelyResolvable) {
    return isFinalGoogleMapsHost(initial.url.hostname)
      ? { kind: "resolved", mapsUrl: initial, redirectCount: 0 }
      : { kind: "failed", reason: "not-resolvable" };
  }

  let current = initial;
  for (let redirectCount = 0; redirectCount <= limits.maxRedirects; redirectCount += 1) {
    if (!current.remotelyResolvable) {
      return { kind: "resolved", mapsUrl: current, redirectCount };
    }
    if (redirectCount === limits.maxRedirects) {
      return { kind: "failed", reason: "too-many-redirects" };
    }

    const remainingMs = limits.totalTimeoutMs - (Date.now() - startedAt);
    if (remainingMs <= 0) {
      return { kind: "failed", reason: "timeout" };
    }

    let response: GoogleMapsRedirectResponse;
    try {
      response = await requestWithTimeout(
        transport,
        current,
        Math.max(1, Math.min(limits.perHopTimeoutMs, remainingMs)),
      );
    } catch (error) {
      return {
        kind: "failed",
        reason: isAbortError(error) ? "timeout" : "transport-failure",
      };
    }

    if (!REDIRECT_STATUSES.has(response.status) || !response.location) {
      return { kind: "failed", reason: "missing-location" };
    }

    let destinationUrl: URL;
    try {
      destinationUrl = new URL(response.location, current.url);
    } catch {
      return { kind: "failed", reason: "redirect-rejected" };
    }

    const destination = validateGoogleMapsUrl(destinationUrl);
    if (destination.kind === "rejected") {
      return { kind: "failed", reason: "redirect-rejected" };
    }
    current = destination.value;
  }

  return { kind: "failed", reason: "too-many-redirects" };
}

export function createNativeGoogleMapsRedirectTransport(): GoogleMapsRedirectTransport {
  return {
    async resolveHop(source, { signal }) {
      const response = await fetch(source.url, {
        method: "GET",
        redirect: "manual",
        credentials: "omit",
        cache: "no-store",
        signal,
      });

      return {
        status: response.status,
        location: response.headers.get("location"),
      };
    },
  };
}
