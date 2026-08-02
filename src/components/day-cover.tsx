"use client";

import { motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { PanInfo } from "motion/react";
import type { Day } from "@/domain/models";
import { coverTitleEs, dayEditorial, es, weekdayEs } from "@/content/es";
import { dayNumber } from "@/lib/format";
import { DayMotif } from "./day-motif";
import { MediaFrame } from "./media-frame";

interface DayCoverProps {
  day: Day;
  index: number;
  active: boolean;
  onOpen: () => void;
}

export function DayCover({ day, index, active, onOpen }: DayCoverProps) {
  const reducedMotion = useReducedMotion();
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-130, 0], [reducedMotion ? 0 : 8, 0]);
  const scale = useTransform(y, [-130, 0], [reducedMotion ? 1 : .975, 1]);
  const mediaY = useTransform(y, [-130, 0], [reducedMotion ? 0 : -10, 0]);
  const number = dayNumber(day.date);
  const confirmed = day.activities.filter((activity) => activity.status === "confirmed").length;
  const weekday = weekdayEs(day);
  const title = coverTitleEs(day);
  const editorial = dayEditorial[day.id];
  const documentaryMedia = day.activities.find((activity) => activity.media)?.media;
  const placeSequence = day.id === "2026-08-10" ? ["Bloomsbury", "Camden", "Whitechapel"] : null;

  function finishDrag(_: PointerEvent, info: PanInfo) {
    if (info.offset.y < -78 || info.velocity.y < -540) onOpen();
  }

  return (
    <motion.article
      className={`day-cover theme-${day.visualTheme}${active ? " is-active" : ""}${documentaryMedia ? " has-documentary-media" : ""}`}
      aria-label={es.journey.coverAria(weekday, number, title)}
      drag={active && !reducedMotion ? "y" : false}
      dragConstraints={{ top: -132, bottom: 0 }}
      dragElastic={{ top: .18, bottom: 0 }}
      dragSnapToOrigin
      onDragEnd={finishDrag}
      style={active ? { y, rotateX, scale, transformOrigin: "50% 100%" } : undefined}
      whileTap={active && !reducedMotion ? { scale: .994 } : undefined}
    >
      <header className="cover-kicker">
        <span>{weekday.slice(0, 3)} {number} · Londres</span>
        <span>Día {index + 1} de 8</span>
      </header>

      <motion.div className="cover-media-zone" style={active ? { y: mediaY } : undefined}>
        {documentaryMedia ? <MediaFrame media={documentaryMedia} priority={active} sizes="(max-width: 760px) 100vw, 460px" /> : <div className="cover-motif-wrap"><DayMotif day={day} />{placeSequence ? <div className="cover-place-sequence">{placeSequence.map((place) => <span key={place}>{place}</span>)}</div> : null}</div>}
        <span className="cover-media-wash" aria-hidden="true" />
        <div className="cover-number" aria-hidden="true">{number}</div>
      </motion.div>

      <div className="cover-copy">
        <p className="cover-eyebrow">{editorial.eyebrow}</p>
        <h2>{title}</h2>
        <div className="cover-meta">
          <span className="booking-count"><span aria-hidden="true">●</span> {confirmed ? es.journey.anchors(confirmed) : es.journey.open}</span>
        </div>
      </div>

      <div className="open-day-zone">
        <button className="open-day-handle" type="button" onClick={onOpen} aria-label="Abrir día"><span /></button>
      </div>
    </motion.article>
  );
}
