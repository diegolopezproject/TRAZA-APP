# Transición espacial de apertura del día

## Intención

La portada se comporta como el inicio físico de un capítulo. No gira 180 grados ni muestra contenido invertido: acompaña el dedo hacia arriba, inclina levemente su plano y deja ver Cloud antes de que el itinerario ocupe la pantalla.

## Apertura

- La card activa admite drag vertical; el carrusel conserva el desplazamiento horizontal.
- Entre `0` y `-130 px`, la portada reduce su escala hasta `0.96`, rota como máximo `11°` en X y aplica parallax distinto a fecha y motivo.
- Se abre al superar `78 px` de distancia o una velocidad ascendente de `540 px/s`.
- Al soltar sin superar el umbral, Motion devuelve la card a origen mediante spring.
- El itinerario completa el movimiento con escala, rotación y desplazamiento cortos; sus cards aparecen escalonadas.
- El fondo Cloud del contenedor queda físicamente debajo de la portada durante el drag.

## Descubribilidad y teclado

- El borde inferior contiene un handle animado sin texto visible.
- El handle es un `button` de 82 × 48 px con `aria-label="Abrir día"`.
- Click, toque, Enter y Space abren el día sin depender del gesto.
- La navegación Left/Right/Home/End del carrusel permanece disponible.

## Cierre

- El botón circular superior y el control “Volver a portada” siempre están visibles.
- Un pull hacia abajo solo comienza cuando el itinerario está exactamente en `scrollTop = 0`.
- El cierre requiere `96 px`; un scroll normal no lo activa.
- El indicador de pull es únicamente un handle visual y cambia de contraste al alcanzar el umbral.

## Reduced motion

Con `prefers-reduced-motion`, se eliminan rotación, parallax, pulso y desplazamientos amplios. La apertura usa un fade corto y conserva todos los controles, estados y umbrales funcionales.
