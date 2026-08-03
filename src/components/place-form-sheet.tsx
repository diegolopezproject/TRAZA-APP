"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import type { Place } from "@/domain/models";
import { es } from "@/content/es";
import { slugify } from "@/lib/format";
import { MobileSheet } from "./mobile-sheet";

interface PlaceFormSheetProps {
  place?: Place;
  onSave: (place: Place) => void;
  onDelete?: (place: Place) => void;
  onClose: () => void;
}

const categories = ["food-drink", "museum-culture", "attraction", "shopping", "neighbourhood"];

export function PlaceFormSheet({ place, onSave, onDelete, onClose }: PlaceFormSheetProps) {
  const formId = useId();
  const [name, setName] = useState(place?.name ?? "");
  const [category, setCategory] = useState(place?.category ?? "food-drink");
  const [area, setArea] = useState(place?.area ?? "");
  const [notes, setNotes] = useState(place?.notes ?? "");
  const [mapsQuery, setMapsQuery] = useState(place?.mapsQuery ?? "");
  const [tags, setTags] = useState(place?.tags.join(", ") ?? "");
  const [image, setImage] = useState(place?.userCreated ? place.media?.src ?? "" : "");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) { setError(es.forms.required); return; }
    onSave({
      ...place,
      id: place?.id ?? `local-${slugify(cleanName)}-${Date.now()}`,
      name: cleanName,
      category,
      status: place?.status ?? "saved",
      area: area.trim() || undefined,
      notes: notes.trim() || undefined,
      mapsQuery: mapsQuery.trim() || undefined,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      userCreated: place?.userCreated ?? true,
      media: image.trim() ? {
        src: image.trim(), alt: `Imagen aportada para ${cleanName}`, kind: "photo",
        source: "Añadida localmente", editorial: true, focalPoint: "50% 50%",
      } : place?.userCreated ? undefined : place?.media,
    });
  }

  return (
    <MobileSheet title={place ? es.forms.editPlace : es.forms.addPlace} kicker="Guardados / Editor local" closeLabel={es.forms.close} onClose={onClose} footer={<><button type="button" className="secondary-button" onClick={onClose}>{es.forms.cancel}</button><button className="primary-button" type="submit" form={formId}>{es.forms.save}</button></>}>
      <form id={formId} className="editor-form" onSubmit={submit}>
        <label><span>{es.forms.name} *</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="off" enterKeyHint="next" /></label>
        <div className="form-grid">
          <label><span>{es.forms.category}</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((value) => <option key={value} value={value}>{es.saved.categories[value]}</option>)}</select></label>
          <label><span>{es.forms.area}</span><input value={area} onChange={(event) => setArea(event.target.value)} /></label>
        </div>
        <label><span>{es.forms.note}</span><textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        <label><span>{es.forms.maps}</span><input value={mapsQuery} onChange={(event) => setMapsQuery(event.target.value)} placeholder="Nombre o enlace" inputMode="url" /></label>
        <label><span>{es.forms.tags}</span><input value={tags} onChange={(event) => setTags(event.target.value)} /></label>
        <label><span>Imagen opcional</span><input type="url" value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://…" /></label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        {place && onDelete ? <button className="danger-action" type="button" onClick={() => { if (window.confirm(es.saved.deleteConfirm)) onDelete(place); }}>{es.forms.delete}</button> : null}
      </form>
    </MobileSheet>
  );
}
