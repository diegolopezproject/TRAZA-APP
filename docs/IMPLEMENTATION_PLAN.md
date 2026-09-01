# Plan de implementación

## Google Maps → TRAZA — Phase 3D

- [x] Añadir una composition root server-only que conecta las fronteras productivas existentes y mantiene transportes, cliente Places y evaluación de Londres inyectables.
- [x] Resolver de forma controlada los tres enlaces Android reales mediante la allow-list existente, sin scraping ni interpretación de payloads opacos.
- [x] Validar con Places API (New) identidad, Details, normalización, Greater London y categoría hasta el contrato pre-persistencia.
- [x] Registrar evidencia segura: A y B terminan `ready-to-save`; C termina `identity-ambiguous` antes de Details al no existir identidad única demostrable.
- [x] Mantener el harness real fuera de la suite ordinaria y eliminarlo después de la ejecución.
- [x] Cerrar lint, typecheck, tests, build, revisión de secretos y checkpoint Git de Phase 3D.

Decisión de alcance: Phase 3D prueba el proveedor real sólo hasta pre-persistencia. No invoca `ImportedPlaceRepository`, no escribe en Supabase y no añade UI, `localStorage`, `/share`, PWA o fotos. La evidencia sanitizada y la incidencia de restricción IP resuelta están en `docs/PHASE_3D_REAL_GOOGLE_VALIDATION.md`.

## Google Maps → TRAZA — Phase 3C

- [x] Aprobar y registrar el recurso dedicado “Greater London boundary” del London Datastore, publicado por Greater London Authority y mantenido por GLA GIS bajo OGL v2.
- [x] Auditar el shapefile fuente como una feature Polygon con un anillo cerrado y 10.921 posiciones en OSGB36 / British National Grid (EPSG:27700).
- [x] Añadir un generador reproducible sin dependencias que transforma a longitud/latitud WGS 84 (EPSG:4326), conserva todos los vértices y valida el perfil exacto de la fuente.
- [x] Incorporar el asset runtime compacto, versionado y con procedencia verificable, sin incluir el ZIP ni sus sidecars.
- [x] Cargar y validar el asset de forma fail-closed; mantener la regla pura de país GB/UK + point-in-polygon y exponer el evaluador productivo para inyección.
- [x] Cubrir puntos fijos interiores y exteriores, país ausente/incorrecto, borde inclusivo, asset ausente o malformado y candidato normalizado sin red.

Decisión de alcance: Phase 3C sólo habilita la decisión determinista de alcance administrativo de Greater London. No conecta el evaluador al orquestador mediante un singleton, no persiste datos, no realiza tráfico Google o Supabase y no crea UI, `/share`, PWA, fotos ni dependencias. La procedencia, transformación aproximada Helmert y su precisión documentada se registran en `docs/GREATER_LONDON_BOUNDARY_SOURCE.md`. La siguiente fase deberá inyectar explícitamente este evaluador en su composition root sin mezclarlo con persistencia o transporte.

## Google Maps → TRAZA — Phase 3B

- [x] Componer parser, resolución segura, contexto Maps, Text Search/selección, Details, normalización, alcance Londres y clasificación en un único orquestador server-only.
- [x] Definir un resultado pre-persistencia que separa identidad/categoría durable preparada de metadatos Google transitorios y nunca inventa `recordId`.
- [x] Inyectar transporte de redirects, cliente Places y evaluador de Londres; mantener normalizador y clasificador como fronteras puras sustituibles en tests.
- [x] Mapear fallos de share, resolución, Places, normalización e identidad al modelo provider-independent sin exponer payloads o detalles internos.
- [x] Cubrir los caminos Text Search y Place ID directo, alcance, categoría ambigua, fallos terminales e idempotencia con 12 tests integrados sin red ni persistencia.

Decisión de alcance: Phase 3B termina en `ready-to-save`, `needs-category`, `outside-scope` o `failed`. No importa ni invoca el repositorio de Phase 2, no usa Supabase y no crea PWA, `/share`, UI, fotos ni tráfico real de Google. El evaluador de Londres es obligatorio como dependencia; la regla productiva de Phase 1 continúa fallando de forma segura mientras falte el asset autoritativo.

