import { describe, expect, it } from "vitest";
import {
  createImportTicket,
  importTicketCookieHeader,
  readImportTicketFromRequest,
  verifyImportTicket,
} from "./import-ticket";

const environment = { TRAZA_IMPORT_TICKET_SECRET: "t".repeat(48) };
const installationId = "018f47f5-4f43-7c8f-8f47-2b9ef863f483";
const otherInstallationId = "018f47f5-4f43-7c8f-9f47-2b9ef863f484";
const nonce = "018f47f5-4f43-7c8f-af47-2b9ef863f485";
const now = new Date("2026-09-01T10:00:00Z");

describe("pending import ticket", () => {
  it("authenticates only installation/trip/provider/place/timestamps/nonce", () => {
    const token = createImportTicket({
      installationId,
      externalPlaceId: "ChIJ_test_place",
      environment,
      nonce,
      now,
    });
    expect(verifyImportTicket(token, { installationId, environment, now })).toMatchObject({
      installationId,
      tripId: "london-2026",
      provider: "google",
      externalPlaceId: "ChIJ_test_place",
      nonce,
    });
    expect(token).not.toContain("ChIJ_test_place");
    expect(token).not.toContain(environment.TRAZA_IMPORT_TICKET_SECRET);
  });

  it.each([
    ["tampered", (token: string) => `${token.slice(0, -1)}x`, installationId, now],
    ["wrong installation", (token: string) => token, otherInstallationId, now],
    ["expired", (token: string) => token, installationId, new Date("2026-09-01T10:11:00Z")],
  ] as const)("rejects %s tickets", (_label, mutate, boundInstallation, verificationTime) => {
    const token = createImportTicket({
      installationId,
      externalPlaceId: "ChIJ_test_place",
      environment,
      nonce,
      now,
    });
    expect(
      verifyImportTicket(mutate(token), {
        installationId: boundInstallation,
        environment,
        now: verificationTime,
      }),
    ).toBeNull();
  });

  it("uses a secure HttpOnly host cookie and reads it only server-side", () => {
    const token = createImportTicket({
      installationId,
      externalPlaceId: "ChIJ_test_place",
      environment,
      nonce,
      now,
    });
    const cookie = importTicketCookieHeader(token);
    expect(cookie).toMatch(/Secure; HttpOnly; SameSite=Lax/u);
    expect(cookie).not.toContain("Domain=");
    const request = new Request("https://traza.test/", {
      headers: { cookie: cookie.split(";", 1)[0] },
    });
    expect(readImportTicketFromRequest(request, { installationId, environment, now })).not.toBeNull();
  });
});
