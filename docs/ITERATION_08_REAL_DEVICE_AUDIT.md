# Iteración 08 — auditoría móvil de producción

Fecha: 3 de agosto de 2026. URL: `https://traza-app-beige.vercel.app/`.

La auditoría combina evidencia del uso físico descrito por el usuario con una reproducción automatizada de producción en Chromium y WebKit móviles. No se dispone de control remoto del Android físico; la instalación y la barra de navegación del dispositivo se vuelven a comprobar manualmente en la Preview.

| Gravedad | Problema / evidencia | Causa | Responsable / token | Solución |
| --- | --- | --- | --- | --- |
| P0 | Dos flechas circulares visibles en los cinco viewports | `DayCarousel` usa scroll horizontal libre y controles de carrusel | `DayCarousel`, ausencia de `DayDeck` | Índice controlado, tres cards, axis lock y controles móviles eliminados |
| P0 | El movimiento puede recorrer el scroller y seleccionar por proximidad | `overflow-x:auto` + scroll snap no limita un flick a un índice | `DayCarousel` | Desplazamiento ligado al dedo y commit máximo ±1 |
| P0 | Gesto vertical de apertura y pan horizontal viven en componentes distintos | `DayCover` solo arrastra en Y; el padre desplaza en X | `DayCover`, `DayCarousel` | Un único recognizer con lock a 10 px |
| P1 | El indicador aparece entre dos flechas como barra de escritorio | Composición `carousel-controls` independiente | navegación/progreso | Ocho segmentos inmediatos a la card y conectados al drag |
| P1 | Navbar clara, voluminosa y ajena al fondo Ink | Core 1.0 usa glass claro + cápsula Ink activa | `BottomNavigation`, surface glass | Fondo Ink opaco y activo Electric Lime sin cápsula |
| P1 | Día 7 tiene motivo rígido, plano y demasiado negro | DayCover 2.0 simplificó la expresión anterior | `DayCover`, `DayMotif` | Tres planos reconocibles: Sky Garden, skyline y acentos |
| P1 | Día abierto duplica fecha/código y mantiene leyenda permanente | Hero previo agrega metadatos decorativos | `DayHeader`, hero local | Header funcional, resumen práctico y leyenda fuera del hero |
| P1 | Hard Rock: acciones y estado compiten y el final queda bajo navbar | El pattern acepta un bloque `action` opaco sin anatomía | `SavedPlaceCard` | Pattern explícito con acción primaria y fila secundaria |
| P1 | Flight tickets parecen abiertos en bordes inferiores | Acento y borde exterior comparten geometría | `TripSectionCard`, `FlightTicketCard` | Borde completo + strip pseudo-elemento independiente |
| P1 | Producción no expone manifest ni service worker | No existe metadata/install surface | App metadata | Se documenta como limitación: no se añade infraestructura PWA fuera de alcance |
| P2 | Header `TRAZA / Londres 2026 / sección` consume espacio | Marca repetida en pantallas internas | `AppHeader` | `PageHeader` de contenido sin wordmark móvil |
| P2 | Copy como “Capítulo 02”, “Banco de posibilidades” y “1 momento” suena artificial | Capas editoriales sin función | contenido ES | Fecha/posición útil, “plan/planes” y copy práctico |

## Evidencia técnica del baseline

- HTTP 200, consola limpia, cero overflow de documento en los diez runs.
- Días mide exactamente el viewport, pero ello no demuestra que la interacción sea correcta.
- Geist Sans variable 100–900 y Geist Mono variable 100–900 aparecen `loaded` en Chromium y WebKit.
- Producción corre en `display-mode: browser`; no hay `<link rel="manifest">` ni registros de service worker.
- Capturas y JSON: `screenshots/iteration-08/before/{chromium,webkit}/`.

## Prueba física pendiente para Preview

Chrome Android instalado/standalone, safe area y barra de navegación Android solo pueden darse por aprobados después de probar la Preview en el dispositivo real. Playwright no sustituye esa aprobación.
