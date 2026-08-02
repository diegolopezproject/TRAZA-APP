import type { Day } from "@/domain/models";

interface DayMotifProps { day: Day; compact?: boolean; }

export function DayMotif({ day, compact = false }: DayMotifProps) {
  const theme = day.visualTheme;
  return (
    <div className={`day-motif motif-${theme}${compact ? " day-motif--compact" : ""}`} aria-hidden="true">
      {theme === "orange-night" ? <><span className="motif-road" /><span className="motif-night-skyline"><i /><i /><i /><i /></span><span className="motif-moon" /></> : null}
      {theme === "sky-lime-orange" ? <><span className="motif-walkie"><i /><i /><i /></span><span className="motif-canary"><i /><i /><i /></span><span className="motif-orbit" /></> : null}
      {theme === "pink-orange" ? <><span className="motif-facades"><i /><i /><i /><i /></span><span className="motif-museum"><i /><i /><i /><i /><i /></span></> : null}
      {theme === "violet-lime" ? <><span className="motif-stage"><i /><i /></span><span className="motif-crown">W</span><span className="motif-monument" /></> : null}
      {theme === "orange-black" ? <><span className="motif-camden"><i /><i /><i /></span><span className="motif-night-cut" /><span className="motif-route-line" /></> : null}
      {theme === "blue-pink" ? <><span className="motif-record"><i /></span><span className="motif-tube"><i /><i /><i /></span><span className="motif-path" /></> : null}
      {theme === "illustrated-open-day" ? <><span className="motif-compass"><i /><i /><i /><i /></span><span className="motif-choice motif-choice--one">A</span><span className="motif-choice motif-choice--two">B</span></> : null}
      {theme === "sky-white" ? <><span className="motif-flight-path" /><span className="motif-plane">✈</span><span className="motif-terminal"><i /><i /><i /></span></> : null}
    </div>
  );
}
