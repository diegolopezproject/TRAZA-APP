# Iteración 07 — TRAZA Design System 1.0

## Objetivo y límites

Convertir el lenguaje aprobado en Iteración 06 en una fuente de verdad ejecutable: tokens, Core, Patterns, Expression, Storybook y gates. Se conservan Días / Guardados / Viaje, datos, persistencia local, fotografía de Sky Garden, navbar Ink, safe areas, viewport dinámico y compatibilidad WebKit. Supabase, contenido, nuevas funcionalidades, PWA y cambio de marca quedan fuera.

## Línea base protegida

- Rama de partida: `iteration-06-mobile-foundation`, commit `72dcb9e`.
- Gates iniciales: lint, typecheck, 16 tests y build en verde; Storybook no existía.
- 19 PNG de Iteración 06 copiados a `screenshots/iteration-07/before/`.
- Rama de trabajo: `iteration-07-design-system-foundation`.

## Secuencia

1. Foundations, tokens semánticos y frontera de imports.
2. Storybook oficial Next/Vite y simuladores de entorno.
3. Core compartido: acciones, estado, navegación, superficies, formularios y feedback.
4. Patterns de producto sin datos hardcodeados.
5. DayCover Lab y contrato de bounds; piloto 06, 07, 08 y 10.
6. Adapters de dominio y migración progresiva en una superficie de cada sección.
7. Gate de tokens, tests, matriz visual, documentación y handoff.

## Riesgos y mitigación

| Riesgo | Mitigación |
| --- | --- |
| Duplicar estilos viejos y nuevos | Core se importa desde `@/design-system`; adapters de `src/components` solo traducen dominio |
| Neutralizar TRAZA | Expression conserva color, ilustración y composición editorial dentro de tres layouts |
| Storybook distinto de producción | Storybook importa `src/app/globals.css` y las mismas exports públicas |
| Regresión móvil | 390, 402, 430, 768 y 1440; WebKit y Chromium; safe-area simulada |
| Valores arbitrarios | `npm run lint:tokens` sobre Core y Patterns |

## Definición de terminado

Todos los gates del repositorio y `build-storybook` pasan; DayCover cumple 80 % de visibilidad y máximo 15 % de solape; Storybook y aplicación tienen capturas; Sky Garden conserva el asset; no hay cambios de datos ni Supabase.
