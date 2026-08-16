import type { MediaAsset } from "@/domain/models";
import { slugify } from "@/lib/format";

const generatedMeta = {
  source: "OpenAI ImageGen",
  author: "OpenAI",
  license: "Generada para Electric London",
  editorial: true,
  generatedAt: "2026-08-02",
  classification: "generated-editorial" as const,
};

function commonsPhoto(asset: Omit<MediaAsset, "kind" | "classification" | "source">): MediaAsset {
  return { ...asset, kind: "photo", classification: "licensed-photo", source: "Wikimedia Commons" };
}

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
  "Natural History Museum": commonsPhoto({
    src: "/media/natural-history-museum-wikimedia.jpg",
    alt: "Exterior real del Natural History Museum de Londres",
    width: 1280,
    height: 1273,
    focalPoint: "50% 48%",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Exterior_of_the_Natural_History_Museum,_London.jpg",
    author: "Yair Haklai",
    license: "CC BY-SA 4.0",
  }),
  "Design Museum": commonsPhoto({
    src: "/media/design-museum-wikimedia.jpg",
    alt: "Exterior real del Design Museum en Kensington",
    width: 1400,
    height: 927,
    focalPoint: "50% 50%",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Design_Museum,_Kensington_exterior_2017-09-16.jpg",
    author: "Ben Sutherland",
    license: "CC BY 2.0",
  }),
  "Shakespeare's Globe": commonsPhoto({
    src: "/media/shakespeares-globe-wikimedia.jpg",
    alt: "Exterior real de Shakespeare's Globe visto desde Bankside",
    width: 1400,
    height: 931,
    focalPoint: "50% 48%",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Shakespeare%27s_Globe,_London.jpg",
    author: "Tristan Surtel",
    license: "CC BY-SA 4.0",
  }),
};

export const placeMedia: Record<string, MediaAsset> = {
  "M&M's London": commonsPhoto({
    src: "/media/mms-london-wikimedia.jpg",
    alt: "Fachada real de M&M's World en Leicester Square, Londres",
    width: 1400,
    height: 1050,
    focalPoint: "50% 50%",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Leicester_Square,_London_-_M_%26_Ms_World_(6438073309).jpg",
    author: "Elliott Brown",
    license: "CC BY 2.0",
  }),
  Hamleys: commonsPhoto({
    src: "/media/hamleys-wikimedia.jpg",
    alt: "Fachada real de Hamleys en Regent Street, Londres",
    width: 1400,
    height: 1050,
    focalPoint: "50% 50%",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Hamleys_Toy_Shop_-_geograph.org.uk_-_2381703.jpg",
    author: "Wikimedia Commons / Geograph",
    license: "CC BY-SA 2.0",
  }),
  Harrods: commonsPhoto({
    src: "/media/harrods-wikimedia.jpg",
    alt: "Exterior real de Harrods en Londres",
    width: 1400,
    height: 1050,
    focalPoint: "50% 50%",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Harrods_(London).jpg",
    author: "Sokkk y",
    license: "Dominio público",
  }),
  "Humble Crumble | Camden Market": {
    src: "/media/humble-crumble-editorial-v3.png", alt: "Crumble de manzana servido en un vaso", width: 1024, height: 1536, focalPoint: "50% 56%", kind: "generated-editorial", ...generatedMeta,
  },
  "Funky Chips - Camden": {
    src: "/media/funky-chips-editorial-v3.png", alt: "Composición editorial de patatas cargadas", width: 1024, height: 1536, focalPoint: "50% 63%", kind: "generated-editorial", ...generatedMeta,
  },
  "The Mac Factory": {
    src: "/media/mac-factory-editorial-v3.png", alt: "Composición editorial de macarrones con queso", width: 1024, height: 1536, focalPoint: "50% 61%", kind: "generated-editorial", ...generatedMeta,
  },
  "Royal Albert Hall": commonsPhoto({
    src: "/media/royal-albert-hall-wikimedia.jpg",
    alt: "Exterior real del Royal Albert Hall en Londres",
    width: 1400,
    height: 933,
    focalPoint: "50% 48%",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Royal_Albert_Hall_Exterior.jpg",
    author: "Mdbeckwith",
    license: "CC BY 3.0",
  }),
  "Kynance Mews": {
    src: "/media/kynance-mews-v2.png", alt: "Imagen editorial generada de Kynance Mews, no documental", width: 1024, height: 1536, focalPoint: "50% 54%", kind: "generated-editorial", ...generatedMeta,
  },
  "Hard Rock Cafe": commonsPhoto({
    src: "/media/hard-rock-wikimedia.jpg",
    alt: "Exterior real del Hard Rock Cafe de Old Park Lane, Londres",
    width: 1063,
    height: 1400,
    focalPoint: "50% 72%",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:The_Hard_Rock_Cafe_-_geograph.org.uk_-_2321056.jpg",
    author: "Geograph Britain and Ireland",
    license: "CC BY-SA 2.0",
  }),
  "Design Museum": activityMedia["Design Museum"],
  "Shakespeare's Globe": activityMedia["Shakespeare's Globe"],
};

const fallbackPalettes = ["#d5f43b", "#ff6d3b", "#ffb7d5", "#83d9e8", "#b6a0ff", "#f4f1ea"];

/** Stable visual identity for missing media, explicitly labelled as a non-documentary fallback. */
export function fallbackPlaceMedia(name: string): MediaAsset {
  const hue = [...name].reduce((total, char) => total + char.charCodeAt(0), 0) % fallbackPalettes.length;
  return {
    src: `fallback://${slugify(name)}`,
    alt: `Gráfico editorial de ${name}`,
    focalPoint: "50% 50%",
    kind: "fallback",
    classification: "graphic-fallback",
    source: "TRAZA deterministic editorial fallback",
    author: "Electric London",
    license: "Asset propio del proyecto",
    editorial: true,
    sourceUrl: fallbackPalettes[hue],
  };
}
