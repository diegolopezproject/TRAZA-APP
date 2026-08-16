# Iteración 11 — Auditoría visual y propuesta de pulido controlado

Fecha: 6 de agosto de 2026
Rama: `iteration-11-open-design-ui-audit`
Baseline: `85f3fb0478d9b9a0044324fe74d0277d3ae1b1b5` (`origin/main`)
Producción revisada: <https://traza-app-beige.vercel.app/>
Estado: auditoría y dirección visual; no se han modificado componentes de producto.

## Alcance, método y límites

Esta revisión parte de la versión estable desplegada. La rama congelada `iteration-10-mobbin-ui-maturation` no se ha usado como base: se creó la rama de auditoría directamente desde `origin/main`. Aunque ambas referencias apuntaban al mismo commit y la rama congelada no tenía commits propios, la procedencia de la nueva rama queda explícita.

Se contrastaron:

- producción real y repositorio en el mismo baseline;
- documentación de `docs/`, `03_SEED_DATA.json` y Storybook;
- capturas nuevas en 360×800, 390×844, 412×915 y 430×932;
- Chromium y WebKit, con interacción táctil emulada;
- estilos computados, fuentes cargadas, geometría, overflow, gesto, navegación y reduced motion;
- componentes principales, tokens, iconos, CSS heredado y valores hardcoded;
- lint, tipos, tests, gate de tokens, build y el test automatizado de navegación/motion de Iteración 09.

La app real tiene **ocho días**, del 6 al 13 de agosto. El encargo menciona en un punto una plantilla para siete días; se adopta la verdad de producto del repositorio y no se elimina ni oculta el octavo.

No se verificó en hardware físico la PWA instalada ni los insets reales de un iPhone/Android. La automatización verificó los tokens y contratos de safe area, y la evidencia histórica del repositorio incluye insets inyectados; esto no sustituye una prueba final en dispositivo.

Las tres imágenes de referencia citadas no están presentes en la carpeta de adjuntos disponible para esta ejecución; solo se recibió el texto del encargo. La dirección propuesta sigue la gramática descrita por escrito, pero no atribuye observaciones concretas a imágenes no inspeccionadas.

## Evidencia generada

La matriz completa está en [`screenshots/iteration-11-open-design/before/`](../screenshots/iteration-11-open-design/before/). Cada motor contiene capturas y `audit.json`; `summary.json` reúne ambos.

| Evidencia | Chromium | WebKit |
| --- | --- | --- |
| DayCover 360×800 | [captura](../screenshots/iteration-11-open-design/before/chromium/01-deck-360x800.png) | [captura](../screenshots/iteration-11-open-design/before/webkit/01-deck-360x800.png) |
| DayCover 390×844 | [captura](../screenshots/iteration-11-open-design/before/chromium/01-deck-390x844.png) | [captura](../screenshots/iteration-11-open-design/before/webkit/01-deck-390x844.png) |
| DayCover 412×915 | [captura](../screenshots/iteration-11-open-design/before/chromium/01-deck-412x915.png) | [captura](../screenshots/iteration-11-open-design/before/webkit/01-deck-412x915.png) |
| DayCover 430×932 | [captura](../screenshots/iteration-11-open-design/before/chromium/01-deck-430x932.png) | [captura](../screenshots/iteration-11-open-design/before/webkit/01-deck-430x932.png) |
| Día abierto | [captura](../screenshots/iteration-11-open-design/before/chromium/07-day-open.png) | [captura](../screenshots/iteration-11-open-design/before/webkit/07-day-open.png) |
| Actividad confirmada | [captura](../screenshots/iteration-11-open-design/before/chromium/09-activity-confirmed-featured.png) | [captura](../screenshots/iteration-11-open-design/before/webkit/09-activity-confirmed-featured.png) |
| Actividad flexible | [captura](../screenshots/iteration-11-open-design/before/chromium/10-activity-flexible.png) | [captura](../screenshots/iteration-11-open-design/before/webkit/10-activity-flexible.png) |
| Opciones cercanas | [captura](../screenshots/iteration-11-open-design/before/chromium/11-nearby-option.png) | [captura](../screenshots/iteration-11-open-design/before/webkit/11-nearby-option.png) |
| Guardados | [captura](../screenshots/iteration-11-open-design/before/chromium/13-saved.png) | [captura](../screenshots/iteration-11-open-design/before/webkit/13-saved.png) |
| Detalle de guardado | [captura](../screenshots/iteration-11-open-design/before/chromium/15-saved-detail.png) | [captura](../screenshots/iteration-11-open-design/before/webkit/15-saved-detail.png) |
| Viaje | [captura](../screenshots/iteration-11-open-design/before/chromium/17-trip.png) | [captura](../screenshots/iteration-11-open-design/before/webkit/17-trip.png) |
| Vuelo | [captura](../screenshots/iteration-11-open-design/before/chromium/18-flight.png) | [captura](../screenshots/iteration-11-open-design/before/webkit/18-flight.png) |
| Hotel | [captura](../screenshots/iteration-11-open-design/before/chromium/19-hotel.png) | [captura](../screenshots/iteration-11-open-design/before/webkit/19-hotel.png) |
| Bottom navigation | [captura](../screenshots/iteration-11-open-design/before/chromium/20-bottom-navigation.png) | [captura](../screenshots/iteration-11-open-design/before/webkit/20-bottom-navigation.png) |
| Formulario | [captura](../screenshots/iteration-11-open-design/before/chromium/16-place-form.png) | [captura](../screenshots/iteration-11-open-design/before/webkit/16-place-form.png) |

