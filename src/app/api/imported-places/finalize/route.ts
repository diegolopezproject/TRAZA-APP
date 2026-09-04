import type { ImportResultCode } from "@/domain/import-result";
import {
  isTrazaImportCategory,
  type TrazaImportCategory,
} from "@/domain/place-import";
import {
  finalizePendingImportWithProductionDependencies,
} from "@/server/finalize-import";
import {
  clearImportTicketCookieHeader,
  readImportTicketFromRequest,
  type ImportTicketPayload,
} from "@/server/import-ticket";
import { readInstallationIdFromRequest } from "@/server/installation-identity";
import { hasSameOrigin } from "@/server/same-origin";

const MAX_FINALIZE_BODY_BYTES = 1_024;

export interface FinalizeRouteDependencies {
  installationId(request: Request): string | null;
  ticket(request: Request, installationId: string): ImportTicketPayload | null;
  finalize(input: {
    installationId: string;
    ticket: ImportTicketPayload;
    category: TrazaImportCategory;
  }): Promise<Exclude<ImportResultCode, "needs-category" | "rate-limited">>;
}

function redirectResult(
  request: Request,
  result: Exclude<ImportResultCode, "needs-category" | "rate-limited">,
): Response {
  const destination = new URL("/", request.url);
  destination.searchParams.set("importResult", result);
  destination.hash = "saved";
  return new Response(null, {
    status: 303,
    headers: {
      location: destination.toString(),
      "set-cookie": clearImportTicketCookieHeader(),
    },
  });
}

async function readCategory(request: Request): Promise<TrazaImportCategory | null> {
  const type = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (
    (type !== "application/x-www-form-urlencoded" && type !== "multipart/form-data") ||
    !request.body
  ) {
    return null;
  }
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength);
    if (
      !Number.isSafeInteger(parsedLength) ||
      parsedLength < 0 ||
      parsedLength > MAX_FINALIZE_BODY_BYTES
    ) {
      return null;
    }
  }

  try {
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_FINALIZE_BODY_BYTES) {
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
    const form = await new Response(body, {
      headers: { "content-type": request.headers.get("content-type") ?? "" },
    }).formData();
    const entries = [...form.entries()];
    if (entries.length !== 1 || entries[0][0] !== "category") return null;
    return isTrazaImportCategory(entries[0][1]) ? entries[0][1] : null;
  } catch {
    return null;
  }
}

export function createFinalizeRouteHandlers(dependencies: FinalizeRouteDependencies) {
  return {
    async POST(request: Request): Promise<Response> {
      if (!hasSameOrigin(request)) return new Response(null, { status: 403 });
      try {
        const installationId = dependencies.installationId(request);
        if (!installationId) return redirectResult(request, "failed");
        const ticket = dependencies.ticket(request, installationId);
        const category = await readCategory(request);
        if (!ticket || !category) return redirectResult(request, "failed");
        const result = await dependencies.finalize({ installationId, ticket, category });
        return redirectResult(request, result);
      } catch {
        return redirectResult(request, "failed");
      }
    },
    async DELETE(request: Request): Promise<Response> {
      if (!hasSameOrigin(request)) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: { "set-cookie": clearImportTicketCookieHeader() },
      });
    },
  };
}

const handlers = createFinalizeRouteHandlers({
  installationId: (request) => readInstallationIdFromRequest(request),
  ticket: (request, installationId) =>
    readImportTicketFromRequest(request, { installationId }),
  finalize: finalizePendingImportWithProductionDependencies,
});

export const POST = handlers.POST;
export const DELETE = handlers.DELETE;
