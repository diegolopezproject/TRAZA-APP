import type { HTMLAttributes, ReactNode } from "react";

export function Surface({ as: Element = "section", tone = "raised", className = "", ...props }: HTMLAttributes<HTMLElement> & { as?: "div" | "section" | "article"; tone?: "canvas" | "raised" | "inverse" | "glass" }) {
  return <Element {...props} className={`ds-surface ds-surface--${tone} ${className}`.trim()} />;
}

export function Card({ as: Element = "article", className = "", ...props }: HTMLAttributes<HTMLElement> & { as?: "article" | "section" | "div" }) {
  return <Element {...props} className={`ds-card ${className}`.trim()} />;
}

export function MediaCard({ media, children, className = "", ...props }: HTMLAttributes<HTMLElement> & { media: ReactNode }) {
  return <article {...props} className={`ds-media-card ${className}`.trim()}><div className="ds-media-card__media">{media}</div><div className="ds-media-card__body">{children}</div></article>;
}

export function HeroCard({ eyebrow, title, media, footer, className = "" }: { eyebrow?: ReactNode; title: ReactNode; media?: ReactNode; footer?: ReactNode; className?: string }) {
  return <article className={`ds-hero-card ${className}`.trim()}>{media ? <div className="ds-hero-card__media">{media}</div> : null}<div className="ds-hero-card__copy">{eyebrow}<h2>{title}</h2>{footer}</div></article>;
}
