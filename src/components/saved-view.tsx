"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { Place } from "@/domain/models";
import { es } from "@/content/es";
import { formatSpanishDate } from "@/lib/format";
import { mapsUrl } from "@/lib/format";
import { ArrowIcon, HeartIcon, PlusIcon } from "./icons";
import { StatusLabel } from "./status-label";
import { MediaFrame } from "./media-frame";
import { AppHeader } from "./app-header";

interface SavedViewProps {
  places: Place[];
  assignments: Record<string, string>;
  onAssignRequest: (placeId: string) => void;
  onAddPlace: () => void;
  onEditPlace: (placeId: string) => void;
  onReset: () => void;
}

const filters = [
  { id: "all", label: es.saved.filters.all },
  { id: "food-drink", label: es.saved.filters["food-drink"] },
  { id: "museum-culture", label: es.saved.filters["museum-culture"] },
  { id: "attraction", label: es.saved.filters.attraction },
  { id: "shopping", label: es.saved.categories.shopping },
] as const;

function hueFor(value: string): number {
  return [...value].reduce((total, char) => total + char.charCodeAt(0) * 7, 0) % 360;
}

export function SavedView({ places, assignments, onAssignRequest, onAddPlace, onEditPlace, onReset }: SavedViewProps) {
  const [filter, setFilter] = useState<string>("all");
  const visible = useMemo(() => filter === "all" ? places : places.filter((place) => place.category === filter), [filter, places]);

  return (
    <section className="saved-view" aria-labelledby="saved-title">
      <AppHeader context="saved" />
      <header className="saved-header">
        <div className="saved-symbol" aria-hidden="true"><HeartIcon /></div>
        <p className="mono-label">{es.saved.kicker}</p>
        <h1 id="saved-title">{es.saved.title.split("\n").map((line, index) => index === 1 ? <em key={line}>{line}</em> : <span key={line}>{line}</span>)}</h1>
        <div className="saved-count"><strong>{places.length}</strong><span>{es.saved.subtitle(places.length).replace(`${places.length} `, "")}</span></div>
        <button className="add-place-button" type="button" onClick={onAddPlace}><PlusIcon /> {es.saved.addPlace}</button>
      </header>

      <div className="filter-row" aria-label={es.saved.filtersLabel}>{filters.map((item) => <button key={item.id} className={filter === item.id ? "active" : ""} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div>

      <div className="saved-editorial-list">
        {visible.map((place, index) => {
          const fallbackStyle = { "--fallback-hue": `${hueFor(place.id)}deg` } as CSSProperties;
          return (
            <article className={`saved-card saved-card--${(index % 4) + 1}${assignments[place.id] ? " is-assigned" : ""}`} key={place.id}>
              <div className="saved-media">
                {place.media ? <MediaFrame media={place.media} sizes="(max-width: 759px) 100vw, 330px" /> : <span className="saved-media-fallback" style={fallbackStyle} role="img" aria-label={es.saved.graphicAria(place.name)}><b>{place.name.split(/\s|&/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("")}</b><i>{es.saved.categories[place.category]}</i></span>}
                <span className="saved-big-index">{String(index + 1).padStart(2, "0")}</span><span className="saved-area-code">{place.area?.slice(0, 3).toUpperCase() ?? "LDN"}</span>
              </div>
              <div className="saved-card-copy">
                <div className="saved-card-top"><span>{es.saved.categories[place.category] ?? place.category}</span><StatusLabel status={place.status} compact /></div>
                <h2>{place.name.replace(" | ", " / ")}</h2><p>{place.area ?? "Londres"}</p>
                {place.tags.length ? <div className="place-tags">{place.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
                <div className="saved-card-actions">
                  <button type="button" className={assignments[place.id] ? "is-assigned" : ""} aria-label={es.saved.assignAria(place.name)} onClick={() => onAssignRequest(place.id)}>{assignments[place.id] ? <HeartIcon /> : <PlusIcon />}{assignments[place.id] ? es.saved.assigned(formatSpanishDate(assignments[place.id])) : es.saved.add}<ArrowIcon /></button>
                  <button type="button" onClick={() => onEditPlace(place.id)}>{es.saved.edit}</button>
                </div>
                {place.mapsQuery ? <a className="saved-maps-link" href={mapsUrl(place.mapsQuery)} target="_blank" rel="noreferrer">Abrir en Google Maps <ArrowIcon /></a> : null}
              </div>
            </article>
          );
        })}
      </div>

      {visible.length === 0 ? <div className="saved-empty"><p>{es.saved.empty}</p><button type="button" onClick={() => setFilter("all")}>{es.saved.showAll}</button></div> : null}
      <footer className="saved-settings"><p>Datos locales · esquema v3</p><button type="button" onClick={() => { if (window.confirm(es.saved.resetConfirm)) onReset(); }}>{es.saved.reset}</button></footer>
    </section>
  );
}
