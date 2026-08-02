"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { ActivityLevel, Day, DaySection, Place, PlaceAssignment } from "@/domain/models";
import { coverTitleEs, es, weekdayEs } from "@/content/es";
import { formatSpanishDate } from "@/lib/format";
import { CheckIcon, CloseIcon } from "./icons";
import { MediaFrame } from "./media-frame";

interface AssignmentSheetProps {
  place: Place;
  days: Day[];
  assignment?: PlaceAssignment;
  onAssign: (dayId: string, section: DaySection, level: ActivityLevel) => void;
  onRemove: () => void;
  onClose: () => void;
}

export function AssignmentSheet({ place, days, assignment, onAssign, onRemove, onClose }: AssignmentSheetProps) {
  const reducedMotion = useReducedMotion();
  const [section, setSection] = useState<DaySection>(assignment?.section ?? "anytime");
  const [level, setLevel] = useState<ActivityLevel>(assignment?.level ?? "nearby-option");
  const [selectedDayId, setSelectedDayId] = useState<string | null>(assignment?.dayId ?? null);

  return (
    <motion.div
      className="assignment-backdrop"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        className="assignment-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assignment-title"
        initial={reducedMotion ? { opacity: 0 } : { y: "100%" }}
        animate={reducedMotion ? { opacity: 1 } : { y: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 38 }}
      >
        <header className="assignment-header">
          <div>
            <p className="mono-label">{es.assignment.kicker}</p>
            <h2 id="assignment-title">{es.assignment.title}</h2>
          </div>
          <button autoFocus type="button" className="icon-button" onClick={onClose} aria-label={es.assignment.close}>
            <CloseIcon />
          </button>
        </header>

        <div className="assignment-place">
          {place.media ? <MediaFrame media={place.media} sizes="84px" /> : null}
          <div><strong>{place.name.replace(" | ", " / ")}</strong><span>{es.assignment.description}</span></div>
        </div>

        <div className="assignment-options form-grid">
          <label><span>{es.forms.section}</span><select value={section} onChange={(event) => setSection(event.target.value as DaySection)}>{Object.entries(es.forms.sections).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label><span>{es.forms.status}</span><select value={level} onChange={(event) => setLevel(event.target.value as ActivityLevel)}><option value="nearby-option">Opción cercana</option><option value="intention">Plan flexible</option><option value="anchor">Confirmado</option></select></label>
        </div>

        <div className="assignment-days" role="list" aria-label={es.assignment.daysLabel}>
          {days.map((day, index) => {
            const active = selectedDayId === day.id;
            return (
              <button key={day.id} type="button" className={active ? "is-assigned" : ""} onClick={() => setSelectedDayId(day.id)}>
                <span className="assignment-day-number">{day.date.slice(-2)}</span>
                <span><strong>{weekdayEs(day)} · {formatSpanishDate(day.date)}</strong><small>{coverTitleEs(day)}</small></span>
                {active ? <span className="assignment-current"><CheckIcon /> {es.assignment.current}</span> : <span>0{index + 1}</span>}
              </button>
            );
          })}
        </div>

        {selectedDayId ? <div className="assignment-placement"><p className="mono-label">{days.find((day) => day.id === selectedDayId)?.date.slice(-2)} AGO</p><h3>¿Dónde quieres colocarlo?</h3><div className="placement-options"><button type="button" className={section === "morning" ? "is-selected" : ""} onClick={() => setSection("morning")}><strong>Mañana</strong><small>Entre el despertar y la comida</small></button><button type="button" className={section === "afternoon" ? "is-selected" : ""} onClick={() => setSection("afternoon")}><strong>Mediodía / tarde</strong><small>Para el bloque central del día</small></button><button type="button" className={section === "evening" ? "is-selected" : ""} onClick={() => setSection("evening")}><strong>Noche</strong><small>Cuando bajen las luces</small></button><button type="button" className={section === "anytime" ? "is-selected" : ""} onClick={() => setSection("anytime")}><strong>Opciones cercanas</strong><small>Decidir después, sin perderlo</small></button></div><button className="primary-button" type="button" onClick={() => onAssign(selectedDayId, section, level)}>Añadir al día</button></div> : null}

        {assignment ? <button className="assignment-remove" type="button" onClick={onRemove}>{es.assignment.remove}</button> : null}
      </motion.section>
    </motion.div>
  );
}
