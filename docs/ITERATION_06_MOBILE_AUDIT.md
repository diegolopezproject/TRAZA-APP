# Auditoría móvil — Iteración 06

Auditoría ejecutada sobre el baseline `85bdea3` y verificada después en Playwright WebKit 26.5 y Chromium. Evidencias iniciales: `screenshots/iteration-06/before/`. Evidencias finales: `screenshots/iteration-06/after/`.

| Pantalla | Problema / breakpoint | Causa | Componente | Solución | Evidencia before → after |
| --- | --- | --- | --- | --- | --- |
| Carrusel de Días | 390–430: portada dependía de varias alturas y el estado inicial podía verse antes de hidratar | Capas CSS históricas con tres valores de `--nav-safe` y alturas independientes | `AppShell`, `DayCarousel` | Grid de `100dvh`, safe top, reserva nav única, card de ancho móvil y snap | `01-carrusel-402x874.png` → `05-carrusel.png` |
| Día abierto | Cabecera, fecha, motivo y titular competían; X más copy redundante | Motivo absoluto ocupaba todo el hero y existía un segundo cierre textual | `DayItinerary` | X icon-only 44 px, metadata lateral, SVG limitado a segunda columna, cierre redundante retirado | `09-itinerario.png` → `06-dia-abierto.png` |
| Sky Garden detalle | Botón “X + Volver…” formaba una cápsula larga bajo el notch | Texto visible dentro de control flotante | `ActivityDetail` | Círculo icon-only con nombre accesible y safe top/laterales | `03-sky-garden-402x874.png` → `07-detalle-sky-garden.png` |
| Organizar | Toolbar y toast podían compartir la misma banda inferior | Offsets propios no ligados al shell | `DayItinerary`, toast | Toolbar segura y toast con offset de organizar | `10-organizar.png` → `08-organizar.png` |
| Guardados | Último contenido dependía de padding heredado y filtros de 40 px | Scroll local y nav medidos por separado | `SavedView` | `--nav-reserve`, filtros/acciones ≥44 px y scroll hasta final | `11-guardados.png` → `09-guardados.png`, `15-ultima-card-sobre-navbar.png` |
| Detalle M&M’s | Sheet podía crecer como lista sin anatomía fija | `assignment-sheet` era un bloque con overflow total | `PlaceDetailSheet`, `MobileSheet` | Header fijo, contenido scrollable, alto de visual viewport y cierre visible | `13-detalle-mms.png` → `10-detalle-mms.png` |
| Asignar lugar | En iPhone mezclaba día, estado, bloque y confirmación en una lista larga | Un solo estado visual con controles antes y después de ocho días | `AssignmentSheet` | Paso 1 día, paso 2 momento; indicador, atrás, footer fijo y estado persistente | `16-sheet-asignacion.png` → `11-asignar-paso-1.png`, `12-asignar-paso-2.png` |
| Añadir lugar | Acciones al final del formulario podían quedar bajo teclado | Footer vivía dentro del scroll del form | `PlaceFormSheet`, `MobileSheet` | Full-height sheet, labels, inputs 16 px, footer fijo, `visualViewport` y `scrollIntoView` | `15-formulario.png` → `13-anadir-lugar.png`, `14-anadir-lugar-teclado-simulado.png` |
| Añadir plan | Misma anatomía larga; selector de Guardados y creación compartían scroll | Acciones locales dentro de cada rama | `PlanFormSheet` | Footer contextual fijo para Crear o colocar Guardado; contenido central scrollable | `12-formulario-anadir-plan.png` → ver flujo cubierto por `MobileSheet` |
| Editar lugar | Eliminar/Guardar podían separarse en scroll largo | Form sin footer real | `PlaceFormSheet` | Guardar/Cancelar fijos; Eliminar permanece en contenido y no es acción primaria | Sistema compartido de `13-anadir-lugar.png` |
| Editar traslado | En 390 px dos columnas estrechas | Grid de formulario no colapsaba siempre | `TripView` | Campos a una columna bajo 430 px; tamaño táctil y reserva nav | `14-viaje.png` → `17-viaje.png` |
| Viaje / Traslados | Última tarjeta podía quedar próxima a nav | Alto y padding duplicados | `TripView` | Scroll `100dvh`, `--nav-reserve` y cards sin alto fijo | `05-viaje-402x874.png` → `17-viaje.png` |
| Restaurar viaje | Acción final podía quedar bajo nav | Footer de sección sin reserva compartida | `SavedView` | Settings entra íntegro antes de nav al final del scroll | `18-restaurar-viaje-original.png` → `15-ultima-card-sobre-navbar.png` |
| Toast | Riesgo de cubrir nav o toolbar | Posiciones especiales dispersas | `TripApp` | Tokens globales con/sin nav y organizar; live region, wrap, una unidad visible | `17-toast.png` → `16-toast.png` |
| Navbar | Altura y offset cambiaban entre capas CSS | Valores de 72/82/86 px acumulados | `BottomNav`, `AppShell` | Ink sólida, 56 px, safe bottom + 10, labels estables y reserva común | `01-app-shell-dias.png` → `05-carrusel.png` |
| Portadas | Día 7 usaba foto y el resto estilos CSS independientes | `DayCover` seleccionaba la primera foto del día; motivos sin gramática única | `DayCover`, `DayMotif` | Ocho variantes dentro de un único SVG system; fotografía prohibida en cover | `05/06/07 portadas` → `01/02/03/04-portada-*.png` |

## Comprobaciones transversales

- Top/bottom safe area: simulados a 59/34 en 390, 393, 402 y 430; ningún control entra en esas bandas.
- Safari chrome: alturas dinámicas y sheets basados en `visualViewport`; cero usos de `100vh`.
- Teclado: a 402 × 560, input y Guardar visibles.
- Controles táctiles: auditoría automática de elementos visibles devuelve cero objetivos menores de 44 × 44.
- Orientación: 874 × 402 sin overflow de documento.
- Scroll: documento sin overflow horizontal; carrusel horizontal intencional; sheets con scroll propio.
- Motion: recorrido abrir/cerrar con `prefers-reduced-motion: reduce` completado.
