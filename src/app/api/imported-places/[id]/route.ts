import { TRAZA_TRIP_ID } from "@/domain/trip-scope";
import { readInstallationIdFromRequest } from "@/server/installation-identity";
import type { ImportedPlaceRepository } from "@/server/imported-place-repository";
import { hasSameOrigin } from "@/server/same-origin";
import { createImportedPlaceRepository } from "@/server/supabase";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export interface DeleteImportedPlaceRouteDependencies {
  installationId(request: Request): string | null;
  repository(): Pick<ImportedPlaceRepository, "delete">;
}

export function createDeleteImportedPlaceHandler(
  dependencies: DeleteImportedPlaceRouteDependencies,
) {
  return async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> },
  ): Promise<Response> {
    if (!hasSameOrigin(request)) return Response.json({ result: "failed" }, { status: 403 });
    const { id } = await context.params;
    if (!UUID.test(id)) return Response.json({ result: "failed" }, { status: 400 });
    try {
      const installationId = dependencies.installationId(request);
      if (!installationId) return Response.json({ result: "failed" }, { status: 401 });
      const result = await dependencies.repository().delete({
        recordId: id,
        installationId,
        tripId: TRAZA_TRIP_ID,
      });
      if (result.kind === "deleted") return Response.json({ result: "deleted" });
      if (result.kind === "not-found") {
        return Response.json({ result: "not-found" }, { status: 404 });
      }
      return Response.json({ result: "failed" }, { status: 500 });
    } catch {
      return Response.json({ result: "failed" }, { status: 500 });
    }
  };
}

export const DELETE = createDeleteImportedPlaceHandler({
  installationId: (request) => readInstallationIdFromRequest(request),
  repository: () => createImportedPlaceRepository(),
});
