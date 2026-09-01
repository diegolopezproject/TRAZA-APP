import { describe, expect, it, vi } from "vitest";
import { INSTALLATION_COOKIE_NAME } from "@/server/installation-identity";
import { createInstallationBootstrapHandler } from "./route";

describe("installation bootstrap route", () => {
  it("creates the normal lifecycle cookie and returns only to a first-party path", async () => {
    const create = vi.fn(() => ({ token: "opaque-token" }));
    const handler = createInstallationBootstrapHandler({ verify: () => null, create });
    const response = await handler(new Request(
      "https://traza.test/api/installation/bootstrap?returnTo=%2F%3FimportResult%3Dfailed%23saved",
    ));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://traza.test/?importResult=failed#saved");
    expect(response.headers.get("set-cookie")).toContain(
      INSTALLATION_COOKIE_NAME + "=opaque-token",
    );
    expect(create).toHaveBeenCalledOnce();
  });

  it("preserves an already verified installation instead of splitting identity", async () => {
    const create = vi.fn(() => ({ token: "new-token" }));
    const handler = createInstallationBootstrapHandler({ verify: () => "installation", create });
    const response = await handler(new Request(
      "https://traza.test/api/installation/bootstrap?returnTo=%2F%23days",
      { headers: { cookie: INSTALLATION_COOKIE_NAME + "=existing-token" } },
    ));
    expect(response.status).toBe(303);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  it("blocks open redirects and fails closed when secure configuration is unavailable", async () => {
    const handler = createInstallationBootstrapHandler({
      verify: () => null,
      create: () => ({ token: "opaque-token" }),
    });
    const redirected = await handler(new Request(
      "https://traza.test/api/installation/bootstrap?returnTo=https%3A%2F%2Fevil.test",
    ));
    expect(redirected.headers.get("location")).toBe("https://traza.test/#days");

    const unavailable = createInstallationBootstrapHandler({
      verify: () => null,
      create: () => { throw new Error("TRAZA_INSTALLATION_COOKIE_SECRET"); },
    });
    const failed = await unavailable(new Request("https://traza.test/api/installation/bootstrap"));
    expect(failed.status).toBe(503);
    expect(await failed.text()).not.toContain("TRAZA_INSTALLATION_COOKIE_SECRET");
  });
});
