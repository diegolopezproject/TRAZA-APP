# Auditoría de referencias visuales

La auditoría se hizo sobre patrones públicos; TRAZA toma principios, no copia layouts, marcas ni paletas.

| Fuente | Patrón observado | Por qué importa | Problema TRAZA | Adaptación | No copiar |
|---|---|---|---|---|---|
| [Apple HIG · Materials](https://developer.apple.com/design/human-interface-guidelines/materials) | Capa funcional flotante, Liquid Glass limitado a controles sobre contenido rico, variantes regular/clear y fallback de contraste | Ayuda a saber dónde está el control sin convertir el contenido en una sopa translúcida | Cabecera/nav necesitaban contexto sin tapar la portada | Glass sólo en AppHeader, BottomNavigation, handles y controles flotantes; contenido sólido | El efecto como decoración de cada tarjeta |
| [Apple HIG · Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) | Tabs para navegación de alto nivel, no para acciones | Días, Guardados y Viaje son destinos persistentes | La navegación debía seguir siendo reconocible al abrir capas | BottomNavigation siempre visible salvo modal/organizar | Esconder tabs como toolbar contextual |
| [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/) | Jerarquía, accesibilidad y estados del sistema | Evita que la expresividad rompa legibilidad | El collage inicial tenía gestos ambiguos | foco visible, `aria-live`, reduce motion/transparency | Imitar componentes nativos literalmente |
| [Material 3 · Cards](https://m3.material.io/components/cards/overview) | Cards con roles distintos: elevated, filled, outlined | No todo contenido merece el mismo peso | Actividades, comidas y lugares se veían demasiado iguales | PlanCard, MealCard y SavedPlaceCard tienen anatomías distintas | Una card universal con sombra y radio idénticos |
| [Material 3 · Navigation bar](https://m3.material.io/components/navigation-bar/overview) | Navegación compacta, etiqueta + icono, selección clara | Reduce el coste de cambiar de contexto en móvil | Había que proteger el “dónde estoy” | Nav de tres destinos, selección textual e icono | Añadir acciones CRUD como tabs |
| [Linear · UI refresh](https://linear.app/changelog/2026-03-12-ui-refresh) | Header y controles consistentes, jerarquía silenciosa, menos ruido | El viaje necesita escaneabilidad | Masthead L/26 y coordenadas competían con el día | AppHeader con marca, progreso y fecha; acciones contextuales | Usar estética de tracker de producto |
| [Wanderlog](https://wanderlog.com/en) | Itinerario y mapa conviven; añadir lugar lo hace visible en el plan | Confirma que guardar y planificar son dos momentos distintos | Guardados no indicaba cómo entrar al día | Paso breve de colocación y Maps visible | Copiar el mapa o rutas automáticas |
| [TripIt](https://help.tripit.com/en/support/solutions/articles/103000063304-getting-started) | Itinerario consolidado, edición manual y mapas/direcciones | Anclas y planes flexibles deben coexistir | Las reservas no podían perderse al editar | Locks y explicación accesible; edición local-first | Importar confirmaciones o mostrar referencias privadas |
| [Airbnb](https://www.airbnb.com/help/article/2908) | Fichas de lugar con contexto, fotos y ubicación | Un guardado necesita decidirse con información suficiente | Tarjetas no tenían Maps/metadata visible | SavedPlaceCard con imagen, zona, tags y Maps | Copiar su sistema de búsqueda |

## Hallazgos de producto

- El patrón común es **contexto persistente + acción local**: el header orienta; la hoja resuelve la tarea.
- El mapa funciona como salida, no como sustituto del itinerario. Por eso TRAZA enlaza Maps y no incrusta ni hace scraping.
- La confirmación de una reserva es una restricción, no otra decoración. Se comunica con lock, hora y “Fijo”.
- La transparencia sólo tiene sentido sobre una imagen o como capa funcional; en contenido largo se prefiere superficie sólida.
