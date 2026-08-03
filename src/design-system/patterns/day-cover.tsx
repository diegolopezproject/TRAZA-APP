import type { ReactNode } from "react";

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
  atmosphere?: "flat" | "atmospheric";
}

export function DayCover({ dayNumber, weekday, sequenceLabel, eyebrow, title, status, motif, theme, artPosition = "back", active = true, onOpen, openLabel = "Abrir día", debugBounds = false, atmosphere = "flat" }: DayCoverProps) {
  return <article className={`ds-day-cover theme-${theme} ds-day-cover--art-${artPosition} ds-day-cover--${atmosphere}${active ? " is-active" : ""}${debugBounds ? " ds-debug-bounds" : ""}`} aria-label={`${weekday} ${dayNumber}. ${title}`}>
    <header className="ds-day-cover__kicker" data-bounds="kicker"><span>{weekday.slice(0, 3)} {dayNumber} · Londres</span><span>{sequenceLabel}</span></header>
    <div className="ds-day-cover__art" data-bounds="art"><div className="ds-day-cover__motif">{motif}</div><div className="ds-day-cover__number" data-bounds="number" aria-hidden="true">{dayNumber}</div></div>
    <div className="ds-day-cover__copy" data-bounds="copy"><p>{eyebrow}</p><h2>{title}</h2><span>{status}</span></div>
    <div className="ds-day-cover__action" data-bounds="action"><button type="button" onClick={onOpen} aria-label={openLabel}><span /></button></div>
  </article>;
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
