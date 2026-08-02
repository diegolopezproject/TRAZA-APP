# Sistema de movimiento

El movimiento de Electric London explica relaciones espaciales y confirma acciones. No existe animación decorativa permanente fuera del pulso sutil del handle.

## Momentos principales

1. **Cambio de capítulo:** scroll snap nativo, vecinos parciales, escala y saturación contenidas; parallax interno durante el drag vertical.
2. **Abrir/cerrar día:** plegado perspectivo descrito en `DAY_TRANSITION.md`, spring controlado y aparición escalonada del contenido.
3. **Actividad a detalle:** la media de Sky Garden comparte `layoutId` con el hero; el itinerario sigue montado y conserva el scroll.
4. **Asignar o elegir:** bottom sheet desde el borde inferior, card actualizada, toast con deshacer y persistencia inmediata.

## Microinteracciones

- Navegación inferior: pill compartida, presión breve, icono/label coordinados y safe area.
- Formularios: entrada del sheet, confirmación por toast y aparición del elemento en su lista.
- Comidas: selección destacada en lima, sustitución no destructiva y retirada reversible.
- Traslados y anchors: expansión local sin desplazar la navegación fuera de su zona segura.

## Parámetros

- Springs de capas: stiffness 285–360; damping 32–38.
- Rotación máxima de portada: 11°.
- Escala mínima de portada: 0.96.
- Stagger de itinerario: 45 ms por card, limitado a 360 ms.
- Toast: 4.2 s y acción de deshacer.

## Accesibilidad

- `prefers-reduced-motion` elimina animaciones, scroll suave y pulso.
- Ninguna función depende únicamente de animación o gesto.
- El foco visible se mantiene durante aperturas, navegación y formularios.
