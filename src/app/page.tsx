import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TripApp } from "@/components/trip-app";
import { SeedTripRepository } from "@/data/seed-trip-repository";
import { parseImportResult } from "@/domain/import-result";
import {
  INSTALLATION_COOKIE_NAME,
  verifyInstallationIdentity,
} from "@/server/installation-identity";
import { loadImportedPlacesForInstallation } from "@/server/imported-place-hydration";

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function bootstrapDestination(importResult: string | null): string {
  const returnTo = importResult
    ? `/?importResult=${encodeURIComponent(importResult)}#saved`
    : "/#days";
  return `/api/installation/bootstrap?returnTo=${encodeURIComponent(returnTo)}`;
}

export default async function Home({ searchParams }: HomeProps) {
  const query = await searchParams;
  const rawResult = Array.isArray(query.importResult)
    ? query.importResult[0]
    : query.importResult;
  const importResult = parseImportResult(rawResult);
  const cookieStore = await cookies();
  const token = cookieStore.get(INSTALLATION_COOKIE_NAME)?.value;

  let installationId: string | null = null;
  try {
    installationId = token ? verifyInstallationIdentity(token) : null;
  } catch {
    installationId = null;
  }
  if (!installationId) redirect(bootstrapDestination(importResult));

  const trip = await new SeedTripRepository().getTrip();
  const importedPlaces = await loadImportedPlacesForInstallation(installationId);
  return <TripApp trip={trip} importedPlaces={importedPlaces} />;
}
