# Modo Organizar

## Estados

- Normal: no hay handles; tocar una card abre detalle.
- Organizar: el contenido se simplifica, aparecen handles, zonas y barra sticky `Cancelar / Guardar cambios`.
- Guardado: sólo el borrador confirmado se persiste en LocalTripRepository.

## Reglas de movimiento

- Anclas confirmadas (vuelos, hotel, Sky Garden, Free Tour, Hunger Games, Wicked y tickets con hora) muestran lock, hora y `Fijo`. El intento de moverlas anuncia por qué no se puede.
- Intenciones y opciones cercanas se pueden reordenar, cambiar de sección o pasar a otro día mediante la acción secundaria. Una opción eliminada sigue en Guardados.
- Las comidas conservan el restaurante elegido al cambiar de posición; se puede elegir otro o retirar la selección.

## Interacción

Desktop usa drag-and-drop nativo con placeholder estable. Móvil ofrece handle de 44 px y controles explícitos de mover arriba/abajo/sección; el long press es opcional. Se anuncia el movimiento con `aria-live`, existe cancelar y el toast ofrece undo después de guardar.

## Persistencia

`placements` vive en el esquema local v4 junto a lugares, asignaciones, comidas, planes y traslados. La migración de v3 crea un array vacío; reset devuelve el seed original.