## Google Maps → TRAZA — Phase 3A

- [x] Preservar los contratos provider-independent de Phase 1 y la frontera de persistencia de Phase 2.
- [x] Extraer un único enlace Maps desde `url`, `text` o `title` con límites del SDD y allow-list exacta compartida.
- [x] Resolver únicamente short links aprobados mediante transporte inyectado, redirects manuales, tres saltos y presupuestos 2 s / 5 s.
- [x] Derivar Place ID solo desde `api=1&query_place_id=` documentado; usar contexto de Text Search para rutas/nombres/coordenadas reconocibles.
- [x] Implementar Text Search y Place Details de Places API (New) con máscaras mínimas, validación runtime, timeout y clave server-only.
- [x] Seleccionar candidatos de forma determinista y mantener ambiguos los empates materiales.
- [x] Normalizar Place Details al `NormalizedPlaceCandidate` de Phase 1 sin persistencia ni acceso a Supabase.
- [x] Cubrir parser, SSRF, redirects, contexto, Places mockeado, selección y normalización con tests sin red.
- [x] Phase 3B: componer estas fronteras en un servicio de orquestación y mapear fallos internos sin crear todavía PWA, `/share` ni UI.

Decisión de alcance: Phase 3A no contiene un `importGoogleMapsPlace()` monolítico. Parser, autoridad/resolución URL, contexto Maps, HTTP Places, selección y normalización permanecen independientes. Los tres enlaces Android reales son fixtures de parser y no se resuelven. La mitigación DNS se apoya en hosts exactos de Google; DNS rebinding no se considera resuelto por validación textual y no se añade infraestructura de red en esta fase.

## Iteración 12 — consistencia de ritmo y sistema cromático de día

### Device fit y safe areas

- [x] Derivar cabeceras, navegación y reservas inferiores de `env(safe-area-inset-*)` mediante tokens compartidos.
- [x] Colocar metadata de DayCover y la fila completa de DayDetail después del safe area superior.
- [x] Priorizar el titular de DayDetail y desplazar el motivo al plano inferior/derecho sin excepciones por día.
- [x] Reutilizar el skyline canónico del Día 07 en Cover y Detail con crop distinto.
- [x] Centrar icono y label de los tres estados activos de BottomNavigation con una columna flex compartida.
- [x] Validar 360×800, 390×844, 393×852, 412×915 y 430×932 en Chromium/WebKit con simulación QA 47/34.
- [x] Generar las doce capturas iPhone 17 y la lámina de aprobación desde UI real.

- [x] Separar el límite de ilustración y la metadata mediante una reserva compartida de 20 px, independiente de la geometría SVG.
- [x] Mantener crops y asimetrías por capítulo, recortando únicamente el desborde que invadiría la zona funcional.
- [x] Formalizar `dayBase` y `daySurface` para 06–13 con una derivación Base→Texto común.
- [x] Aplicar `daySurface` e Ink al hero compartido de los ocho DayDetail, conservando el itinerario warm neutral y el radio inferior.
- [x] Comprobar automáticamente contraste de título, ruta, descripción, fecha, posición e iconos.
- [x] Generar `iteration-12-day-system.png` y `iteration-12-daycover-rhythm.png`.
- [x] Validar 64 pares cover/detail en Chromium y WebKit sobre cuatro viewports móviles sin overflow ni excepciones por día.

Decisión de sistema: cada superficie de detalle se obtiene con la misma relación cromática, 42% `dayBase` + 58% Texto. Todos los heroes permiten Ink con contraste mínimo superior a 6.6:1. El ritmo funcional queda fijado por layout en 20 px ilustración→metadata, 20 px metadata→CTA, 8 px CTA→progreso y al menos 12 px progreso→navbar.

## Iteración 12 — Mobile Experience Polish

