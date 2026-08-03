"use client";

import { useEffect, useId, useRef } from "react";
import type { FocusEvent, HTMLAttributes, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CloseControl, DragHandle } from "./navigation";

export interface SheetProps { title: string; kicker?: string; closeLabel: string; children: ReactNode; footer?: ReactNode; onClose: () => void; wide?: boolean; handle?: boolean; }
export const sheetFocusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
export function Sheet({ title, kicker, closeLabel, children, footer, onClose, wide = false, handle = true }: SheetProps) {
  const reducedMotion = useReducedMotion(); const titleId = useId(); const backdropRef = useRef<HTMLDivElement>(null); const sheetRef = useRef<HTMLElement>(null);
  useEffect(() => { const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null; const updateHeight = () => backdropRef.current?.style.setProperty("--ds-sheet-height", `${window.visualViewport?.height ?? window.innerHeight}px`); const keydown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); if (event.key !== "Tab" || !sheetRef.current) return; const controls = [...sheetRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]; if (!controls.length) return; const first = controls[0]; const last = controls[controls.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }; updateHeight(); window.visualViewport?.addEventListener("resize", updateHeight); window.addEventListener("keydown", keydown); return () => { window.visualViewport?.removeEventListener("resize", updateHeight); window.removeEventListener("keydown", keydown); previousFocus?.focus({ preventScroll: true }); }; }, [onClose]);
  function revealField(event: FocusEvent<HTMLElement>) { if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement)) return; window.setTimeout(() => event.target.scrollIntoView({ block: "center", behavior: reducedMotion ? "auto" : "smooth" }), 80); }
  return <motion.div ref={backdropRef} className="ds-sheet-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><motion.section ref={sheetRef} className={`ds-sheet${wide ? " ds-sheet--wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby={titleId} initial={reducedMotion ? { opacity: 0 } : { y: "100%" }} animate={reducedMotion ? { opacity: 1 } : { y: 0 }} exit={reducedMotion ? { opacity: 0 } : { y: "100%" }} transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 32 }}>
    {handle ? <DragHandle label="Indicador de panel" tabIndex={-1} /> : null}<header className="ds-sheet__header"><div>{kicker ? <p>{kicker}</p> : null}<h2 id={titleId}>{title}</h2></div><CloseControl autoFocus label={closeLabel} onClick={onClose} /></header><div className="ds-sheet__scroll" onFocusCapture={revealField}>{children}</div>{footer ? <footer className="ds-sheet__footer">{footer}</footer> : null}
  </motion.section></motion.div>;
}

export function Toast({ className = "", ...props }: HTMLAttributes<HTMLElement>) { return <aside {...props} role="status" aria-live="polite" className={`ds-toast ${className}`.trim()} />; }
