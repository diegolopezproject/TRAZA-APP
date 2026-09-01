# Phase 3D — Validación real del proveedor Google

## Contexto

- Fecha: 2026-09-01
- Checkpoint Phase 3C: `505197b22367f2a226b372e08323881e8cd83f6f`
- Proveedor: Google Places API (New)
- Alcance: preparación pre-persistencia; no se invocó ningún repositorio ni Supabase.
- Credencial: `GOOGLE_MAPS_PLATFORM_API_KEY`, cargada únicamente en el proceso server-side
  desde `.env.local`. Su valor se omitió de logs, errores, documentación y Git.

La ejecución utilizó el transporte de redirects, cliente Places, normalizador, evaluador
autoritativo de Greater London y clasificador TRAZA existentes mediante la composition root
productiva. El harness fue temporal, emitió sólo campos escalares seguros y se eliminó antes
de ejecutar la suite ordinaria.

## Evidencia segura

### Fixture A

- Share URL: `https://maps.app.goo.gl/EJoMkxSzVytZT5gB9?g_st=ac`
- Redirect: un salto; destino reconocido en `www.google.com` sin descargar ni inspeccionar HTML.
- Contexto: Text Search para “Snowflake Gelato - Soho, 102 Wardour St, London W1F 0TP, Reino Unido”.
- Candidatos: uno.
- Place ID canónico: `ChIJhxH-adMEdkgR9-q9IqIXYLQ`
- Nombre: Snowflake Gelato - Soho
- Dirección: 102 Wardour St, London W1F 0TP, UK
- Coordenadas: latitud `51.5137184`, longitud `-0.1340345`
- Tipos relevantes: primary `ice_cream_shop`; también `coffee_shop`, `cafe`,
  `dessert_restaurant`, `restaurant`, `food` y `establishment`.
- Greater London: `inside`
- Resultado: `ready-to-save`, categoría `food-drink`.

### Fixture B

- Share URL: `https://maps.app.goo.gl/LQMKg8hE9XopoSa68`
- Redirect: un salto; destino reconocido en `www.google.com` sin descargar ni inspeccionar HTML.
- Contexto: Text Search para “Fortnum & Mason”.
- Candidatos: cinco; el selector determinista encontró una coincidencia de nombre única.
- Place ID canónico: `ChIJ__8_XtYEdkgRtTLtWfASNFg`
- Nombre: Fortnum & Mason
- Dirección: 181 Piccadilly, London W1A 1ER, UK
- Coordenadas: latitud `51.5083687`, longitud `-0.13831`
- Tipos relevantes: primary `department_store`; también `tea_store`, `gift_shop`,
  `food_store`, `store` y `establishment`.
- Greater London: `inside`
- Resultado: `ready-to-save`, categoría `shopping`.

### Fixture C

- Share URL: `https://maps.app.goo.gl/NjSorR34a7x1QLqV8?g_st=ac`
- Redirect: un salto; destino reconocido en `www.google.com` sin descargar ni inspeccionar HTML.
- Contexto: Text Search para “Hamleys”.
- Candidatos: cinco; la evidencia documentada no seleccionó una identidad única.
- Place ID, Details, normalización y evaluación de Londres: no ejecutados, porque la frontera
  de identidad detuvo correctamente el pipeline.
- Resultado: `failed / identity-ambiguous`.

No se hardcodeó ningún nombre, dirección o Place ID para influir en estos resultados.
`g_st` continuó siendo irrelevante para la identidad.

## Incidencias y límites

El primer intento llegó a Places API (New), pero Google lo rechazó con
`API_KEY_IP_ADDRESS_BLOCKED`. La IP pública de salida se añadió después a la allow-list de
la credencial y la repetición controlada completó A/B/C sin rechazo. Fue una corrección de
configuración externa; no se modificó ni relajó la seguridad del código.

No se detectó un defecto de implementación que justificara cambiar parser, resolución,
Text Search, selección, normalización, LondonScope o clasificación. La ambigüedad de C es
evidencia válida y no se fuerza mediante lógica específica para el fixture.

## Actividad de red y persistencia

Los únicos hosts solicitados por HTTP fueron `maps.app.goo.gl` y
`places.googleapis.com`. `www.google.com` apareció como destino permitido de redirect, pero
el resolver no descargó esa página. No hubo scraping, decodificación de payloads opacos,
peticiones a Supabase, escritura de filas ni invocación de `ImportedPlaceRepository`.
