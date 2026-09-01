"use client";

import { useRef, useState } from "react";
import type { CSSProperties, TouchEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Activity, ActivityPlacement, Day, DaySection, Place, PlaceAssignment } from "@/domain/models";
import { activityTitleEs, coverTitleEs, dayEditorial, es, weekdayEs } from "@/content/es";
import { dayNumber, formatSpanishDate, placeMapsUrl } from "@/lib/format";
import { ActivityCard } from "./activity-card";
import { ChevronIcon, CloseIcon, HeartIcon, MapIcon, PlusIcon } from "./icons";
import { MediaFrame } from "./media-frame";
import { DayMotif } from "./day-motif";
import { motionDuration, navigationMotion } from "@/lib/motion";
import { useBackSwipe } from "@/lib/use-back-swipe";
import { ActionGroup, Button, DayHeader, DayHero, SectionHeader } from "@/design-system";

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
  placements: ActivityPlacement[];
  onSavePlacements: (placements: ActivityPlacement[]) => void;
  onOrganizeNotice: (message: string) => void;
  organizing: boolean;
  onStartOrganizing: () => void;
  onFinishOrganizing: () => void;
}

type SectionId = "morning" | "afternoon" | "evening";

function sectionFor(activity: Activity): SectionId {
  if (activity.section && activity.section !== "anytime") return activity.section;
  if (activity.startTime && activity.startTime < "12:00") return "morning";
  if (activity.startTime && activity.startTime >= "18:00") return "evening";
  if (activity.timeLabel?.toLowerCase().includes("dinner") || activity.title === "Dinner") return "evening";
  return "afternoon";
}

function activityTitle(activity: Activity): string { return activityTitleEs(activity); }

