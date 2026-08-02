import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import type { ActivityStatus } from "@/domain/models";
import { es } from "@/content/es";

export function SectionHeader({ title, count, ...props }: { title: string; count?: string } & HTMLAttributes<HTMLDivElement>) { return <div className="traza-section-header" {...props}><h2>{title}</h2>{count ? <span>{count}</span> : null}</div>; }
export function StatusBadge({ status, locked = false }: { status: ActivityStatus; locked?: boolean }) { return <span className={`status-badge status-badge--${status}${locked ? " status-badge--locked" : ""}`}>{locked ? "🔒 Fijo" : es.status[status]}</span>; }
export function TimeLabel({ children }: { children: ReactNode }) { return <span className="time-label">{children}</span>; }
export function IconButton(props: ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...props} className={`icon-button-system ${props.className ?? ""}`.trim()} />; }
export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...props} className={`primary-button ${props.className ?? ""}`.trim()} />; }
export function SecondaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...props} className={`secondary-button ${props.className ?? ""}`.trim()} />; }
export function FilterChip(props: ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...props} className={`filter-chip ${props.className ?? ""}`.trim()} />; }
export function DragHandle(props: ButtonHTMLAttributes<HTMLButtonElement>) { return <button type="button" aria-label="Mover elemento" {...props} className={`drag-handle ${props.className ?? ""}`.trim()}>⠿</button>; }
export function EmptyState({ title, action }: { title: string; action?: ReactNode }) { return <div className="empty-state"><p>{title}</p>{action}</div>; }
export function Toast({ children, ...props }: HTMLAttributes<HTMLElement>) { return <aside role="status" className="assignment-toast" {...props}>{children}</aside>; }
export function FormField({ label, children }: { label: string; children: ReactNode }) { return <label className="form-field"><span>{label}</span>{children}</label>; }
export function TextField(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} />; }
export function SelectField(props: SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} />; }
export function BottomSheet({ children, ...props }: HTMLAttributes<HTMLElement>) { return <section className="assignment-sheet" role="dialog" aria-modal="true" {...props}>{children}</section>; }
