# Iteración 04 — TRAZA

## Objetivo

Convertir Electric London en TRAZA, un acompañante móvil de viaje que permite leer el día, guardar lugares y organizar el plan por capas sin perder el contexto de la ciudad.

## Alcance aceptado

- Marca TRAZA: símbolo, wordmark, favicon, app icon, cabecera global y lenguaje “Tu viaje, por capas.”.
- Sistema de superficies y componentes documentado, con Liquid Glass restringido a la capa funcional.
- Portadas de días 1–8 con una retícula segura y motivos semánticos; se mantienen los temas expresivos sin coordenadas decorativas.
- Modo Organizar con estado explícito, elementos fijos visibles, controles de reordenación accesibles y persistencia local.
- Flujo Guardados → “¿Dónde quieres colocarlo?” con secciones de día y opciones cercanas.
- Guardados y detalle con imagen, categoría, zona, etiquetas y enlace visible a Google Maps.
- Auditoría de media para los 28 lugares: editorial generado o fallback gráfico determinista, sin duplicar `src`.
- Movimiento reducido, formularios y hojas alineados con el sistema.

## Fuera de alcance

Login, Supabase, scraping de Maps, recomendaciones automáticas, reservas nuevas, mapa embebido y cambios radicales de paleta o navegación.

## Criterios de aceptación

1. Días / Guardados / Viaje siguen siendo los tres anclajes principales.
2. Un ancla confirmada nunca se mueve silenciosamente; explica “Fijo”.
3. Organizar permite editar y cancelar sin persistir un borrador parcial.
4. Todo lugar guardado tiene media, `mapsQuery` preciso y acción “Abrir en Google Maps”.
5. El vidrio tiene fallback opaco y respeta transparencia reducida y contraste.
6. `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` pasan antes de handoff.

## Secuencia

1. Protección de estado y baseline (completado: commit `0cf6abb`, `feat: complete iteration 03`).
2. Investigación visual y decisiones de patrón.
3. Marca, tokens, superficies y componentes compartidos.
4. Media/Maps y flujo Guardados.
5. Organizar y persistencia.
6. QA responsive, accesibilidad, movimiento y handoff.
