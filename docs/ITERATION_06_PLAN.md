# Iteración 06 — base móvil y capítulos ilustrados

## Objetivo cerrado

TRAZA pasa de caber en un teléfono a organizarse desde el viewport de un iPhone moderno. La referencia de ingeniería es `402 × 874` CSS px, DPR 3, interacción táctil y WebKit. Escritorio se conserva como adaptación. No se añaden datos, secciones, backend ni funciones de producto.

## Baseline protegido

- Rama de origen: `iteration-05-unified-product-system` en `85bdea3`.
- Rama de trabajo: `iteration-06-mobile-foundation`.
- Estado inicial limpio; lint, TypeScript, 16 tests y build pasaron antes de editar.
- Evidencias de Iteración 05 y captura directa a 402 × 874 conservadas en `screenshots/iteration-06/before/`.

## Decisiones de interacción

1. El `AppShell` será el único propietario de safe areas, alto dinámico, reserva inferior, navegación y offsets de feedback.
2. Días seguirá sin cabecera persistente. La franja superior de la portada será contenido no interactivo y las acciones quedarán fuera del eje de la Dynamic Island.
3. La navegación Ink mantiene color y destinos; gana una altura compartida y una base que incluye el safe inset inferior.
4. Los overlays inmersivos usan `100dvh`; los sheets usan header y footer sticky con contenido central scrollable y altura limitada por `visualViewport`.
5. Asignar un Guardado se divide en dos pasos persistentes mientras el sheet está abierto: día y momento.
6. Las portadas dejan de consumir fotografía. Un único componente SVG con primitivas, trazo, sombras, perspectiva y grid comunes produce ocho capítulos semánticos.
7. La fotografía editorial anterior de Sky Garden vuelve exactamente desde el historial para card y detalle. No se cambia otra fotografía.

## Orden de implementación

- [x] Proteger Git, ejecutar quality gate inicial y capturar baseline.
- [x] Centralizar tokens de safe area, viewport, navegación, sheets, controles flotantes y toast.
- [x] Corregir shell, carrusel, itinerario, detalle, Guardados, Viaje y Organizar.
- [x] Reconstruir `MobileSheet`, formularios y compatibilidad con teclado/Visual Viewport.
- [x] Implementar asignación secuencial en dos pasos.
- [x] Implementar `Chapter Illustration System` y ocho portadas.
- [x] Restaurar y documentar el asset anterior de Sky Garden.
- [x] Ejecutar matriz WebKit/Chromium, consola, reduced motion, orientación y capturas.
- [x] Completar auditoría, matriz de dispositivos y lámina before/after.
- [x] Ejecutar quality gate final; la entrega queda registrada en el commit de la rama.

## Fuera de alcance

Supabase, autenticación, sincronización, PWA completa, offline, contenido de días 11/12, nuevas categorías, mapa embebido, recomendaciones, IA, carga local de imágenes, cambio masivo de medios, branding, tipografía, paleta y nuevas funciones de Organizar.
