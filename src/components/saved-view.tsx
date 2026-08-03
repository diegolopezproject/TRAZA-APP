"use client";

import { useMemo, useState } from "react";
import type { Place } from "@/domain/models";
import { es } from "@/content/es";
import { formatSpanishDate, mapsUrl } from "@/lib/format";
import { ArrowIcon, HeartIcon, MapIcon, PlusIcon } from "./icons";
import { StatusLabel } from "./status-label";
import { MediaFrame } from "./media-frame";
import { AppHeader } from "./app-header";
import { FilterChip, SavedPlaceCard } from "@/design-system";

interface SavedViewProps {
  places: Place[];
  assignments: Record<string, string>;
  onAssignRequest: (placeId: string) => void;
  onAddPlace: () => void;
  onEditPlace: (placeId: string) => void;
  onOpenPlace: (placeId: string) => void;
  onReset: () => void;
}

const filters = [
  { id: "all", label: es.saved.filters.all },
  { id: "food-drink", label: es.saved.filters["food-drink"] },
  { id: "museum-culture", label: es.saved.filters["museum-culture"] },
  { id: "attraction", label: es.saved.filters.attraction },
  { id: "shopping", label: es.saved.categories.shopping },
] as const;

export function SavedView({ places, assignments, onAssignRequest, onAddPlace, onEditPlace, onOpenPlace, onReset }: SavedViewProps) {
  const [filter, setFilter] = useState<string>("all");
  const visible = useMemo(() => filter === "all" ? places : places.filter((place) => place.category === filter), [filter, places]);

  return (
    <section className="saved-view" aria-labelledby="saved-title">
      <AppHeader context="saved" />
      <header className="saved-header">
        <div>
          <p className="mono-label">Banco de posibilidades</p>
          <h1 id="saved-title">Guardados</h1>
          <p className="saved-summary"><strong>{places.length} lugares</strong> para decidir después, sin mezclarlos con el itinerario.</p>
        </div>
        <button className="add-place-button primary-button" type="button" onClick={onAddPlace}><PlusIcon /> {es.saved.addPlace}</button>
      </header>

      <div className="filter-row" aria-label={es.saved.filtersLabel}>{filters.map((item) => <FilterChip key={item.id} selected={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</FilterChip>)}</div>

      <div className="saved-editorial-list">
        {visible.map((place) => (
          <SavedPlaceCard key={place.id} title={place.name.replace(" | ", " / ")} category={es.saved.categories[place.category] ?? place.category} area={place.area ?? "Londres"} media={place.media ? <MediaFrame media={place.media} sizes="(max-width: 759px) 100vw, 420px" /> : <div className="saved-media-empty"><strong>{place.name}</strong><span>Imagen pendiente</span></div>} action={<>
              <div className="saved-card-top"><span>{place.tags.slice(0, 3).join(" · ")}</span><StatusLabel status={place.status} compact /></div>
              <div className="saved-card-actions">
                <button type="button" className={assignments[place.id] ? "is-assigned" : ""} aria-label={es.saved.assignAria(place.name)} onClick={() => onAssignRequest(place.id)}>{assignments[place.id] ? <HeartIcon /> : <PlusIcon />}<span>{assignments[place.id] ? es.saved.assigned(formatSpanishDate(assignments[place.id])) : es.saved.add}</span><ArrowIcon /></button>
                {place.mapsQuery ? <a className="saved-maps-link" href={mapsUrl(place.mapsQuery)} target="_blank" rel="noreferrer"><MapIcon /> Google Maps</a> : null}
                <button className="saved-detail-button" type="button" onClick={() => onOpenPlace(place.id)}>Detalle</button>
                <button className="saved-edit-button" type="button" onClick={() => onEditPlace(place.id)}>{es.saved.edit}</button>
              </div>
            </>} />
        ))}
      </div>

      {visible.length === 0 ? <div className="saved-empty"><p>{es.saved.empty}</p><button type="button" onClick={() => setFilter("all")}>{es.saved.showAll}</button></div> : null}
      <footer className="saved-settings"><div><strong>Datos del viaje</strong><p>Persistencia local · sin referencias privadas.</p></div><button type="button" onClick={() => { if (window.confirm(es.saved.resetConfirm)) onReset(); }}>{es.saved.reset}</button></footer>
    </section>
  );
}
