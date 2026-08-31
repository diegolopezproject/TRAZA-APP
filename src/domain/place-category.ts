import type { NormalizedPlaceCandidate, TrazaImportCategory } from "./place-import";

const CATEGORY_BY_EXTERNAL_TYPE = {
  restaurant: "food-drink",
  cafe: "food-drink",
  bakery: "food-drink",
  bar: "food-drink",
  pub: "food-drink",
  coffee_shop: "food-drink",
  breakfast_restaurant: "food-drink",
  brunch_restaurant: "food-drink",
  fast_food_restaurant: "food-drink",
  fine_dining_restaurant: "food-drink",
  hamburger_restaurant: "food-drink",
  ice_cream_shop: "food-drink",
  pizza_restaurant: "food-drink",
  sandwich_shop: "food-drink",
  seafood_restaurant: "food-drink",

  museum: "museum-culture",
  art_gallery: "museum-culture",
  cultural_center: "museum-culture",
  performing_arts_theater: "museum-culture",

  store: "shopping",
  shopping_mall: "shopping",
  book_store: "shopping",
  clothing_store: "shopping",
  department_store: "shopping",
  electronics_store: "shopping",
  gift_shop: "shopping",
  grocery_store: "shopping",
  home_goods_store: "shopping",
  jewelry_store: "shopping",
  market: "shopping",
  shoe_store: "shopping",
  sporting_goods_store: "shopping",
  supermarket: "shopping",

  tourist_attraction: "attraction",
  park: "attraction",
  national_park: "attraction",
  landmark: "attraction",
  cultural_landmark: "attraction",
  historical_landmark: "attraction",
  historical_place: "attraction",
  monument: "attraction",
  observation_deck: "attraction",
  plaza: "attraction",
  visitor_center: "attraction",
  locality: "attraction",
  neighborhood: "attraction",
} as const satisfies Record<string, TrazaImportCategory>;

const FACTUAL_TAG_BY_EXTERNAL_TYPE = {
  restaurant: "Restaurante",
  cafe: "Cafetería",
  bakery: "Panadería",
  bar: "Bar",
  pub: "Pub",
  coffee_shop: "Cafetería",
  museum: "Museo",
  art_gallery: "Galería de arte",
  cultural_center: "Centro cultural",
  store: "Tienda",
  shopping_mall: "Centro comercial",
  book_store: "Librería",
  clothing_store: "Tienda de ropa",
  park: "Parque",
  tourist_attraction: "Atracción turística",
  historical_place: "Lugar histórico",
  neighborhood: "Barrio",
} as const satisfies Record<string, string>;

export type PlaceCategoryClassification =
  | { kind: "classified"; category: TrazaImportCategory }
  | { kind: "ambiguous" };

type CandidateTypes = Pick<NormalizedPlaceCandidate, "primaryType"> & {
  types?: readonly string[];
};

function mappedCategory(type: string | undefined): TrazaImportCategory | undefined {
  if (!type || !Object.hasOwn(CATEGORY_BY_EXTERNAL_TYPE, type)) {
    return undefined;
  }

  return CATEGORY_BY_EXTERNAL_TYPE[type as keyof typeof CATEGORY_BY_EXTERNAL_TYPE];
}

export function classifyPlaceCategory(candidate: CandidateTypes): PlaceCategoryClassification {
  const primaryCategory = mappedCategory(candidate.primaryType);
  if (primaryCategory) {
    return { kind: "classified", category: primaryCategory };
  }

  const categories = new Set<TrazaImportCategory>();
  for (const type of candidate.types ?? []) {
    const category = mappedCategory(type);
    if (category) {
      categories.add(category);
    }
  }

  if (categories.size !== 1) {
    return { kind: "ambiguous" };
  }

  return { kind: "classified", category: categories.values().next().value! };
}

export function factualPlaceTags(candidate: CandidateTypes): readonly string[] {
  const types = candidate.types ?? [];
  const orderedTypes = candidate.primaryType ? [candidate.primaryType, ...types] : types;
  const tags: string[] = [];

  for (const type of orderedTypes) {
    if (!Object.hasOwn(FACTUAL_TAG_BY_EXTERNAL_TYPE, type)) {
      continue;
    }

    const tag = FACTUAL_TAG_BY_EXTERNAL_TYPE[type as keyof typeof FACTUAL_TAG_BY_EXTERNAL_TYPE];
    if (!tags.includes(tag)) {
      tags.push(tag);
    }

    if (tags.length === 2) {
      break;
    }
  }

  return tags;
}
