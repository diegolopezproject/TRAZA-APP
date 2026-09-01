# Phases 5 + 6 — Importación end-to-end

## Resultado

`POST /share` conserva el límite multipart de 16 KiB y las fronteras de seguridad de Phase 4, pero ahora compone el servicio productivo completo: parser allow-listed, resolución controlada, Places API (New), normalización, Greater London, categoría y persistencia. Todos los resultados terminan en un 303 cerrado a Guardados; ningún payload compartido, Place ID o error técnico entra en la URL.

## Decisiones posteriores a validación física

La prueba Android real confirmó que algunos short links `maps.app.goo.gl` válidos abren correctamente en el dispositivo, pero desde Vercel responden 404 sin `Location`. La importación ya no depende de que todos esos tokens sean resolubles server-to-server: tras validar primero una fuente Maps allow-listed, un fallo tipado de disponibilidad puede derivar una query acotada desde `title` o `text` saneados y continuar por Text Search y el selector determinista existente.

El fallback elimina URLs, boilerplate y whitespace duplicado, prioriza un título útil y no persiste, registra ni refleja el texto compartido. No se habilita para fuentes no soportadas, redirects rechazados, downgrade HTTP, hosts engañosos, puertos no permitidos, localhost o IPs. No hay scraping, lectura de HTML ni selección del primer resultado.

La misma validación cambió una regla de producto: Greater London sigue evaluándose con el asset autoritativo GLA, pero ahora es contexto y no una frontera de persistencia. Un lugar exterior continúa a categoría y guardado, porque un viaje puede incluir excursiones. Los resultados `invalid-or-unknown` continúan cerrándose como fallo; el resultado y toast terminal `outside-scope` se retiraron sin eliminar el trabajo de boundary ni sus pruebas.

## Identidad y tickets

- `__Host-traza-installation` lleva un UUID generado por servidor y autenticado con HMAC usando `TRAZA_INSTALLATION_COOKIE_SECRET`. Es `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`, sin `Domain` y con duración máxima de 400 días.
- La navegación normal crea la identidad mediante `/api/installation/bootstrap`. Un share sin cookie no inventa una segunda identidad: pasa por bootstrap y muestra un fallo seguro sin importar.
- `__Host-traza-import-ticket` está autenticada con `TRAZA_IMPORT_TICKET_SECRET`, ligada a instalación y `london-2026`, contiene solo provider, Place ID, timestamps y nonce, y expira a los diez minutos. No existe fila pendiente ni payload Google durable.
- Finalización y borrado requieren mismo origen. La finalización vuelve a hidratar y evaluar Greater London como contexto, consume la cookie y delega duplicados a PostgreSQL.

## Persistencia y Guardados híbrido

Supabase conserva exclusivamente record UUID, installation ID, `london-2026`, provider `google`, Place ID y categoría TRAZA. No se guardan nombre, dirección, coordenadas, tipos, URI, fotos ni respuesta del proveedor.

La página lista relaciones por instalación/viaje y obtiene la presentación actual mediante Place Details. Cada relación se adapta a `imported:{record UUID}` y se añade después de los 28 lugares seed/manual. Un fallo de hidratación afecta solo a esa relación y usa la presentación degradada existente. `LocalTripRepository` no recibe modelos importados; sí conserva sus asignaciones por el ID estable.

El borrado usa record ID + installation ID + trip ID, elimina la relación remota y limpia asignaciones y referencias de comidas locales. Añadir a un día reutiliza el flujo local actual. Los lugares manuales conservan el helper Maps por query; los importados usan exclusivamente una URI canónica HTTPS validada de Google.

## UI reutilizada

- Cards: `SavedView` sigue renderizando todo mediante `SavedPlaceCard`; no existe tarjeta Google/importada.
- Toast: `TripApp` conserva `.assignment-toast`, Motion, posición, tipografía, color, duración de 4,2 s y undo opcional. Solo se añadieron los cuatro textos de resultado; no cambió el styling.
- Categoría: `ImportCategorySheet` usa `MobileSheet` → `Sheet`, el footer/botón existente y `.placement-options`. Ofrece solo Comer y beber, Cultura, Lugares y Compras. No se añadió modal, alerta ni librería.
- El parámetro `importResult` se elimina con `history.replaceState` al consumirse, preservando `#saved`; refresh no repite el toast.

## Verificación

La suite ordinaria es offline y cubre firma/tampering/expiración, instalación estable, share saved/duplicate/failed/needs-category, fallback por disponibilidad, rechazo de fallback inseguro, ambigüedad de identidad, lugares exteriores, categorías válidas e inválidas, tickets rechazados, consumo one-shot, mezcla híbrida, fallo aislado, enlaces, borrado con ownership y roundtrip de asignación.

Validación real controlada, 1 de septiembre de 2026:

- se usó una identidad aleatoria dedicada y la fixture londinense aprobada Snowflake Gelato;
- el primer insert devolvió `saved`;
- la repetición devolvió `duplicate`;
- la relación se listó e hidrató con su ID estable;
- la fila dedicada se eliminó en `finally`;
- no se imprimieron secretos ni valores de entorno.

El short link físico que motivó el fallback es `https://maps.app.goo.gl/Ux3ZEovmVFPLA1Ja7?g_st=ac`, pero el payload exacto de `title`/`text` entregado por Android no quedó capturado. No se inventó: la regresión usa contexto realista controlado y la confirmación final queda para el dispositivo físico sobre el nuevo Preview. No se ejecutó una fixture exterior o ambigua real; esos caminos se validan offline con fronteras inyectadas. El ciclo HTTP local completo requiere añadir `TRAZA_INSTALLATION_COOKIE_SECRET` y `TRAZA_IMPORT_TICKET_SECRET` al entorno. La configuración de Preview se comprueba después del push.

## Limitaciones y Phase 7

La identidad es de instalación, no una cuenta recuperable; borrar cookies pierde acceso a relaciones previas. No hay sincronización entre dispositivos. Las fotos Google siguen totalmente fuera de alcance: los importados usan el fallback actual. Phase 7 debe implementar obtención transitoria de fotos, proxy server-side y atribución conforme a política, sin guardar resource names ni desplegar a producción sin autorización.