- [x] Extender el color Base de cada DayCover a todo el viewport, también detrás de la navegación flotante.
- [x] Mantener la navbar fija fuera del transform del deck y reservar CTA/progreso desde altura de navegación, gap y `safe-area` compartidos.
- [x] Afinar axis lock, seguimiento directo, cancelación, snap de un solo día y resistencia acotada en los extremos.
- [x] Convertir el progreso 06–13 en feedback continuo durante el drag sin añadir otro indicador.
- [x] Unificar CTA y gesto vertical sobre la misma apertura; presentar DayDetail desde abajo conservando DayCover debajo.
- [x] Conservar Día 07 al volver mediante Android/Browser Back, swipe-edge y botón de cierre.
- [x] Eliminar escalas tipográficas por longitud y usar una única jerarquía DayCoverTitle / FunctionalMeta / CTA.
- [x] Validar Chromium y WebKit en 360×800, 390×844, 412×915 y 430×932, con los ocho crops a 390×844.
- [x] Completar quality gate final con lint, tipos, 44 tests, token gate, build, Storybook y navegación histórica.
- [ ] Crear commit, push y Vercel Preview; no desplegar a producción.

Decisión de interacción: `DayDeck` sigue montando únicamente anterior / actual / siguiente y nunca avanza más de un día. La navegación Días / Guardados / Viaje permanece fija e independiente; su reserva inferior es el único origen geométrico para CTA y progreso. El detalle entra como una capa desde abajo sin sustituir previamente la portada, y todas sus salidas convergen en la misma operación de historial.

## Iteración 12 — DayCover Full Bleed aprobada

- [x] Aprobar en Open Design la dirección B — Full Bleed, su respuesta móvil y el sistema cromático 06–13.
- [x] Limitar la implementación a `DayCover`, sin modificar Guardados, Viaje ni navegación.
- [x] Sustituir frame y fecha gigante por fondo continuo, cabecera funcional, titular editorial, ilustración integrada y CTA Lime.
- [x] Aplicar los roles Base / Texto / Apoyo / Ink a las ocho portadas; reservar Electric Lime para interacción y posición activa.
- [x] Validar lint, tipos, tests, build y Preview local en Chromium/WebKit para 360×800, 390×844, 412×915 y 430×932.
- [ ] Esperar aprobación de Preview antes de cualquier despliegue a producción.

Decisión de alcance: la variante Full Bleed sustituye únicamente la presentación cerrada de las DayCover. El día abierto conserva su composición y paleta previas. La ilustración refinada del Día 07 se activa solo en portada; los demás motivos mantienen su semántica existente dentro de la nueva lógica cromática de colección.

## Iteración 11 — auditoría visual y aplicación mobile-first

- [x] Auditar producción y Storybook en Chromium/WebKit para 360×800, 390×844, 412×915 y 430×932.
- [x] Documentar hallazgos, prioridades y propuesta DayCover A/B sin alterar navegación, datos ni CRUD.
- [x] Validar y aprobar DayCover A con Open Design como dirección de implementación.
- [x] Aplicar correcciones seguras: tipo funcional, apertura táctil, iconos, crop de Hard Rock y stories móviles reales.
- [x] Implementar la retícula editorial estable de DayCover A en los ocho días.
- [x] Simplificar ActivityCard conservando anchor / intention / nearby-option.
- [x] Refinar SavedPlaceCard, TripSectionCard y FlightTicketCard sin cambiar comportamiento.
- [x] Migrar estilos visibles heredados a tokens DS mediante cambios acotados.
- [x] Actualizar documentación de ilustraciones, decisiones y evidencia before/after.
- [x] Ejecutar lint, typecheck, tests, token gate, build y matriz visual móvil antes de cualquier despliegue.

Decisión móvil: 390×844 es la referencia de composición; 360×800 y 430×932 son límites obligatorios. Todos los controles interactivos mantienen al menos 44 px y la navegación Días / Guardados / Viaje no cambia.

## Iteración 09 — Navigation & Motion Polish

- [x] Proteger `744c16d`, crear `iteration-09-navigation-motion-polish` y capturar baseline Chromium/WebKit.
- [x] Localizar en `0cf6abb` la navegación histórica Ink + pill Lime y auditar la causa del flash.
- [x] Recuperar la intención histórica dentro de `BottomNavigation` de Design System 1.1.
- [x] Eliminar brightness/opacity del deck sin cambiar portadas ni contenido.
- [x] Coordinar History API, X, Back, fallback, scroll y foco con una sola API.
- [x] Añadir swipe-back lateral únicamente a pantallas secundarias.
- [x] Cerrar Storybook, tests, matriz móvil, capturas y vídeo after.
- [ ] Publicar Vercel Preview y esperar aprobación antes de producción.

