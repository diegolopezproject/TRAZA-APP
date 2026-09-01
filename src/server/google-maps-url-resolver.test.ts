import { describe, expect, it } from "vitest";
import { validateGoogleMapsUrl, type SupportedGoogleMapsUrl } from "./google-maps-url";
import {
  allowsValidatedShareContextFallback,
  resolveGoogleMapsUrl,
  type GoogleMapsRedirectResponse,
  type GoogleMapsRedirectTransport,
} from "./google-maps-url-resolver";

function supported(url: string): SupportedGoogleMapsUrl {
  const result = validateGoogleMapsUrl(url);
  if (result.kind !== "supported") {
    throw new Error(`Invalid test URL: ${url}`);
  }
  return result.value;
}

class FakeRedirectTransport implements GoogleMapsRedirectTransport {
  calls: string[] = [];

  constructor(
    private readonly responses: readonly (GoogleMapsRedirectResponse | Error | "timeout")[],
  ) {}

  async resolveHop(source: SupportedGoogleMapsUrl, { signal }: { signal: AbortSignal }) {
    this.calls.push(source.url.toString());
    const response = this.responses[this.calls.length - 1];
    if (response === "timeout") {
      return new Promise<GoogleMapsRedirectResponse>((_resolve, reject) => {
        signal.addEventListener("abort", () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        });
      });
    }
    if (response instanceof Error) {
      throw response;
    }
    if (!response) {
      throw new Error("Unexpected transport call");
    }
    return response;
  }
}

const SHORT = "https://maps.app.goo.gl/test-token";

describe("resolveGoogleMapsUrl", () => {
  it.each([
    "https://google.com/maps/place/Test",
    "https://www.google.com/maps/place/Test",
  ])("resolves a short link to an approved final destination: %s", async (destination) => {
    const transport = new FakeRedirectTransport([{ status: 302, location: destination }]);
    await expect(resolveGoogleMapsUrl(supported(SHORT), transport)).resolves.toMatchObject({
      kind: "resolved",
      redirectCount: 1,
      mapsUrl: { url: new URL(destination) },
    });
    expect(transport.calls).toEqual([SHORT]);
  });

  it("supports the reviewed legacy goo.gl/maps family", async () => {
    const legacy = "https://goo.gl/maps/legacy-token";
    const transport = new FakeRedirectTransport([
      { status: 301, location: "https://www.google.com/maps/place/Legacy" },
    ]);

    await expect(resolveGoogleMapsUrl(supported(legacy), transport)).resolves.toMatchObject({
      kind: "resolved",
      redirectCount: 1,
    });
    expect(transport.calls).toEqual([legacy]);
  });

  it.each([1, 2, 3])("allows exactly %i redirect hops", async (hopCount) => {
    const shortLinks = Array.from(
      { length: Math.max(0, hopCount - 1) },
      (_, index) => `https://maps.app.goo.gl/hop-${index}`,
    );
    const destinations = [...shortLinks, "https://www.google.com/maps/place/Final"];
    const transport = new FakeRedirectTransport(
      destinations.map((location) => ({ status: 302, location })),
    );

    await expect(resolveGoogleMapsUrl(supported(SHORT), transport)).resolves.toMatchObject({
      kind: "resolved",
      redirectCount: hopCount,
    });
    expect(transport.calls).toHaveLength(hopCount);
  });

  it("rejects more than three redirects without requesting the fourth destination", async () => {
    const transport = new FakeRedirectTransport([
      { status: 302, location: "https://maps.app.goo.gl/hop-1" },
      { status: 302, location: "https://maps.app.goo.gl/hop-2" },
      { status: 302, location: "https://maps.app.goo.gl/hop-3" },
    ]);

    const result = await resolveGoogleMapsUrl(supported(SHORT), transport);
    expect(result).toEqual({
      kind: "failed",
      reason: "too-many-redirects",
    });
    if (result.kind !== "failed") throw new Error("Expected a typed resolver failure");
    expect(allowsValidatedShareContextFallback(result)).toBe(true);
    expect(transport.calls).toHaveLength(3);
  });

  it.each([
    "http://www.google.com/maps/place/Test",
    "https://attacker.test/maps/place/Test",
    "https://localhost/maps",
    "https://127.0.0.1/maps",
    "https://[::1]/maps",
    "https://10.0.0.4/maps",
    "https://169.254.169.254/maps",
    "https://www.google.com:444/maps/place/Test",
  ])("rejects an unsafe redirect before transport can fetch it: %s", async (location) => {
    const transport = new FakeRedirectTransport([{ status: 302, location }]);
    const result = await resolveGoogleMapsUrl(supported(SHORT), transport);
    expect(result).toEqual({
      kind: "failed",
      reason: "redirect-rejected",
    });
    if (result.kind !== "failed") throw new Error("Expected a typed resolver failure");
    expect(allowsValidatedShareContextFallback(result)).toBe(false);
    expect(transport.calls).toEqual([SHORT]);
  });

  it("returns a typed timeout", async () => {
    const transport = new FakeRedirectTransport(["timeout"]);
    await expect(
      resolveGoogleMapsUrl(supported(SHORT), transport, {
        perHopTimeoutMs: 5,
        totalTimeoutMs: 20,
      }),
    ).resolves.toEqual({ kind: "failed", reason: "timeout" });
  });

  it("types terminal 404/no Location as fallback-eligible availability failure", async () => {
    const transport = new FakeRedirectTransport([{ status: 404, location: null }]);
    const result = await resolveGoogleMapsUrl(supported(SHORT), transport);
    expect(result).toEqual({ kind: "failed", reason: "missing-location" });
    if (result.kind !== "failed") throw new Error("Expected a typed resolver failure");
    expect(allowsValidatedShareContextFallback(result)).toBe(true);
  });

  it.each([
    { status: 200, location: null },
    { status: 302, location: null },
    { status: 302, location: "https://%" },
  ])("fails on a missing or invalid Location without reading a body", async (response) => {
    const transport = new FakeRedirectTransport([response]);
    await expect(resolveGoogleMapsUrl(supported(SHORT), transport)).resolves.toMatchObject({
      kind: "failed",
    });
    expect(transport.calls).toHaveLength(1);
  });
});
