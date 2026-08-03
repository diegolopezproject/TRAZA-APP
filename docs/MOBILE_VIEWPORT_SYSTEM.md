# Sistema de viewport móvil

## Contrato global

`AppShell` es el único sistema de coordenadas de TRAZA. El `Viewport` de Next emite `width=device-width`, `initial-scale=1` y `viewport-fit=cover`. La referencia principal es iPhone moderno en vertical, `402 × 874` CSS px, DPR 3, táctil y WebKit.

Los tokens globales son:

| Token | Responsabilidad |
| --- | --- |
| `--safe-top/right/bottom/left` | Valor real de `env(safe-area-inset-*)` |
| `--top-safe-content` | Safe top más 12 px de respiración visual |
| `--bottom-safe-content` | Safe bottom más 14 px de separación |
| `--nav-height` | Altura estable de la navegación Ink: 56 px |
| `--nav-safe` | Nav + safe bottom + separación de 10 px |
| `--nav-reserve` | Reserva de todo scroll principal bajo la nav |
| `--sheet-top-gap` | Distancia entre sheet y límite superior seguro |
| `--floating-control-offset` | Base de controles flotantes sin nav |
| `--toast-bottom-with-nav` | Safe bottom + nav + separación |
| `--toast-bottom-immersive` | Safe bottom + separación cuando la nav está cubierta |

No se dibuja ni se modela una Dynamic Island. En hardware real, Safari suministra los insets. En automatización de escritorio se inyectan `59 px` arriba y `34 px` abajo para comprobar que la composición consume los tokens; esos números no viven en CSS de producto.

## Altura y chrome de Safari

- Shell, overlays inmersivos y scroll raíz usan `100dvh` con `100svh` como mínimo estable.
- No queda ningún `100vh`.
- La portada se resuelve con Grid: espacio seguro, carrusel, controles y reserva de nav. Su altura es el espacio restante, no una captura codificada.
- Guardados y Viaje poseen scroll local de `100dvh`; el documento exterior no desplaza la nav.
- `overscroll-behavior` contiene rebotes y `-webkit-overflow-scrolling: touch` conserva el desplazamiento táctil de WebKit.
- El documento recorta overflow accidental. El carrusel es la única superficie horizontal deliberada.

## Navegación inferior

La navbar Ink continúa fija y opaca. Su posición depende solo de `--safe-bottom` y `--nav-gap`; cada destino tiene al menos 48 px de alto y labels sin truncado. Días, Guardados y Viaje reservan `--nav-reserve`. Las capas Día y Detalle la cubren mediante el sistema de z-index y no cambian su posición, por lo que reaparece sin salto.

## Sheets y teclado

`MobileSheet` tiene cuatro zonas: handle opcional, header, contenido con scroll propio y footer. El alto máximo usa `window.visualViewport.height`, actualizado en cada `resize`; si no existe usa `innerHeight`. El header y el footer son filas fijas del grid, no elementos que compiten dentro del scroll.

El footer añade `--safe-bottom` y mantiene Cancelar/Guardar accesibles. Al enfocar `input`, `select` o `textarea`, el control se centra dentro del scroll del sheet. Los inputs mantienen labels persistentes y `font-size: 16px` para evitar zoom automático de Safari. Cerrar con X, backdrop o Escape restaura el foco anterior y el Tab queda contenido en el diálogo.

La prueba automatizada reduce el viewport visible a 560 px: el input activo termina en 256.5 px y Guardar en 516 px. Ambos permanecen visibles.

## Toasts y controles flotantes

El toast normal usa `--toast-bottom-with-nav`; en Día/Detalle usa `--toast-bottom-immersive`; Organizar añade la altura de su toolbar. El ancho respeta insets laterales, el texto envuelve, solo hay uno, `role=status` crea la live region y la superficie no bloquea la interacción salvo Deshacer.

## Orientación y tamaños grandes

En landscape bajo 560 px, la portada pasa a composición de dos columnas y mantiene la nav sobre el safe bottom. A partir de 760 px el sistema aumenta el espacio entre portadas y centra sheets con altura máxima; no cambia la prioridad móvil. A 1440 × 900 la portada sigue siendo el mismo capítulo móvil adaptado, no un dashboard.

## Standalone futuro

El sistema ya evita depender del chrome del navegador y consume safe areas, por lo que es compatible con un futuro modo standalone. Esta iteración no añade manifest, service worker, instalación, offline ni comportamiento PWA.