## Iteración 08 — recuperación móvil y carácter visual

- [x] Proteger baseline, crear rama y auditar producción en Chromium/WebKit y cinco viewports.
- [x] Sustituir el carrusel libre por `DayDeck` controlado con axis lock y máximo ±1.
- [x] Recuperar navbar Ink y una reserva inferior única.
- [x] Madurar DayCover 2.0 con pilotos expresivos 6, 7 y 10.
- [x] Simplificar día abierto, headers internos y copy redundante.
- [x] Reconstruir SavedPlaceCard y flight tickets desde Patterns.
- [x] Añadir historias atmosférica/flat, vertical stack y contenido largo real.
- [ ] Cerrar gates y Vercel Preview sin tocar producción; vídeo y matriz ya validados.

## Iteración 06 — base móvil y capítulos ilustrados

- [x] Proteger el baseline, ejecutar el quality gate inicial y crear `iteration-06-mobile-foundation`.
- [x] Centralizar safe areas, viewport dinámico, reserva de navegación, sheets y feedback.
- [x] Convertir asignación de Guardados en un sheet secuencial de dos pasos.
- [x] Consolidar formularios móviles con header/footer sticky y compatibilidad con teclado.
- [x] Crear un sistema SVG común para las ocho portadas sin fotografía principal.
- [x] Restaurar desde Git la fotografía editorial anterior de Sky Garden.
- [x] Validar WebKit y Chromium en la matriz móvil y guardar evidencias before/after.

## Iteración 05 — sistema de producto unificado

- [x] Proteger `fc2a772`, crear `iteration-05-unified-product-system` y capturar baseline.
- [x] Cerrar investigación práctica, principios y auditoría antes de modificar UI.
- [x] Unificar shell, navegación Ink, header opcional, safe areas, sheets y feedback.
- [x] Centralizar spacing, radios, superficies, botones, media provenance y motion.
- [x] Reimplementar pilotos: portada 7, Guardados y Viaje.
- [x] Aplicar plantilla editorial a portadas 7, 8 y 10 sin códigos decorativos.
- [x] Auditar 28 Guardados y sustituir siete por fotografía real licenciada.
- [x] Diferenciar de forma visible generated editorial y graphic fallback.
- [x] Cerrar matriz final de navegador, capturas after y láminas before/after.
- [ ] Reintentar los tres assets Commons limitados por HTTP 429 o solicitar imagen al usuario.

## Iteración 04 — TRAZA: viaje por capas

El alcance, referencias y decisiones completas están documentados en `ITERATION_04_PLAN.md`, `REFERENCE_AUDIT.md` y `PATTERN_DECISIONS.md`.

- [x] Proteger el baseline de Iteración 03 con Git y commit reproducible.
- [x] Reemplazar L/26/coordenadas por marca TRAZA, header global, favicon y app icon.
- [x] Documentar componentes, tipografía y superficies; glass limitado a la capa funcional.
- [x] Completar media y Maps para los 28 lugares con auditoría trazable.
- [x] Añadir paso Guardados → ¿Dónde quieres colocarlo? y persistencia v4.
- [x] Implementar Organizar con borrador, cancelar/guardar, locks y controles accesibles.
- [x] Mantener Días / Guardados / Viaje, CRUD local-first y reduced motion.
- [ ] Capturar la matriz visual final de Iteración 04 y cerrar QA de navegador.

## Iteración 02 — sistema y legibilidad

- [x] Auditar producto, código y capturas en 390×844, 430×932, 768×1024 y 1440×900.
- [x] Centralizar contenido español, fechas y etiquetas semánticas.
- [x] Añadir tokens tipográficos y capas/zona segura de portada.
- [x] Reconstruir el escenario responsive del carrusel y añadir teclado.
- [x] Añadir `MediaAsset` y medios locales reconocibles para Sky Garden y Guardados.
- [x] Reordenar navegación inferior y áreas scrollables para que no tapen acciones.
- [x] Implementar asignación local Guardado → Día y reflejarla como opción cercana.
- [x] Afinar motion y microinteracciones con reduced motion.
- [x] Actualizar documentación de datos, visual e interacciones.
- [x] Validar los cuatro viewports, consola, accesibilidad, lint, tipos, tests y build.

