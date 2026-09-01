import { NextResponse } from "next/server";
import {
  createInstallationIdentity,
  INSTALLATION_COOKIE_NAME,
  installationCookieHeader,
  verifyInstallationIdentity,
} from "@/server/installation-identity";
import { readCookieValue } from "@/server/signed-token";

function safeReturnTo(request: Request): URL {
  const requestUrl = new URL(request.url);
  const raw = requestUrl.searchParams.get("returnTo") ?? "/#days";
  if (!raw.startsWith("/") || raw.startsWith("//")) return new URL("/#days", requestUrl);
  const target = new URL(raw, requestUrl);
  return target.origin === requestUrl.origin ? target : new URL("/#days", requestUrl);
}

export interface InstallationBootstrapDependencies {
  verify(token: string): string | null;
  create(): { token: string };
}

export function createInstallationBootstrapHandler(
  dependencies: InstallationBootstrapDependencies,
) {
  return async function bootstrap(request: Request): Promise<Response> {
    const target = safeReturnTo(request);
    try {
      const existing = readCookieValue(request.headers.get("cookie"), INSTALLATION_COOKIE_NAME);
      if (existing && dependencies.verify(existing)) {
        return NextResponse.redirect(target, 303);
      }
      const identity = dependencies.create();
      const response = NextResponse.redirect(target, 303);
      response.headers.append("set-cookie", installationCookieHeader(identity.token));
      return response;
    } catch {
      return new Response("TRAZA no está disponible temporalmente.", {
        status: 503,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  };
}

export const GET = createInstallationBootstrapHandler({
  verify: (token) => verifyInstallationIdentity(token),
  create: () => createInstallationIdentity(),
});
