import type { MediaAsset } from "@/domain/models";

const generatedMeta = {
  source: "OpenAI ImageGen",
  author: "OpenAI",
  license: "Generada para Electric London",
  editorial: true,
  generatedAt: "2026-08-02",
} as const;

export const activityMedia: Record<string, MediaAsset> = {
  "Sky Garden": {
    src: "/media/sky-garden-editorial-v2.png",
    alt: "Interior ajardinado de Sky Garden frente al skyline de la City de Londres",
    width: 853,
    height: 2048,
    focalPoint: "50% 58%",
    kind: "photo",
    ...generatedMeta,
  },
};

export const placeMedia: Record<string, MediaAsset> = {
  "Humble Crumble | Camden Market": {
    src: "/media/humble-crumble-editorial-v3.png",
    alt: "Crumble de manzana caliente servido en un vaso en Camden Market",
    width: 1024,
    height: 1536,
    focalPoint: "50% 56%",
    kind: "photo",
    ...generatedMeta,
  },
  "Funky Chips - Camden": {
    src: "/media/funky-chips-editorial-v3.png",
    alt: "Bandeja de patatas cargadas en un puesto de comida de Camden Market",
    width: 1024,
    height: 1536,
    focalPoint: "50% 63%",
    kind: "photo",
    ...generatedMeta,
  },
  "The Mac Factory": {
    src: "/media/mac-factory-editorial-v3.png",
    alt: "Cuenco de macarrones con queso dorado en Camden Market",
    width: 1024,
    height: 1536,
    focalPoint: "50% 61%",
    kind: "photo",
    ...generatedMeta,
  },
  "Royal Albert Hall": {
    src: "/media/royal-albert-hall-v2.png",
    alt: "Fachada curva de ladrillo rojo del Royal Albert Hall al atardecer",
    width: 853,
    height: 2048,
    focalPoint: "68% 44%",
    kind: "photo",
    ...generatedMeta,
  },
  "Kynance Mews": {
    src: "/media/kynance-mews-v2.png",
    alt: "Calle adoquinada de Kynance Mews entre casas blancas cubiertas de vegetación",
    width: 1024,
    height: 1536,
    focalPoint: "50% 54%",
    kind: "photo",
    ...generatedMeta,
  },
  "Hard Rock Cafe": {
    src: "/media/hard-rock-editorial.svg",
    alt: "Composición gráfica inspirada en música y una púa de guitarra para Hard Rock Cafe",
    width: 900,
    height: 1200,
    focalPoint: "50% 50%",
    kind: "graphic",
    source: "Electric London",
    author: "Diseño local",
    license: "Asset propio del proyecto",
  },
};