### Resultado de validación

- 390×844, 430×932, 768×1024 y 1440×900 sin overflow de documento.
- Portada activa centrada, titular dentro de card y navegación sin solapamiento.
- Flechas de teclado cambian de día en los cuatro viewports.
- Consola limpia, reduced motion operativo y posición de itinerario preservada.
- Asignación, movimiento visual y retirada Guardado → Día cubiertos por reducer y navegador.
- Capturas finales e informes en `screenshots/` y `screenshots/audit-iteration-02/`.

### Decisiones conservadas

- Electric London sigue siendo la dirección aprobada.
- El cambio entre portadas continúa sobre scroll horizontal nativo con snap.
- Abrir/cerrar el día mantiene el gesto deliberado y su alternativa visible.
- Supabase continúa fuera de alcance; la persistencia pasa al repositorio local versionado de Iteración 03.

### Nota de dependencias

La auditoría de npm continúa señalando avisos transitivos en `postcss` y `sharp` dentro de Next. El `fix --force` sugerido degrada Next de forma incompatible, por lo que no se aplica automáticamente.

## Iteración 03 — utilidad local-first

El alcance, riesgos y orden completo están documentados en `ITERATION_03_PLAN.md`.

- [x] Corregir horarios, estados, meals y narrativa de los ocho días.
- [x] Derivar índices, copies, final de capítulo y anchors desde datos reales.
- [x] Crear ocho themes y motivos semánticos sin el asset genérico anterior.
- [x] Implementar apertura espacial con handle accesible y reduced motion.
- [x] Renderizar 28 Guardados y medios/fallbacks diferenciados.
- [x] Añadir CRUD de lugares y repositorio local versionado con migración/reset.
- [x] Persistir asignaciones, comidas, planes personalizados y traslados.
- [x] Añadir restaurante por meal slot, Añadir plan, mover, eliminar y deshacer.
- [x] Añadir Traslados editables y resumen desplegable de 12 anchors reales.
- [x] Documentar medios, transición y sistema de motion.
- [x] Validar flujo móvil y los cuatro viewports sin Supabase.
# Iteración 07 — TRAZA Design System 1.0

- [x] Proteger Iteración 06, capturar baseline y crear `iteration-07-design-system-foundation`.
- [x] Crear tokens semánticos con salidas CSS, Tailwind y TypeScript.
- [x] Configurar Storybook 10 con Next/Vite, viewports, themes y preferencias.
- [x] Construir Core, Patterns y frontera Core/Expression.
- [x] Implementar DayCover 2.0, Lab, overlays y tests de bounds.
- [x] Migrar pilotos visibles de Días, Guardados y Viaje.
- [x] Añadir gate de tokens y documentación operativa/Figma.
- [x] Cerrar matriz WebKit/Chromium, capturas y commit final.
## Microiteración — approval gate CTA + swipe de DayCover 07

- [x] Mantener CTA ancho y swipe-up como accesos equivalentes sin modificar navegación ni transición.
- [x] Reutilizar `ChevronIcon` del sistema local de TRAZA como chevron ascendente y centrar el grupo label + icono.
- [x] Consolidar CTA, progreso activo y BottomNavigation activa sobre `--ds-color-action-accent` (`#d5f43b`).
- [x] Prototipar un único hint vertical de 8 px / 420 ms con el easing estándar y exclusión para Reduced Motion.
- [x] Aprobar visualmente DayCover 07 y extender la misma regla CTA, sin variantes, a los días 06–13.
- [x] Regenerar y revisar las ocho capturas finales y la contact sheet específica sin UI de desarrollo.

## Microiteración — compactación y safe zone del motif en DayDetail

- [x] Sustituir la reserva vertical fija del hero por una composición en flujo basada en copy, pausa, motif y padding compartido.
- [x] Aplicar una safe zone común al motif y mostrar la composición completa en el uso compacto de DayDetail.
- [x] Auditar DayDetail 06–13 en la matriz móvil y actualizar únicamente la captura final afectada.
