# Fuente del límite administrativo de Greater London

## Fuente aprobada

| Campo | Valor |
| --- | --- |
| Portal | London Datastore |
| Dataset | Statistical GIS Boundary Files for London |
| Recurso | Greater London boundary |
| Publisher / autor | Greater London Authority |
| Maintainer | GLA GIS |
| Página oficial | https://data.london.gov.uk/dataset/statistical-gis-boundary-files-for-london-20od9 |
| Descarga oficial | https://data.london.gov.uk/download/20od9/114d1137-e339-4b50-b409-124c17f4b59a/gla.zip |
| Licencia | Open Government Licence v2 |
| Fecha de recuperación | 2026-09-01 |

Sólo se descargó el recurso dedicado `gla.zip` de 64.788 bytes (mostrado como 63,27 kB
en el portal), no el bundle general de límites de Londres. El SHA-256 del ZIP recuperado
es `6c2c52af0a1b6e921c0b2c5ec3cda6256dd470527cfa21ea79521bfc97be1fee`.
El portal publica además el hash `493a53b06b0d89f3132acb53e22d80b4` en los metadatos
del recurso. El ZIP y sus sidecars no se incorporan al repositorio.

La página del dataset registraba el recurso con fecha `2025-03-13`; este valor identifica
la versión runtime, pero no implica que la geometría administrativa se haya revisado ese
día. El XML incluido en el ZIP fue creado el 2020-02-26 y su lineage referencia
`BoundaryLine_2019_10`. Estos datos se conservan como procedencia y no se presentan como
garantía de vigencia actual.

## Contenido y sistema de coordenadas

El archivo fuente `London_GLA_Boundary.shp` contiene una única feature Polygon, un único
anillo cerrado y 10.921 posiciones. Su bounding box en British National Grid es
`[503568.2, 155850.8, 561957.5, 200933.9]`.

El `.prj` declara `British_National_Grid`, datum `OSGB_1936`, elipsoide Airy 1830 y
proyección Transverse Mercator. Se trata de OSGB36 / British National Grid
(`EPSG:27700`). El asset de ejecución usa longitud/latitud WGS 84
(`EPSG:4326`) en el orden GeoJSON `[longitude, latitude]`.

## Transformación reproducible

`scripts/build-greater-london-boundary.mjs`:

1. comprueba la firma y el perfil exacto del shapefile aprobado;
2. valida el WKT del `.prj`;
3. invierte la proyección British National Grid según las fórmulas de Ordnance Survey;
4. aplica en sentido OSGB36 → WGS84 la transformación Helmert de siete parámetros
   publicada por Ordnance Survey;
5. verifica la implementación contra el ejemplo calculado oficial;
6. valida rangos, finitud, cierre y orientación del anillo; y
7. escribe el asset GeoJSON compacto y versionado.

Comando de reproducción, tras extraer el ZIP oficial:

```powershell
node scripts/build-greater-london-boundary.mjs <ruta\London_GLA_Boundary.shp> <ruta\London_GLA_Boundary.prj> src/data/greater-london-boundary.json
```

Referencias de transformación:

- Ordnance Survey, “Converting between grid eastings and northings and ellipsoidal latitude and longitude”: https://docs.os.uk/more-than-maps/a-guide-to-coordinate-systems-in-great-britain/converting-between-grid-eastings-and-northings-and-ellipsoidal-latitude-and-longitude
- Ordnance Survey, “Approximate WGS84 to OSGB36/ODN transformation”: https://docs.os.uk/more-than-maps/deep-dive/a-guide-to-coordinate-systems-in-great-britain/from-one-coordinate-system-to-another-geodetic-transformations/approximate-wgs84-to-osgb36-odn-transformation
- Ordnance Survey, “Helmert transformation worked example”: https://docs.os.uk/more-than-maps/a-guide-to-coordinate-systems-in-great-britain/helmert-transformation-worked-example

La transformación Helmert es la aproximación oficial sin grid OSTN15; Ordnance Survey
documenta un error de hasta 3,5 m en el 95 % de Gran Bretaña. Esta limitación importa para
puntos extremadamente próximos al límite. No se añadió una librería GIS ni un grid de
transformación oculto: la decisión queda explícita, determinista y reproducible.

## Asset runtime y política geométrica

- Ruta: `src/data/greater-london-boundary.json`
- Versión: `gla-greater-london-boundary-2025-03-13`
- CRS: `EPSG:4326`
- Geometría: Polygon, un anillo, 10.921 posiciones
- Bounding box runtime: `[-0.5103751, 51.2867602, 0.3340155, 51.6918741]`
- Tamaño: 255.232 bytes
- SHA-256: `b5d22b4fd959d4a29fe4dd5a62c8cc731d54fa6c739fa6bc2d96fbee47d3c405`

No se simplificó la geometría: se conservaron todas las posiciones del shapefile. Las
coordenadas se cuantizaron a siete decimales (precisión submétrica, muy por debajo de la
incertidumbre de la transformación). El evaluador sigue considerando inclusivos los
vértices y segmentos del límite. El loader rechaza identidad, versión, procedencia, CRS,
tipos, coordenadas o anillos inesperados y falla de forma segura sin geometría.

## Licencia y atribución

El recurso se publica bajo Open Government Licence v2. Se conservan los avisos exigidos
por el portal:

> Contains National Statistics data © Crown copyright and database right [2015]

> Contains Ordnance Survey data © Crown copyright and database right [2015]

La aplicación no expone todavía este asset en UI; esta atribución debe acompañar cualquier
uso visible futuro cuando corresponda.
