"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import type { ActivityLevel, ActivityStatus, Day, DaySection, Place, UserPlan } from "@/domain/models";
import { es, weekdayEs } from "@/content/es";
import { slugify } from "@/lib/format";
import { HeartIcon, PlusIcon } from "./icons";
import { MediaFrame } from "./media-frame";
import { MobileSheet } from "./mobile-sheet";
import type { PlanView } from "@/lib/app-state";

interface PlanFormSheetProps {
  day: Day;
  days: Day[];
  places: Place[];
  plan?: UserPlan;
  onChoosePlace: (placeId: string, section: DaySection) => void;
  onSave: (plan: UserPlan) => void;
  onDelete?: (plan: UserPlan) => void;
  onClose: () => void;
  view: PlanView;
  placementPlaceId?: string;
  onNavigate: (view: PlanView, placeId?: string) => void;
}

function levelFor(status: ActivityStatus): ActivityLevel {
  return status === "confirmed" ? "anchor" : status === "planned" || status === "flexible" ? "intention" : "nearby-option";
}

const placementOptions: Array<{ value: DaySection; label: string; copy: string }> = [
  { value: "morning", label: "Mañana", copy: "Entre el despertar y la comida" },
  { value: "afternoon", label: "Mediodía / tarde", copy: "Para el bloque central del día" },
  { value: "evening", label: "Noche", copy: "Cuando bajen las luces" },
  { value: "anytime", label: "Opciones cercanas", copy: "Decidir después, sin perderlo" },
];

export function PlanFormSheet({ day, days, places, plan, onChoosePlace, onSave, onDelete, onClose, view: mode, placementPlaceId, onNavigate }: PlanFormSheetProps) {
  const formId = useId();
  const placementPlace = places.find((place) => place.id === placementPlaceId) ?? null;
  const [name, setName] = useState(plan?.title ?? "");
  const [dayId, setDayId] = useState(plan?.dayId ?? day.id);
  const [section, setSection] = useState<DaySection>(plan?.section ?? "anytime");
  const [time, setTime] = useState(plan?.startTime ?? "");
  const [category, setCategory] = useState(plan?.type ?? "attraction");
  const [status, setStatus] = useState<ActivityStatus>(plan?.status ?? "flexible");
  const [area, setArea] = useState(plan?.area ?? "");
  const [notes, setNotes] = useState(plan?.notes ?? "");
  const [mapsQuery, setMapsQuery] = useState(plan?.mapsQuery ?? "");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) { setError(es.forms.required); return; }
    onSave({
      ...plan,
      id: plan?.id ?? `local-plan-${slugify(cleanName)}-${Date.now()}`,
      title: cleanName,
      dayId,
      section,
      type: category,
      status,
      level: levelFor(status),
      startTime: time || undefined,
      area: area.trim() || undefined,
      notes: notes.trim() || undefined,
      mapsQuery: mapsQuery.trim() || undefined,
      userCreated: true,
    });
  }

  const footer = mode === "create" ? (
    <><button className="secondary-button" type="button" onClick={onClose}>{es.forms.cancel}</button><button className="primary-button" type="submit" form={formId}>{es.forms.save}</button></>
  ) : mode === "placement" && placementPlace ? (
    <><button className="secondary-button" type="button" onClick={onClose}>Atrás</button><button className="primary-button" type="button" onClick={() => onChoosePlace(placementPlace.id, section)}>Añadir al día</button></>
  ) : undefined;

  return (
    <MobileSheet title={plan ? es.forms.editPlan : es.forms.addPlan} kicker={`Días / ${day.date.slice(-2)} AGO`} closeLabel={es.forms.close} onClose={onClose} footer={footer} wide>
      {mode === "menu" ? (
        <div className="plan-choice-grid">
          <button type="button" onClick={() => onNavigate("saved")}><HeartIcon /><strong>{es.forms.chooseSaved}</strong><span>Conserva el lugar en Guardados.</span></button>
          <button type="button" onClick={() => onNavigate("create")}><PlusIcon /><strong>{es.forms.createPlan}</strong><span>Añade una actividad local y editable.</span></button>
        </div>
      ) : null}

      {mode === "saved" || mode === "placement" ? (
        <div className="saved-picker-list">
          {placementPlace ? (
            <div className="placement-step"><p className="mono-label">{placementPlace.name}</p><h3>¿Dónde quieres colocarlo?</h3><p>Elige una capa; podrás reorganizarlo más tarde.</p><div className="placement-options">{placementOptions.map((option) => <button type="button" key={option.value} className={section === option.value ? "is-selected" : ""} onClick={() => setSection(option.value)}><strong>{option.label}</strong><small>{option.copy}</small></button>)}</div></div>
          ) : places.map((place) => (
            <button type="button" key={place.id} onClick={() => onNavigate("placement", place.id)}>{place.media ? <MediaFrame media={place.media} sizes="64px" attributionMode="compact" /> : <span className="mini-fallback">{place.name.slice(0, 2).toUpperCase()}</span>}<span><strong>{place.name}</strong><small>{place.area ?? "Londres"} · {es.saved.categories[place.category]}</small></span><PlusIcon /></button>
          ))}
        </div>
      ) : null}

      {mode === "create" ? (
        <form id={formId} className="editor-form" onSubmit={submit}>
          <label><span>{es.forms.name} *</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="off" enterKeyHint="next" /></label>
          <div className="form-grid"><label><span>{es.forms.date}</span><select value={dayId} onChange={(event) => setDayId(event.target.value)}>{days.map((item) => <option key={item.id} value={item.id}>{item.date.slice(-2)} AGO · {weekdayEs(item)}</option>)}</select></label><label><span>{es.forms.section}</span><select value={section} onChange={(event) => setSection(event.target.value as DaySection)}>{Object.entries(es.forms.sections).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
          <div className="form-grid"><label><span>{es.forms.time}</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label><label><span>{es.forms.category}</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="attraction">Atracción</option><option value="tour">Tour</option><option value="museum">Museo</option><option value="entertainment">Espectáculo</option><option value="meal">Comida</option><option value="neighbourhood">Barrio</option></select></label></div>
          <label><span>{es.forms.status}</span><select value={status} onChange={(event) => setStatus(event.target.value as ActivityStatus)}><option value="confirmed">Confirmado</option><option value="flexible">Plan flexible</option><option value="saved">Opción cercana</option><option value="unplanned">Por decidir</option></select></label>
          <label><span>{es.forms.area}</span><input value={area} onChange={(event) => setArea(event.target.value)} /></label>
          <label><span>{es.forms.note}</span><textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
          <label><span>{es.forms.maps}</span><input value={mapsQuery} onChange={(event) => setMapsQuery(event.target.value)} inputMode="url" /></label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          {plan && onDelete ? <button className="danger-action" type="button" onClick={() => onDelete(plan)}>{es.forms.delete}</button> : null}
        </form>
      ) : null}
    </MobileSheet>
  );
}
