# AGENTS.md template

Keep the final repository `AGENTS.md` concise. Adapt commands after scaffolding.

## Product

- Build a mobile-first London trip companion, not a generic dashboard.
- Preserve the Journey / Saved / Trip information architecture.
- Treat `docs/` and the typed seed data as product sources of truth.
- Keep fixed anchors, flexible intentions and nearby options distinct.
- Never expose private booking references in demo-facing UI.

## Engineering

- Use strict TypeScript.
- Keep domain data separate from presentation.
- Prefer small, reusable components.
- Do not add dependencies without a clear reason.
- Avoid unrelated refactors.
- Maintain accessible names, focus states and touch targets.
- Respect reduced-motion preferences.
- Run formatting, lint, type-check and relevant tests before handoff.

## Workflow

- Read the closest applicable `AGENTS.md` before editing.
- For multi-step work, update `docs/IMPLEMENTATION_PLAN.md`.
- Document important architecture or interaction changes.
- Report commands run, checks completed and remaining limitations.
