"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ActivityLevel, Day, DaySection, Place, PlaceAssignment } from "@/domain/models";
import { coverTitleEs, es, weekdayEs } from "@/content/es";
import { formatSpanishDate } from "@/lib/format";
import { CheckIcon } from "./icons";
import { MediaFrame } from "./media-frame";
import { MobileSheet } from "./mobile-sheet";

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
  const [step, setStep] = useState<1 | 2>(1);
  const selectedDay = days.find((day) => day.id === selectedDayId);

  function selectDay(dayId: string) {
    setSelectedDayId(dayId);
    setStep(2);
  }

  function choosePlacement(nextSection: DaySection, nextLevel: ActivityLevel) {
    setSection(nextSection);
    setLevel(nextLevel);
  }

  return (
    <MobileSheet
      title={step === 1 ? "¿Qué día encaja mejor?" : "¿En qué momento?"}
      kicker={`Guardados / ${step} de 2`}
      closeLabel={es.assignment.close}
      onClose={onClose}
      footer={step === 2 ? (
        <>
          <button className="secondary-button" type="button" onClick={() => setStep(1)}>Atrás</button>
          <button className="primary-button" type="button" disabled={!selectedDayId} onClick={() => selectedDayId && onAssign(selectedDayId, section, level)}>Añadir al día</button>
        </>
      ) : undefined}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          className="assignment-step"
          key={step}
          initial={{ opacity: 0, x: reducedMotion ? 0 : step === 1 ? -24 : 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reducedMotion ? 0 : step === 1 ? -24 : 24 }}
          transition={{ duration: reducedMotion ? 0 : .18 }}
        >
          <div className="assignment-place">
            {place.media ? <MediaFrame media={place.media} sizes="84px" /> : null}
            <div>
              <strong>{place.name.replace(" | ", " / ")}</strong>
              <span>{step === 1 ? "Estado previsto · Opción cercana" : selectedDay ? `${weekdayEs(selectedDay)} · ${formatSpanishDate(selectedDay.date)}` : es.assignment.description}</span>
            </div>
          </div>

          {step === 1 ? (
            <div className="assignment-days" role="list" aria-label={es.assignment.daysLabel}>
              {days.map((day, index) => {
                const active = selectedDayId === day.id;
                return (
                  <button key={day.id} type="button" className={active ? "is-assigned" : ""} aria-pressed={active} onClick={() => selectDay(day.id)}>
                    <span className="assignment-day-number">{day.date.slice(-2)}</span>
                    <span><strong>{weekdayEs(day)} · {formatSpanishDate(day.date)}</strong><small>{coverTitleEs(day)}</small></span>
                    {active ? <span className="assignment-current"><CheckIcon /> {es.assignment.current}</span> : <span>0{index + 1}</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="assignment-placement">
              <p>Elige el bloque que mejor expresa la intención. Podrás reorganizarlo más tarde.</p>
              <div className="placement-options">
                <button type="button" className={section === "morning" ? "is-selected" : ""} onClick={() => choosePlacement("morning", "intention")}><strong>Mañana</strong><small>Entre el despertar y la comida</small></button>
                <button type="button" className={section === "afternoon" ? "is-selected" : ""} onClick={() => choosePlacement("afternoon", "intention")}><strong>Mediodía / tarde</strong><small>Para el bloque central del día</small></button>
                <button type="button" className={section === "evening" ? "is-selected" : ""} onClick={() => choosePlacement("evening", "intention")}><strong>Noche</strong><small>Cuando bajen las luces</small></button>
                <button type="button" className={section === "anytime" && level === "nearby-option" ? "is-selected" : ""} onClick={() => choosePlacement("anytime", "nearby-option")}><strong>Opciones cercanas</strong><small>Guardarlo como alternativa por zona</small></button>
                <button type="button" className={section === "anytime" && level === "intention" ? "is-selected" : ""} onClick={() => choosePlacement("anytime", "intention")}><strong>Decidir después</strong><small>Sin fijar todavía un momento concreto</small></button>
              </div>
            </div>
          )}

          {assignment ? <button className="assignment-remove" type="button" onClick={onRemove}>{es.assignment.remove}</button> : null}
        </motion.div>
      </AnimatePresence>
    </MobileSheet>
  );
}