## A. Resumen ejecutivo

### Qué funciona bien y debe conservarse

1. **El modelo móvil es sólido.** Días / Guardados / Viaje se entiende, la navegación inferior tiene identidad propia y el estado activo Ink/Lime es inequívoco.
2. **El deck funciona.** En ambos motores no hubo overflow documental, no aparecieron flechas móviles, se mantuvieron como máximo tres cards y un swipe pasó exactamente de 2 a 3. No se observó flash oscuro.
3. **La arquitectura funcional no necesita reabrirse.** Back, foco, scroll y persistencia pasan el test de Iteración 09; reduced motion reduce los tokens a `.01ms`.
4. **La marca ya existe.** Ink, Lime, Geist, los colores de día y las ilustraciones semánticas producen una identidad reconocible. No hace falta introducir fuente, iconos, librería visual ni sistema paralelo.
5. **Las superficies clave son accesibles por tamaño.** La navbar mide 54 px por destino; botones principales, sheets y campos mantienen generalmente 44–48 px y los inputs de formulario usan 16 px.

### Qué genera más incoherencia

1. DayCover conserva su altura exterior, pero no una escala interna estable. El arte crece demasiado en viewports altos; en 360 px el mismo título pasa a tres líneas y el bloque inferior se comprime.
2. Metadata, estado y labels de navegación se renderizan entre 9 y 11 px. Son funcionales, no decorativos, y su tamaño dificulta la lectura rápida.
3. La apertura del día es un handle visual con botón de solo 24 px de alto. El gesto vertical existe, pero el fallback visible no alcanza el target táctil del sistema.
4. Guardados, actividad flexible, opciones cercanas y Viaje usan demasiados signos simultáneos: barras, masas laterales, chips, bordes, iconos y contenedores anidados.
5. El código visual tiene tres generaciones superpuestas: aliases globales históricos, variables `--traza-*` y tokens `--ds-*`. El gate de tokens pasa en Core/Patterns, pero no cubre todo `globals.css`.
6. Storybook no representa fielmente producción: usa motivos de laboratorio repetidos, copy artificial como “Capítulo de Londres”, el término inglés “anchors” y placeholders donde producción usa fotografía.

### Cambios de mayor impacto

- Convertir DayCover en una retícula de cuatro zonas invariantes y una fila de interacción táctil integrada.
- Elevar el mínimo funcional a 11–12 px y reservar mono solo para datos reales.
- Mantener los significados de anchor / intention / nearby, reduciendo la repetición de barras y etiquetas.
- Unificar Guardados y Viaje alrededor de borde completo, superficie Paper/White y una sola señal cromática por componente.
- Migrar gradualmente estilos de producto a tokens semánticos y retirar reglas históricas sobrescritas.

## B. Tesis visual

**TRAZA debe sentirse como una única edición móvil del viaje: directa, vibrante y editorial, con una retícula estable que deja que cada día cambie de color y escena sin cambiar de idioma visual.**

El pulido no añade personalidad; hace más legible y consistente la personalidad que ya existe.

## C. Inventario

### Tipografía real

| Uso | Computado / fuente | Observación |
| --- | --- | --- |
| Body | GeistSans, 16/24, peso 400 | Correcto; GeistSans 100–900 aparece `loaded`. |
| Mono | GeistMono 100–900 | Correcto; carga real verificada. |
| DayCover kicker | 9/9, peso 700, mono | Demasiado pequeño para fecha y secuencia funcionales. |
| DayCover título | 28–30.1 px, line-height .92, peso 400 | Legible, pero su relación con el arte cambia por viewport. |
| DayCover status/ruta | 11/13.2, peso 700 | Límite inferior aceptable; no debe reducirse más. |
| DayCover número | 108–129 px según ancho | La escala depende demasiado de `vw`; debe limitarse por escala óptica. |
| Bottom navigation | 11/11, peso 650 | Iconos centrados y targets correctos; label pequeño. |
| Datos de vuelo | Geist Mono | Uso funcional correcto para horas, fechas, aeropuertos y vuelo. |

Pesos visibles: 400, 570/590, 650, 700, 750 y 800. Geist Variable los soporta, pero 570/590 y 650 multiplican matices sin aportar siempre una diferencia perceptible. Conviene reducir a una escala operativa: 400, 550/600 y 700.

### Tokens, colores y aliases

Fuente oficial: `src/design-system/tokens/tokens.css`.

