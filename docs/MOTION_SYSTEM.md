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

## Tokens compartidos

Los componentes consumen `src/lib/motion.ts`; los valores no se redefinen de forma local.

| Token | Valor | Uso |
|---|---|---|
| `gestureSpring` | stiffness 360, damping 32, mass 0.78 | navegación, controles y confirmaciones directas |
| `layerSpring` | stiffness 285, damping 34, mass 0.9 | hojas, detalle y cambio de capa |
| `softSpring` | stiffness 220, damping 30, mass 1 | reorganización y cambios editoriales suaves |
| `quickEase` | 180 ms, cubic-bezier(0.22, 1, 0.36, 1) | estados CSS breves |
| `layerEase` | 280 ms, cubic-bezier(0.22, 1, 0.36, 1) | entrada/salida CSS de superficies |

La rotación máxima de portada es 11°, su escala mínima es 0.96, el stagger del itinerario es 45 ms por card (máximo 360 ms) y el toast permanece 4.2 s con acción de deshacer.

## Accesibilidad

- `prefers-reduced-motion` elimina animaciones, scroll suave y pulso.
- Ninguna función depende únicamente de animación o gesto.
- El foco visible se mantiene durante aperturas, navegación y formularios.
