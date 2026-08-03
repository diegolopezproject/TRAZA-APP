# Iteración 08 — auditoría tipográfica

## Resultado real

Producción carga `GeistSans` y `GeistMono` desde el paquete local `geist@1.7.2`. `src/app/layout.tsx` aplica las variables de ambas familias en `<html>` y los `FontFace` variables 100–900 están `loaded` en Chromium y WebKit. No se observa fallback activo ni error de hidratación.

No existe un asset “Heist” legal en el repositorio. No se descarga ni se simula.

## Contrato 1.1

- Geist Sans: títulos, cards, navegación, acciones, formularios y frases.
- Geist Mono: fechas, horas, índices y datos logísticos breves.
- Pesos usados: 400–700, cubiertos por la variable font real.
- Uppercase: solo etiquetas compactas o datos; no en frases normales.
- Tracking amplio: solo metadata mono; se retira de contenido y acciones.
- Storybook importa los mismos globals y, por tanto, las mismas variables.

## Evidencia computada del baseline

| Muestra | Familia | Peso |
| --- | --- | --- |
| body | GeistSans, GeistSans Fallback, Arial, sans-serif | 400 |
| título de portada | GeistSans, GeistSans Fallback, Arial, sans-serif | 400 |
| navegación | GeistSans, GeistSans Fallback, Arial, sans-serif | 400 |

La validación final vuelve a medir portada, día abierto, Guardados, Viaje, botones, metadata y formularios.