| Rol | Design System | Alias heredado aún presente |
| --- | --- | --- |
| Ink | `#161616` | `#0c0c0c` |
| Paper | `#f4f1ea` | igual |
| Lime | `#d5f43b` | `#dcfc24` |
| Sky | `#82d8f7` | `#a9d7de` |
| Pink | `#f3a7cf` | `#f4c4ec` |
| Orange | `#ff6b35` | `#ff5a36` |
| Violet | `#6d45e5` | `#6959d9` |

El inventario encontró 21 hex fuera de `tokens.css`. Algunos son metadatos o catálogos de fallback legítimos, pero `globals.css` mantiene dos paletas y superficies paralelas. Esto explica pequeñas diferencias visibles entre Patterns migrados y pantallas heredadas.

### Espaciado, radios y sombras

- Escala DS: 0, 4, 8, 12, 16, 20, 24, 32, 40 y 48 px.
- `globals.css` mantiene además valores 5, 6, 7, 9, 10, 11, 13, 14, 15, 17 y 18 px en reglas de producto.
- Radios DS: control 12 px, card 24 px, hero 32 px, pill 999 px.
- Radios heredados: control 14 px, card 20 px, hero 28 px, sheet 32 px, además de valores puntuales 11, 18, 19, 20, 23 y 31 px.
- Sombra DS raised: 0 12 px 40 px al 14 %. Se usa en navbar y menús; en la navbar el halo es más ancho de lo necesario para un contenedor ya contrastado.
- DayCover atmosférico usa gradiente radial + lineal y blur. La dirección solicitada pide masas planas; debe retirarse el tratamiento cosmético, no el color del día.

### Iconos

`src/components/icons.tsx` define 11 iconos propios: Arrow, Chevron, Close, Journey, Heart, Ticket, Map, Check, Clock, Plus y Plane. Comparten 20×20, viewBox 24, stroke 1.8, `currentColor`, caps y joins redondeados. No se justifica cambiar de librería.

Las excepciones están en `SavedPlaceCard`: `♥`, `+`, `→` y `···` se renderizan como caracteres. Plus, Arrow y Heart ya existen como SVG del sistema; usarlos evitaría diferencias de caja óptica. El corazón además es una etiqueta no interactiva repetida dentro de una pantalla donde todos los elementos ya están guardados.

### Componentes principales y duplicación

- Core/Patterns: `DayCover`, `DayDeck`, `BottomNavigation`, `SavedPlaceCard`, `TripSectionCard`, `FlightTicketCard`, `DayHeader`, `DayHero`, `SectionHeader`, botones, sheets y formularios.
- Producto: `ActivityCard`, `DayItinerary`, `SavedView`, `TripView`, sheets de edición/asignación y `ActivityDetail`.
- `globals.css` tiene 1.206 líneas y conserva implementaciones anteriores de `.day-cover`, `.bottom-nav`, `.saved-card`, `.travel-doc`, formularios y safe areas, seguidas por overrides de Iteraciones 05, 06 y 08.
- Existen al menos tres namespaces visuales (`--ink/--cloud`, `--traza-*`, `--ds-*`) y dos familias de clases para patrones ya migrados (`.saved-card` / `.ds-saved-place-card`, `.bottom-nav` / `.ds-bottom-navigation`).
- El gate de tokens valida correctamente Core/Patterns migrados, pero su resultado no significa que toda la capa de producto esté tokenizada.

## D. Auditoría por pantalla

### Días / DayCover

![DayCover 07 en 360×800](../screenshots/iteration-11-open-design/before/chromium/01-deck-360x800.png)

![DayCover 07 en 430×932](../screenshots/iteration-11-open-design/before/chromium/01-deck-430x932.png)

**Conservar:** altura exterior sin scroll, deck de tres elementos, color de capítulo, número grande, ilustración semántica, Ink/Lime, ausencia de flechas, swipe y apertura vertical.

**Problemas concretos:**

- El grid actual es `auto / minmax(0,1fr) / auto / auto`. Todo el crecimiento vertical cae en el arte. Entre 360×800 y 430×932 el motivo y el vacío superior ganan mucho más peso que título, status e interacción.
- El número crece de 108 a 129 px con el ancho; no existe una caja óptica común por motivo.
- Fecha y secuencia están a 9 px. Son datos funcionales y no deben tratarse como microdecoración.
- Ruta y estado compiten por su uso simultáneo de mayúsculas, peso 700 y tamaño pequeño.
- La acción visible es una raya sin verbo. Su botón mide 44×24 px, por debajo de `--ds-touch-target` en altura.
- El indicador vive fuera de la card y la acción dentro; ambos expresan progreso/gesto, pero no forman una unidad.
- Las variantes `art-left`, `art-top`, `art-back` usan insets diferentes. Dan variedad, pero no controlan una escala óptica equivalente.
- Las variantes atmosféricas añaden gradientes y blur, en conflicto con la dirección plana solicitada.

