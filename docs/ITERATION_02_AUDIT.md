# Auditoría — Iteración 02

Auditoría realizada sobre los documentos de producto, `03_SEED_DATA.json`, el código, las capturas de la primera vertical slice y la aplicación real en 390×844, 430×932, 768×1024 y 1440×900.

## Hallazgos P0

| Problema observado | Causa | Solución propuesta | Pantallas |
| --- | --- | --- | --- |
| En una carga fría el estado marca el 7 de agosto, pero el carrusel puede comenzar mostrando el 6; el indicador y la portada no representan el mismo día. | El posicionamiento inicial depende de un único `requestAnimationFrame` y `scrollIntoView` antes de que el carrusel haya estabilizado sus medidas. | Centrar mediante cálculo explícito sobre el scroller, repetir tras layout/resize y hacer que el índice visible sea la única fuente del estado. | Días |
| La interfaz funcional, `aria-label` y estados están mezclados en inglés; además, los textos se encuentran dispersos por los componentes. | No existe una capa de contenido/localización. | Crear `src/content/es.ts`, formateadores españoles y consumirlos desde todos los componentes y tests visibles. | Todas |
| No existe interacción real entre Guardados y Días; “Add to a day” es decorativo. | El reducer no modela asignaciones ni existe selector de día. | Añadir una asignación local y reversible: abrir selector, elegir día, confirmar visualmente y mostrar el lugar como opción cercana en el itinerario. | Guardados, Días |
| Textos funcionales y estados aparecen a 7–9 px, con Mono usado en botones, categorías y explicaciones. | La hoja de estilos usa tamaños ad hoc sin escala tipográfica. | Introducir tokens responsive (`display`, `hero`, `section`, `card`, `body`, `metadata`, `caption`), mínimo funcional legible y limitar Mono a horas, fechas, códigos y contadores. | Todas |

## Hallazgos P1

| Problema observado | Causa | Solución propuesta | Pantallas |
| --- | --- | --- | --- |
| En 768 px se ven varias portadas casi completas; en 1440 px aparecen tres o más posters con jerarquía similar. La portada activa no construye un escenario centrado. | El ancho de slide permanece en 390 px y el carrusel ocupa todo el viewport sin máscara ni escenario máximo. | Crear un escenario centrado; portada activa de 420–460 px en escritorio, laterales parciales con menor escala/contraste, máscara de bordes y gaps responsive. | Días |
| Las flechas funcionan, pero el carrusel no responde a `ArrowLeft`/`ArrowRight` cuando tiene foco. | No hay `tabIndex` ni manejador de teclado en el scroller. | Añadir semántica de región/carrusel, foco y navegación por teclado con anuncio del día activo. | Días |
| En la portada del 7, la silueta puede atravesar el titular a 430 px y en composiciones laterales; otros titulares quedan cortados por una ilustración repetida. | Media, fecha, texto y acción comparten coordenadas absolutas sin zonas semánticas ni variables de capa. | Definir zonas de portada y tokens de capa; usar media con máscara/gradiente y una caja de texto protegida. Ajustar cada breakpoint. | Días |
| Guardados usa el mismo arco abstracto para lugares de comida, salas, calles y cafés. No existe alt ni procedencia de media. | `Place` no tiene media y `.saved-shape` es un placeholder universal. | Añadir `MediaAsset`, catálogo local con fotografía/imagen editorial específica, `object-position`, alt y metadatos de procedencia. Mantener gráficos solo cuando su `kind` sea `graphic`. | Guardados, Sky Garden |
| La ilustración de skyline se reutiliza como portada, card y hero sin adaptar significado o densidad. | Un solo componente SVG intenta resolver todas las escalas y contextos. | Mantener el skyline como firma gráfica de la portada, pero usar media reconocible en card/detalle y tratamientos diferenciados por contexto. | Días, detalle Sky Garden |
| La navegación flotante tapa parte de medios/documentos en el primer viewport y el contenido pasa por detrás sin una zona de lectura clara. | Es `fixed` global y las superficies solo reservan espacio al final de toda la página. | Crear un dock inferior con zona segura y hacer Días/Guardados/Viaje scrollables dentro del área disponible; mantener la píldora sin cubrir acciones. | Todas |
| Los estados técnicos (`anchor`, `intention`, `nearby-option`) aparecen al usuario y `planned` se traduce como una mezcla de estado y verificación. | El modelo de dominio se imprime directamente. | Separar nivel interno de etiqueta de interfaz; mostrar Confirmado, Plan flexible, Opción cercana, Por decidir y Hora por confirmar con texto + icono. | Itinerario, detalle, Guardados |

## Hallazgos P2

| Problema observado | Causa | Solución propuesta | Pantallas |
| --- | --- | --- | --- |
| Fechas, días y rutas mezclan formatos ingleses y abreviaturas poco claras. | Renderizado manual mediante `slice()` y cadenas fijas. | Centralizar `Intl.DateTimeFormat("es-ES")` y abreviaturas editoriales consistentes. | Días, Viaje |
| El movimiento principal explica jerarquía, pero faltan feedback al asignar, cambio de pestaña y transición del estado activo. | Motion solo se usa en capas de apertura/cierre. | Añadir microinteracciones breves, estado de asignación y `layoutId`/indicador activo; desactivar transformaciones con reduced motion. | Guardados, navegación |
| La documentación no describe zonas de portada, capas ni el nuevo contrato de medios. | La primera iteración documentó intención, no reglas operativas. | Actualizar dirección visual, interacciones y modelo de datos tras implementar. | Documentación |

## Criterio de cierre

La iteración estará lista cuando las cuatro resoluciones muestren una portada activa inequívoca, ningún texto funcional quede por debajo de la escala mínima, toda la interfaz sea española, los medios tengan semántica y alt, una asignación Guardado → Día sea verificable y reversible, y el flujo automatizado termine sin overflow ni errores de consola.
