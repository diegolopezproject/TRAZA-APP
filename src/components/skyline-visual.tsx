interface SkylineVisualProps {
  compact?: boolean;
}

export function SkylineVisual({ compact = false }: SkylineVisualProps) {
  return (
    <div className={`skyline-visual${compact ? " skyline-visual--compact" : ""}`} aria-hidden="true">
      <div className="sky-orbit sky-orbit--one" />
      <div className="sky-orbit sky-orbit--two" />
      <div className="sky-sun" />
      <svg className="sky-building" viewBox="0 0 300 440" fill="none">
        <path d="M30 440V276l31-19v-57l24-16 25 16v31l22-14v-72l35-41 35 41v150l27-17v-93l34-21v276H30Z" fill="currentColor" />
        <path d="M167 104V23M150 52h34" stroke="currentColor" strokeWidth="9" />
        <path d="M54 307h33M54 331h33M151 183h32M151 210h32M151 237h32M151 264h32M222 224h24M222 250h24" stroke="var(--sky)" strokeWidth="8" />
      </svg>
      <div className="sky-caption"><span>LA CITY</span><span>ARRIBA</span></div>
      <div className="evening-chip">19:00 / CW</div>
    </div>
  );
}
