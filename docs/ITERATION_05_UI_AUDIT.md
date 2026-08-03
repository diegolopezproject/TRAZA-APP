# Auditoría honesta de UI — Iteración 05

Baseline: commit `fc2a772`, capturado en 390×844, 430×932, 768×1024 y 1440×900. Evidencia en `screenshots/iteration-05/before/`.

## Hallazgos sistémicos

| Problema y captura | Causa | Gravedad | Componente responsable | Solución sistémica | Solución local |
|---|---|---:|---|---|---|
| Días, Guardados y Viaje parecen productos distintos. Comparar `iteration-05-before-390x844-{journey,saved,trip}.png`. | Cada sección inventa hero, fondos, radios, botones y densidad; solo comparten la barra clara. | Crítica | `SavedView`, `TripView`, `DayCarousel`, `globals.css` | App shell, section header, surface/card/button tokens compartidos. | Mantener acento Sky/Pink/Violet según contenido. |
| App bar clara persistente ocupa 62–70 px y repite Londres 2026, sección, tagline y TRAZA/progreso. | Marca usada como chrome de dashboard. | Alta | `AppHeader` | Header opcional; sin barra en Días y encabezado compacto integrado en Guardados/Viaje. | Progreso del día pasa a la portada. |
| Navbar clara pierde iconos y labels sobre Cloud/Pink/Violet; no recupera la identidad Ink. | Fondo translúcido claro y texto blanco sin contraste estable. | Crítica | `BottomNav`, `.bottom-nav` | Nav Ink opaca con fallback sólido, inactive Cloud 72%, active Ink sobre Lime. | Ninguna variante por sección. |
| Toast puede cubrir la última card o la barra de edición. | Posición fija comparte la misma reserva inferior que nav y no conoce Organizar/sheets. | Alta | `TripApp`, `.assignment-toast` | Capa de feedback del shell con offsets por nav/editor y ancho máximo. | Toast de lock se muestra sobre toolbar, no sobre card. |
| Sheets y formularios terminan demasiado cerca del borde inferior. | Padding final no usa `env(safe-area-inset-bottom)` de forma uniforme. | Alta | `MobileSheet`, formularios, `.editor-actions` | Sheet único con `--sheet-bottom-space` y footer sticky/opaco. | Ampliar acción final de asignación. |
| Botones parecen familias diferentes entre secciones. | Clases locales (`add-place-button`, `doc-action`, `anchors-toggle`, actions de cards). | Alta | Vistas y `ui.tsx` infrautilizado | `PrimaryButton`, `SecondaryButton`, `TextButton`, `IconButton` con alturas y estados únicos. | Mantener Maps como secondary con icono. |
| Motion varía por componente y contiene valores inline. | Springs/durations hardcoded en nav, día, sheet y toast. | Media | componentes Motion | Exportar tokens `instant`, `fast`, `standard`, `expressive`, `gestureSpring`, `sheetSpring`. | El carrusel conserva scroll snap nativo. |

## Días

| Problema y captura | Causa | Gravedad | Componente | Solución sistémica | Solución local |
|---|---|---:|---|---|---|
| Portada 7: el `07`, silueta, órbita, torres y copy compiten; la fecha parece cortada accidentalmente. `iteration-05-before-390x844-journey.png`. | Motivo construido como capas independientes sin zona media dominante. | Crítica | `DayCover`, `DayMotif` | Plantilla de portada con grid fijo: meta, fecha, media, ruta, título, estado y handle. | 7 usa foto real de Sky Garden con fecha contenida y degradado editorial. |
| Portadas 8 y 10 dependen de arcos/polígonos y códigos (`W11 → SW7`, `NW1 → E1`). | Abstracción decorativa intenta explicar el destino. | Alta | `DayMotif` | Media real o silueta reconocible y copy mínimo; retirar códigos. | 8: Notting Hill/South Kensington; 10: collage tipográfico de tres barrios con foto reconocible. |
| Carrusel muestra vecinos parciales mal recortados y degradados laterales pesados en desktop. | Stage demasiado oscuro y slides vecinos escalados/filtrados como posters. | Media | `DayCarousel`, CSS | Peek consistente de 12–20 px móvil y stage Cloud/Ink controlado en desktop. | Contener títulos dentro de zona segura de 24 px. |
| Duplicación de acciones al activar Organizar. | Acciones normales siguen presentes y toolbar se añade encima. | Alta | `DayItinerary` | Al organizar se ocultan Añadir plan, leyenda, nav y acciones ordinarias; toolbar única. | Locks opacos y handle solo en flexibles. |

