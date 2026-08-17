import type { ReactNode } from "react";
import type { Day } from "@/domain/models";

interface DayMotifProps { day: Day; compact?: boolean; cover?: boolean; }

function Route({ d, accent = "accent" }: { d: string; accent?: "accent" | "paper" }) {
  return <path className={`chapter-route chapter-${accent}`} d={d} pathLength="1" />;
}

function Windows({ x, y, columns, rows, gap = 18 }: { x: number; y: number; columns: number; rows: number; gap?: number }) {
  return <g className="chapter-windows">{Array.from({ length: columns * rows }, (_, index) => <rect key={index} x={x + (index % columns) * gap} y={y + Math.floor(index / columns) * gap} width="7" height="9" rx="2" />)}</g>;
}

function ChapterSix() {
  return <><Route d="M28 286 C70 254 90 268 116 222 S176 160 214 132 S260 76 300 62" /><g className="chapter-main"><path d="M58 302 L136 180 L216 302 Z" /><path className="chapter-paper" d="M92 276 L136 204 L181 276 Z" /><path className="chapter-accent" d="M132 294 L138 294 L138 258 L132 258 Z" /></g><g className="chapter-secondary"><path d="M224 126 V80 H246 V126 M253 126 V66 H278 V126 M284 126 V92 H302 V126" /><circle className="chapter-accent" cx="235" cy="64" r="7" /><circle className="chapter-accent" cx="291" cy="76" r="7" /></g></>;
}

function ChapterSeven() {
  return <><Route d="M22 288 C94 270 112 224 157 202 S228 192 302 122" /><g className="chapter-main chapter-sky-garden"><path d="M62 304 C70 248 74 132 102 52 C129 78 143 108 150 150 C158 200 151 254 145 304 Z" /><path className="chapter-paper" d="M88 284 C98 214 95 132 105 88 C123 126 130 190 122 284 Z" /><Windows x={82} y={184} columns={3} rows={5} gap={16} /></g><g className="chapter-secondary chapter-canary"><path d="M202 296 V154 H225 V296 M232 296 V118 H260 V296 M268 296 V176 H292 V296" /></g><g className="chapter-editorial-accent"><path className="chapter-orange-bars" d="M188 146 H302 V157 H188 Z M177 170 H276 V179 H177 Z" /><circle className="chapter-lime-focus" cx="274" cy="92" r="20" /></g></>;
}

function ChapterEight() {
  return <><Route d="M24 286 C86 256 135 272 172 238 S229 188 300 198" /><g className="chapter-main"><path d="M42 286 V126 H208 V286 Z" /><path className="chapter-paper" d="M64 286 V152 H106 V286 M116 286 V140 H158 V286 M168 286 V160 H198 V286" /><path className="chapter-accent" d="M72 286 V218 C72 184 100 184 100 218 V286 Z M126 286 V204 C126 168 150 168 150 204 V286 Z" /></g><g className="chapter-secondary"><path d="M206 286 V210 H298 V286 Z" /><path className="chapter-paper" d="M218 238 H286 M218 254 H286 M228 286 V224 M252 286 V224 M276 286 V224" /></g></>;
}

function ChapterNine() {
  return <><Route d="M24 292 C74 274 104 246 141 224 S232 214 300 166" /><g className="chapter-main"><path d="M54 300 V74 H270 V300 Z" /><path className="chapter-paper" d="M78 278 V112 Q160 40 246 112 V278 Z" /><path d="M82 274 C116 232 126 172 126 108 C92 132 78 180 82 274 Z M242 274 C208 232 198 172 198 108 C232 132 246 180 242 274 Z" /><ellipse className="chapter-accent" cx="162" cy="150" rx="35" ry="52" /><path className="chapter-paper" d="M151 150 L161 132 L171 150 L161 172 Z" /></g><g className="chapter-secondary"><circle className="chapter-accent" cx="274" cy="72" r="15" /><path d="M274 88 L240 182" /></g></>;
}

function ChapterTen() {
  return <><Route d="M20 276 C56 236 90 252 124 218 S184 176 214 210 S264 246 302 208" /><g className="chapter-main"><path className="chapter-bloomsbury" d="M38 270 V132 H124 V270 Z M54 154 H108 V270 H54 Z" fillRule="evenodd" /><path className="chapter-camden" d="M124 270 V104 H212 V270 Z M144 132 H192 V270 H144 Z" fillRule="evenodd" /><path className="chapter-whitechapel" d="M212 270 V162 H294 V270 Z M230 184 H276 V270 H230 Z" fillRule="evenodd" /><path className="chapter-orange-bars" d="M52 180 H110 V195 H52 Z M136 204 H202 V217 H136 Z" /></g><g className="chapter-secondary"><circle className="chapter-sunset" cx="172" cy="72" r="32" /><circle cx="172" cy="72" r="10" /></g></>;
}

