# Design System Migration

## Migrado en Iteración 07

- DayCover de aplicación → Pattern DayCover 2.0 mediante adapter de dominio.
- BottomNav → Core BottomNavigation.
- MobileSheet → Core Sheet; formularios y asignación conservan sus features.
- StatusLabel → Core StatusBadge.
- filtros de Guardados → FilterChip.
- cards de Guardados → SavedPlaceCard.
- secciones de Viaje → TripSectionCard.
- media provenance → MediaAttribution discreta y desplegable.

## Regla para nuevas migraciones

1. Crear/ajustar story con estados reales.
2. Usar exclusivamente tokens semánticos en Core/Pattern.
3. Mantener en adapter la traducción de dominio, contenido y callbacks.
4. Probar interacción y bounds.
5. Sustituir el markup visible y retirar el adapter temporal cuando no queden consumidores.

## Deuda deliberada

El CSS histórico sigue existiendo para superficies no reescritas de forma completa; no debe recibir valores nuevos. Próximas iteraciones pueden extraer DayHeader/PlanCard y formularios internos, una pantalla cada vez, verificando paridad. Los iconos propios se mantienen en su ubicación para evitar una duplicación masiva.