Storybook confirma la deriva: [All Eight Chapters](../screenshots/iteration-11-open-design/before/chromium/storybook-day-cover-all-eight.png) repite un motivo de laboratorio y copy no productivo; [Long Title](../screenshots/iteration-11-open-design/before/chromium/storybook-day-cover-long-title.png) prueba un texto artificial que se trunca, no el título real más exigente.

### Día abierto e itinerario

![Día abierto](../screenshots/iteration-11-open-design/before/chromium/07-day-open.png)

**Conservar:** cabecera inmersiva, cierre X, fecha/posición, foto documental de Sky Garden, SectionHeader, prioridad Lime de Añadir plan y acción secundaria Organizar.

**Ajustar:**

- El título del día ocupa cinco líneas mientras el motivo queda reducido a una miniatura; la composición no hereda el equilibrio de la portada.
- En actividades no destacadas, la columna cromática de 62 px comunica `anchor`, `intention` o `nearby-option` mediante `✓`, `~` o `+`. Sí comunica una clasificación, pero repite el mismo dato en el footer y resta ancho al contenido.
- La actividad flexible muestra simultáneamente masa azul, símbolo `~`, status pill y texto “Plan flexible”. Es semántica cuádruple para un único estado.
- El bloque cercano usa violet/lime/pink, grandes índices y una gramática de cards distinta de actividad, Guardados y DayCover. Debe seguir siendo distinto como “opción”, pero dentro de la misma familia de borde, tipo y espaciado.
- `ActivityDetail` conserva códigos y copy pseudoeditorial (`LDN / SG`, “Cerca, si la ciudad lo permite”) que no aportan una función. Cualquier cambio de copy debe aprobarse explícitamente.

**Borde vertical:** no se recomienda eliminar toda señal cromática. Se recomienda sustituir la columna de 62 px por una keyline de 4–6 px o un pequeño marcador integrado junto al tiempo, usando una sola señal por estado. Los headers Mañana / Tarde / Noche y el espaciado deben hacer el trabajo principal de agrupación.

### Guardados

![Guardados](../screenshots/iteration-11-open-design/before/chromium/13-saved.png)

![SavedPlaceCard](../screenshots/iteration-11-open-design/before/chromium/14-saved-place-card.png)

**Conservar:** lista vertical móvil, fotografía dominante, categoría → nombre → zona, máximo dos tags + contador, Añadir a un día como acción primaria, Maps/Detalle/overflow como secundarios.

**Ajustar:**

- La cabecera es una card grande con borde superior rosa; la lista empieza con otra secuencia de chips y cards. El contenido útil entra tarde en 390×844.
- Cada card suma corazón flotante no interactivo, tags con borde, botón Lime, Maps, Detalle y overflow. Aunque la primaria es clara, hay demasiadas cajas de control consecutivas.
- Maps, Detalle y overflow tienen el mismo peso superficial. Maps puede ser enlace de texto con icono; Detalle, control quiet; overflow, icon-only.
- La fotografía de Hard Rock es una fuente licenciada y correcta, pero el recorte actual oculta la señal del local y puede parecer una fachada genérica. Ajustar focal point o usar un encuadre más reconocible es preferible a sustituir la procedencia.
- El detalle de guardado es más limpio que la card de lista, pero vuelve a introducir tres chips grises y un kicker “OPCIONES CERCANAS / DETALLE” innecesariamente técnico.

Storybook usa bloques rosas sin fotografía, por lo que no permite evaluar peso, focal point ni contraste de controles sobre medios reales.

### Viaje

![Viaje](../screenshots/iteration-11-open-design/before/chromium/17-trip.png)

![Vuelo](../screenshots/iteration-11-open-design/before/chromium/18-flight.png)

![Hotel](../screenshots/iteration-11-open-design/before/chromium/19-hotel.png)

**Conservar:** información correcta, ausencia de referencias privadas, bordes completos de vuelo, prioridad de ruta/horas/fecha/vuelo y separación de estancia/traslados/reservas.

**Ajustar:**

- La cabecera blanca con borde violeta y tres chips parece pertenecer a otro sistema frente al deck oscuro y Guardados rosa.
- `TripSectionCard::before` repite una barra lateral en los cuatro documentos. Intenta codificar categoría por color, pero el índice y el título ya la expresan; el color no forma una leyenda aprendible.
- FlightTicketCard usa línea discontinua y avión en círculo naranja. Es una metáfora de boarding pass más literal de lo necesario y está explícitamente fuera de la dirección deseada.
- Hotel empuja el título a cuatro líneas por la distribución header índice/título/icono. La información principal pierde escaneabilidad.
- La sección mezcla radios 12, 20 y 28 px y densidades diferentes. El borde completo común es una base suficiente; la diferenciación puede vivir en header, spacing y una única tinta de acento.

### Navegación

![Bottom navigation](../screenshots/iteration-11-open-design/before/chromium/20-bottom-navigation.png)

