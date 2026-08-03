# TRAZA Iteration 09 — Navigation & Motion Polish

## Alcance cerrado

Esta iteración responde a la prueba física de la web app instalada en Android. Solo modifica navegación inferior, transición horizontal entre días, historial/back, gesto interno de retroceso y defectos evidentes de spacing de las pantallas afectadas.

Quedan fuera: datos del viaje, contenido de días, ilustraciones, fotografías, portadas, Supabase, autenticación, PWA offline, nueva paleta, nueva tipografía, navegación vertical y nuevas funcionalidades.

## Baseline protegido

- Base: `744c16da61980af5ffa3cf6b1723541df21a7aaa`.
- Rama: `iteration-09-navigation-motion-polish`.
- Seed SHA-256: `40F59ED5F0070B4A5283BF23E31D71951BCCFFED4E8162E4A48C8CE8C3DF326A`.
- Gates iniciales: token gate, lint, typecheck, 34 tests, build y build-storybook correctos.
- Evidencias Chromium/WebKit y vídeo: `screenshots/iteration-09/before/`.

## Evidencia histórica de navegación

El historial disponible comienza en Iteration 03. El commit `0cf6abb` conserva la navegación que corresponde a la referencia descrita para Iteration 02:

- dock Ink de ancho máximo 352 px y radio continuo;
- padding exterior compacto;
- targets de 50 px;
- activo Electric Lime con icono y texto Ink;
- inactivos blancos atenuados;
- tres columnas idénticas e iconos de 17 px.

Se recuperará esa intención dentro de `BottomNavigation` de Design System 1.1, sin revertir componentes ni perder safe areas, foco visible o reservas móviles posteriores.

## Decisiones técnicas

1. `BottomNavigation` tendrá una pill activa compartida, Ink sólido, tres items iguales y geometría derivada de tokens.
2. `DayDeck` conservará anterior/activa/siguiente montadas con identidad de día estable. Las tres mantienen su color real; solo se anima desplazamiento.
3. `useAppNavigation` será la única API para `pushState`, `replaceState`, `popstate`, cierre y fallback. El historial guardará navegación, scroll y foco de retorno.
4. Los cambios de nivel crean entradas; selección de día y filtros actualizan la entrada actual.
5. X, botón Back y swipe-back llaman a la misma operación semántica.
6. El swipe-back se limita a una zona lateral de pantallas secundarias y nunca se instala en la raíz de Días.
7. Los pasos de asignación y formulario forman parte del estado de navegación; Back recorre un paso cada vez.
8. Los ajustes visuales usarán exclusivamente tokens existentes o tokens semánticos compartidos añadidos al sistema 1.1.

## Validación

- Unit tests: deck, serialización/fallback de historial, entradas y estados de navbar.
- Browser tests: secuencia Sky Garden → día → carrusel; Guardados → detalle → Guardados; sheets; scroll/foco; swipe-back; no flash y un solo día por swipe.
- Storybook: navbar en tres destinos y estados de interacción; deck y back navigation en estados de diagnóstico.
- Matriz: 360×800, 393×873, 402×874, 412×915 y 430×932 en Chromium y WebKit.
- Entrega: capturas y vídeo `after`, commit y Vercel Preview. Producción queda bloqueada hasta aprobación.
