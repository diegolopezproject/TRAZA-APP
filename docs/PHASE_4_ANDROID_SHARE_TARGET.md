# Phase 4 — Android PWA + Web Share Target

## Aceptación física Android

PASS, 1 de septiembre de 2026:

```text
Días
→ Google Maps nativo
→ Compartir
→ TRAZA instalada
→ Guardados
```

La PWA Preview estaba instalada, el usuario dejó TRAZA deliberadamente en Días, Google Maps mostró TRAZA como destino y al seleccionarla la aplicación abrió directamente Guardados. Que no apareciera una fila nueva era el resultado esperado del checkpoint de transporte de Phase 4; la importación real se implementa en Phases 5–6 sin modificar `share_target`.

## Contrato implementado

- `src/app/manifest.ts` sirve el manifiesto App Router de TRAZA: `start_url` y `scope` `/`, `display: standalone`, fondo paper `#f4f1ea` y tema ink `#161616`.
- Los iconos PNG 192×192 y 512×512 derivan de `public/brand/traza-app-icon.svg`. La variante maskable 512 mantiene el trazo dentro de la zona segura y extiende el fondo ink hasta el borde.
- `share_target` publica `POST /share` como `multipart/form-data` y mapea exclusivamente `title`, `text` y `url`; no acepta archivos.
- El layout enlaza `/manifest.webmanifest`. Un componente cliente registra `/sw.js` solo en contexto seguro; el worker implementa instalación/activación, sin `fetch`, cachés, precache ni respuesta sintética para `/share`.

## Comportamiento de `/share`

El Route Handler limita el cuerpo completo a 16 KiB, valida el tipo de contenido, rechaza archivos y campos desconocidos, conserva el primer valor no vacío si un campo se repite y delega toda interpretación al parser allow-listed de Phase 3A.

Un payload Maps compatible devuelve `303 /?shareTarget=accepted#saved`. Cualquier entrada malformada o no compatible devuelve `303 /?shareTarget=invalid#saved`. Los códigos son cerrados y el destino nunca refleja título, texto ni URL compartidos.

Esta fase no resuelve short links, no invoca el orquestador de importación, Google transport/Places ni Supabase, y no persiste lugares. La cookie firmada `__Host-traza-installation` se difiere a Phase 5: no es necesaria para registrar o validar el transporte y aún no existe una operación con identidad/persistencia. No se ha añadido Auth ni secreto.

## Evidencia local

- Pruebas offline dirigidas del manifiesto y `/share`: 18 aprobadas.
- Suite completa: 28 archivos y 270 tests aprobados.
- Validación de dimensiones PNG mediante lectura de IHDR.
- El build contiene `/`, `/manifest.webmanifest`, `/share` y los assets: manifiesto JSON válido, enlace HTML presente, `start_url` 200, tres iconos PNG 200 y redirects 303 válidos/inválidos comprobados sobre `next start`.
- `git diff --check`, lint, typecheck, suite completa y build pasan. El bundle cliente `.next/static` no contiene nombres de secretos server-only revisados.

La validación local no demuestra el registro del share target por Android. Ese gate solo pasa instalando por HTTPS el build exacto de Phase 4 en el dispositivo físico.

## Procedimiento de reproducción de la aceptación Android

1. Servir por HTTPS un build revisado que contenga el commit de Phase 4; `localhost` solo sirve como diagnóstico de desarrollo.
2. Desinstalar cualquier TRAZA PWA/WebAPK o acceso directo anterior para evitar que Android conserve un manifiesto/share target obsoleto.
3. Abrir la URL HTTPS en Chrome Android y usar **Instalar aplicación** o **Añadir a pantalla de inicio** cuando Chrome lo ofrezca.
4. Abrir TRAZA desde su icono y confirmar que se muestra en modo standalone, sin la barra normal del navegador.
5. En Google Maps, abrir un lugar y seleccionar **Compartir**.
6. Confirmar que **TRAZA** aparece como destino del panel de compartir y seleccionarlo.
7. Confirmar que TRAZA abre Guardados (`#saved`) con el resultado cerrado `shareTarget=accepted`; en Phase 4 no aparecerá un lugar nuevo ni se ejecutará una importación.

Este procedimiento produjo el PASS físico registrado al inicio del documento. Al repetirlo, registrar versión de Android/Chrome, URL HTTPS, commit probado y evidencia visual. Si TRAZA no aparece, reinstalar tras verificar que el manifiesto servido contiene el contrato; no debilitar cookies ni añadir un share target GET como workaround.
