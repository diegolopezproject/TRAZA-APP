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
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
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