La navegación cumple el contrato preferido: contenedor Ink, activo Lime, icono/texto Ink y estados inactivos claros. Los tres targets miden 111.3×54 px en el test automatizado. Ajustes propuestos: elevar labels a 12 px, reducir la sombra exterior y sustituir cualquier carácter suelto por SVG del set existente. No se recomienda una navbar blanca ni una nueva familia de iconos.

### Sheets y formularios

![Formulario Añadir lugar](../screenshots/iteration-11-open-design/before/chromium/16-place-form.png)

La anatomía funciona: handle, header, scroll, footer fijo, inputs 16 px y acciones visibles. Mantener. El pulido debe reducir kickers técnicos (“EDITOR LOCAL”), consolidar radios con los tokens DS y asegurar estados hover/focus/disabled/error en Storybook. Los cambios de copy requieren aprobación y no forman parte de una corrección silenciosa.

## E. Problemas priorizados

No se encontraron P0 en el recorrido auditado.

| Prioridad | Pantalla | Evidencia | Qué ocurre / impacto | Qué debería ocurrir | Componente | Recomendación | Riesgo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | DayCover | [360×800](../screenshots/iteration-11-open-design/before/chromium/01-deck-360x800.png), métricas `audit.json` | Fecha/secuencia a 9 px y status a 11 px dificultan lectura rápida. | Metadata funcional ≥11–12 px. | `DayCover` | Subir escala, reducir tracking y probar títulos reales. | Bajo. |
| P1 | DayCover | [portada](../screenshots/iteration-11-open-design/before/chromium/03-day-07.png) | El handle de apertura tiene target 44×24 px y no nombra la acción. | Fila táctil ≥44 px conectada al indicador y gesto. | `DayCover` | “Abrir día” + indicador/posición + flecha discreta. | Medio: gesto y layout. |
| P1 | DayCover | [360](../screenshots/iteration-11-open-design/before/chromium/01-deck-360x800.png) / [430](../screenshots/iteration-11-open-design/before/chromium/01-deck-430x932.png) | El espacio extra agranda el plano de arte, no la jerarquía completa; la serie cambia de balance. | Zonas invariantes y motivo con escala óptica acotada. | `DayCover`, `DayMotif` | Retícula recomendada A. | Medio: ocho motivos. |
| P2 | DayCover | [día 07](../screenshots/iteration-11-open-design/before/chromium/03-day-07.png) | Gradiente/blur atmosférico contradice la gramática plana. | Masas planas y máximo 3–4 colores por portada. | `patterns.css` | Retirar atmósfera cosmética; conservar color. | Bajo. |
| P2 | Día abierto | [flexible](../screenshots/iteration-11-open-design/before/chromium/10-activity-flexible.png) | Columna de 62 px + símbolo + status + footer repiten el estado. | Una señal cromática y una etiqueta semántica. | `ActivityCard` | Keyline/marcador integrado y agrupación tipográfica. | Medio. |
| P2 | Detalle | [cercanos](../screenshots/iteration-11-open-design/before/chromium/11-nearby-option.png) | Las cards neon y el copy pseudoeditorial parecen una submarca. | Opción cercana distinta, pero con borde/tipo/spacing TRAZA. | `ActivityDetail` | Reusar superficie y tipografía; simplificar arte. | Medio. |
| P2 | Guardados | [card](../screenshots/iteration-11-open-design/before/chromium/14-saved-place-card.png) | Demasiadas cápsulas, corazón decorativo y secundarios equivalentes. | Imagen + jerarquía + primaria clara + secundarios quiet. | `SavedPlaceCard` | Retirar corazón no funcional; aplanar secundarios. | Bajo. |
| P2 | Guardados | [Hard Rock](../screenshots/iteration-11-open-design/before/chromium/14-saved-place-card.png) | Asset correcto, pero recorte poco reconocible. | Focal point que muestre el local. | `media-catalog.ts` | Ajustar focalPoint después de QA. | Bajo. |
| P2 | Viaje | [sección](../screenshots/iteration-11-open-design/before/chromium/17-trip.png) | Barras laterales repetidas sin sistema semántico aprendible. | Una única señal de acento por header/superficie. | `TripSectionCard` | Mantener borde completo; acento compacto. | Bajo. |
| P2 | Viaje | [vuelo](../screenshots/iteration-11-open-design/before/chromium/18-flight.png) | Línea discontinua + avión literal. | Ruta legible mediante alineación, regla sólida y texto. | `FlightTicketCard` | Retirar metáfora de ticket sin perder borde. | Bajo. |
| P2 | Viaje | [hotel](../screenshots/iteration-11-open-design/before/chromium/19-hotel.png) | Título en cuatro líneas por grid del header. | Nombre legible en 2–3 líneas y fechas subordinadas. | `TripSectionCard` | Header responsive específico de contenido. | Bajo. |
| P2 | Sistema | [Storybook](../screenshots/iteration-11-open-design/before/chromium/storybook-day-cover-all-eight.png) | Copy/motivo de laboratorio no representa producción. | Stories con los ocho días reales y media representativa. | Stories | Sustituir fixtures artificiales, no datos de producto. | Bajo. |
| P2 | Sistema | Código | 21 hex fuera de tokens y tres namespaces visuales. | Una frontera semántica única y excepciones documentadas. | `globals.css`, tokens | Migración incremental; no rewrite. | Medio. |

