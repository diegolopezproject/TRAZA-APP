"use client";

import { useMemo } from "react";
import type { Place } from "@/domain/models";
import { es } from "@/content/es";
import { formatSpanishDate, mapsUrl } from "@/lib/format";
import { PlusIcon } from "./icons";
import { MediaFrame } from "./media-frame";
import { Button, FilterChip, PageHeader, SavedPlaceCard } from "@/design-system";

interface SavedViewProps {
  places: Place[];
  assignments: Record<string, string>;
  onAssignRequest: (placeId: string) => void;
  onAddPlace: () => void;
  onEditPlace: (placeId: string) => void;
  onOpenPlace: (placeId: string) => void;
  onReset: () => void;
  filter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: "all", label: es.saved.filters.all },
  { id: "food-drink", label: es.saved.filters["food-drink"] },
  { id: "museum-culture", label: es.saved.filters["museum-culture"] },
  { id: "attraction", label: es.saved.filters.attraction },
  { id: "shopping", label: es.saved.categories.shopping },
] as const;

export function SavedView({ places, assignments, onAssignRequest, onAddPlace, onEditPlace, onOpenPlace, onReset, filter, onFilterChange }: SavedViewProps) {
  const visible = useMemo(() => filter === "all" ? places : places.filter((place) => place.category === filter), [filter, places]);

  return (
    <section className="saved-view" aria-labelledby="saved-title" data-navigation-scroll="saved">
      <div className="saved-header"><PageHeader eyebrow="Londres 2026" title="Guardados" count={`${places.length} lugares`} id="saved-title" /><Button className="add-place-button" type="button" onClick={onAddPlace}><PlusIcon /> {es.saved.addPlace}</Button></div>

      <div className="filter-row" aria-label={es.saved.filtersLabel}>{filters.map((item) => <FilterChip key={item.id} selected={filter === item.id} onClick={() => onFilterChange(item.id)}>{item.label}</FilterChip>)}</div>

      <div className="saved-editorial-list">
        {visible.map((place) => (
          <SavedPlaceCard key={place.id} title={place.name.replace(" | ", " / ")} category={es.saved.categories[place.category] ?? place.category} area={place.area ?? "Londres"} tags={place.tags} media={place.media ? <MediaFrame media={place.media} sizes="(max-width: 759px) 100vw, 420px" /> : <div className="saved-media-empty"><strong>{place.name}</strong><span>Imagen pendiente</span></div>} assignedLabel={assignments[place.id] ? `Asignado al ${formatSpanishDate(assignments[place.id])}` : undefined} onAssign={() => onAssignRequest(place.id)} mapsHref={place.mapsQuery ? mapsUrl(place.mapsQuery) : undefined} onDetail={() => onOpenPlace(place.id)} onEdit={() => onEditPlace(place.id)} />
        ))}
      </div>

      {visible.length === 0 ? <div className="saved-empty"><p>{es.saved.empty}</p><button type="button" onClick={() => onFilterChange("all")}>{es.saved.showAll}</button></div> : null}
      <footer className="saved-settings"><div><strong>Datos del viaje</strong><p>Persistencia local · sin referencias privadas.</p></div><button type="button" onClick={() => { if (window.confirm(es.saved.resetConfirm)) onReset(); }}>{es.saved.reset}</button></footer>
    </section>
  );
}
