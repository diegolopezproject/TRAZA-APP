# Figma handoff

El código y Storybook son la fuente de verdad; Figma representa el contrato para exploración y comunicación.

## Archivo recomendado

1. Cover: versión, enlaces a Storybook y changelog.
2. Foundations: variables de color, spacing, radius, type, motion y layout.
3. Core: component sets con estados.
4. Patterns: DayCover, cards, flows y templates.
5. Expression: primitivas y capítulos.
6. Sandbox: propuestas no aprobadas, claramente separadas.

Colecciones: `TRAZA/Core` y `TRAZA/Expression`; modes Electric, Paper, Night y Reduced transparency. Naming: `TRAZA/Core/{Family}/{Component}/{Variant}` y `TRAZA/Patterns/{Pattern}/{State}`.

## Orden de recreación

Tokens → Button/StatusBadge → BottomNavigation/Sheet → cards → DayCover anatomía/variants → templates. Mantener enlace bidireccional manual con el story ID y el nombre exacto del componente; cualquier cambio se implementa y prueba primero en código o se marca “proposal” en Figma.

La página `TRAZA Design System/Figma handoff` de Storybook contiene el índice de naming y los componentes prioritarios.
