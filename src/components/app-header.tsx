import Image from "next/image";

interface AppHeaderProps {
  context?: "journey" | "saved" | "trip";
}

/** Compact, optional orientation header. Journey intentionally renders without it. */
export function AppHeader({ context = "journey" }: AppHeaderProps) {
  const contextLabel = context === "saved" ? "Guardados" : context === "trip" ? "Viaje" : "Días";
  return (
    <header className="app-header" aria-label={`${contextLabel}, Londres 2026`}>
      <div className="app-brand-lockup">
        <Image src="/brand/traza-mark.svg" alt="" width={24} height={24} priority />
        <strong>TRAZA</strong>
      </div>
      <p><span>Londres 2026</span><span aria-hidden="true">/</span><strong>{contextLabel}</strong></p>
    </header>
  );
}
