# Iteración 03 — Plan de implementación

## Objetivo

Convertir la vertical slice de Electric London en una herramienta útil para organizar el viaje, preservando Días / Guardados / Viaje, la identidad visual aprobada, el responsive, la accesibilidad y las interacciones ya validadas. La iteración seguirá siendo local-first: no se conectará Supabase.

## Punto de partida y checkpoint

- La línea base del 2 de agosto de 2026 supera `lint`, `typecheck`, 7 tests y el build de producción.
- El directorio entregado no contiene `.git`; no es posible crear un commit de checkpoint. Este documento y las capturas de validación actuarán como checkpoint verificable.
- Los cambios se realizarán de forma incremental sobre los componentes existentes.

## Cambios de contenido

- Corregir horarios, estados y narrativa de los ocho días según los datos confirmados.
- Derivar índices, posición del viaje, metadata, final de capítulo y copy contextual del día activo.
- Eliminar `07 / 08`, horarios obsoletos y textos genéricos de componentes compartidos.
- Cargar y renderizar los 28 lugares iniciales; enriquecer Hard Rock Cafe y Al Dente.
- Derivar el resumen de planes confirmados y los traslados desde datos reales, sin referencias privadas.

## Cambios visuales

- Crear un tema contextual por día con base, acento, contraste, motivo y metadata propios.
- Sustituir la composición universal por ocho composiciones semánticas distintas, compartiendo solo el lenguaje de diseño.
- Definir tokens contextuales para badges y estados legibles sobre cada tema.
- Refinar la composición editorial de las portadas mediante zonas seguras, metadatos propios y un handle sin texto visible.
- Mantener Cloud en el cuerpo del itinerario y propagar la identidad del día al hero abierto.
- Diferenciar cada lugar guardado mediante media propia o fallback gráfico deliberado y único.

## Cambios funcionales

- Añadir, editar y eliminar lugares guardados con confirmación.
- Asignar Guardados a días, quitar, mover de sección y cambiar su nivel de planificación.
- Añadir, editar, mover y eliminar planes dentro de un día.
- Elegir planes desde Guardados sin duplicar el lugar de origen.
- Convertir Comida y Cena en slots seleccionables que priorizan restaurantes por zona.
- Añadir en Viaje una sección editable de Traslados y un resumen desplegable de anchors reales.
- Añadir restauración explícita de los datos iniciales.
- Añadir deshacer para operaciones destructivas o sustituciones recientes cuando sea razonable.

## Modelo de persistencia local

- Un único repositorio versionado encapsulará `localStorage`; los componentes no accederán directamente a él.
- El documento persistido contendrá `schemaVersion`, modificaciones de lugares, asignaciones, elecciones de comidas, planes personalizados y traslados editables.
- El seed seguirá siendo la verdad inicial. El repositorio materializará el estado actual aplicando los cambios locales sobre el seed.
- Los planes o elecciones procedentes de Guardados conservarán `sourcePlaceId` en vez de duplicar el lugar.
- Una migración pequeña normalizará versiones anteriores; datos inválidos volverán de forma segura al seed.
- Los cambios se escribirán tras cada operación y se restaurarán al recargar.

## Assets necesarios

- Composiciones de portada específicas para los ocho días, preferiblemente code-native cuando sean formas editoriales y rutas.
- Medios propios para Humble Crumble, Funky Chips y The Mac Factory; no compartirán `src`.
- Fallbacks gráficos deterministas y diferenciados para lugares sin fotografía.
- Assets ImageGen adicionales solo cuando una fotografía editorial semántica aporte más que una composición local.
- Registro completo de ruta, lugar, tipo, fuente o prompt, alt, foco, fecha y licencia en `MEDIA_ASSETS.md`.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Estado local disperso o inconsistente | Repositorio único, acciones tipadas y pruebas de migración/recarga. |
| Crecimiento excesivo de UI en un componente | Formularios y sheets pequeños, reutilizables y semánticos. |
| Regresiones de gesto o scroll | Mantener pruebas existentes y añadir handle, teclado, reduced motion y preservación de scroll. |
| Themes con contraste insuficiente | Tokens contextuales por tema y comprobaciones automatizadas. |
| Imágenes repetidas o engañosas | Quality gate de `src`, fallbacks explícitos y metadata semántica. |
| Scope demasiado amplio | Implementar primero el flujo vertical completo; pulir visualmente después de cerrar persistencia y CRUD. |
| Ausencia de Git | Cambios incrementales, suite frecuente y capturas de checkpoint. |

## Orden de implementación

1. Corregir seed, modelo y contenido derivado.
2. Implementar el repositorio local versionado y sus pruebas.
3. Completar Guardados, media única, CRUD y contador real.
4. Integrar asignaciones, comidas y planes personalizados con persistencia.
5. Refinar portadas, transición espacial y microinteracciones.
6. Completar Traslados y anchors en Viaje.
7. Ejecutar quality gates, pruebas responsive y revisión visual final.

## Fuera de alcance

- Supabase, autenticación, colaboración y sincronización multiusuario.
- Mapas embebidos, recomendaciones con IA o datos en tiempo real.
- Sustitución de Next.js, Motion, Geist o la arquitectura visual aprobada.

## Estado de entrega

Implementación completada. La suite funcional, la auditoría responsive y las capturas finales se registran en `screenshots/iteration-03/`. La validación final se ejecuta contra el build de producción antes del handoff.
