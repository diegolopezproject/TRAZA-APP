# Arquitectura de TRAZA Design System 1.1

La versión 1.1 conserva Core / Patterns / Expression y corrige la composición móvil. Añade `DayDeck`, `DayHeader`, `DayHero`, `PageHeader`, `ActionGroup`, la anatomía explícita de `SavedPlaceCard` y `FlightTicketCard`.

## Capas

```text
tokens/foundations → components (Core) → patterns → adapters de aplicación
                            ↑              ↑
                         hooks/icons    expression
```

- **Foundations/tokens**: valores físicos encapsulados y nombres semánticos. `tokens.css` es la única fuente de valores; `tokens.ts` solo expone referencias `var(...)`.
- **Core**: comportamiento y accesibilidad estables. No conoce Londres, Sky Garden, fechas, seed ni repositorios.
- **Patterns**: anatomías de producto con props presentacionales. Pueden expresar “estado confirmado”, pero no importar modelos o datos de viaje.
- **Expression**: primitivas editoriales, color y composición. Puede variar sin romper los contratos de Core.
- **Adapters**: `src/components` traduce `Day`, `Place`, `Trip` y acciones a props del sistema.

## Regla de dependencia

`src/design-system` no importa desde `src/data`, `src/content` ni `src/domain`. La aplicación puede importar `@/design-system`; el sentido inverso está prohibido. Las stories tampoco contienen códigos o referencias privadas.

## Core frente a Expression

| Core controla | Expression puede variar |
| --- | --- |
| foco, targets, estado, semántica | motivo de capítulo y color de acento |
| spacing, radio, borde y capas | posición `left`, `back` o `top` del arte |
| safe areas, sheet, navbar | ritmo editorial y textura |
| límites y lectura del DayCover | composición SVG dentro de esos límites |

La personalidad no puede romper lectura, contraste, bounds ni interacción. Core no debe convertir la experiencia en una plantilla neutral.

## API pública

`src/design-system/index.ts` es la entrada. Los imports internos directos se reservan a la implementación y tests. Storybook usa esa misma API pública para evitar demostraciones ficticias.