export function DayItinerary({ day, dayIndex, onClose, onOpenActivity, assignedItems, onEditAssignment, onOpenPlace, onAddPlan, onEditPlan, onOpenMeal, placements, onSavePlacements, onOrganizeNotice, organizing, onStartOrganizing, onFinishOrganizing }: DayItineraryProps) {
  const reducedMotion = useReducedMotion();
  const backSwipe = useBackSwipe(onClose);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pullStart = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const [draftActivities, setDraftActivities] = useState<Activity[]>(day.activities);
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

  function startOrganizing() {
    const scoped = placements.filter((placement) => placement.dayId === day.id);
    const next = [...day.activities].sort((a, b) => {
      const ao = scoped.find((item) => item.activityId === a.id)?.order ?? 999;
      const bo = scoped.find((item) => item.activityId === b.id)?.order ?? 999;
      return ao - bo;
    }).map((activity) => {
      const placement = scoped.find((item) => item.activityId === activity.id);
      return placement ? { ...activity, section: placement.section } : activity;
    });
    setDraftActivities(next);
    onStartOrganizing();
  }

  function isLocked(activity: Activity) {
    return activity.status === "confirmed" || activity.level === "anchor";
  }

  function moveActivity(activityId: string, direction: -1 | 1) {
    const index = draftActivities.findIndex((item) => item.id === activityId);
    const activity = draftActivities[index];
    if (!activity || isLocked(activity)) {
      onOrganizeNotice("Este punto es Fijo: tiene una reserva o una hora confirmada.");
      return;
    }
    const target = index + direction;
    if (target < 0 || target >= draftActivities.length) return;
    const next = [...draftActivities];
    [next[index], next[target]] = [next[target], next[index]];
    setDraftActivities(next);
  }

  function changeSection(activityId: string, section: DaySection) {
    const activity = draftActivities.find((item) => item.id === activityId);
    if (!activity) return;
    if (isLocked(activity)) {
      onOrganizeNotice("Este punto es Fijo y no se puede cambiar de bloque.");
      return;
    }
    setDraftActivities((items) => items.map((item) => item.id === activityId ? { ...item, section } : item));
  }

  function saveOrganization() {
    const next = draftActivities.map((activity, order) => ({ activityId: activity.id, dayId: day.id, section: sectionFor(activity), order }));
    onSavePlacements(next);
    onFinishOrganizing();
    onOrganizeNotice("Cambios de organización guardados");
  }

  const pullStyle = { "--pull": `${pull}px` } as CSSProperties;

  return (
    <motion.section
      className="day-open-layer"
      aria-label={es.day.itineraryAria(weekday, dayNumber(day.date))}
      initial={reducedMotion ? false : { y: "100%" }}
      animate={{ y: 0 }}
      exit={reducedMotion ? { y: 0 } : { y: "100%" }}
      transition={reducedMotion ? { duration: motionDuration.instant } : navigationMotion.spring}
      style={{ x: backSwipe.x }}
    >
      <div className="app-back-swipe-zone" aria-hidden="true" {...backSwipe.zoneProps} />
      <div ref={scrollerRef} className="itinerary-scroll" style={pullStyle} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} data-testid="itinerary-scroll" data-navigation-scroll={`day:${day.id}`}>
        <div className={`pull-indicator${pull >= 96 ? " is-ready" : ""}`} aria-hidden="true"><span /></div>

        <div className={`open-day-hero theme-${day.visualTheme}`}>
          <DayHeader date={formatSpanishDate(day.date)} position={`${dayIndex + 1} / 8`} closeLabel={es.day.closeAria} onClose={onClose} closeIcon={<CloseIcon />} />
          <DayHero route={editorial.eyebrow} title={coverTitleEs(day)} summary={editorial.intro} motif={<DayMotif day={day} compact />} />
        </div>

        <div className="itinerary-content">
          {!organizing ? <ActionGroup className="itinerary-actions" primary={<Button onClick={onAddPlan}><PlusIcon /> {es.day.addPlan}</Button>} secondary={<Button variant="secondary" onClick={startOrganizing}>Organizar</Button>} /> : null}
          {organizing ? <div className="organize-bar surface-translucent" role="toolbar" aria-label="Guardar cambios de organización"><button type="button" className="organize-cancel" onClick={onFinishOrganizing}>Cancelar</button><button type="button" className="organize-save" onClick={saveOrganization}>Guardar cambios</button></div> : null}

          {sections.map((section, sectionIndex) => {
            const activities = (organizing ? draftActivities : day.activities).filter((activity) => sectionFor(activity) === section.id);
            return (
              <section className="time-section" key={section.id} aria-labelledby={`section-${sectionIndex}`}>
                <SectionHeader className="section-heading" index={`0${sectionIndex + 1}`} title={section.label} count={es.day.moments(activities.length)} id={`section-${sectionIndex}`} />
                <div className="activity-list">
                  {activities.map((activity, index) => (
                    <motion.div className={`organize-item${isLocked(activity) ? " is-locked" : ""}`} key={activity.id} initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0 : Math.min(.36, (sectionIndex * 3 + index) * .045) }} draggable={organizing && !isLocked(activity)}>
                      <ActivityCard activity={activity} featured={activity.title === "Sky Garden"} onOpen={organizing ? undefined : activity.type === "meal" ? () => onOpenMeal(activity) : activity.userCreated ? () => onEditPlan(activity) : () => onOpenActivity(activity)} actionLabel={organizing ? undefined : activity.type === "meal" ? (activity.sourcePlaceId ? es.day.changeMeal : es.day.chooseMeal) : activity.userCreated ? es.day.editPlan : undefined} />
                      {organizing ? <div className="organize-tools"><button type="button" className="drag-handle" aria-label={`Mover ${activityTitle(activity)}; usa arriba y abajo`} onClick={() => moveActivity(activity.id, 1)}>⠿</button><button type="button" aria-label="Mover arriba" onClick={() => moveActivity(activity.id, -1)}>↑</button><button type="button" aria-label="Mover abajo" onClick={() => moveActivity(activity.id, 1)}>↓</button><label><span className="sr-only">Bloque</span><select value={sectionFor(activity)} onChange={(event) => changeSection(activity.id, event.target.value as DaySection)} disabled={isLocked(activity)}><option value="morning">Mañana</option><option value="afternoon">Mediodía / tarde</option><option value="evening">Noche</option></select></label></div> : null}
                      {organizing && isLocked(activity) ? <p className="locked-explanation">🔒 Fijo · no se mueve</p> : null}
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })}

          {assignedItems.length ? (
            <section className="time-section assigned-section" aria-labelledby="assigned-title">
              <SectionHeader className="section-heading" index="04" title={es.day.nearby} count={es.day.moments(assignedItems.length)} id="assigned-title" />
              <div className="assigned-place-list">
                {assignedItems.map(({ place, assignment }) => (
                  <article className="assigned-place-card" key={place.id}>
                    {place.media ? <MediaFrame media={place.media} sizes="112px" /> : <span className="assigned-place-fallback"><HeartIcon /></span>}
                    <div><small>{es.day.assigned} · {es.forms.sections[assignment.section]}</small><h3>{place.name.replace(" | ", " / ")}</h3><p>{place.area ?? "Londres"} · {es.levels[assignment.level]}</p></div>
                    <div className="assigned-card-actions">{placeMapsUrl(place) ? <a href={placeMapsUrl(place)} target="_blank" rel="noreferrer"><MapIcon /> Mapa</a> : null}<button type="button" onClick={() => onOpenPlace(place.id)}>Detalle</button><button type="button" onClick={() => onEditAssignment(place.id)}>{es.saved.edit}</button></div>
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
