# Plan de implementación

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
