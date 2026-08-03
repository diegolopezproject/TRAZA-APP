import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface NavigationItem<Id extends string> { id: Id; label: string; icon: ReactNode; }
export function BottomNavigation<Id extends string>({ items, active, onChange, label }: { items: readonly NavigationItem<Id>[]; active: Id; onChange: (id: Id) => void; label: string }) {
  return <nav className="ds-bottom-navigation" aria-label={label}>{items.map((item) => <button key={item.id} type="button" aria-current={active === item.id ? "page" : undefined} className={`ds-bottom-navigation__item${active === item.id ? " is-active" : ""}`} onClick={() => onChange(item.id)}><span className="ds-bottom-navigation__icon">{item.icon}</span><span>{item.label}</span></button>)}</nav>;
}

export function CarouselNavigation({ current, total, previousLabel, nextLabel, onPrevious, onNext }: { current: number; total: number; previousLabel: string; nextLabel: string; onPrevious: () => void; onNext: () => void }) {
  return <nav className="ds-carousel-navigation" aria-label="Navegación del carrusel"><button type="button" aria-label={previousLabel} onClick={onPrevious}>←</button><div role="status" aria-label={`${current + 1} de ${total}`}>{Array.from({ length: total }, (_, index) => <span key={index} className={index === current ? "is-active" : ""} />)}</div><button type="button" aria-label={nextLabel} onClick={onNext}>→</button></nav>;
}

function RoundControl({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) { return <button type="button" {...props} className={`ds-round-control ${className}`.trim()} />; }
export function BackControl(props: ButtonHTMLAttributes<HTMLButtonElement>) { return <RoundControl {...props}>←<span>{props.children}</span></RoundControl>; }
export function CloseControl({ label = "Cerrar", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label?: string }) { return <RoundControl {...props} aria-label={label}>×</RoundControl>; }
export function DragHandle({ label = "Mover", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label?: string }) { return <button type="button" {...props} aria-label={label} className="ds-drag-handle"><span /></button>; }

export function ProgressIndicator({ current, total, label }: { current: number; total: number; label: string }) {
  return <div className="ds-progress" role="progressbar" aria-label={label} aria-valuemin={1} aria-valuemax={total} aria-valuenow={current}><span style={{ "--ds-progress": `${Math.max(0, Math.min(100, current / total * 100))}%` } as React.CSSProperties} /></div>;
}
