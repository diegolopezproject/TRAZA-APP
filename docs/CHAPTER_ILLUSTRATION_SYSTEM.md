# Chapter Illustration System

## Propósito

Las ocho portadas son capítulos editoriales, no galerías fotográficas. `DayCover` siempre renderiza `DayMotif`; la fotografía queda reservada a actividades, detalle y Guardados.

## Gramática compartida

- Un único `viewBox 0 0 320 360`.
- Trazo de 4 unidades, extremos y uniones redondeados.
- Dos planos como máximo: sombra desplazada 8/9 y dibujo principal.
- Una tinta principal, el color de fondo de la portada como papel y un único acento semántico.
- Una textura SVG común con ruido al 5.5 %, contenida dentro del frame.
- Perspectiva frontal ligeramente editorial; sin mezclar isométrico, collage y fotografía.
- Radios, ventanas y rutas se construyen con primitivas comunes (`Route`, `Windows`).
- Cada capítulo contiene un motivo principal, una ruta, hasta dos secundarios y una textura.

## Grid de portada

| Zona | Regla |
| --- | --- |
| Metadata | Fila superior no interactiva; respeta el safe top del shell |
| Motivo | Frame central con borde y radio comunes |
| Número | Anclado abajo/izquierda dentro del frame; conserva más del 70 % visible |
| Ruta | Línea discontinua detrás o entre motivos, nunca sobre el titular |
| Titular | Zona propia bajo el frame; máximo tres líneas salvo copy español largo |
| Estado | Cápsula bajo el titular |
| Handle | Fila final de 52 px con objetivo táctil de 44 px |

El motivo y el número pueden cruzarse dentro del frame, pero el titular está fuera de ese plano. En el día abierto, el SVG compacto se confina a la segunda columna para no invadir el título.

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
