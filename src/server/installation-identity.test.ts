import { describe, expect, it } from "vitest";
import {
  createInstallationIdentity,
  INSTALLATION_COOKIE_NAME,
  installationCookieHeader,
  readInstallationIdFromRequest,
  verifyInstallationIdentity,
} from "./installation-identity";

const environment = { TRAZA_INSTALLATION_COOKIE_SECRET: "i".repeat(48) };
const installationId = "018f47f5-4f43-7c8f-8f47-2b9ef863f483";
const now = new Date("2026-09-01T10:00:00Z");

describe("installation identity", () => {
  it("creates and verifies a server-generated opaque UUID identity", () => {
    const created = createInstallationIdentity({ environment, installationId, now });
    expect(verifyInstallationIdentity(created.token, { environment, now })).toBe(installationId);
    expect(created.token).not.toContain(installationId);
    expect(created.token).not.toContain(environment.TRAZA_INSTALLATION_COOKIE_SECRET);
  });

  it("rejects tampering and expiry", () => {
    const created = createInstallationIdentity({ environment, installationId, now });
    expect(
      verifyInstallationIdentity(`${created.token.slice(0, -1)}x`, { environment, now }),
    ).toBeNull();
    expect(
      verifyInstallationIdentity(created.token, {
        environment,
        now: new Date("2028-01-01T00:00:00Z"),
      }),
    ).toBeNull();
  });

  it("uses the required secure host cookie attributes without Domain", () => {
    const created = createInstallationIdentity({ environment, installationId, now });
    const header = installationCookieHeader(created.token);
    expect(header).toContain(`${INSTALLATION_COOKIE_NAME}=`);
    expect(header).toContain("Secure");
    expect(header).toContain("HttpOnly");
    expect(header).toContain("SameSite=Lax");
    expect(header).toContain("Path=/");
    expect(header).not.toContain("Domain=");
  });

  it("keeps the same installation across requests carrying the cookie", () => {
    const created = createInstallationIdentity({ environment, installationId, now });
    const request = new Request("https://traza.test/", {
      headers: { cookie: `${INSTALLATION_COOKIE_NAME}=${created.token}` },
    });
    expect(readInstallationIdFromRequest(request, environment, now)).toBe(installationId);
    expect(readInstallationIdFromRequest(request, environment, now)).toBe(installationId);
  });
});
