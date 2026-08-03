# Matriz de validación móvil — Iteración 06

Motores: Playwright WebKit 26.5 como primario y Google Chrome/Chromium como comprobación secundaria. El runtime de escritorio no publica insets físicos, por lo que los viewports iPhone inyectan safe top 59 y safe bottom 34 solo durante la prueba. Resultado bruto en `screenshots/iteration-06/after/validation.json` y `after/chromium/validation.json`.

| Viewport | Safe top/bottom | Navbar | Teclado | Scroll | Sheet | Resultado | Captura / incidencia |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| 390 × 844 | 59 / 34 | visible, bottom 44 | n/a | sin overflow | flujo primario cubierto | Pasa | datos de matriz; ninguna |
| 393 × 852 | 59 / 34 | visible, bottom 44 | n/a | sin overflow | flujo primario cubierto | Pasa | datos de matriz; ninguna |
| 402 × 874 | 59 / 34 | visible, bottom 44 | simulado a 560 px | sin overflow | header/content/footer | Pasa | `05-carrusel.png`; ninguna |
| 430 × 932 | 59 / 34 | visible, bottom 44 | n/a | sin overflow | flujo primario cubierto | Pasa | datos de matriz; ninguna |
| 768 × 1024 | 0 / 0 | visible, bottom 10 | n/a | sin overflow | centrado y limitado | Pasa | datos de matriz; ninguna |
| 1440 × 900 | 0 / 0 | visible, bottom 10 | n/a | sin overflow | centrado y limitado | Pasa | datos de matriz; ninguna |
| 874 × 402 | 0/59/21/59 | visible | n/a | sin overflow | n/a | Pasa | `18-landscape-sanity.png` |

## Cobertura obligatoria a 402 × 874

| Pantalla | Evidencia WebKit |
| --- | --- |
| Portada día 6 | `01-portada-dia-06.png` |
| Portada día 7 | `02-portada-dia-07.png` |
| Portada día 8 | `03-portada-dia-08.png` |
| Portada día 10 | `04-portada-dia-10.png` |
| Carrusel | `05-carrusel.png` |
| Día abierto | `06-dia-abierto.png` |
| Detalle Sky Garden | `07-detalle-sky-garden.png` |
| Organizar | `08-organizar.png` |
| Guardados | `09-guardados.png` |
| Detalle M&M’s | `10-detalle-mms.png` |
| Asignar — paso 1 | `11-asignar-paso-1.png` |
| Asignar — paso 2 | `12-asignar-paso-2.png` |
| Añadir lugar, teclado cerrado | `13-anadir-lugar.png` |
| Añadir lugar, teclado simulado | `14-anadir-lugar-teclado-simulado.png` |
| Última card y settings sobre navbar | `15-ultima-card-sobre-navbar.png` |
| Toast | `16-toast.png` |
| Viaje / Traslados | `17-viaje.png` |
| Landscape sanity | `18-landscape-sanity.png` |
| Lámina comparativa | `mobile-before-after.png` |

## Resultados funcionales

- Consola: cero errores en ambos motores.
- Targets visibles <44 × 44: cero.
- Documento/body: cero overflow horizontal.
- Teclado simulado: input bottom 256.5; Guardar bottom 516; visual viewport 560.
- Reduced motion: abrir/cerrar Día completado en ambos motores.
- Fotografía Sky Garden: `/media/sky-garden-editorial-v2.png` idéntica en card y detalle.
