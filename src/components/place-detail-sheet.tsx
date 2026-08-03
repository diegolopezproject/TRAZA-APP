"use client";

import type { Place } from "@/domain/models";
import { es } from "@/content/es";
import { mapsUrl } from "@/lib/format";
import { ArrowIcon, MapIcon } from "./icons";
import { MediaFrame } from "./media-frame";
import { MobileSheet } from "./mobile-sheet";

interface PlaceDetailSheetProps { place: Place; onClose: () => void; }

export function PlaceDetailSheet({ place, onClose }: PlaceDetailSheetProps) {
  return (
    <MobileSheet title={place.name.replace(" | ", " / ")} kicker="Opciones cercanas / Detalle" closeLabel={es.forms.close} onClose={onClose}>
      <div className="place-detail-sheet">
        {place.media ? <MediaFrame media={place.media} sizes="560px" /> : <div className="place-detail-fallback">{place.name.slice(0, 2).toUpperCase()}</div>}
        <div className="place-detail-meta"><span>{es.saved.categories[place.category] ?? place.category}</span><span>{place.area ?? "Londres"}</span></div>
        {place.tags.length ? <div className="place-tags">{place.tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
        {place.notes ? <p>{place.notes}</p> : <p>Guardado como posibilidad para encajar en el itinerario.</p>}
        {place.mapsQuery ? <a className="primary-action" href={mapsUrl(place.mapsQuery)} target="_blank" rel="noreferrer"><MapIcon /> Abrir en Google Maps <ArrowIcon /></a> : null}
      </div>
    </MobileSheet>
  );
}
