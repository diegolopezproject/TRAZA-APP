# Chapter Illustration System

## Propósito

Las ocho portadas son capítulos editoriales, no galerías fotográficas. `DayCover` siempre renderiza `DayMotif`; la fotografía queda reservada a actividades, detalle y Guardados.

## Gramática Full Bleed

- Fondo continuo, sin frame blanco, borde, sombra, gradiente ni textura.
- La portada usa cuatro roles: Base, Texto, Apoyo e Ink. Electric Lime queda reservado al CTA, foco y posición activa.
- Los motivos existentes conservan su `viewBox 0 0 320 360`; el skyline refinado del Día 07 usa `430 380` para controlar su crop horizontal.
- Un solo plano de dibujo y masas geométricas planas; no hay efectos 3D ni decoración arbitraria.
- El motivo se integra en el tercio medio-bajo y cede encuadre antes de reducir la escala tipográfica.
- Perspectiva frontal ligeramente editorial; sin mezclar isométrico, collage y fotografía.
- Radios, ventanas y rutas se construyen con primitivas comunes. TRAZA Design System expone `BuildingBlock`, `ArchBlock`, `DomeBlock`, `BridgeBlock`, `RouteLine`, `EditorialShape` y `GrainTexture`; el SVG histórico se migrará por composición, sin duplicarlo.
- Cada capítulo contiene un motivo principal, una ruta y hasta dos secundarios.

## Grid de portada

| Zona | Regla |
| --- | --- |
| Metadata | Fecha y ciudad a la izquierda; fracción única a la derecha |
| Titular | Zona superior estable; dos a cuatro líneas con escala editorial |
| Motivo | Fondo integrado en el tercio medio-bajo, sin contenedor propio |
| Ruta | Metadata legible sobre la base, separada del arte |
| Estado | Una única línea funcional, sin cápsula decorativa |
| Apertura | Botón Lime de 54 px y, debajo, ocho marcas sin texto ni flechas |

Titular, arte y zona funcional tienen reservas independientes. La referencia de composición es 390×844; 360×800 reduce moderadamente el crop y 412×915–430×932 mantienen los márgenes y contienen la escala máxima. La portada ocupa el viewport completo detrás de la navegación, mientras CTA y progreso usan la reserva semántica de navbar y `safe-area`. En el día abierto, el SVG compacto conserva el sistema anterior y se confina a la segunda columna; solo cambia la continuidad de entrada y salida de la capa.

## Color de colección 06–13

| Día | Base | Texto | Apoyo | Ink |
| --- | --- | --- | --- | --- |
| 06 | `#7C3A43` | `#FFF7ED` | `#B98086` | `#321B20` |
| 07 | `#0F5A50` | `#FFF8EC` | `#66A094` | `#082F2A` |
| 08 | `#8A3F76` | `#FFF7F3` | `#C37AAA` | `#3D1D35` |
| 09 | `#4C3973` | `#FCF8F2` | `#8273A5` | `#211A35` |
| 10 | `#A4452E` | `#FFF8EF` | `#D07B64` | `#462016` |
| 11 | `#2F4F8F` | `#F8FAFF` | `#6F8CC3` | `#152540` |
| 12 | `#3F5A34` | `#FAF8ED` | `#82986E` | `#1D2A18` |
| 13 | `#292E33` | `#F7F4EC` | `#747D84` | `#15191C` |

Electric Lime usa `#C7F25B` solo dentro de la interacción de DayCover.

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
