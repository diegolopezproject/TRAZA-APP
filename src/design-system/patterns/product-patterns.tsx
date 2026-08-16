import type { ReactNode } from "react";
import { Button } from "../components/actions";
import { Sheet, type SheetProps } from "../components/feedback";
import { Card, MediaCard } from "../components/surfaces";
import { Eyebrow, MetadataRow, StatusBadge, Tag } from "../components/content";
import type { CoreStatus } from "../foundations/foundations";

export function DayHeader({ date, position, closeLabel, onClose, closeIcon }: { date: string; position: string; closeLabel: string; onClose: () => void; closeIcon?: ReactNode }) { return <header className="ds-day-header"><button type="button" className="ds-day-header__close" aria-label={closeLabel} onClick={onClose}>{closeIcon ?? "×"}</button><span>{date}</span><span>{position}</span></header>; }

export function DayHero({ route, title, motif, summary }: { route: string; title: string; motif?: ReactNode; summary?: string }) { return <section className="ds-day-hero"><div className="ds-day-hero__copy"><Eyebrow>{route}</Eyebrow><h1>{title}</h1>{summary ? <p>{summary}</p> : null}</div>{motif ? <div className="ds-day-hero__motif">{motif}</div> : null}</section>; }

export function PlanCard({ time, title, meta, status, media, action }: { time?: string; title: string; meta?: string; status: CoreStatus; media?: ReactNode; action?: ReactNode }) { const body = <><div className="ds-plan-card__top">{time ? <Tag>{time}</Tag> : <span />}<StatusBadge status={status} /></div><h3>{title}</h3>{meta ? <p>{meta}</p> : null}{action}</>; return media ? <MediaCard className="ds-plan-card" media={media}>{body}</MediaCard> : <Card className="ds-plan-card">{body}</Card>; }

export function SavedPlaceCard({ title, category, area, media, tags = [], assignedLabel, onAssign, mapsHref, onDetail, onEdit, assignIcon, assignEndIcon, mapsIcon, moreIcon }: { title: string; category: string; area?: string; media?: ReactNode; tags?: readonly string[]; assignedLabel?: string; onAssign?: () => void; mapsHref?: string; onDetail?: () => void; onEdit?: () => void; assignIcon: ReactNode; assignEndIcon: ReactNode; mapsIcon: ReactNode; moreIcon: ReactNode }) {
  const visibleTags = tags.slice(0, 2);
  return <article className="ds-saved-place-card">
    <div className="ds-saved-place-card__media">{media ?? <div className="ds-saved-place-card__fallback" aria-hidden="true" />}</div>
    <div className="ds-saved-place-card__content"><Eyebrow>{category}</Eyebrow><h3>{title}</h3>{area ? <p>{area}</p> : null}{tags.length ? <div className="ds-saved-place-card__tags">{visibleTags.map((tag) => <Tag key={tag}>{tag}</Tag>)}{tags.length > 2 ? <Tag>+{tags.length - 2}</Tag> : null}</div> : null}</div>
    <div className="ds-saved-place-card__actions"><button type="button" className="ds-saved-place-card__primary" onClick={onAssign}><span aria-hidden="true">{assignIcon}</span><span>{assignedLabel ?? "Añadir a un día"}</span><span aria-hidden="true">{assignEndIcon}</span></button><div className="ds-saved-place-card__secondary">{mapsHref ? <a href={mapsHref} target="_blank" rel="noreferrer"><span aria-hidden="true">{mapsIcon}</span> Google Maps</a> : <span />}{onDetail ? <button type="button" onClick={onDetail}>Detalle</button> : null}<details><summary aria-label={`Más acciones para ${title}`}>{moreIcon}</summary>{onEdit ? <button type="button" onClick={onEdit}>Editar</button> : null}</details></div></div>
  </article>;
}

export function TripSectionCard({ index, title, children, action, className = "", titleId }: { index: string; title: string; children: ReactNode; action?: ReactNode; className?: string; titleId?: string }) { return <Card className={`ds-trip-section-card ${className}`.trim()}><header><span className="ds-trip-section-card__accent" aria-hidden="true" /><Tag>{index}</Tag><h2 id={titleId}>{title}</h2>{action}</header>{children}</Card>; }

export function FlightTicketCard({ origin, destination, startTime, endTime, meta }: { origin: string; destination: string; startTime?: string; endTime?: string; meta: string }) { return <article className="ds-flight-ticket"><div><span>{origin}</span><strong>{startTime}</strong></div><span className="ds-flight-ticket__route" aria-hidden="true" /><div><span>{destination}</span><strong>{endTime}</strong></div><p>{meta}</p></article>; }

export function AssignmentFlow({ step, total, title, children, previous, next }: { step: number; total: number; title: string; children: ReactNode; previous?: () => void; next?: () => void }) { return <section className="ds-assignment-flow"><Eyebrow>Paso {step} de {total}</Eyebrow><h3>{title}</h3><div>{children}</div><footer>{previous ? <Button variant="secondary" onClick={previous}>Atrás</Button> : null}<Button onClick={next} disabled={!next}>{step === total ? "Guardar" : "Continuar"}</Button></footer></section>; }

export function OrganizeToolbar({ count, onCancel, onSave }: { count: number; onCancel: () => void; onSave: () => void }) { return <aside className="ds-organize-toolbar"><span>{count} cambios</span><div><Button variant="quiet" onClick={onCancel}>Cancelar</Button><Button onClick={onSave}>Guardar</Button></div></aside>; }

export function MobileFormSheet(props: SheetProps) { return <Sheet {...props} />; }
export function TripMetadata({ children }: { children: ReactNode }) { return <MetadataRow>{children}</MetadataRow>; }
