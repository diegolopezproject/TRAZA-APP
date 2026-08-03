# Auditoría de transición entre días — Iteration 09

## Síntoma

En Android físico, durante el swipe la siguiente portada entra oscurecida y recupera su color al confirmarse el cambio. La percepción es un flash negro aunque el viewport nunca quede vacío.

## Causa confirmada

`DayDeck` mantiene montadas la card anterior, activa y siguiente, pero `patterns.css` aplicaba a toda card no activa:

- `opacity: .58`;
- `filter: saturate(.78) brightness(.78)`.

La card siguiente se desplaza correctamente con el dedo, pero lo hace con ese tratamiento oscuro. Al cambiar `currentIndex`, recibe `.is-current`, elimina el filtro y salta de color. La transición de settling también incluía `opacity`, amplificando el cambio visual.

No se encontró un backdrop nuevo, overlay negro, remount del deck, cambio de fondo del `body` ni ausencia de la siguiente card. La causa es el tratamiento cromático explícito de las cards vecinas.

## Corrección aprobada

- Todas las cards del deck conservan `opacity: 1`, `filter: none` y su background real durante idle, drag, commit y cancelación.
- Settling anima únicamente `transform`.
- La card anterior, activa y siguiente continúan siendo el máximo montado.
- Las keys pasan a representar el identificador estable del día.
- El indicador conserva el índice activo hasta confirmar el threshold; el progreso de drag es solo informativo.
- No se añade overlay, crossfade global ni transición de color.
- Reduced motion conserva la función con desplazamiento inmediato o mínimo.

## Contratos de regresión

- Un gesto cambia como máximo un día y no hace loop.
- Drag cancelado mantiene índice y color.
- La siguiente card existe antes del commit.
- El deck y el viewport Ink no cambian de opacidad.
- Navbar e indicador permanecen montados y estables.
