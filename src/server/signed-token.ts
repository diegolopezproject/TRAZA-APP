import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_VERSION = "v1";

function signature(input: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(input).digest();
}

export function readServerSecret(
  environment: Readonly<Record<string, string | undefined>>,
  name: string,
): string {
  const secret = environment[name]?.trim();
  if (!secret || secret.length < 32) {
    throw new Error(`Missing or invalid required server configuration: ${name}`);
  }
  return secret;
}

export function signJsonToken(payload: unknown, secret: string): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const authenticated = `${TOKEN_VERSION}.${encoded}`;
  return `${authenticated}.${signature(authenticated, secret).toString("base64url")}`;
}

export function verifyJsonToken(value: string, secret: string): unknown | null {
  const parts = value.split(".");
  if (parts.length !== 3 || parts[0] !== TOKEN_VERSION) return null;

  const authenticated = `${parts[0]}.${parts[1]}`;
  let supplied: Buffer;
  try {
    supplied = Buffer.from(parts[2], "base64url");
  } catch {
    return null;
  }
  const expected = signature(authenticated, secret);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as unknown;
  } catch {
    return null;
  }
}

export function readCookieValue(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const pair of header.split(";")) {
    const separator = pair.indexOf("=");
    if (separator < 0) continue;
    if (pair.slice(0, separator).trim() === name) {
      return pair.slice(separator + 1).trim() || null;
    }
  }
  return null;
}

export function secureHttpOnlyCookie(
  name: string,
  value: string,
  options: { maxAge: number },
): string {
  return [
    `${name}=${value}`,
    "Path=/",
    `Max-Age=${options.maxAge}`,
    "Secure",
    "HttpOnly",
    "SameSite=Lax",
  ].join("; ");
}
