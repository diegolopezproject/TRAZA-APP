import "server-only";

import { randomUUID } from "node:crypto";
import { TRAZA_TRIP_ID } from "@/domain/trip-scope";
import {
  readCookieValue,
  readServerSecret,
  secureHttpOnlyCookie,
  signJsonToken,
  verifyJsonToken,
} from "./signed-token";

export const IMPORT_TICKET_COOKIE_NAME = "__Host-traza-import-ticket";
export const IMPORT_TICKET_TTL_SECONDS = 10 * 60;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const PLACE_ID = /^[A-Za-z0-9_-]{3,255}$/u;

export interface ImportTicketPayload {
  installationId: string;
  tripId: typeof TRAZA_TRIP_ID;
  provider: "google";
  externalPlaceId: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
}

export type ImportTicketEnvironment = Readonly<Record<string, string | undefined>>;

function isTicket(value: unknown): value is ImportTicketPayload {
  if (!value || typeof value !== "object") return false;
  const ticket = value as Partial<ImportTicketPayload>;
  return (
    typeof ticket.installationId === "string" &&
    UUID.test(ticket.installationId) &&
    ticket.tripId === TRAZA_TRIP_ID &&
    ticket.provider === "google" &&
    typeof ticket.externalPlaceId === "string" &&
    PLACE_ID.test(ticket.externalPlaceId) &&
    typeof ticket.issuedAt === "number" &&
    Number.isSafeInteger(ticket.issuedAt) &&
    typeof ticket.expiresAt === "number" &&
    Number.isSafeInteger(ticket.expiresAt) &&
    typeof ticket.nonce === "string" &&
    UUID.test(ticket.nonce) &&
    ticket.expiresAt === ticket.issuedAt + IMPORT_TICKET_TTL_SECONDS
  );
}

function secret(environment: ImportTicketEnvironment): string {
  return readServerSecret(environment, "TRAZA_IMPORT_TICKET_SECRET");
}

export function createImportTicket(input: {
  installationId: string;
  externalPlaceId: string;
  environment?: ImportTicketEnvironment;
  now?: Date;
  nonce?: string;
}): string {
  const issuedAt = Math.floor((input.now ?? new Date()).getTime() / 1_000);
  const payload: ImportTicketPayload = {
    installationId: input.installationId,
    tripId: TRAZA_TRIP_ID,
    provider: "google",
    externalPlaceId: input.externalPlaceId,
    issuedAt,
    expiresAt: issuedAt + IMPORT_TICKET_TTL_SECONDS,
    nonce: input.nonce ?? randomUUID(),
  };
  if (!isTicket(payload)) throw new Error("Invalid import ticket input");
  return signJsonToken(payload, secret(input.environment ?? process.env));
}

export function verifyImportTicket(
  token: string,
  input: {
    installationId: string;
    environment?: ImportTicketEnvironment;
    now?: Date;
  },
): ImportTicketPayload | null {
  const payload = verifyJsonToken(token, secret(input.environment ?? process.env));
  if (!isTicket(payload) || payload.installationId !== input.installationId) return null;
  const now = Math.floor((input.now ?? new Date()).getTime() / 1_000);
  return now >= payload.issuedAt - 60 && now < payload.expiresAt ? payload : null;
}

export function readImportTicketFromRequest(
  request: Request,
  input: {
    installationId: string;
    environment?: ImportTicketEnvironment;
    now?: Date;
  },
): ImportTicketPayload | null {
  const token = readCookieValue(request.headers.get("cookie"), IMPORT_TICKET_COOKIE_NAME);
  return token ? verifyImportTicket(token, input) : null;
}

export function importTicketCookieHeader(token: string): string {
  return secureHttpOnlyCookie(IMPORT_TICKET_COOKIE_NAME, token, {
    maxAge: IMPORT_TICKET_TTL_SECONDS,
  });
}

export function clearImportTicketCookieHeader(): string {
  return secureHttpOnlyCookie(IMPORT_TICKET_COOKIE_NAME, "", { maxAge: 0 });
}
