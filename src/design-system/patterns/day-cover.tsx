"use client";

import type { ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { PanInfo } from "motion/react";

export type DayCoverArtPosition = "left" | "back" | "top";
export interface DayCoverProps {
  dayNumber: string;
  weekday: string;
  sequenceLabel: string;
  eyebrow: string;
  title: string;
  status: string;
  motif: ReactNode;
  theme: string;
  artPosition?: DayCoverArtPosition;
  active?: boolean;
  onOpen?: () => void;
  openLabel?: string;
  debugBounds?: boolean;
}

export function DayCover({ dayNumber, weekday, sequenceLabel, eyebrow, title, status, motif, theme, artPosition = "back", active = true, onOpen, openLabel = "Abrir día", debugBounds = false }: DayCoverProps) {
  const reducedMotion = useReducedMotion(); const y = useMotionValue(0); const rotateX = useTransform(y, [-130, 0], [reducedMotion ? 0 : 8, 0]); const scale = useTransform(y, [-130, 0], [reducedMotion ? 1 : .975, 1]); const artY = useTransform(y, [-130, 0], [reducedMotion ? 0 : -10, 0]);
  function finishDrag(_: PointerEvent, info: PanInfo) { if (info.offset.y < -78 || info.velocity.y < -540) onOpen?.(); }
  return <motion.article className={`ds-day-cover theme-${theme} ds-day-cover--art-${artPosition}${active ? " is-active" : ""}${debugBounds ? " ds-debug-bounds" : ""}`} aria-label={`${weekday} ${dayNumber}. ${title}`} drag={active && !reducedMotion && onOpen ? "y" : false} dragConstraints={{ top: -132, bottom: 0 }} dragElastic={{ top: .18, bottom: 0 }} dragSnapToOrigin onDragEnd={finishDrag} style={active ? { y, rotateX, scale, transformOrigin: "50% 100%" } : undefined} whileTap={active && !reducedMotion ? { scale: .994 } : undefined}>
    <header className="ds-day-cover__kicker" data-bounds="kicker"><span>{weekday.slice(0, 3)} {dayNumber} · Londres</span><span>{sequenceLabel}</span></header>
    <motion.div className="ds-day-cover__art" data-bounds="art" style={active ? { y: artY } : undefined}><div className="ds-day-cover__motif">{motif}</div><div className="ds-day-cover__number" data-bounds="number" aria-hidden="true">{dayNumber}</div></motion.div>
    <div className="ds-day-cover__copy" data-bounds="copy"><p>{eyebrow}</p><h2>{title}</h2><span>{status}</span></div>
    <div className="ds-day-cover__action" data-bounds="action"><button type="button" onClick={onOpen} aria-label={openLabel}><span /></button></div>
  </motion.article>;
}

export interface BoundsRect { left: number; top: number; right: number; bottom: number; width: number; height: number; }
export interface DayCoverBoundsInput { cover: BoundsRect; number: BoundsRect; art: BoundsRect; copy: BoundsRect; }
export function validateDayCoverBounds({ cover, number, art, copy }: DayCoverBoundsInput) {
  const visibleWidth = Math.max(0, Math.min(number.right, cover.right) - Math.max(number.left, cover.left));
  const visibleHeight = Math.max(0, Math.min(number.bottom, cover.bottom) - Math.max(number.top, cover.top));
  const visibleRatio = number.width && number.height ? visibleWidth * visibleHeight / (number.width * number.height) : 0;
  const overlapHeight = Math.max(0, Math.min(art.bottom, copy.bottom) - Math.max(art.top, copy.top));
  const overlapRatio = Math.min(1, overlapHeight / Math.max(1, copy.height));
  return { visibleRatio, overlapRatio, numberVisible: visibleRatio >= .8, artOverlapSafe: overlapRatio <= .15, withinCover: copy.left >= cover.left && copy.right <= cover.right && copy.bottom <= cover.bottom };
}
