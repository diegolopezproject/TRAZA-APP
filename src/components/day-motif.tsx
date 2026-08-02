import type { Day } from "@/domain/models";

interface DayMotifProps { day: Day; compact?: boolean; }

export function DayMotif({ day, compact = false }: DayMotifProps) {
  const theme = day.visualTheme;
  return (
    <div className={`day-motif motif-${theme}${compact ? " day-motif--compact" : ""}`} aria-hidden="true">
      {theme === "orange-night" ? <><span className="motif-road" /><span className="motif-night-skyline"><i /><i /><i /><i /></span><span className="motif-moon" /><b>19:00</b></> : null}
      {theme === "sky-lime-orange" ? <><span className="motif-walkie"><i /><i /><i /></span><span className="motif-canary"><i /><i /><i /></span><span className="motif-orbit" /><b>20 FENCHURCH</b></> : null}
      {theme === "pink-orange" ? <><span className="motif-facades"><i /><i /><i /><i /></span><span className="motif-museum"><i /><i /><i /><i /><i /></span><b>W11 → SW7</b></> : null}
      {theme === "violet-lime" ? <><span className="motif-stage"><i /><i /></span><span className="motif-crown">W</span><span className="motif-monument" /><b>WEST END / 14:30</b></> : null}
      {theme === "orange-black" ? <><span className="motif-camden"><i /><i /><i /></span><span className="motif-night-cut" /><span className="motif-route-line" /><b>NW1 → E1</b></> : null}
      {theme === "blue-pink" ? <><span className="motif-record"><i /></span><span className="motif-tube"><i /><i /><i /></span><span className="motif-path" /><b>RUTAS / ABIERTAS</b></> : null}
      {theme === "illustrated-open-day" ? <><span className="motif-compass"><i /><i /><i /><i /></span><span className="motif-choice motif-choice--one">A</span><span className="motif-choice motif-choice--two">B</span><b>ELIGE LA RUTA</b></> : null}
      {theme === "sky-white" ? <><span className="motif-flight-path" /><span className="motif-plane">✈</span><span className="motif-terminal"><i /><i /><i /></span><b>LHR → SVQ</b></> : null}
    </div>
  );
}
