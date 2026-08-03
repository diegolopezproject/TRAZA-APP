# Sistema de producto unificado

TRAZA conserva tres ritmos de contenido dentro de una sola gramática. La diferencia procede de lo que se consulta, no de inventar una interfaz por sección.

## Tokens

| Familia | Tokens | Regla |
|---|---|---|
| Espaciado | 4, 8, 12, 16, 24, 32, 48, 64 | No se introducen distancias nuevas salvo safe areas calculadas. |
| Radios | control 14, card 20, hero 28, sheet 32 | Pills solo para chips, estados y navegación. |
| Superficies | content, card, muted, Ink overlay | Cloud es base; las cards no cambian de material por sección. |
| Bordes | 1 px Ink al 18%; Ink sólido en acción | La estructura se percibe sin una colección de separadores. |
| Color | Ink, Cloud, Lime, Orange, Violet, Pink, Sky | Cada acento tiene función semántica; no adorna por sí solo. |
| Tipo | Geist Sans + Geist Mono para datos | Sin serif añadida: no mejora el sistema en esta iteración. |
| Motion | instant 80, fast 160, standard 240, expressive 420 ms; gesture/sheet springs | Mismos valores para todos los niveles y reduced motion. |

## Aplicación entre secciones

| Sistema compartido | Días | Guardados | Viaje |
|---|---|---|---|
| Shell | Stage Ink inmersivo y sin top bar | Cloud con header contextual compacto | Cloud con header contextual compacto |
| Hero | Portada editorial con zonas seguras | Resumen de posibilidades, acento Pink | Resumen del viaje, acento Violet |
| Card | Media/estado/título/acción en itinerario | Media/procedencia/meta/título/tags/acciones | Kicker/icono/título/body/acción |
| Acento | Sky/Lime/Orange según capítulo | Pink identifica exploración | Violet identifica logística/cultura |
| Acción primaria | Ink o Lime según superficie | Ink: añadir a un día | Ink: guardar/consultar |
| Acción secundaria | Outline de 1 px | Maps/Editar | Maps/Editar traslados |
| Estado | Label con texto e icono | Mismo `StatusLabel` | Confirmación con icono y texto |
| Navegación | Bottom nav Ink | La misma instancia | La misma instancia |
| Sheets | `MobileSheet` y scrim compartidos | Asignación, detalle y editor | Edición inline usa los mismos campos y acciones |
| Feedback | Toast sobre reserva de nav/editor | Misma posición | Misma posición |

## Anatomía de card

1. Contexto o media.
2. Metadata breve.
3. Título dominante.
4. Contexto secundario.
5. Estado legible sin depender de color.
6. Acciones agrupadas al final.

Ninguna variante añade índices gigantes, códigos de zona o formas pseudo-técnicas.

