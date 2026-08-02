# App shell de TRAZA

`AppShell` es el único sistema de coordenadas de las secciones principales. Recibe la sección activa y contiene vista, navegación, overlays, sheets y feedback.

## Capas

| Capa | z-index | Responsabilidad |
|---|---:|---|
| Content | 0–9 | Días, Guardados o Viaje y su scroll local |
| Navigation | 20 | `BottomNav` Ink idéntica en todas las secciones |
| Open day | 40 | Itinerario inmersivo; cubre la navegación normal |
| Detail | 60 | Detalle de actividad preservando el scroll del día |
| Modal | 80 | Scrim y `MobileSheet` |
| Feedback | 90 | Toast con offset de nav o barra de edición |

## Reglas

- `100dvh` y safe areas se resuelven en el shell, no por pantalla.
- Días no tiene cabecera persistente: la portada contiene fecha, progreso y contexto.
- Guardados y Viaje comparten el mismo header contextual de 52 px, sin tagline ni progreso duplicado.
- La nav usa fondo Ink sólido. No depende de blur y su fallback es idéntico.
- Guardados y Viaje tienen scroll local y reserva inferior `--nav-safe` común.
- Sheets comparten scrim, radio 32, padding final y footer de acciones seguro.
- Toast se oculta bajo un modal y sube cuando existe barra de Organizar.
- `prefers-reduced-motion` y `prefers-reduced-transparency` mantienen toda la función.

## Componentes

- `AppShell`: viewport, sección activa y clases de estado.
- `AppHeader`: orientación opcional, marca compacta y contexto.
- `BottomNav`: tres destinos de primer nivel.
- `MobileSheet`: diálogo modal y motion compartido.
- `MediaFrame`: media, fallback honesto y procedencia.
- `PrimaryButton`, `SecondaryButton`, `IconButton`: controles comunes.

