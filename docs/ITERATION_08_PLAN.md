# Iteración 08 — Mobile UX Recovery & Visual Character

## Baseline protegido

- Rama: `iteration-08-mobile-ux-recovery`.
- Estado heredado: `e2e69db`; contiene el commit de Design System 1.0 `61c7a6b` y un merge posterior.
- Gate inicial: tokens, lint, typecheck, 30 tests, Next build y Storybook build en verde.
- Producción auditada en Chromium y WebKit a 360×800, 393×873, 402×874, 412×915 y 430×932.
- Seed protegido: SHA-256 `40F59ED5F0070B4A5283BF23E31D71951BCCFFED4E8162E4A48C8CE8C3DF326A`.

## Relación problema → cambio

| Problema observado | Cambio del sistema | Validación |
| --- | --- | --- |
| Carrusel web, flechas y flick libre | `DayDeck` controlado con tres posiciones, axis lock, umbral, resistencia y teclado | Gestos 6→7→8, flick de un solo índice y extremos |
| Días depende de un carrusel horizontal nativo | Grid de `100dvh`, stage `minmax(0, 1fr)`, indicador propio y reserva común de navbar | Cero scroll vertical en cinco viewports |
| Indicador separado del gesto | Ocho segmentos con progreso continuo del drag | Captura intermedia y valores de progreso |
| Navbar clara y con apariencia de cápsula del SO | `BottomNavigation` Ink, activo Electric Lime, sin blur | Story A/B y contraste en las tres secciones |
| Portadas ordenadas pero planas | `DayCover` 1.1 y pilotos 6/7/10 con atmósfera y tres planos | Stories flat/atmospheric y capturas piloto |
| Día 7 rígido | Sky Garden curvo, skyline secundario, barras naranjas y foco lime dentro del contrato 2.0 | Portada 07 y bounds del titular/número |
| Día abierto redundante/generativo | `DayHeader`, `DayHero`, `ActionGroup`, `SectionHeader`; fecha única, copy práctico, sin leyenda fija | Día 7 abierto a 360/393/402 |
| SavedPlaceCard sin jerarquía | Anatomía media/contenido/acción primaria/fila secundaria/overflow | Hard Rock y M&M’s en Storybook y app |
| Cabecera web interna | `PageHeader` de contenido sin wordmark móvil | Guardados y Viaje |
| Card de vuelo con borde ambiguo | `FlightTicketCard` con borde completo y `TripSectionCard` con strip independiente | 360 y 393 px |
| Navbar tapa finales | `--ds-navigation-reserve` único para todos los scroll containers | Última acción completamente visible |
| Tipografía supuesta | Verificación de fuente real, pesos y mono limitado a datos | Computed styles en app y Storybook |
| Copy artificial | Auditoría y retirada de códigos, duplicados y frases sin función | Búsqueda textual y revisión visual |
| Alternativa vertical sin validar | Story aislada `Experiments / Day Navigation / Vertical Stack` | Solo Storybook; nunca producción |

## Orden de ejecución

1. Auditar producción, historial, capturas y tipografía.
2. Corregir tokens y patterns en Design System 1.1 con historias reales.
3. Aplicar los patterns a Días, Guardados y Viaje.
4. Añadir tests unitarios de índice/gesto y contratos.
5. Generar matriz Chromium/WebKit, capturas y vídeo/GIF.
6. Ejecutar gate completo y publicar exclusivamente Vercel Preview.

## Fuera de alcance

Sin Supabase, login, datos nuevos, fotos nuevas, navegación vertical en producción, librería visual nueva, marca nueva, IA o producción.
