"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CloseIcon } from "./icons";
import { motionDuration, sheetSpring } from "@/lib/motion";

interface MobileSheetProps {
  title: string;
  kicker: string;
  closeLabel: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}

export function MobileSheet({ title, kicker, closeLabel, children, onClose, wide = false }: MobileSheetProps) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className="assignment-backdrop"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <motion.section
        className={`assignment-sheet editor-sheet${wide ? " editor-sheet--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-sheet-title"
        initial={reducedMotion ? { opacity: 0 } : { y: "100%", scale: .98 }}
        animate={reducedMotion ? { opacity: 1 } : { y: 0, scale: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { y: "100%", scale: .98 }}
        transition={reducedMotion ? { duration: motionDuration.fast } : sheetSpring}
      >
        <header className="assignment-header editor-sheet-header">
          <div><p className="mono-label">{kicker}</p><h2 id="editor-sheet-title">{title}</h2></div>
          <button autoFocus type="button" className="icon-button" onClick={onClose} aria-label={closeLabel}><CloseIcon /></button>
        </header>
        {children}
      </motion.section>
    </motion.div>
  );
}
