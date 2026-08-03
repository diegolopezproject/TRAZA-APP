import type { HTMLAttributes, ReactNode } from "react";
import type { CoreStatus } from "../foundations/foundations";

export function Eyebrow({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...props} className={`ds-eyebrow ${className}`.trim()} />;
}

export function SectionHeader({ title, count, index, action, className = "", ...props }: HTMLAttributes<HTMLElement> & { title: string; count?: ReactNode; index?: ReactNode; action?: ReactNode }) {
  return <header {...props} className={`ds-section-header ${className}`.trim()}>{index ? <span className="ds-section-header__index">{index}</span> : null}<h2>{title}</h2>{count ? <span className="ds-section-header__count">{count}</span> : null}{action ? <div className="ds-section-header__action">{action}</div> : null}</header>;
}

export function PageHeader({ eyebrow, title, count, className = "", ...props }: HTMLAttributes<HTMLElement> & { eyebrow: string; title: string; count?: ReactNode }) {
  return <header {...props} className={`ds-page-header ${className}`.trim()}><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1>{count ? <p>{count}</p> : null}</header>;
}

export function StatusBadge({ status, children, className = "" }: { status: CoreStatus; children?: ReactNode; className?: string }) {
  return <span className={`ds-status-badge ds-status-badge--${status} ${className}`.trim()}>{children ?? status}</span>;
}

export function CountBadge({ children, className = "" }: { children: ReactNode; className?: string }) { return <span className={`ds-count-badge ${className}`.trim()}>{children}</span>; }

export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`ds-tag ${className}`.trim()}>{children}</span>;
}

export function MetadataRow({ className = "", ...props }: HTMLAttributes<HTMLDListElement>) {
  return <dl {...props} className={`ds-metadata-row ${className}`.trim()} />;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <section className="ds-empty-state"><h3>{title}</h3>{description ? <p>{description}</p> : null}{action}</section>;
}

export interface MediaAttributionProps { source?: string; author?: string; license?: string; sourceUrl?: string; }
export function MediaAttribution({ source, author, license, sourceUrl }: MediaAttributionProps) {
  const detail = [author && `Autor: ${author}`, source && `Fuente: ${source}`, license && `Licencia: ${license}`].filter(Boolean).join(". ");
  return <details className="ds-media-attribution"><summary aria-label="Información y créditos del medio"><span aria-hidden="true">i</span><span className="sr-only">Información y créditos del medio</span></summary><p>{detail}</p>{sourceUrl ? <a href={sourceUrl} target="_blank" rel="noreferrer">Abrir fuente</a> : null}</details>;
}
