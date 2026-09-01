import type { Place } from "./models";
import type { ImportedPlaceViewModel } from "./place-import";

export function importedViewModelToPlace(place: ImportedPlaceViewModel): Place {
  return {
    id: place.id,
    name: place.name,
    category: place.category,
    status: "saved",
    area: place.area,
    tags: [...place.tags],
    mapsDestination: place.mapsDestination,
    source: place.source,
    importedRecordId: place.recordId,
  };
}

export function mergeHybridPlaces(
  localPlaces: readonly Place[],
  importedPlaces: readonly ImportedPlaceViewModel[],
): Place[] {
  return [...localPlaces, ...importedPlaces.map(importedViewModelToPlace)];
}
