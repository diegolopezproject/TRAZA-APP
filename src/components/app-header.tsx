import Image from "next/image";
import { formatSpanishShortDate } from "@/lib/format";

interface AppHeaderProps {
  dayIndex?: number;
  dayDate?: string;
  context?: "journey" | "saved" | "trip";
  organize?: boolean;
}

export function AppHeader({ dayIndex, dayDate, context = "journey", organize = false }: AppHeaderProps) {
  const contextLabel = context === "saved" ? "Guardados" : context === "trip" ? "Viaje" : "Días";
  return (
    <header className={`app-header surface-translucent${organize ? " is-organizing" : ""}`}>
      <div className="app-brand-lockup"><Image src="/brand/traza-mark.svg" alt="TRAZA" width={32} height={32} priority /><div><strong>Londres 2026</strong><span>{contextLabel} · Tu viaje, por capas.</span></div></div>
      <div className="app-header-progress" aria-label={dayIndex === undefined ? contextLabel : `Día ${dayIndex + 1} de 8`}>
        {dayIndex === undefined ? <span className="mono-label">TRAZA</span> : <><b>Día {dayIndex + 1} de 8</b>{dayDate ? <span>{formatSpanishShortDate(dayDate)}</span> : null}</>}
      </div>
    </header>
  );
}
