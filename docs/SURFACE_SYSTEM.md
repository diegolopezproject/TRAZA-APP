# Surface system

TRAZA separa cuatro capas:

1. **Solid** — contenido, tarjetas de plan y formularios. `--surface-solid` opaco, siempre legible.
2. **Raised** — plan destacado, card activa y placeholder de drag. Sombra pequeña y borde, sin blur.
3. **Translucent** — AppHeader, BottomNavigation, handles e IconButton sobre media. Usa `backdrop-filter` sólo cuando está disponible.
4. **Overlay / Immersive** — scrim + BottomSheet sobre el día abierto. La hoja es opaca en el cuerpo y puede usar un handle translúcido.

## Reglas

- Liquid Glass sólo en la capa funcional, nunca en una lista de contenido.
- `@supports` y `prefers-reduced-transparency: reduce` devuelven una superficie opaca.
- El texto primario mantiene contraste WCAG AA; no se selecciona un material por el color que “parece” aportar.
- Blur máximo 18 px, una sola capa por región, sin animar blur.
- El modo `prefers-reduced-motion` elimina desplazamientos de apertura y deja cambios de estado instantáneos.
- En desktop la glass nav no cubre el carrusel; en móvil respeta el safe area inferior.
