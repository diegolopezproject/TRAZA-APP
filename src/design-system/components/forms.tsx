import { useId } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldShellProps { label: string; hint?: string; error?: string; id: string; children: ReactNode; }
function FieldShell({ label, hint, error, id, children }: FieldShellProps) { return <label className="ds-form-field" htmlFor={id}><span>{label}</span>{children}{error ? <InlineError id={`${id}-error`}>{error}</InlineError> : hint ? <small>{hint}</small> : null}</label>; }

export function TextField({ label, hint, error, id: providedId, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) { const generatedId = useId(); const id = providedId ?? generatedId; return <FieldShell label={label} hint={hint} error={error} id={id}><input {...props} id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} /></FieldShell>; }
export function TextArea({ label, hint, error, id: providedId, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; error?: string }) { const generatedId = useId(); const id = providedId ?? generatedId; return <FieldShell label={label} hint={hint} error={error} id={id}><textarea {...props} id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} /></FieldShell>; }
export function SelectField({ label, children, id: providedId, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) { const generatedId = useId(); const id = providedId ?? generatedId; return <FieldShell label={label} id={id}><select {...props} id={id}>{children}</select></FieldShell>; }

export function ChoiceCard({ selected, title, description, children, ...props }: InputHTMLAttributes<HTMLInputElement> & { selected?: boolean; title: string; description?: string; children?: ReactNode }) { return <label className={`ds-choice-card${selected ? " is-selected" : ""}`}><input {...props} type={props.type ?? "radio"} checked={selected} readOnly={props.readOnly ?? props.onChange === undefined} /><span><strong>{title}</strong>{description ? <small>{description}</small> : null}</span>{children}</label>; }
export function FormHeader({ kicker, title, action }: { kicker?: string; title: string; action?: ReactNode }) { return <header className="ds-form-header">{kicker ? <p>{kicker}</p> : null}<div><h2>{title}</h2>{action}</div></header>; }
export function FormFooter({ children }: { children: ReactNode }) { return <footer className="ds-form-footer">{children}</footer>; }
export function InlineError({ id, children }: { id?: string; children: ReactNode }) { return <span id={id} className="ds-inline-error" role="alert">{children}</span>; }
