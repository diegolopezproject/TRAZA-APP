import type { ImportResultCode } from "@/domain/import-result";
import {
  createGoogleMapsImportService,
  type GoogleMapsImportService,
} from "@/server/google-maps-import-service";
import type {
  PreparedPlaceImportOutcome,
} from "@/server/google-maps-import-orchestrator";
import {
  type GoogleMapsSharePayload,
} from "@/server/google-maps-share-parser";
import {
  clearImportTicketCookieHeader,
  createImportTicket,
  importTicketCookieHeader,
} from "@/server/import-ticket";
import {
  readInstallationIdFromRequest,
} from "@/server/installation-identity";
import {
  createImportedPlaceRepository,
} from "@/server/supabase";
import {
  persistPreparedPlaceImport,
  type ImportedPlaceInsertPort,
} from "@/server/place-import-persistence";

export const MAX_SHARE_TARGET_BODY_BYTES = 16 * 1_024;

const SHARE_FIELDS = new Set<keyof GoogleMapsSharePayload>(["title", "text", "url"]);

export interface ShareRouteDependencies {
  installationId(request: Request): string | null;
  prepare(payload: GoogleMapsSharePayload): Promise<PreparedPlaceImportOutcome>;
  repository(): ImportedPlaceInsertPort;
  issueTicket(input: { installationId: string; externalPlaceId: string }): string;
}

function redirectToSaved(
  request: Request,
  result: ImportResultCode,
  cookie?: string,
): Response {
  const destination = new URL("/", request.url);
  destination.searchParams.set("importResult", result);
  destination.hash = "saved";
  return new Response(null, {
    status: 303,
    headers: {
      location: destination.toString(),
      "set-cookie": cookie ?? clearImportTicketCookieHeader(),
    },
  });
}

function redirectThroughBootstrap(request: Request): Response {
  const destination = new URL("/api/installation/bootstrap", request.url);
  destination.searchParams.set("returnTo", "/?importResult=failed#saved");
  return new Response(null, {
    status: 303,
    headers: {
      location: destination.toString(),
      "set-cookie": clearImportTicketCookieHeader(),
    },
  });
}

function isMultipartFormData(request: Request): boolean {
  const contentType = request.headers.get("content-type");
  if (!contentType) return false;
  return contentType.split(";", 1)[0].trim().toLowerCase() === "multipart/form-data";
}

async function readBoundedFormData(request: Request): Promise<FormData | null> {
  if (!isMultipartFormData(request) || !request.body) return null;

  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength);
    if (
      !Number.isSafeInteger(parsedLength) ||
      parsedLength < 0 ||
      parsedLength > MAX_SHARE_TARGET_BODY_BYTES
    ) {
      return null;
    }
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_SHARE_TARGET_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return await new Response(body, {
      headers: { "content-type": request.headers.get("content-type") ?? "" },
    }).formData();
  } catch {
    return null;
  }
}

function extractSharePayload(formData: FormData): GoogleMapsSharePayload | null {
  const payload: GoogleMapsSharePayload = {};

  for (const [rawField, value] of formData.entries()) {
    if (!SHARE_FIELDS.has(rawField as keyof GoogleMapsSharePayload) || typeof value !== "string") {
      return null;
    }
    const field = rawField as keyof GoogleMapsSharePayload;
    if (value.trim() && payload[field] === undefined) payload[field] = value;
  }

  return Object.keys(payload).length ? payload : null;
}

export function createShareRouteHandler(dependencies: ShareRouteDependencies) {
  return async function handleShare(request: Request): Promise<Response> {
    let installationId: string | null;
    try {
      installationId = dependencies.installationId(request);
    } catch {
      return redirectToSaved(request, "failed");
    }
    if (!installationId) return redirectThroughBootstrap(request);

    try {
      const formData = await readBoundedFormData(request);
      const payload = formData ? extractSharePayload(formData) : null;
      if (!payload) return redirectToSaved(request, "failed");

      const prepared = await dependencies.prepare(payload);
      const result = await persistPreparedPlaceImport(prepared, {
        installationId,
        repository: dependencies.repository(),
      });
      if (result.kind !== "needs-category") {
        return redirectToSaved(request, result.kind);
      }

      const ticket = dependencies.issueTicket({
        installationId,
        externalPlaceId: result.externalPlaceId,
      });
      return redirectToSaved(request, "needs-category", importTicketCookieHeader(ticket));
    } catch {
      return redirectToSaved(request, "failed");
    }
  };
}

let importService: GoogleMapsImportService | null = null;

export const POST = createShareRouteHandler({
  installationId: (request) => readInstallationIdFromRequest(request),
  prepare(payload) {
    importService ??= createGoogleMapsImportService();
    return importService.prepare({ sharePayload: payload });
  },
  repository: () => createImportedPlaceRepository(),
  issueTicket: createImportTicket,
});
