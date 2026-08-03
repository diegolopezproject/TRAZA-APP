import type { MediaAsset } from "@/domain/models";

export type MediaClassification = NonNullable<MediaAsset["classification"]>;

export function classifyMedia(media: MediaAsset): MediaClassification {
  if (media.classification) return media.classification;
  if (media.kind === "fallback" || media.kind === "graphic" || media.kind === "illustration") return "graphic-fallback";
  if (media.kind === "generated-editorial" || media.generatedAt) return "generated-editorial";
  if (media.source === "Añadida localmente") return "user-photo";
  return "licensed-photo";
}

export function mediaClassificationLabel(media: MediaAsset): string {
  const labels: Record<MediaClassification, string> = {
    "real-photo": "Foto real",
    "official-photo": "Foto oficial",
    "licensed-photo": "Foto con licencia",
    "user-photo": "Foto del usuario",
    "generated-editorial": "Imagen editorial generada",
    "graphic-fallback": "Imagen pendiente",
  };
  return labels[classifyMedia(media)];
}
