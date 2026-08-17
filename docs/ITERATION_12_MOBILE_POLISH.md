# Iteración 12 · Mobile Experience Polish

## Resultado

La dirección aprobada B — Full Bleed se conserva. La maduración corrige la relación entre portada, gesto y navegación sin introducir nuevas superficies ni alterar Guardados o Viaje.

El corte inferior procedía de una reserva física en `.journey-view`: la portada terminaba antes de la navbar y dejaba visible el fondo Ink del shell. Ahora la DayCover ocupa `100dvh`, el shell adopta el color Base del día activo y CTA/progreso reservan su espacio con `--ds-navigation-overlay-reserve`, derivado de altura real, gap y `safe-area` de la barra.

## Decisiones aplicadas

| Área | Comportamiento final |
| --- | --- |
| Navbar | Capa fija independiente del deck; tres destinos con geometría equivalente y targets de 54 px. |
| Swipe horizontal | Axis lock a 10 px, seguimiento directo, máximo ±1 día, cancelación breve y sin crossfade. |
| Extremos | Resistencia no lineal acotada a 36 px; no loop ni rebote largo. |
| Progreso | Las ocho marcas permanecen en DayCover; la marca actual cede de forma continua a la siguiente durante el drag. |
| Apertura | CTA y swipe vertical invocan la misma acción. DayDetail entra desde abajo mientras DayCover permanece debajo. |
| Retorno | Browser/Android Back, swipe-edge y X restauran el Día 07 y la navbar sin saltos. |
| Tipografía | Una sola escala y métricas para todas las DayCover; no hay overrides por longitud ni por día. |
| Contenido | Día 06 se condensa a “Llegada a Londres. De Gatwick a Ealing.” para mantener tres líneas con la escala común. |
| Motion | Press 120 ms / `.98`, snap 220 ms, navegación 220 ms y apertura expresiva 420 ms; reduced motion sigue operativo. |

## Auditoría de crops

- Día 06: titular en tres líneas a 360 px; calzada y skyline no invaden metadata funcional.
- Día 07: skyline termina antes de la ruta; no hay frame ni corte inferior.
- Días 08–13: mismo componente, mismos tokens tipográficos y mismos límites de CTA/navbar.
- Los ocho días conservan fondo Base, Texto, Apoyo e Ink aprobados; Electric Lime continúa reservado a interacción y posición activa.

La pasada de consistencia posterior fija la relación vertical mediante el layout compartido: 20 px entre el límite de arte y metadata, 20 px entre metadata y CTA, 8 px entre CTA y progreso, y 16 px nominales entre progreso y navbar a 390×844. `overflow: hidden` en la caja de arte impide que una geometría SVG interna reduzca esas reservas.

## Continuidad DayCover → DayDetail

Cada día expone dos niveles semánticos: `dayBase` profundo para la portada y `daySurface` compañero para el hero abierto. La superficie se deriva con la misma mezcla 42/58 de Base hacia Texto; el contenido operativo conserva el warm neutral. El Día 07 pasa así de un hero indistinguible del itinerario a `#9AB6AA`, claramente vinculado a su Base teal `#0F5A50`.

La lámina `screenshots/iteration-12/iteration-12-day-system.png` compara los ocho pares y `screenshots/iteration-12/iteration-12-daycover-rhythm.png` alinea las ocho portadas. El informe `day-system-validation.json` contiene 64 auditorías cover/detail en Chromium y WebKit.

## Evidencia reproducible

La evidencia se genera en `screenshots/iteration-12/mobile-polish/` mediante:

```text
npm run test:iteration12:mobile
```

Incluye:

- baseline anterior con corte inferior;
- responsive del Día 07 en 360×800, 390×844, 412×915 y 430×932;
- colección 06–13 a 390×844 en Chromium y WebKit;
- frames de swipe cancelado, commit, resistencia de borde, apertura vertical, Browser/Android Back, swipe-edge y X;
- `mobile-polish-sequences.webm` y `validation.json`.

El gate automatizado exige viewport completo, continuidad cromática del shell, ausencia de overflow, separación CTA/navbar, targets mínimos de 44 px, tipografía idéntica entre días, máximo cuatro líneas, colección sin frames y consola limpia.

## Límite de despliegue

Esta iteración autoriza únicamente Vercel Preview desde `iteration-12-art-direction-ui-maturation`. No incluye merge a `main`, despliegue de producción ni cambios de UI en Guardados o Viaje.

## Device fit · iPhone 17

El pase final usa `393×852` como referencia visual y simula `47 px` arriba / `34 px` abajo únicamente en Playwright. Producción conserva `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)`.

- `--ds-safe-top-content` añade 12 px de respiración tras la zona del sistema.
- BottomNavigation se posiciona a `safe-bottom + 10 px`; su reserva de contenido deriva de la misma ecuación.
- El item activo es una única columna flex centrada, idéntica en Días, Guardados y Viaje.
- DayDetail ofrece el ancho completo al titular; el motivo baja al extremo inferior derecho antes de reducir tipografía.
- Guardados y Viaje desplazan sus superficies scrollables tras el safe area superior; sheets y footers conservan sus reservas existentes.

La evidencia reproducible se genera con `npm run test:iteration12:iphone17` en `screenshots/iteration-12/iphone17/`. La lámina `screenshots/iteration-12/iteration-12-iphone17-approval.png` usa tres capturas reales, sin UI falsificada.
