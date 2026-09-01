import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [shapefileArgument, projectionArgument, outputArgument] = process.argv.slice(2);

if (!shapefileArgument || !projectionArgument || !outputArgument) {
  throw new Error(
    "Usage: node scripts/build-greater-london-boundary.mjs <boundary.shp> <boundary.prj> <output.json>",
  );
}

const SOURCE_PROFILE = {
  fileBytes: 174_892,
  shapeType: 5,
  recordCount: 1,
  partCount: 1,
  pointCount: 10_921,
};

const AIRY_1830 = { semiMajor: 6_377_563.396, semiMinor: 6_356_256.909 };
const WGS84 = { semiMajor: 6_378_137, semiMinor: 6_356_752.3141 };
const NATIONAL_GRID = {
  scaleFactor: 0.9996012717,
  latitudeOfOrigin: degreesToRadians(49),
  longitudeOfOrigin: degreesToRadians(-2),
  falseEasting: 400_000,
  falseNorthing: -100_000,
};

// Reverse of the official ETRS89/WGS84 → OSGB36 position-vector parameters.
const OSGB36_TO_WGS84 = {
  translateX: 446.448,
  translateY: -125.157,
  translateZ: 542.06,
  scalePpm: -20.4894,
  rotateXSeconds: 0.1502,
  rotateYSeconds: 0.247,
  rotateZSeconds: 0.8421,
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function degreesToRadians(value) {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value) {
  return (value * 180) / Math.PI;
}

function validateProjection(wkt) {
  const requiredFragments = [
    'PROJCS["British_National_Grid"',
    'GEOGCS["GCS_OSGB_1936"',
    'SPHEROID["Airy_1830",6377563.396,299.3249646]',
    'PROJECTION["Transverse_Mercator"]',
    'PARAMETER["False_Easting",400000.0]',
    'PARAMETER["False_Northing",-100000.0]',
    'PARAMETER["Central_Meridian",-2.0]',
    'PARAMETER["Scale_Factor",0.9996012717]',
    'PARAMETER["Latitude_Of_Origin",49.0]',
    'UNIT["Meter",1.0]',
  ];

  for (const fragment of requiredFragments) {
    assert(wkt.includes(fragment), `Unexpected projection metadata: missing ${fragment}`);
  }
}

function signedArea(ring) {
  let twiceArea = 0;
  for (let index = 0; index < ring.length; index += 1) {
    const current = ring[index];
    const next = ring[(index + 1) % ring.length];
    twiceArea += current[0] * next[1] - next[0] * current[1];
  }
  return twiceArea / 2;
}

function parsePolygonShapefile(buffer) {
  assert(buffer.length === SOURCE_PROFILE.fileBytes, "Unexpected shapefile byte size");
  assert(buffer.readInt32BE(0) === 9994, "Invalid shapefile file code");
  assert(buffer.readInt32BE(24) * 2 === buffer.length, "Invalid shapefile length header");
  assert(buffer.readInt32LE(28) === 1000, "Unsupported shapefile version");
  assert(buffer.readInt32LE(32) === SOURCE_PROFILE.shapeType, "Expected Polygon shapefile");

  let offset = 100;
  const records = [];
  while (offset < buffer.length) {
    assert(offset + 8 <= buffer.length, "Truncated shapefile record header");
    const contentBytes = buffer.readInt32BE(offset + 4) * 2;
    const contentStart = offset + 8;
    const contentEnd = contentStart + contentBytes;
    assert(contentEnd <= buffer.length, "Truncated shapefile record content");
    assert(buffer.readInt32LE(contentStart) === SOURCE_PROFILE.shapeType, "Unexpected record shape type");

    const partCount = buffer.readInt32LE(contentStart + 36);
    const pointCount = buffer.readInt32LE(contentStart + 40);
    assert(partCount > 0 && pointCount > 0, "Polygon record must contain parts and points");
    assert(
      contentBytes === 44 + partCount * 4 + pointCount * 16,
      "Unexpected Polygon record layout",
    );

    const partIndexes = Array.from({ length: partCount }, (_, index) =>
      buffer.readInt32LE(contentStart + 44 + index * 4),
    );
    assert(partIndexes[0] === 0, "First Polygon part must begin at point zero");
    for (let index = 1; index < partIndexes.length; index += 1) {
      assert(partIndexes[index] > partIndexes[index - 1], "Polygon part indexes must increase");
    }

    const pointsStart = contentStart + 44 + partCount * 4;
    const points = Array.from({ length: pointCount }, (_, index) => [
      buffer.readDoubleLE(pointsStart + index * 16),
      buffer.readDoubleLE(pointsStart + index * 16 + 8),
    ]);
    const rings = partIndexes.map((partStart, index) =>
      points.slice(partStart, partIndexes[index + 1] ?? points.length),
    );

    for (const ring of rings) {
      assert(ring.length >= 4, "Polygon ring must contain at least four coordinates");
      assert(
        ring.every(
          ([easting, northing]) =>
            Number.isFinite(easting) &&
            Number.isFinite(northing) &&
            easting >= 0 &&
            easting <= 700_000 &&
            northing >= 0 &&
            northing <= 1_300_000,
        ),
        "Polygon contains invalid British National Grid coordinates",
      );
      assert(
        ring[0][0] === ring.at(-1)[0] && ring[0][1] === ring.at(-1)[1],
        "Polygon ring must be closed",
      );
    }

    records.push(rings);
    offset = contentEnd;
  }

  assert(offset === buffer.length, "Unexpected trailing shapefile bytes");
  assert(records.length === SOURCE_PROFILE.recordCount, "Unexpected shapefile feature count");
  assert(records[0].length === SOURCE_PROFILE.partCount, "Unexpected shapefile part count");
  assert(records[0][0].length === SOURCE_PROFILE.pointCount, "Unexpected shapefile point count");
  assert(signedArea(records[0][0]) < 0, "Expected the source outer ring to be clockwise");

  return records[0][0];
}

function meridionalArc(latitude) {
  const { semiMajor: a, semiMinor: b } = AIRY_1830;
  const { scaleFactor: scale, latitudeOfOrigin } = NATIONAL_GRID;
  const n = (a - b) / (a + b);
  const latitudeDelta = latitude - latitudeOfOrigin;
  const latitudeSum = latitude + latitudeOfOrigin;

  return (
    b *
    scale *
    ((1 + n + (5 / 4) * n ** 2 + (5 / 4) * n ** 3) * latitudeDelta -
      (3 * n + 3 * n ** 2 + (21 / 8) * n ** 3) *
        Math.sin(latitudeDelta) *
        Math.cos(latitudeSum) +
      ((15 / 8) * n ** 2 + (15 / 8) * n ** 3) *
        Math.sin(2 * latitudeDelta) *
        Math.cos(2 * latitudeSum) -
      ((35 / 24) * n ** 3) * Math.sin(3 * latitudeDelta) * Math.cos(3 * latitudeSum))
  );
}

function gridToOsgb36(easting, northing) {
  const { semiMajor: a, semiMinor: b } = AIRY_1830;
  const {
    scaleFactor: scale,
    latitudeOfOrigin,
    longitudeOfOrigin,
    falseEasting,
    falseNorthing,
  } = NATIONAL_GRID;
  const eccentricitySquared = 1 - (b * b) / (a * a);

  let latitude = latitudeOfOrigin;
  let arc = 0;
  do {
    latitude = (northing - falseNorthing - arc) / (a * scale) + latitude;
    arc = meridionalArc(latitude);
  } while (Math.abs(northing - falseNorthing - arc) >= 0.00001);

  const sinLatitude = Math.sin(latitude);
  const cosLatitude = Math.cos(latitude);
  const tangent = Math.tan(latitude);
  const transverseRadius =
    (a * scale) / Math.sqrt(1 - eccentricitySquared * sinLatitude ** 2);
  const meridionalRadius =
    (a * scale * (1 - eccentricitySquared)) /
    (1 - eccentricitySquared * sinLatitude ** 2) ** 1.5;
  const etaSquared = transverseRadius / meridionalRadius - 1;
  const eastingDelta = easting - falseEasting;

  const vii = tangent / (2 * meridionalRadius * transverseRadius);
  const viii =
    (tangent / (24 * meridionalRadius * transverseRadius ** 3)) *
    (5 + 3 * tangent ** 2 + etaSquared - 9 * tangent ** 2 * etaSquared);
  const ix =
    (tangent / (720 * meridionalRadius * transverseRadius ** 5)) *
    (61 + 90 * tangent ** 2 + 45 * tangent ** 4);
  const x = 1 / (cosLatitude * transverseRadius);
  const xi =
    (1 / (cosLatitude * 6 * transverseRadius ** 3)) *
    (transverseRadius / meridionalRadius + 2 * tangent ** 2);
  const xii =
    (1 / (cosLatitude * 120 * transverseRadius ** 5)) *
    (5 + 28 * tangent ** 2 + 24 * tangent ** 4);
  const xiia =
    (1 / (cosLatitude * 5040 * transverseRadius ** 7)) *
    (61 + 662 * tangent ** 2 + 1320 * tangent ** 4 + 720 * tangent ** 6);

  return {
    latitude:
      latitude - vii * eastingDelta ** 2 + viii * eastingDelta ** 4 - ix * eastingDelta ** 6,
    longitude:
      longitudeOfOrigin +
      x * eastingDelta -
      xi * eastingDelta ** 3 +
      xii * eastingDelta ** 5 -
      xiia * eastingDelta ** 7,
  };
}

function geodeticToCartesian({ latitude, longitude }, height, ellipsoid) {
  const { semiMajor: a, semiMinor: b } = ellipsoid;
  const eccentricitySquared = 1 - (b * b) / (a * a);
  const sinLatitude = Math.sin(latitude);
  const radius = a / Math.sqrt(1 - eccentricitySquared * sinLatitude ** 2);

  return {
    x: (radius + height) * Math.cos(latitude) * Math.cos(longitude),
    y: (radius + height) * Math.cos(latitude) * Math.sin(longitude),
    z: ((1 - eccentricitySquared) * radius + height) * sinLatitude,
  };
}

function applyHelmert(point, parameters) {
  const radiansPerSecond = Math.PI / (180 * 3600);
  const rotateX = parameters.rotateXSeconds * radiansPerSecond;
  const rotateY = parameters.rotateYSeconds * radiansPerSecond;
  const rotateZ = parameters.rotateZSeconds * radiansPerSecond;
  const scale = 1 + parameters.scalePpm * 0.000001;

  return {
    x:
      parameters.translateX +
      scale * point.x -
      rotateZ * point.y +
      rotateY * point.z,
    y:
      parameters.translateY +
      rotateZ * point.x +
      scale * point.y -
      rotateX * point.z,
    z:
      parameters.translateZ -
      rotateY * point.x +
      rotateX * point.y +
      scale * point.z,
  };
}

function cartesianToGeodetic(point, ellipsoid) {
  const { semiMajor: a, semiMinor: b } = ellipsoid;
  const eccentricitySquared = 1 - (b * b) / (a * a);
  const distanceFromAxis = Math.hypot(point.x, point.y);
  let latitude = Math.atan2(point.z, distanceFromAxis * (1 - eccentricitySquared));

  for (let iteration = 0; iteration < 12; iteration += 1) {
    const radius = a / Math.sqrt(1 - eccentricitySquared * Math.sin(latitude) ** 2);
    const nextLatitude = Math.atan2(
      point.z + eccentricitySquared * radius * Math.sin(latitude),
      distanceFromAxis,
    );
    if (Math.abs(nextLatitude - latitude) < 1e-12) {
      latitude = nextLatitude;
      break;
    }
    latitude = nextLatitude;
  }

  return { latitude, longitude: Math.atan2(point.y, point.x) };
}

function britishNationalGridToWgs84(easting, northing, height = 0) {
  const osgb36 = gridToOsgb36(easting, northing);
  const osgb36Cartesian = geodeticToCartesian(osgb36, height, AIRY_1830);
  const wgs84Cartesian = applyHelmert(osgb36Cartesian, OSGB36_TO_WGS84);
  return cartesianToGeodetic(wgs84Cartesian, WGS84);
}

function validateAgainstOfficialWorkedExample() {
  const osgb36 = gridToOsgb36(422_297.792, 412_878.741);
  const expectedLatitude = degreesToRadians(53 + 36 / 60 + 42.2972 / 3600);
  const expectedLongitude = degreesToRadians(-(1 + 39 / 60 + 46.5416 / 3600));
  assert(Math.abs(osgb36.latitude - expectedLatitude) < 2e-9, "Projection self-check failed");
  assert(Math.abs(osgb36.longitude - expectedLongitude) < 2e-9, "Projection self-check failed");

  const osgb36Cartesian = geodeticToCartesian(osgb36, 249.95, AIRY_1830);
  const wgs84Cartesian = applyHelmert(osgb36Cartesian, OSGB36_TO_WGS84);
  const expectedWgs84Cartesian = { x: 3_790_644.9, y: -110_149.21, z: 5_111_482.97 };
  assert(
    Math.hypot(
      wgs84Cartesian.x - expectedWgs84Cartesian.x,
      wgs84Cartesian.y - expectedWgs84Cartesian.y,
      wgs84Cartesian.z - expectedWgs84Cartesian.z,
    ) < 0.1,
    "Helmert self-check failed",
  );
}

function roundCoordinate(value) {
  return Number(value.toFixed(7));
}

validateProjection(readFileSync(resolve(projectionArgument), "utf8"));
validateAgainstOfficialWorkedExample();

const sourceRing = parsePolygonShapefile(readFileSync(resolve(shapefileArgument)));
const runtimeRing = sourceRing.map(([easting, northing]) => {
  const coordinate = britishNationalGridToWgs84(easting, northing);
  const longitude = roundCoordinate(radiansToDegrees(coordinate.longitude));
  const latitude = roundCoordinate(radiansToDegrees(coordinate.latitude));
  assert(
    Number.isFinite(longitude) &&
      Number.isFinite(latitude) &&
      longitude >= -180 &&
      longitude <= 180 &&
      latitude >= -90 &&
      latitude <= 90,
    "Transformation produced an invalid WGS84 coordinate",
  );
  return [longitude, latitude];
});

assert(
  runtimeRing[0][0] === runtimeRing.at(-1)[0] &&
    runtimeRing[0][1] === runtimeRing.at(-1)[1],
  "Transformed Polygon ring must remain closed",
);

const asset = {
  id: "greater-london",
  version: "gla-greater-london-boundary-2025-03-13",
  source: {
    publisher: "Greater London Authority",
    portal: "London Datastore",
    dataset: "Statistical GIS Boundary Files for London",
    resource: "Greater London boundary",
    maintainer: "GLA GIS",
    license: "Open Government Licence v2",
  },
  crs: "EPSG:4326",
  geometry: {
    type: "Polygon",
    coordinates: [runtimeRing],
  },
};

const outputPath = resolve(outputArgument);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(asset)}\n`, "utf8");

const longitudes = runtimeRing.map(([longitude]) => longitude);
const latitudes = runtimeRing.map(([, latitude]) => latitude);
console.log(
  JSON.stringify({
    sourceCrs: "EPSG:27700 (OSGB36 / British National Grid)",
    runtimeCrs: asset.crs,
    sourceGeometryType: "Polygon",
    runtimeGeometryType: asset.geometry.type,
    featureCount: SOURCE_PROFILE.recordCount,
    polygonCount: 1,
    ringCount: SOURCE_PROFILE.partCount,
    pointCount: runtimeRing.length,
    simplified: false,
    coordinatePrecisionDecimals: 7,
    runtimeBounds: [
      Math.min(...longitudes),
      Math.min(...latitudes),
      Math.max(...longitudes),
      Math.max(...latitudes),
    ],
    outputPath,
  }),
);
