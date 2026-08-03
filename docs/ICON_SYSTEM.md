# Icon System

La familia actual es el set SVG propio de `src/components/icons.tsx`. No se añadió otra librería.

- Caja: `1em`; tamaños de control 20 px y navegación 20–24 px.
- Color: `currentColor`; nunca color físico dentro del SVG.
- Stroke/filled: conservar una variante por significado; active cambia superficie/color del control, no sustituye la familia.
- Alineación: centrada en caja cuadrada con corrección óptica solo dentro del icono.
- Accesibilidad: SVG decorativo con `aria-hidden`; el botón o enlace aporta nombre. Iconos informativos necesitan texto accesible adyacente.
- Auditoría pendiente: mover gradualmente las implementaciones al directorio `design-system/icons` sin duplicarlas. `iconContract` ya fija el contrato de la futura migración.
