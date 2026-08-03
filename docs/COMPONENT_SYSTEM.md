# Component System

Storybook documenta las exports reales de `src/design-system/components`.

| Familia | Componentes implementados | Uso actual |
| --- | --- | --- |
| Actions | Button, IconButton, FilterChip, ActionRow | filtros, formularios y acciones |
| Status | StatusBadge, CountBadge vía SectionHeader, Tag, ProgressIndicator | planes y pasos |
| Navigation | BottomNavigation, CarouselNavigation, BackControl, CloseControl, DragHandle | shell, carrusel y overlays |
| Surfaces | Surface, Card, MediaCard, HeroCard | cards y templates |
| Feedback | Sheet, Toast | edición, asignación y confirmación |
| Forms | TextField, TextArea, SelectField, ChoiceCard, headers/footer/error | flows móviles |
| Content | Eyebrow, SectionHeader, MetadataRow, EmptyState, MediaAttribution | jerarquía y provenance |

Todos los controles usan HTML semántico, foco visible y objetivos de 44 px. Disabled mantiene semántica nativa; pressed usa `aria-pressed`; loading se representa con `aria-busy` en el botón que inicia la operación, sin sustituir el texto por un spinner sin nombre.

No se creó SegmentedControl porque el producto no lo consume: los filtros actuales son independientes y corresponden a FilterChip. Se añadirá solo cuando exista un caso mutuamente exclusivo que no sea navegación.
