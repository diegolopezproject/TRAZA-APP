import "server-only";

import { randomUUID } from "node:crypto";
import {
  readCookieValue,
  readServerSecret,
  secureHttpOnlyCookie,
  signJsonToken,
  verifyJsonToken,
} from "./signed-token";

export const INSTALLATION_COOKIE_NAME = "__Host-traza-installation";
export const INSTALLATION_COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const MAX_FUTURE_SKEW_SECONDS = 60;

interface InstallationTokenPayload {
  installationId: string;
  issuedAt: number;
}

export type InstallationEnvironment = Readonly<Record<string, string | undefined>>;

function isPayload(value: unknown): value is InstallationTokenPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<InstallationTokenPayload>;
  return (
    typeof payload.installationId === "string" &&
    UUID.test(payload.installationId) &&
    Number.isSafeInteger(payload.issuedAt)
  );
}

function secret(environment: InstallationEnvironment): string {
  return readServerSecret(environment, "TRAZA_INSTALLATION_COOKIE_SECRET");
}

export function createInstallationIdentity(options: {
  environment?: InstallationEnvironment;
  now?: Date;
  installationId?: string;
} = {}): { installationId: string; token: string } {
  const installationId = options.installationId ?? randomUUID();
  if (!UUID.test(installationId)) throw new Error("Invalid installation identity");
  const issuedAt = Math.floor((options.now ?? new Date()).getTime() / 1_000);
  return {
    installationId,
    token: signJsonToken(
      { installationId, issuedAt } satisfies InstallationTokenPayload,
      secret(options.environment ?? process.env),
    ),
  };
}

export function verifyInstallationIdentity(
  token: string,
  options: { environment?: InstallationEnvironment; now?: Date } = {},
): string | null {
  const payload = verifyJsonToken(token, secret(options.environment ?? process.env));
  if (!isPayload(payload)) return null;
  const now = Math.floor((options.now ?? new Date()).getTime() / 1_000);
  if (
    payload.issuedAt > now + MAX_FUTURE_SKEW_SECONDS ||
    now - payload.issuedAt > INSTALLATION_COOKIE_MAX_AGE_SECONDS
  ) {
    return null;
  }
  return payload.installationId;
}

export function installationCookieHeader(token: string): string {
  return secureHttpOnlyCookie(INSTALLATION_COOKIE_NAME, token, {
    maxAge: INSTALLATION_COOKIE_MAX_AGE_SECONDS,
  });
}

export function readInstallationIdFromRequest(
  request: Request,
  environment: InstallationEnvironment = process.env,
  now = new Date(),
): string | null {
  const token = readCookieValue(request.headers.get("cookie"), INSTALLATION_COOKIE_NAME);
  return token ? verifyInstallationIdentity(token, { environment, now }) : null;
}
