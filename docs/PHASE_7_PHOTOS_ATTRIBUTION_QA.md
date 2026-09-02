# Phase 7 — Google Photos, atribución y QA final de importación

Fecha de revisión: 3 de septiembre de 2026.

## Fuentes oficiales actuales

- [Policies and attributions for Places API](https://developers.google.com/maps/documentation/places/web-service/policies): Place ID como excepción durable; atribución visible `Google Maps` fuera de un mapa; reglas tipográficas; autor y acceso a la foto individual.
- [Place Photos (New)](https://developers.google.com/maps/documentation/places/web-service/place-photos): `photos` en el field mask, dimensiones 1–4800, `authorAttributions`, prohibición de cachear el photo name y uso de `skipHttpRedirect`.
- [REST Photo y AuthorAttribution](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places#Photo): contratos `name`, dimensiones, autor, `googleMapsUri`, avatar y perfil.
- [places.photos.getMedia](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places.photos/getMedia): nombre `/media` y `photoUri` efímero.
- [Authenticate with REST](https://docs.cloud.google.com/docs/authentication/rest#api-keys): `X-Goog-Api-Key` como forma preferente de enviar la clave sin incluirla en la URL.

La implementación sigue estas fuentes actuales cuando concretan o sustituyen supuestos antiguos del SDD. `flagContentUri` no se incorpora en esta iteración: la política lo presenta como mecanismo recomendado y el enlace individual `googleMapsUri` ya permite abrir la foto en Google Maps, donde existe el reporte.

## Arquitectura transitoria

1. Supabase entrega solo la identidad durable ya aprobada: record UUID, instalación, viaje, provider, Place ID y categoría TRAZA.
2. La carga server-side pide Place Details actual con `photos`.
3. El parser conserva solo fotos completas y seguras; la primera foto válida mantiene el ranking del proveedor.
4. El cliente server-only llama `places.photos.getMedia` con 1200×1200 y `skipHttpRedirect=true`. La clave viaja en `X-Goog-Api-Key`, nunca en una URL de navegador.
5. El `photoUri` HTTPS efímero se valida contra el host exacto admitido y se adapta a `MediaAsset` únicamente para la respuesta actual.
6. `SavedPlaceCard` y el detalle siguen usando el `MediaFrame` existente. No hay tarjeta, galería, SDK ni dependencia nueva.

No se persisten photo names, `photoUri`, dimensiones, autores, `googleMapsUri` de foto ni metadata de provider. No hay columnas nuevas, migración, escritura en `LocalTripRepository`, `localStorage` o seed. Todos los fetch server-side usan `cache: "no-store"`; no existe caché de aplicación ni memoización de photos. El URI efímero se carga directamente y cualquier caché de transporte queda gobernada por la respuesta temporal del proveedor.

## Atribución y fallback

En tarjeta y detalle, la foto muestra dentro de su contenedor una banda discreta con el texto exacto `Google Maps`, 12 px, peso 400, contraste blanco sobre Ink y `translate="no"`. Ese texto enlaza directamente al `googleMapsUri` de la foto. Cuando existen `authorAttributions`, se muestran avatar, nombre y enlace de perfil disponibles junto a la imagen.

Las miniaturas estrechas mantienen `Google Maps` visible y omiten el autor; el usuario dispone de la misma imagen ampliada en Guardados/detalle con atribución completa, conforme a la excepción de espacio para thumbnails. Media manual/seed continúa por `MediaAttribution` y no recibe marca Google.

Sin array de fotos, con foto malformada, nombre inválido, timeout, error HTTP, URI ausente/no segura o fallo de transporte, el lugar permanece visible con `fallbackPlaceMedia`. Un fallo de foto nunca se transforma en error de importación.

## Toast móvil

Se conserva exactamente el `motion.aside.assignment-toast` de `TripApp`, su `role="status"`, Motion vertical, duración de 4,2 s, copy, tipografía, colores, radio, sombra y posición inferior con safe area. La causa del desplazamiento era que Motion escribe `transform` inline para animar `y` y sustituía el `translateX(-50%)` de CSS.

El centrado ya no depende de `transform`: usa `left`/`right` con safe areas, `width: fit-content`, máximo móvil de 420 px y `margin-inline: auto`. El span puede encogerse y usa `overflow-wrap: anywhere`, por lo que el copy largo no sale del viewport. No se creó otro toast ni cambió su lenguaje visual.

## QA de regresión

Cobertura offline focal:

- parsing de foto/autor actual y descarte aislado de metadata malformada;
- petición Place Photos, límites, `skipHttpRedirect`, URI efímero y clave solo server-side;
- primera foto determinista, autor presente/ausente y fallback ante ausencia/error;
- atribución Google exclusiva de media Google, autor y enlace fuente;
- modelo híbrido con media transitoria sin introducirla en identidad durable;
- toast existente centrado, con safe insets/wrap y sin `translateX`;
- hard delete por record + instalación + viaje y limpieza de referencias locales;
- roundtrip de asignación por ID `imported:{record UUID}` sin serializar el lugar importado;
- finalización de las cuatro categorías mediante ticket existente.

Validación browser local en Chrome headless, viewport 390×844 y copy largo `No hemos podido guardar este sitio. Inténtalo de nuevo.`: bounds 14–376 px, ancho 362 px, centro con delta 0, altura 65 px, texto dentro del contenedor y overflow horizontal de documento 0. Se usó un secreto de instalación ficticio solo en memoria para superar el bootstrap local; no se editó `.env.local` ni se realizaron escrituras remotas.

No se limpió Supabase ni seed. No se ejecutó una escritura de validación real adicional porque el pipeline de importación ya está aceptado físicamente y la suite normal debe permanecer offline; la comprobación final del contenido en dispositivo queda asociada al Preview generado por este push.

## Pendiente conocido

- Confirmar en el Preview resultante que las variables server-side requeridas están configuradas, sin mostrar valores.
- Repetir una comprobación visual física en Android del toast largo y de una foto con autor antes de la demo final.
- La deduplicación entre fuentes seed/manual y Google continúa fuera de Phase 7.
