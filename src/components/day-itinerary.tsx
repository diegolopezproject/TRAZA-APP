"use client";

import { useRef, useState } from "react";
import type { CSSProperties, TouchEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Activity, Day, Place, PlaceAssignment } from "@/domain/models";
import { coverTitleEs, dayEditorial, es, weekdayEs } from "@/content/es";
import { dayNumber, formatSpanishShortDate, mapsUrl } from "@/lib/format";
import { ActivityCard } from "./activity-card";
import { ChevronIcon, CloseIcon, HeartIcon, MapIcon, PlusIcon } from "./icons";
import { MediaFrame } from "./media-frame";
import { DayMotif } from "./day-motif";

interface AssignedItem { place: Place; assignment: PlaceAssignment; }

interface DayItineraryProps {
  day: Day;
  dayIndex: number;
  onClose: () => void;
  onOpenActivity: (activity: Activity) => void;
  assignedItems: AssignedItem[];
  onEditAssignment: (placeId: string) => void;
  onOpenPlace: (placeId: string) => void;
  onAddPlan: () => void;
  onEditPlan: (activity: Activity) => void;
  onOpenMeal: (activity: Activity) => void;
}

type SectionId = "morning" | "afternoon" | "evening";

function sectionFor(activity: Activity): SectionId {
  if (activity.section && activity.section !== "anytime") return activity.section;
  if (activity.startTime && activity.startTime < "12:00") return "morning";
  if (activity.startTime && activity.startTime >= "18:00") return "evening";
  if (activity.timeLabel?.toLowerCase().includes("dinner") || activity.title === "Dinner") return "evening";
  return "afternoon";
}

export function DayItinerary({ day, dayIndex, onClose, onOpenActivity, assignedItems, onEditAssignment, onOpenPlace, onAddPlan, onEditPlan, onOpenMeal }: DayItineraryProps) {
  const reducedMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pullStart = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const sections: Array<{ id: SectionId; label: string }> = [
    { id: "morning", label: es.day.sections[0] },
    { id: "afternoon", label: es.day.sections[1] },
    { id: "evening", label: es.day.sections[2] },
  ];
  const weekday = weekdayEs(day);
  const editorial = dayEditorial[day.id];

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (event.touches.length === 1 && scrollerRef.current?.scrollTop === 0) pullStart.current = event.touches[0].clientY;
  }
  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    if (pullStart.current === null || scrollerRef.current?.scrollTop !== 0) return;
    const distance = Math.max(0, event.touches[0].clientY - pullStart.current);
    setPull(Math.min(112, distance * .62));
  }
  function handleTouchEnd() {
    if (pull >= 96) onClose();
    setPull(0);
    pullStart.current = null;
  }

  const pullStyle = { "--pull": `${pull}px` } as CSSProperties;

  return (
    <motion.section
      className="day-open-layer"
      aria-label={es.day.itineraryAria(weekday, dayNumber(day.date))}
      initial={reducedMotion ? { opacity: 0 } : { y: 72, opacity: .35, scale: .975, rotateX: 7 }}
      animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { y: 92, opacity: 0, scale: .98, rotateX: 5 }}
      transition={reducedMotion ? { duration: .12 } : { type: "spring", stiffness: 285, damping: 32 }}
      style={{ transformOrigin: "50% 0%" }}
    >
      <div ref={scrollerRef} className="itinerary-scroll" style={pullStyle} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} data-testid="itinerary-scroll">
        <div className={`pull-indicator${pull >= 96 ? " is-ready" : ""}`} aria-hidden="true"><span /></div>

        <header className={`open-day-hero theme-${day.visualTheme}`}>
          <div className="open-day-toolbar">
            <button type="button" className="icon-button" onClick={onClose} aria-label={es.day.closeAria}><CloseIcon /></button>
            <span>{editorial.meta}</span>
            <span className="open-day-date">{formatSpanishShortDate(day.date)}</span>
          </div>
          <div className="open-day-visual">
            <div><p>{editorial.eyebrow}</p><h1>{coverTitleEs(day)}</h1></div>
            <DayMotif day={day} compact />
          </div>
          <button className="close-day-text" type="button" onClick={onClose}><ChevronIcon /> {es.day.backCover}</button>
        </header>

        <div className="itinerary-content">
          <div className="itinerary-intro"><span className="mono-label">{weekday.slice(0, 3)} / {dayNumber(day.date)}</span><p>{editorial.intro}</p></div>
          <div className="itinerary-actions"><button type="button" onClick={onAddPlan}><PlusIcon /> {es.day.addPlan}</button></div>

          <aside className="level-legend" aria-label={es.day.legend}><span><b>✓</b> {es.status.confirmed}</span><span><b>~</b> {es.status.flexible}</span><span><b>+</b> {es.levels["nearby-option"]}</span></aside>

          {sections.map((section, sectionIndex) => {
            const activities = day.activities.filter((activity) => sectionFor(activity) === section.id);
            return (
              <section className="time-section" key={section.id} aria-labelledby={`section-${sectionIndex}`}>
                <div className="section-heading"><span>0{sectionIndex + 1}</span><h2 id={`section-${sectionIndex}`}>{section.label}</h2><span>{es.day.moments(activities.length)}</span></div>
                <div className="activity-list">
                  {activities.map((activity, index) => (
                    <motion.div key={activity.id} initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0 : Math.min(.36, (sectionIndex * 3 + index) * .045) }}>
                      <ActivityCard activity={activity} featured={activity.title === "Sky Garden"} onOpen={activity.type === "meal" ? () => onOpenMeal(activity) : activity.userCreated ? () => onEditPlan(activity) : () => onOpenActivity(activity)} actionLabel={activity.type === "meal" ? (activity.sourcePlaceId ? es.day.changeMeal : es.day.chooseMeal) : activity.userCreated ? es.day.editPlan : undefined} />
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })}

          {assignedItems.length ? (
            <section className="time-section assigned-section" aria-labelledby="assigned-title">
              <div className="section-heading"><span>04</span><h2 id="assigned-title">{es.day.nearby}</h2><span>{es.day.moments(assignedItems.length)}</span></div>
              <div className="assigned-place-list">
                {assignedItems.map(({ place, assignment }) => (
                  <article className="assigned-place-card" key={place.id}>
                    {place.media ? <MediaFrame media={place.media} sizes="112px" /> : <span className="assigned-place-fallback"><HeartIcon /></span>}
                    <div><small>{es.day.assigned} · {es.forms.sections[assignment.section]}</small><h3>{place.name.replace(" | ", " / ")}</h3><p>{place.area ?? "Londres"} · {es.levels[assignment.level]}</p></div>
                    <div className="assigned-card-actions">{place.mapsQuery ? <a href={mapsUrl(place.mapsQuery)} target="_blank" rel="noreferrer"><MapIcon /> Mapa</a> : null}<button type="button" onClick={() => onOpenPlace(place.id)}>Detalle</button><button type="button" onClick={() => onEditAssignment(place.id)}>{es.saved.edit}</button></div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <footer className="day-end"><span>{String(dayIndex + 1).padStart(2, "0")} / 08</span><h2>{editorial.ending}</h2><button type="button" onClick={onClose}><ChevronIcon /> {es.day.closeChapter}</button></footer>
        </div>
      </div>
    </motion.section>
  );
}
