import type { ReactNode } from "react";
import { Button } from "../components/actions";
import { Sheet, type SheetProps } from "../components/feedback";
import { Card, MediaCard } from "../components/surfaces";
import { Eyebrow, MetadataRow, StatusBadge, Tag } from "../components/content";
import type { CoreStatus } from "../foundations/foundations";

export function DayHeader({ weekday, date, title, action, motif }: { weekday: string; date: string; title: string; action?: ReactNode; motif?: ReactNode }) { return <header className="ds-day-header"><div><Eyebrow>{weekday} · {date}</Eyebrow><h1>{title}</h1>{action}</div>{motif ? <div className="ds-day-header__motif">{motif}</div> : null}</header>; }

export function PlanCard({ time, title, meta, status, media, action }: { time?: string; title: string; meta?: string; status: CoreStatus; media?: ReactNode; action?: ReactNode }) { const body = <><div className="ds-plan-card__top">{time ? <Tag>{time}</Tag> : <span />}<StatusBadge status={status} /></div><h3>{title}</h3>{meta ? <p>{meta}</p> : null}{action}</>; return media ? <MediaCard className="ds-plan-card" media={media}>{body}</MediaCard> : <Card className="ds-plan-card">{body}</Card>; }

export function SavedPlaceCard({ title, category, area, media, action }: { title: string; category: string; area?: string; media?: ReactNode; action?: ReactNode }) { return <MediaCard className="ds-saved-place-card" media={media ?? <div className="ds-saved-place-card__fallback" aria-hidden="true" />}><Eyebrow>{category}</Eyebrow><h3>{title}</h3>{area ? <p>{area}</p> : null}{action}</MediaCard>; }

export function TripSectionCard({ index, title, children, action, className = "", titleId }: { index: string; title: string; children: ReactNode; action?: ReactNode; className?: string; titleId?: string }) { return <Card className={`ds-trip-section-card ${className}`.trim()}><header><Tag>{index}</Tag><h2 id={titleId}>{title}</h2>{action}</header>{children}</Card>; }

export function AssignmentFlow({ step, total, title, children, previous, next }: { step: number; total: number; title: string; children: ReactNode; previous?: () => void; next?: () => void }) { return <section className="ds-assignment-flow"><Eyebrow>Paso {step} de {total}</Eyebrow><h3>{title}</h3><div>{children}</div><footer>{previous ? <Button variant="secondary" onClick={previous}>Atrás</Button> : null}<Button onClick={next} disabled={!next}>{step === total ? "Guardar" : "Continuar"}</Button></footer></section>; }

export function OrganizeToolbar({ count, onCancel, onSave }: { count: number; onCancel: () => void; onSave: () => void }) { return <aside className="ds-organize-toolbar"><span>{count} cambios</span><div><Button variant="quiet" onClick={onCancel}>Cancelar</Button><Button onClick={onSave}>Guardar</Button></div></aside>; }

export function MobileFormSheet(props: SheetProps) { return <Sheet {...props} />; }
export function TripMetadata({ children }: { children: ReactNode }) { return <MetadataRow>{children}</MetadataRow>; }