## F. Propuesta para DayCover

### Variante A — Retícula editorial estable (recomendada)

```text
┌──────────────────────────────────────┐
│ VIE 07 · LONDRES              02 / 08│  36 px · mono 11–12
├──────────────────────────────────────┤
│                                      │
│       CAJA DE ILUSTRACIÓN             │  flexible, motivo acotado
│       misma escala óptica             │  y recorte controlado
│                                      │
│ 07                                   │  número anclado al plano
├──────────────────────────────────────┤
│ SKY GARDEN → CITY → CANARY WHARF     │  11–12 px
│ La City desde las alturas.           │  30–34 px / 2 líneas
│ Canary Wharf al anochecer.            │  3 líneas solo en 360
│ 3 planes confirmados                  │  12 px
├──────────────────────────────────────┤
│ 02/08  ━ ━ ● ━ ━ ━ ━ ━    Abrir día ↑│  ≥48 px táctiles
└──────────────────────────────────────┘
```

**Grid:** `36px minmax(0, 1fr) clamp(128px, 17svh, 152px) 48px`. La portada ocupa el espacio disponible; el plano de ilustración absorbe altura, pero el motivo se limita a una caja óptica con máximo común.

**Texto variable:** título de 19ch, 2 líneas objetivo; 3 en ≤360 px. No reducir fuente por día. Si un título real excede, revisar copy funcional de forma explícita o aumentar la zona en toda la serie; no truncar silenciosamente un solo día.

**Ilustración:** viewBox común 320×360; motivo principal dentro de 72–82 % de la caja; un secundario y una ruta como máximo; una única lógica de contorno de 4 unidades; sin sombras desplazadas distintas por día, blur, textura falsa ni gradientes. El número y el motivo pueden cruzarse hasta el 12–15 %, nunca con el título.

**Indicador e interacción:** se integran en la última fila. La posición `02/08` es texto accesible; los segmentos muestran progreso; “Abrir día” ofrece fallback visible al gesto. Swipe sigue siendo horizontal y la apertura vertical sigue disponible.

### Variante B — Plano dividido

```text
┌──────────────────────────────────────┐
│ VIE 07 · LONDRES              02 / 08│
├───────────────────────┬──────────────┤
│ ILUSTRACIÓN            │ 07           │
│                       │ ruta/status  │
│                       │ título       │
│                       │ 2–3 líneas   │
├───────────────────────┴──────────────┤
│ progreso                 Abrir día ↑ │
└──────────────────────────────────────┘
```

Funciona bien en 430×932 y landscape, pero en 360×800 reduce demasiado el ancho del título y puede crear composiciones distintas por longitud. Se conserva como estudio, no como recomendación final.

### Recomendación

Elegir A. Es la evolución más pequeña, conserva la lectura vertical actual, tolera mejor títulos reales, mantiene la ilustración protagonista y hace que los ocho días se sientan una serie sin convertirlos en una plantilla rígida.

### Sistema cromático para ocho días

| Día | Base | Tinta | Acento | Decisión |
| --- | --- | --- | --- | --- |
| 06 | Orange DS | Ink | Pink | Conservar; retirar gradiente oscuro. |
| 07 | Sky DS | Ink | Lime + detalle Orange | Conservar; limitar Orange a un detalle. |
| 08 | Pink DS | Ink | Orange | Conservar; evitar añadir Violet. |
| 09 | Violet DS | White | Lime | Conservar como único capítulo violeta dominante. |
| 10 | Orange DS | Ink | Lime | Conservar; retirar plano atmosférico/negro cosmético. |
| 11 | Sky DS | Ink | Pink | Mantener dirección; no cambiar datos ni copy. |
| 12 | Paper DS | Ink | Violet | Mantener dirección; no cambiar datos ni copy. |
| 13 | Sky DS | Ink | White | Conservar como cierre luminoso. |

Regla común: base + tinta + un acento; un cuarto color solo para un detalle semántico. Ink/Lime conectan portada, interacción y navbar, no tienen que dominar cada ilustración.

### Prototipo Open Design

Se completó en **Local Codex** el proyecto **TRAZA Iteration 11 — DayCover Local Codex**, con alcance móvil / core flow / polished. El artefacto materializa la variante A recomendada y la alternativa B, permite contrastar los días reales 07, 09 y 10, mantiene la paleta y tipografía de TRAZA, y define reglas específicas para 360×800–430×932 y controles táctiles de al menos 44 px.

