# Plan de implementación

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
