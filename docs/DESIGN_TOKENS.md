# Design tokens

La fuente de verdad es `src/design-system/tokens/tokens.css`. La paleta física `--ds-palette-*` solo se consume dentro del sistema de tokens o Expression; Core y Patterns usan `--ds-color-*`.

## Contratos

- Color: texto, superficies, borde, acción, foco, estado y error.
- Spacing: escala 0/4/8/12/16/20/24/32/40/48 con `page-inline` semántico.
- Radius: control, card, hero y pill; sheet/navigation/media reutilizan esos roles.
- Tipografía: caption, body, title y display, con familias Geist heredadas.
- Motion: fast, base y slow; curvas standard/enter. Motion React conserva springs gestuales cuando son cálculo dinámico.
- Layout: anchos, target táctil, safe areas y layers nombradas.

## Salidas

- CSS variables: consumo principal.
- `@theme inline`: aliases para Tailwind 4.
- TypeScript: nombres estables que apuntan a `var(...)`, nunca una copia de valores.
- Storybook: `Foundations/Tokens` muestra color, tipo y spacing.

## Gate

`npm run lint:tokens` inspecciona Core y Patterns y falla ante hex nuevos, radius/shadow/duration/layer sin token o spacing con unidades fuera del contrato. Excepciones permitidas: geometría SVG, cálculos/transform de Motion, hairlines y medidas expresivas documentadas; hoy se mantienen fuera del alcance del scanner o deben usar `token-gate-allow` en la misma línea.
