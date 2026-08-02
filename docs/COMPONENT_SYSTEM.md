# Component system

Componentes compartidos y sus contratos:

| Componente | Variantes/estados | Regla responsive y accesibilidad |
|---|---|---|
| AppHeader | journey, saved, trip; normal/organize | sticky, foco visible, progreso anunciado |
| BottomNavigation | active, modal-hidden | tres destinos; labels nunca sólo icono |
| DayCover / DayHeader | selected, opening, reduced-motion | título dentro de zona segura |
| SectionHeader | morning/afternoon/evening/nearby | `h2`, contador y orden estable |
| PlanCard | anchor, intention, flexible, locked | lock + hora + “Fijo” para anclas |
| MealCard | empty, selected, change | CTA de elección explícita |
| SavedPlaceCard | saved, assigned, user-created | metadata y Maps visibles |
| StatusBadge / TimeLabel | confirmed, flexible, saved, verify | texto además del color |
| IconButton | default, pressed, disabled | nombre accesible y foco de 44 px |
| PrimaryButton / SecondaryButton | default, loading, disabled | nunca serif; mínimo 44 px |
| BottomSheet | peek, expanded, closing | `role=dialog`, escape/cerrar y scrim |
| FormField | text, select, textarea, error | label visible y mensaje asociado |
| FilterChip | active/inactive | estado textual y teclado |
| DragHandle | idle, dragging, locked | instrucciones para teclado y touch |
| EmptyState | saved, section | siguiente acción clara |
| Toast | undo, status | `role=status`, no bloquea navegación |

Las tarjetas comparten tokens, no una plantilla visual única: una actividad ancla prioriza tiempo, una comida prioriza selección y un guardado prioriza imagen/zona/Maps.
