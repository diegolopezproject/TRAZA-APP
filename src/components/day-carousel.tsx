"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { KeyboardEvent, UIEvent } from "react";
import type { Day } from "@/domain/models";
import { es, weekdayEs } from "@/content/es";
import { dayNumber } from "@/lib/format";
import { DayCover } from "./day-cover";
import { ArrowIcon } from "./icons";
import { AppHeader } from "./app-header";

interface DayCarouselProps { days: Day[]; selectedIndex: number; onSelect: (index: number) => void; onOpen: (day: Day) => void; }

export function DayCarousel({ days, selectedIndex, onSelect, onOpen }: DayCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const frameRef = useRef<number | null>(null);
  const initialIndexRef = useRef(selectedIndex);
  const selectedIndexRef = useRef(selectedIndex);
  const initializedRef = useRef(false);
  useEffect(() => { selectedIndexRef.current = selectedIndex; }, [selectedIndex]);
  const moveTo = useCallback((index: number, behavior: ScrollBehavior = "smooth") => { const target = Math.max(0, Math.min(days.length - 1, index)); const scroller = scrollerRef.current; const card = cardRefs.current[target]; if (scroller && card) scroller.scrollTo({ left: card.offsetLeft - (scroller.clientWidth - card.offsetWidth) / 2, behavior }); onSelect(target); }, [days.length, onSelect]);
  useLayoutEffect(() => { const positionInitial = () => { const scroller = scrollerRef.current; const card = cardRefs.current[initialIndexRef.current]; if (!scroller || !card) return; scroller.scrollLeft = card.offsetLeft - (scroller.clientWidth - card.offsetWidth) / 2; initializedRef.current = true; }; positionInitial(); const firstFrame = window.requestAnimationFrame(positionInitial); const timer = window.setTimeout(positionInitial, 80); const observer = new ResizeObserver(() => moveTo(initializedRef.current ? selectedIndexRef.current : initialIndexRef.current, "auto")); if (scrollerRef.current) observer.observe(scrollerRef.current); return () => { window.cancelAnimationFrame(firstFrame); window.clearTimeout(timer); observer.disconnect(); }; }, [moveTo]);
  useEffect(() => { const timer = window.setTimeout(() => moveTo(initialIndexRef.current, "auto"), 180); return () => window.clearTimeout(timer); }, [moveTo]);
  function handleScroll(event: UIEvent<HTMLDivElement>) { if (!initializedRef.current) return; if (frameRef.current) window.cancelAnimationFrame(frameRef.current); const scroller = event.currentTarget; frameRef.current = window.requestAnimationFrame(() => { const center = scroller.scrollLeft + scroller.clientWidth / 2; let closest = 0; let distance = Number.POSITIVE_INFINITY; cardRefs.current.forEach((card, index) => { if (!card) return; const nextDistance = Math.abs(center - (card.offsetLeft + card.offsetWidth / 2)); if (nextDistance < distance) { distance = nextDistance; closest = index; } }); if (closest !== selectedIndex) onSelect(closest); }); }
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); moveTo(event.key === "ArrowLeft" ? selectedIndex - 1 : event.key === "ArrowRight" ? selectedIndex + 1 : event.key === "Home" ? 0 : days.length - 1); } }
  return <section className="journey-view" aria-label={es.journey.label}>
    <AppHeader dayIndex={selectedIndex} dayDate={days[selectedIndex]?.date} />
    <div ref={scrollerRef} className="day-carousel" onScroll={handleScroll} onKeyDown={handleKeyDown} tabIndex={0} role="region" aria-roledescription="carrusel" aria-label={es.journey.label} data-testid="day-carousel">
      {days.map((day, index) => <div className={`day-slide${index === selectedIndex ? " is-selected" : ""}`} key={day.id} ref={(node) => { cardRefs.current[index] = node; }}><DayCover day={day} index={index} active={index === selectedIndex} onOpen={() => onOpen(day)} /></div>)}
    </div>
    <p className="sr-only" aria-live="polite">{es.journey.currentAnnouncement(weekdayEs(days[selectedIndex]), dayNumber(days[selectedIndex].date))}</p>
    <div className="carousel-controls" aria-label={es.journey.controls}><button type="button" onClick={() => moveTo(selectedIndex - 1)} disabled={selectedIndex === 0} aria-label={es.journey.previous}><ArrowIcon className="arrow-back" /></button><div className="day-progress" aria-hidden="true">{days.map((day, index) => <span key={day.id} className={index === selectedIndex ? "active" : ""} />)}</div><button type="button" onClick={() => moveTo(selectedIndex + 1)} disabled={selectedIndex === days.length - 1} aria-label={es.journey.next}><ArrowIcon /></button></div>
  </section>;
}
