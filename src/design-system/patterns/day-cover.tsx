import type { ReactNode } from "react";

export interface DayCoverProps {
  dayNumber: string;
  weekday: string;
  sequenceLabel: string;
  eyebrow: string;
  title: string;
  status: string;
  motif: ReactNode;
  theme: string;
  active?: boolean;
  onOpen?: () => void;
  openLabel?: string;
  openText?: string;
  openIcon?: ReactNode;
  openComposition?: "split" | "centered";
  progress?: ReactNode;
  entryHint?: boolean;
  debugBounds?: boolean;
}

export function DayCover({ dayNumber, weekday, sequenceLabel, eyebrow, title, status, motif, theme, active = true, onOpen, openLabel = "Abrir día", openText = "Abrir día", openIcon, openComposition = "split", progress, entryHint = false, debugBounds = false }: DayCoverProps) {
  return <article className={`ds-day-cover theme-${theme}${active ? " is-active" : ""}${entryHint ? " has-entry-hint" : ""}${debugBounds ? " ds-debug-bounds" : ""}`} aria-label={`${weekday} ${dayNumber}. ${title}`}>
    <header className="ds-day-cover__header" data-bounds="header">
      <span className="ds-day-cover__date"><b>{weekday.slice(0, 3)} {dayNumber} ago</b><b>Londres</b></span>
      <span className="ds-day-cover__count">{sequenceLabel}</span>
    </header>
    <div className="ds-day-cover__title" data-bounds="title"><h2>{title}</h2></div>
    <div className="ds-day-cover__art" data-bounds="art"><div className="ds-day-cover__motif">{motif}</div></div>
    <div className="ds-day-cover__details" data-bounds="details"><p>{eyebrow}</p><span>{status}</span></div>
    <div className="ds-day-cover__action" data-bounds="action">
      <button className={openComposition === "centered" ? "is-centered" : undefined} type="button" onClick={onOpen} aria-label={openLabel}><span>{openText}</span>{openIcon}</button>
      {progress}
    </div>
  </article>;
}

export interface BoundsRect { left: number; top: number; right: number; bottom: number; width: number; height: number; }
export interface DayCoverBoundsInput { cover: BoundsRect; header: BoundsRect; title: BoundsRect; details: BoundsRect; action: BoundsRect; }
export function validateDayCoverBounds({ cover, header, title, details, action }: DayCoverBoundsInput) {
  const regions = [header, title, details, action];
  const withinCover = regions.every((region) => region.left >= cover.left && region.right <= cover.right && region.top >= cover.top && region.bottom <= cover.bottom);
  const titleDetailsGap = details.top - title.bottom;
  const detailsActionGap = action.top - details.bottom;
  return { withinCover, titleDetailsGap, detailsActionGap, titleClear: titleDetailsGap >= 0, actionClear: detailsActionGap >= 0 };
}