function ChapterEleven() {
  return <><Route d="M24 282 C84 248 120 254 154 212 S228 132 302 148" /><g className="chapter-main"><circle cx="124" cy="166" r="92" /><circle className="chapter-paper" cx="124" cy="166" r="58" /><circle className="chapter-accent" cx="124" cy="166" r="18" /><path d="M211 88 L274 66 L274 228 C274 258 226 260 226 228 C226 202 254 194 274 202" /></g><g className="chapter-secondary"><path className="chapter-paper" d="M52 292 H292" /><path className="chapter-accent" d="M194 292 C205 250 232 244 254 218" /></g></>;
}

function ChapterTwelve() {
  return <><Route d="M22 286 C74 246 112 258 148 218 S222 144 302 106" /><g className="chapter-main"><circle cx="158" cy="166" r="102" /><circle className="chapter-paper" cx="158" cy="166" r="76" /><path className="chapter-accent" d="M158 80 L180 166 L158 252 L136 166 Z" /><circle cx="158" cy="166" r="10" /></g><g className="chapter-secondary"><path d="M250 270 V174 L292 150 V270 Z" /><path className="chapter-paper" d="M262 196 H280 V270 H262 Z" /></g></>;
}

function ChapterThirteen() {
  return <><Route d="M22 270 C70 238 104 246 146 212 S220 150 304 116" /><g className="chapter-main"><path d="M46 290 V164 Q164 60 282 164 V290 Z" /><path className="chapter-paper" d="M74 290 V178 Q164 96 254 178 V290 Z" /><path d="M94 290 V206 H234 V290 Z" /><path className="chapter-accent" d="M110 222 H218 V238 H110 Z" /><path className="chapter-paper" d="M118 290 V246 H148 V290 M180 290 V246 H210 V290" /></g><g className="chapter-secondary"><circle className="chapter-accent" cx="278" cy="84" r="18" /><path d="M278 102 V140" /></g></>;
}

const chapters: Record<string, () => ReactNode> = {
  "2026-08-06": ChapterSix,
  "2026-08-07": ChapterSeven,
  "2026-08-08": ChapterEight,
  "2026-08-09": ChapterNine,
  "2026-08-10": ChapterTen,
  "2026-08-11": ChapterEleven,
  "2026-08-12": ChapterTwelve,
  "2026-08-13": ChapterThirteen,
};

function FullBleedLondon() {
  return <svg viewBox="0 0 430 380" preserveAspectRatio="xMidYMax slice" role="img" focusable="false">
    <path className="chapter-city-support" d="M0 300L38 270L73 286L109 246L142 274L181 230L218 270L257 214L294 257L335 224L379 265L430 238V380H0Z" />
    <path className="chapter-city-ink" d="M0 380V292H24V270H43V380ZM58 380V238H78V222H104V238H121V380ZM132 380V282H154V252H177V380ZM187 380V215H220V380ZM232 380V271H258V248H277V380Z" />
    <path className="chapter-city-paper" d="M43 380V207H60V179H51L45 158L69 143L97 158L91 179H82V207H106V380Z" />
    <path className="chapter-city-support" d="M50 178H92L86 193H56Z" />
    <path className="chapter-city-paper" d="M164 380V235H181L187 194L193 235H209V380Z" />
    <path className="chapter-city-support" d="M217 380V170L235 147L253 170V380Z" />
    <path className="chapter-city-paper" d="M273 380V111H315V380Z" />
    <path className="chapter-city-support" d="M283 127H305V380H283Z" />
    <path className="chapter-city-paper" d="M323 380V62H365V380Z" />
    <path className="chapter-city-support" d="M332 78H356V380H332Z" />
    <path className="chapter-city-ink" d="M374 380V136H407V380Z" />
  </svg>;
}

export function DayMotif({ day, compact = false, cover = false }: DayMotifProps) {
  if (day.id === "2026-08-07") {
    return <div className={`day-motif day-motif--london${compact ? " day-motif--compact" : ""}${cover ? " day-motif--full-bleed" : ""}`} aria-hidden="true"><FullBleedLondon /></div>;
  }

  const Chapter = chapters[day.id] ?? ChapterTwelve;
  return (
    <div className={`day-motif chapter-illustration motif-${day.visualTheme}${compact ? " day-motif--compact" : ""}${cover ? " day-motif--full-bleed" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 320 360" preserveAspectRatio={compact ? "xMidYMid meet" : "xMidYMid slice"} role="img" focusable="false">
        <g className="chapter-plane chapter-plane--ink"><Chapter /></g>
      </svg>
    </div>
  );
}
