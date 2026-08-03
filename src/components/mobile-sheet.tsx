"use client";

import { useEffect, useId, useRef } from "react";
import type { FocusEvent, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CloseIcon } from "./icons";
import { motionDuration, sheetSpring } from "@/lib/motion";

interface MobileSheetProps {
  title: string;
  kicker: string;
  closeLabel: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  wide?: boolean;
  handle?: boolean;
}

export function MobileSheet({ title, kicker, closeLabel, children, footer, onClose, wide = false, handle = true }: MobileSheetProps) {
  const reducedMotion = useReducedMotion();
  const titleId = useId();
  const backdropRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const updateVisualHeight = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      backdropRef.current?.style.setProperty("--sheet-visual-height", `${height}px`);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !sheetRef.current) return;
      const focusable = [...sheetRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    updateVisualHeight();
    window.visualViewport?.addEventListener("resize", updateVisualHeight);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.visualViewport?.removeEventListener("resize", updateVisualHeight);
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [onClose]);

  function keepFocusedControlVisible(event: FocusEvent<HTMLElement>) {
    if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement)) return;
    window.setTimeout(() => event.target.scrollIntoView({ block: "center", behavior: reducedMotion ? "auto" : "smooth" }), 80);
  }

  return (
    <motion.div
      ref={backdropRef}
      className="assignment-backdrop"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <motion.section
        ref={sheetRef}
        className={`assignment-sheet editor-sheet${wide ? " editor-sheet--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={reducedMotion ? { opacity: 0 } : { y: "100%" }}
        animate={reducedMotion ? { opacity: 1 } : { y: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { y: "100%" }}
        transition={reducedMotion ? { duration: motionDuration.fast } : sheetSpring}
      >
        {handle ? <span className="sheet-handle" aria-hidden="true" /> : null}
        <header className="assignment-header editor-sheet-header">
          <div><p className="mono-label">{kicker}</p><h2 id={titleId}>{title}</h2></div>
          <button autoFocus type="button" className="icon-button" onClick={onClose} aria-label={closeLabel}><CloseIcon /></button>
        </header>
        <div className="sheet-scroll" onFocusCapture={keepFocusedControlVisible}>{children}</div>
        {footer ? <footer className="sheet-footer">{footer}</footer> : null}
      </motion.section>
    </motion.div>
  );
}
