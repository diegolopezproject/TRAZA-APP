"use client";

import type { Place } from "@/domain/models";
import { es } from "@/content/es";
import { placeMapsUrl } from "@/lib/format";
import { ArrowIcon, MapIcon } from "./icons";
import { MediaFrame } from "./media-frame";
import { MobileSheet } from "./mobile-sheet";

interface PlaceDetailSheetProps {
  place: Place;
  onClose: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}

export function PlaceDetailSheet({ place, onClose, onDelete, deleting = false }: PlaceDetailSheetProps) {
  const mapsHref = placeMapsUrl(place);
  return (
    <MobileSheet title={place.name.replace(" | ", " / ")} kicker="Opciones cercanas / Detalle" closeLabel={es.forms.close} onClose={onClose}>
      <div className="place-detail-sheet">
        {place.media ? <MediaFrame media={place.media} sizes="560px" /> : <div className="place-detail-fallback">{place.name.slice(0, 2).toUpperCase()}</div>}
        <div className="place-detail-meta"><span>{es.saved.categories[place.category] ?? place.category}</span><span>{place.area ?? "Londres"}</span></div>
        {place.tags.length ? <div className="place-tags">{place.tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
        {place.notes ? <p>{place.notes}</p> : place.source !== "imported-google" ? <p>Guardado como posibilidad para encajar en el itinerario.</p> : null}
        {mapsHref ? <a className="primary-action" href={mapsHref} target="_blank" rel="noreferrer"><MapIcon /> Abrir en Google Maps <ArrowIcon /></a> : null}
        {onDelete ? <button className="danger-action" type="button" disabled={deleting} onClick={onDelete}>{deleting ? "Eliminando…" : es.forms.delete}</button> : null}
      </div>
    </MobileSheet>
  );
}
