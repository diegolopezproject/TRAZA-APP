import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

export function Button({ variant = "primary", loading = false, loadingLabel = "Cargando…", className = "", children, disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; loading?: boolean; loadingLabel?: string }) {
  return <button {...props} disabled={disabled || loading} aria-busy={loading || undefined} className={`ds-button ds-button--${variant} ${className}`.trim()}>{loading ? loadingLabel : children}</button>;
}

export function IconButton({ label, className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return <button {...props} aria-label={label} className={`ds-icon-button ${className}`.trim()}>{children}</button>;
}

export function FilterChip({ selected = false, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return <button {...props} aria-pressed={selected} className={`ds-filter-chip${selected ? " is-selected" : ""} ${className}`.trim()} />;
}

export function ActionRow({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`ds-action-row ${className}`.trim()} />;
}

export function ActionGroup({ primary, secondary, className = "", ...props }: HTMLAttributes<HTMLDivElement> & { primary: ReactNode; secondary?: ReactNode }) {
  return <div {...props} className={`ds-action-group ${className}`.trim()}><div className="ds-action-group__primary">{primary}</div>{secondary ? <div className="ds-action-group__secondary">{secondary}</div> : null}</div>;
}