- [Abrir el prototipo DayCover en Open Design](http://127.0.0.1:63129/api/projects/traza-iteration-11-daycover-local/raw/daycover-audit.html)
- [Abrir el archivo en Open Design Studio](http://127.0.0.1:59050/projects/traza-iteration-11-daycover-local/conversations/c7dcd7dd-559d-4892-bde1-381631c9e3c2/files/daycover-audit.html)

Los enlaces dependen de la sesión local actual de Open Design. La validación del artefacto confirmó sintaxis JavaScript, contenido real, 33 IDs editables, ausencia de placeholders, gradientes y glassmorphism, y las reglas responsive indicadas. Open Design no pudo generar una captura automática por falta de contexto adicional de workspace; esa limitación no afecta al HTML interactivo, pero la revisión visual final debe hacerse en el preview abierto antes de aprobar la implementación.

## G. Propuesta para componentes

### SavedPlaceCard

- Mantener fotografía 240 px como máximo en 390×844; reducir a 210–224 px si permite ver el inicio de la siguiente card.
- Eliminar el corazón no interactivo o convertirlo en una acción real solo si existe funcionalidad aprobada.
- Mantener dos tags + contador, pero usar superficie sin borde para tags informativos.
- Mantener Añadir a un día como única acción Lime.
- Maps como enlace con `MapIcon`; Detalle como botón quiet; Editar solo en overflow.
- Ajustar focal point de imágenes ambiguas; mantener licencia/provenance.

### TripSectionCard / FlightTicketCard

- Borde completo común, radio card DS y fondo Paper/White.
- Sustituir barra lateral completa por un bloque de índice/acento de 6–8 px dentro del header.
- Vuelo: ruta, aeropuertos y horas en primer plano; fecha/vuelo debajo; regla sólida, sin avión flotante ni línea discontinua.
- Hotel: título con ancho prioritario, fechas en dos columnas y Maps como acción secundaria sólida.

### ActivityCard

- Mantener la distinción anchor / intention / nearby-option.
- Usar keyline o marcador pequeño, no una columna de 62 px.
- Mostrar status una vez; eliminar duplicación símbolo + pill + footer cuando expresen lo mismo.
- Conservar la card fotográfica destacada de Sky Garden como excepción documental.

### Section headers

- Conservar índice, título y count.
- Elevar metadata a 11–12 px y reducir mayúsculas/tracking.
- Usar espaciado y keyline como agrupación principal, no cards envolventes adicionales.

### BottomNavigation

- Conservar estructura, Ink/Lime y labels.
- Elevar label a 12 px, reducir sombra, mantener target 54 px.
- Reusar exclusivamente los SVG propios.

### Acciones primarias y secundarias

- Una primaria Lime o Ink por contexto.
- Secundaria outline/quiet; terciaria como link o overflow.
- No convertir categorías, estados y acciones en cápsulas con el mismo peso.

## H. Plan de cambios propuesto

### 1. Correcciones seguras

1. Elevar kicker/nav/status funcional a 11–12 px.
2. Aumentar el target de Abrir día a 44–48 px y añadir nombre visible.
3. Sustituir caracteres Heart/Plus/Arrow por iconos existentes.
4. Ajustar focal point de Hard Rock después de comparar dos crops.
5. Actualizar Storybook con contenido real y viewport 360/390/430.

### 2. Cambios de componentes

1. Aplicar retícula A a `DayCover` y reglas ópticas a los ocho motivos.
2. Simplificar `ActivityCard` sin perder niveles semánticos.
3. Refinar jerarquía de acciones en `SavedPlaceCard`.
4. Unificar `TripSectionCard` y simplificar `FlightTicketCard`.
5. Migrar estilos visibles desde aliases heredados hacia tokens DS.

### 3. Cambios visuales que necesitan aprobación

1. Retirar gradientes/blur atmosféricos de DayCover.
2. Integrar indicador y Abrir día dentro de la card.
3. Sustituir la columna cromática de actividad por keyline/marcador.
4. Retirar el corazón decorativo de Guardados.
5. Retirar barra lateral repetida y metáfora de boarding pass en Viaje.
6. Cambiar copy no funcional (`LDN / SG`, “Capítulo”, “EDITOR LOCAL”, microcopy cercana).
7. Aplicar la paleta común a los ocho días, especialmente 11 y 12, sin tocar su contenido.

### 4. Cambios que no se recomiendan

- Nueva fuente, librería de iconos o Design System.
- Navbar blanca, dashboard o grid administrativo.
- Reescribir navegación, persistencia, CRUD o modelo de datos.
- Eliminar niveles anchor / intention / nearby-option.
- Ilustraciones raster independientes por día, 3D, collage o fotografía en DayCover.
- Glassmorphism, sombras flotantes, gradientes decorativos o animaciones nuevas.
- Cambiar producción, conectar Supabase o publicar Preview en esta fase.

## I. Archivos que se modificarían tras aprobación

### Componentes y patterns

- `src/design-system/patterns/day-cover.tsx`
- `src/design-system/patterns/patterns.css`
- `src/components/day-cover.tsx`
- `src/components/day-motif.tsx`
- `src/design-system/expression/illustration-primitives.tsx`
- `src/components/activity-card.tsx`
- `src/components/day-itinerary.tsx`
- `src/components/activity-detail.tsx`
- `src/design-system/patterns/product-patterns.tsx`
- `src/components/saved-view.tsx`
- `src/components/trip-view.tsx`
- `src/components/icons.tsx` solo si falta un overflow icon coherente.

### Tokens y estilos

- `src/design-system/tokens/tokens.css`
- `src/design-system/components/components.css`
- `src/app/globals.css` mediante migración acotada, sin rewrite.

### Stories

- `src/design-system/stories/DayCover.stories.tsx`
- `src/design-system/stories/Patterns.stories.tsx`
- `src/design-system/stories/Atmospheric.stories.tsx` si se retira la variante atmosférica.
- `src/design-system/stories/Navigation.stories.tsx`

### Tests y QA

- `src/design-system/patterns/day-cover.test.ts`
- `src/design-system/patterns/day-deck.test.ts` solo si cambia la fila de interacción.
- `src/design-system/components/contracts.test.tsx`
- `scripts/audit-iteration-11.mjs`
- un nuevo test visual after para Iteración 11.

### Documentación

- `docs/IMPLEMENTATION_PLAN.md` cuando se apruebe el alcance.
- `docs/CHAPTER_ILLUSTRATION_SYSTEM.md`
- `docs/DESIGN_TOKENS.md` solo si cambia un contrato.
- este documento con enlaces after y decisiones aprobadas.

### Assets

No se recomienda modificar fotografías ni añadir bitmaps para DayCover. Las ilustraciones deben seguir siendo SVG/code-native dentro de `day-motif.tsx` y Expression. La única posible modificación de media sería el `focalPoint` de Hard Rock en `src/data/media-catalog.ts`; no el archivo licenciado.

## Quality gate del baseline

| Comprobación | Resultado |
| --- | --- |
| `npm run lint` | Pasa. |
| `npm run typecheck` | Pasa. |
| `npm test` | 10 archivos, 40 tests, todos pasan. |
| `npm run lint:tokens` | Pasa para Core/Patterns migrados. |
| `npm run build` | Pasa; ruta `/` prerenderizada. |
| `npm run test:iteration09` | Pasa; nav 3×54 px, Back/scroll/foco correctos, sin errores. |
| Auditoría Chromium | 4 viewports, sin overflow ni errores; swipe 2→3. |
| Auditoría WebKit | 4 viewports, sin overflow ni errores; swipe 2→3. |
| Geist | Sans y Mono `loaded`; fallback no usado. |
| Storybook | 5 stories comparadas en ambos motores; existen divergencias de contenido/medios documentadas. |

## Punto de parada

El 16 de agosto de 2026 se aprobó continuar en el orden del apartado H y usar la variante A de Open Design como especificación. La implementación se realizó en `iteration-11-open-design-ui-audit`, sin alterar navegación, persistencia, CRUD, datos privados ni estructura Días / Guardados / Viaje.

### Cambios aplicados

- Retícula DayCover A para los ocho días: arte 4:3 estable, número fuera del frame, título de hasta tres líneas y fila de apertura de 54 px con progreso integrado.
- Metadata, status y navegación funcional a 12 px; controles táctiles de al menos 44 px.
- Ilustraciones SVG planas: sin fondo atmosférico, blur, sombra desplazada ni textura de ruido.
- `ActivityCard` sin rail de 62 px; keyline de 6 px y nivel separado del estado.
- `SavedPlaceCard` sin corazón decorativo, con una primaria Lime y secundarias quiet; Hard Rock usa `focalPoint: 50% 72%` tras comparar dos crops.
- `TripSectionCard` usa un acento corto en el header; `FlightTicketCard` usa una regla sólida sin avión flotante ni línea discontinua.
- Storybook usa contenido real y stories explícitas para 360, 390 y 430 px; se retiró el experimento atmosférico.

### Evidencia after

- `screenshots/iteration-11-open-design/after/chromium/`
- `screenshots/iteration-11-open-design/after/webkit/`
- `C:/Users/Diego/.codex/visualizations/2026/08/05/019fd43e-4498-7113-adf2-63b7086c1fb4/hard-rock-crop-comparison.png`

### Quality gate after

| Comprobación | Resultado |
| --- | --- |
| `npm run lint` | Pasa. |
| `npm run typecheck` | Pasa. |
| `npm test` | 10 archivos, 42 tests, todos pasan. |
| `npm run lint:tokens` | Pasa. |
| `npm run build` | Pasa; ruta `/` prerenderizada. |
| `npm run build-storybook` | Pasa; solo mantiene el aviso no bloqueante de chunks grandes. |
| `npm run test:iteration09` | Pasa; navegación 3×54 px, historial, scroll, foco y consola correctos. |
| Chromium | 360×800, 390×844 y 430×932 sin overflow ni errores; apertura 54 px. |
| WebKit | 360×800, 390×844 y 430×932 sin overflow ni errores; apertura 54 px. |

No se ha creado commit, publicado Preview ni desplegado producción. Esas acciones siguen requiriendo autorización explícita.
