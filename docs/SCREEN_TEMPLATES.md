# Screen templates

| Template | Anatomía | Scroll y navegación | Responsive |
| --- | --- | --- | --- |
| Immersive | stage visual + control de capítulo | stage fijo, carrusel horizontal, navbar flotante | full viewport; máximo legible del cover |
| Standard scroll | page header + lista/cards | body vertical, reserva inferior de navbar | contenido centrado y grid progresivo |
| Day detail | DayHeader + secciones + final | scroll interno; close/back persistente | hero limitado; contenido máx. 680 px |
| Modal flow | Sheet + progress + ChoiceCards | body interno; footer sticky | bottom sheet móvil, diálogo centrado en tablet |
| Form sheet | FormHeader + fields + FormFooter | visualViewport y focus reveal | safe bottom en footer; ancho 42/58 rem |

Todas consumen `--ds-safe-*`, canvas semántico, target de 44 px y layers del sistema. Solo la capa de aplicación decide cuándo la navbar queda oculta por un detalle inmersivo.
