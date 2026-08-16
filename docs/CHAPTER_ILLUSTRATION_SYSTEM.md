# Chapter Illustration System

## Propósito

Las ocho portadas son capítulos editoriales, no galerías fotográficas. `DayCover` siempre renderiza `DayMotif`; la fotografía queda reservada a actividades, detalle y Guardados.

## Gramática compartida

- Un único `viewBox 0 0 320 360`.
- Trazo de 4 unidades, extremos y uniones redondeados.
- Un solo plano de dibujo; sin sombra desplazada, blur ni gradiente ambiental.
- Una tinta principal, el color de fondo de la portada como papel y un único acento semántico.
- El motivo se recorta con `xMidYMid slice` dentro de un frame 4:3 estable; no usa textura de ruido.
- Perspectiva frontal ligeramente editorial; sin mezclar isométrico, collage y fotografía.
- Radios, ventanas y rutas se construyen con primitivas comunes. TRAZA Design System expone `BuildingBlock`, `ArchBlock`, `DomeBlock`, `BridgeBlock`, `RouteLine`, `EditorialShape` y `GrainTexture`; el SVG histórico se migrará por composición, sin duplicarlo.
- Cada capítulo contiene un motivo principal, una ruta y hasta dos secundarios.

## Grid de portada

| Zona | Regla |
| --- | --- |
| Metadata | Fila superior no interactiva; respeta el safe top del shell |
| Motivo | Frame 4:3 con borde de 2 px y escala óptica común |
| Número | Zona independiente bajo el frame; 80–92 px según el ancho móvil |
| Ruta | Línea discontinua detrás o entre motivos, nunca sobre el titular |
| Titular | Zona propia bajo el frame; máximo tres líneas salvo copy español largo |
| Estado | Metadata funcional bajo el titular, sin cápsula decorativa |
| Apertura | Fila final de 54 px con progreso 1–8, nombre “Abrir día” y flecha SVG |

Motivo, número y titular ocupan zonas independientes y no se solapan. La referencia de composición es 390×844; 360×800 admite como máximo tres líneas y 430×932 no amplía el arte. En el día abierto, el SVG compacto se confina a la segunda columna para no invadir el título.

## Ocho capítulos

| Día | Motivo principal | Ruta / secundarios |
| --- | --- | --- |
| 06 | Calzada triangular de llegada | Ruta Gatwick–Ealing–Londres y skyline iluminado |
| 07 | Silueta curva de 20 Fenchurch Street | Ascenso diagonal y transición a Canary Wharf |
| 08 | Secuencia reducida de fachadas | Ruta hacia pórtico de museo |
| 09 | Boca escénica y cortinas | Foco verde; sin poster ni arte promocional |
| 10 | Tres ambientes urbanos enlazados | Ruta Bloomsbury–Camden–Whitechapel y disco como transición nocturna |
| 11 | Disco/cultura musical | Nota, ruta abierta y línea de transporte |
| 12 | Brújula de posibilidades | Ruta de salida y edificio secundario no concluyente |
| 13 | Terminal/arco de regreso | Ruta Ealing–Heathrow y señal de cierre |

## Accesibilidad y motion

El SVG es decorativo (`aria-hidden`) porque título, fecha y estado ya expresan el capítulo. No contiene texto esencial. `prefers-reduced-motion` elimina transformaciones y scroll suave; el significado del motivo no depende de animación.
