# Sistema de movimiento

El movimiento de TRAZA comunica jerarquía espacial y confirma acciones. Cada contexto usa una familia semántica distinta; no existe una animación genérica para toda la aplicación.

## Navigation motion

Uso: cambio de sección, apertura/cierre de día, detalle y retroceso.

- Spring: stiffness 420, damping 36, mass 0.78.
- Distancia de entrada de capa: 24 px.
- Pill de bottom navigation: `layoutId` compartido, sin crossfade de todo el dock.
- Swipe-back: zona lateral de 24 px, desplazamiento directo con el dedo.
- Commit de back: 28 % del viewport hasta un máximo de 112 px; un flick exige al menos 40 px y velocidad 0.5 px/ms.
- Cancelación: spring 420/38/0.82.
- Opacidad: no se reduce la pantalla subyacente durante back. Una capa secundaria puede usar fade solo en reduced motion.

## Deck motion

Uso exclusivo: cambiar de día y abrir la portada mediante gesto vertical.

- Settling: 220 ms con `cubic-bezier(.16, 1, .3, 1)`.
- Threshold horizontal: 22 % del ancho, limitado a 72–112 px.
- Flick horizontal: 0.5 px/ms y misma dirección que el desplazamiento.
- Apertura vertical: 72 px o velocidad -0.52 px/ms.
- Un gesto cambia como máximo un día y nunca hace loop.
- Escala mínima aprobada: 0.98. La presión actual usa 0.995.
- Opacidad de card y deck: siempre 1.
- Filtros, overlays oscuros y crossfade completo: prohibidos.
- Anterior, activa y siguiente permanecen montadas con key estable de día.
- El indicador mantiene el índice confirmado; el segmento entrante solo muestra progreso de drag.

## Modal motion

Uso: sheets, formularios y selectores.

- Spring: stiffness 360, damping 38, mass 0.92.
- Entrada principal desde el borde inferior.
- Swipe-back horizontal se compone con el eje vertical sin instalar listeners globales.
- El backdrop puede animar opacidad; nunca se reutiliza dentro del deck.

## Microinteraction

Uso: botones, tabs, badges, indicador y feedback local.

- Duración: 160 ms.
- Easing: `cubic-bezier(.22, 1, .36, 1)`.
- Escala pressed: 0.97 mediante token compartido.
- Ninguna microinteracción cambia la geometría reservada ni la posición de lectura.

## Historial y continuidad

El movimiento no decide navegación. `useAppNavigation` crea/restaura entradas de History API y el mismo `back()` alimenta X, botón Back, `popstate` y swipe-back. Cada entrada conserva scroll y foco de retorno; la animación solo representa ese cambio ya coordinado.

## Reduced motion

- Cambio inmediato o desplazamiento corto; sin parallax ni spring.
- El deck mantiene color y contexto, sin fade global.
- Historial, fallback, foco, scroll y gestos conservan toda la función.
- CSS reduce las duraciones a `.01ms`; Motion usa duración cero o el token instantáneo según el contexto.
