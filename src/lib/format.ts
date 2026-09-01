import type { MapsDestination } from "@/domain/models";

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function dayNumber(date: string): string {
  return date.slice(-2);
}

export function mapsUrl(query: string): string {
  return mapsDestinationUrl({ kind: "query", value: query }) ?? "";
}

const CANONICAL_GOOGLE_MAPS_HOSTS = new Set([
  "google.com",
  "www.google.com",
  "maps.google.com",
]);

export function mapsDestinationUrl(destination: MapsDestination): string | undefined {
  if (destination.kind === "query") {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.value)}`;
  }

  try {
    const url = new URL(destination.value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      !CANONICAL_GOOGLE_MAPS_HOSTS.has(url.hostname.toLowerCase())
    ) {
      return undefined;
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

export function placeMapsUrl(place: {
  mapsDestination?: MapsDestination;
  mapsQuery?: string;
}): string | undefined {
  return place.mapsDestination
    ? mapsDestinationUrl(place.mapsDestination)
    : place.mapsQuery
      ? mapsUrl(place.mapsQuery)
      : undefined;
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const shortDateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

export function formatSpanishDate(date: string): string {
  return dateFormatter.format(new Date(`${date}T12:00:00Z`));
}

export function formatSpanishShortDate(date: string): string {
  return shortDateFormatter.format(new Date(`${date}T12:00:00Z`)).replace(".", "");
}
