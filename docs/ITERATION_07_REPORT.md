# Iteración 07 — informe final

## Entrega

- Arquitectura Core / Patterns / Expression en `src/design-system`, con entrada pública única.
- Storybook 10.5.5 sobre adapter oficial `@storybook/nextjs-vite`, Tailwind 4, assets, docs, a11y, temas y cinco viewports.
- Tokens semánticos como CSS source of truth, aliases Tailwind y referencias TypeScript.
- Core de acciones, estado, navegación, superficies, feedback, forms y contenido.
- Patterns DayCover, DayHeader, PlanCard, SavedPlaceCard, TripSectionCard, AssignmentFlow, OrganizeToolbar y MobileFormSheet.
- DayCover 2.0 con anatomía fija, tres posiciones de arte, máximo tres líneas, debug overlay y contrato de bounds.
- Primitivas Expression para edificios, rutas, ventanas, arcos, skyline, teatro, transporte, luces y textura.
- Pilotos reales migrados en Días, Guardados y Viaje; MediaAttribution discreta; Sky Garden intacto.

## Validación

| Gate | Resultado |
| --- | --- |
| Token gate / lint / typecheck | pass |
| Vitest | 8 archivos, 30 tests, pass |
| Next build | pass |
| Storybook build | pass, 12 estados capturados por motor |
| WebKit / Chromium | pass, consola sin errores |
| 390×844 / 402×874 / 430×932 / 768×1024 | cero overflow, cover y navbar presentes |
| DayCover activo en 402 | x=18–384, número 100 % visible en la medición, título dentro de contrato |
| Reduced motion | media activa y duration token `.01ms` |
| Reduced transparency | superficie glass cambia a contrato opaco |
| Navbar / sheet / forms | 3 destinos y un current; foco dentro de sheet con 7 controles; 6 fields y error conectado |
| Sky Garden | imagen reconocida en detalle; SHA-256 `434464AD5701991B7581164518C5D54B16FACEF524479E725EC47EE1007F7951` |

Evidencias en `screenshots/iteration-07/after/`, incluidas `design-system-before-after.png`, `three-sections-system-comparison.png`, Storybook y validaciones de ambos motores.

## Quality gate — respuestas

- ¿El número se reconoce? **Sí**: zona reservada, ≥80 % exigido, 100 % en el muestreo final.
- ¿Las portadas son distintas y del mismo sistema? **Sí**: un stage y tres variantes; color/motivo quedan en Expression.
- ¿Días, Guardados y Viaje comparten gramática? **Sí**: navegación, tokens, radios, bordes, cards, estado y sheets comunes.
- ¿Los estados están definidos? **Sí**: default, disabled/loading/pressed cuando aplica, errores y contenido largo en stories/tests.
- ¿Los valores proceden de tokens? **Sí** en Core/Patterns; gate automatizado en verde.
- ¿Storybook representa la app real? **Sí**: importa globals y exports públicas de producción.
- ¿Hay Core estable y Expression propia? **Sí**, con frontera de dependencia documentada.
- ¿Reduce decisiones arbitrarias sin perder alma? **Sí**: contratos estrictos y composición editorial preservada.

## Deuda deliberada

- Retirar CSS histórico solo cuando cada consumidor haya migrado; no añadirle valores nuevos.
- Mover gradualmente SVGs propios de `src/components/icons.tsx` a la export pública sin duplicarlos.
- Validar en iPhone físico; esta iteración cubre WebKit y safe-area simulada.
- El bundle estático de Docs/a11y de Storybook avisa de chunks >500 kB; no afecta el bundle Next.
- `npm install` informa tres vulnerabilidades high en el árbol; no se aplicó `audit fix --force` porque implicaría cambios de versión no autorizados.

## Decisiones para aprobación posterior

1. Aprobar Design System 1.0 y su naming antes de completar capítulos 11/12.
2. Confirmar si la siguiente iteración prioriza migración completa de CSS/iconos o prueba en iPhone físico.
3. Revisar dependencias con un cambio aislado, sin mezclarlo con producto.
