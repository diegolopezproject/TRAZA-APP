import {
  parseGoogleMapsSharePayload,
  type GoogleMapsSharePayload,
} from "@/server/google-maps-share-parser";

export const MAX_SHARE_TARGET_BODY_BYTES = 16 * 1_024;

const SHARE_FIELDS = new Set<keyof GoogleMapsSharePayload>(["title", "text", "url"]);

type ShareTargetResult = "accepted" | "invalid";

function redirectToSaved(request: Request, result: ShareTargetResult): Response {
  const destination = new URL("/", request.url);
  destination.searchParams.set("shareTarget", result);
  destination.hash = "saved";
  return Response.redirect(destination, 303);
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

  return payload;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const formData = await readBoundedFormData(request);
    const payload = formData ? extractSharePayload(formData) : null;
    const parsed = payload ? parseGoogleMapsSharePayload(payload) : null;
    return redirectToSaved(request, parsed?.kind === "success" ? "accepted" : "invalid");
  } catch {
    return redirectToSaved(request, "invalid");
  }
}
