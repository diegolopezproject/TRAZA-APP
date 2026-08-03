# Auditoría de spacing y alineación — Iteration 09

La revisión se limitó a Días, día 7 abierto, Sky Garden, Guardados, Hard Rock Cafe, Viaje, detalle y sheets.

## Hallazgos y correcciones

- `BottomNavigation`: el estado activo anterior era solo icono/texto Lime con underline; la pill recuperada unifica padding, baseline, icono y target en tres columnas iguales.
- Días: la altura compacta del dock y `--ds-navigation-reserve` mantienen un token completo entre indicador y navegación, además del safe bottom.
- Día abierto: se eliminó la entrada semitransparente que dejaba ver la portada y parecía solapar acciones/heading. `SectionHeader` usa ahora `--ds-space-8` para su columna de índice.
- Viaje: `TripSectionCard` alinea el borde-acento con padding izquierdo `--ds-space-6`, sin el offset local de `.25rem`.
- Sheets: header, scroll y footer conservan los tokens de Design System 1.1; sus controles mantienen target mínimo y el swipe lateral no altera el grid.
- Guardados y Hard Rock Cafe: no se detectó wrapping o gap que justificara cambiar el patrón; se conserva la composición aprobada.
- Sky Garden: no se cambia contenido, hero ni media. El detalle conserva scroll/foco al volver.

No se añadieron márgenes negativos, valores dirigidos a una captura ni cambios de ilustración/contenido.