## Guardados

| Problema y captura | Causa | Gravedad | Componente | Solución sistémica | Solución local |
|---|---|---:|---|---|---|
| Header rosa es una campaña distinta y ocupa casi una pantalla. `iteration-05-before-390x844-saved.png`. | Hero con anillo, corazón flotante, display multiline y contador separado. | Crítica | `SavedView` | `SectionHeader` compacto sobre Cloud, mismo grid y superficies. | Pink queda como banda/acento, no como gramática. |
| Añadir lugar queda pegado al bloque `28`; el contador y CTA compiten. | Ambos viven en la misma zona sin ritmo ni alineación. | Alta | `SavedView` | Header en dos filas: título/subtítulo y CTA independiente de 44 px. | Texto “28 lugares” compacto. |
| Cards usan índice gigante, código de zona y collage aun cuando la foto es fallback. | Decoración oculta procedencia y aparenta precisión. | Crítica | `SavedView`, `MediaFrame` | Anatomía media/meta/título/tags/actions/status; badge de tipo de media. | Retirar índice y código; fallback rotulado “Imagen pendiente”. |
| Restaurar viaje original tiene ancho insuficiente y parece un link peligroso. | Footer estrecho y acción destructiva sin contenedor. | Alta | `.saved-settings` | Card de preferencias de ancho completo, botón secondary 100% en móvil. | Confirmación existente se mantiene. |
| La mayoría de imágenes no representa documentalmente el lugar. | `kind: photo` se usa en assets generados y 20 fallbacks se presentan sin aviso visible. | Crítica | `media-catalog.ts`, `MediaFrame` | Clasificación explícita y auditoría; fotos Commons locales con crédito; fallback honesto. | Sustituir los 12 prioritarios disponibles y pedir al usuario los restantes sin fuente. |

## Viaje

| Problema y captura | Causa | Gravedad | Componente | Solución sistémica | Solución local |
|---|---|---:|---|---|---|
| Hero violeta ocupa más de media pantalla y usa anillo/estampilla como campaña. `iteration-05-before-390x844-trip.png`. | Composición independiente, no un header de producto. | Crítica | `TripView` | `SectionHeader` + resumen de viaje en una card del mismo sistema. | Violet queda como acento de contexto. |
| Vuelos, hotel, traslados y reservas tienen anatomías y colores propios. | Cada bloque fue diseñado como poster. | Alta | `TripView`, `.travel-doc*` | `LogisticsCard` comparte kicker, icono, título, body y acción. | Variantes de acento, nunca de estructura. |
| Edición de traslados parece formulario genérico dentro de un poster. | Inputs sin wrapper/spacing/tokens comunes. | Alta | `TripView`, `.transfer-fields` | Campos y acciones de `MobileSheet`/form system aplicados inline. | Mantener edición local y contenido actual. |

## Responsive, estados y accesibilidad

- El baseline no tiene overflow de documento y las flechas de teclado cambian de día en los cuatro viewports; se conserva.
- Los títulos están técnicamente dentro de la card, pero visualmente demasiado próximos a capas y bordes; la nueva zona segura será estructural, no una comprobación de bounding box aislada.
- No hubo errores de consola en las 12 capturas baseline.
- `prefers-reduced-motion` existe; falta centralizar tokens y verificar `prefers-reduced-transparency` en el shell final.
- La navegación y los botones necesitan foco visible consistente sobre fondos Ink, Pink y Violet.

## Criterio de salida de la auditoría

El cambio se considera sistémico solo si resuelve el mismo problema en las tres secciones o en todas las instancias del patrón. Las excepciones locales anteriores se limitarán a media, copy y acento semántico.
