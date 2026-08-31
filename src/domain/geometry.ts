/** Geographic point expressed as named latitude/longitude values. */
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** GeoJSON coordinate order: longitude first, latitude second. */
export type LongitudeLatitude = readonly [longitude: number, latitude: number];
export type LinearRing = readonly LongitudeLatitude[];

export interface PolygonGeometry {
  type: "Polygon";
  coordinates: readonly LinearRing[];
}

export interface MultiPolygonGeometry {
  type: "MultiPolygon";
  coordinates: readonly (readonly LinearRing[])[];
}

export type BoundaryGeometry = PolygonGeometry | MultiPolygonGeometry;

type RingPosition = "inside" | "outside" | "boundary";

const SEGMENT_EPSILON = 1e-10;

export function isValidGeoPoint(point: GeoPoint): boolean {
  return (
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    point.latitude >= -90 &&
    point.latitude <= 90 &&
    point.longitude >= -180 &&
    point.longitude <= 180
  );
}

function isPointOnSegment(
  [pointX, pointY]: LongitudeLatitude,
  [startX, startY]: LongitudeLatitude,
  [endX, endY]: LongitudeLatitude,
): boolean {
  const crossProduct = (pointY - startY) * (endX - startX) - (pointX - startX) * (endY - startY);
  const scale = Math.max(1, Math.abs(endX - startX), Math.abs(endY - startY));

  if (Math.abs(crossProduct) > SEGMENT_EPSILON * scale) {
    return false;
  }

  return (
    pointX >= Math.min(startX, endX) - SEGMENT_EPSILON &&
    pointX <= Math.max(startX, endX) + SEGMENT_EPSILON &&
    pointY >= Math.min(startY, endY) - SEGMENT_EPSILON &&
    pointY <= Math.max(startY, endY) + SEGMENT_EPSILON
  );
}

function positionInRing(point: LongitudeLatitude, ring: LinearRing): RingPosition {
  if (ring.length < 3) {
    return "outside";
  }

  let inside = false;
  for (let currentIndex = 0, previousIndex = ring.length - 1; currentIndex < ring.length; previousIndex = currentIndex++) {
    const current = ring[currentIndex];
    const previous = ring[previousIndex];

    if (isPointOnSegment(point, previous, current)) {
      return "boundary";
    }

    const [pointX, pointY] = point;
    const [currentX, currentY] = current;
    const [previousX, previousY] = previous;
    const crossesRay =
      currentY > pointY !== previousY > pointY &&
      pointX < ((previousX - currentX) * (pointY - currentY)) / (previousY - currentY) + currentX;

    if (crossesRay) {
      inside = !inside;
    }
  }

  return inside ? "inside" : "outside";
}

function polygonContainsPoint(point: LongitudeLatitude, rings: readonly LinearRing[]): boolean {
  const outerRing = rings[0];
  if (!outerRing) {
    return false;
  }

  const outerPosition = positionInRing(point, outerRing);
  if (outerPosition === "boundary") {
    return true;
  }
  if (outerPosition === "outside") {
    return false;
  }

  for (const hole of rings.slice(1)) {
    const holePosition = positionInRing(point, hole);
    if (holePosition === "boundary") {
      return true;
    }
    if (holePosition === "inside") {
      return false;
    }
  }

  return true;
}

/** Tests polygon/multipolygon membership with inclusive polygon edges and vertices. */
export function boundaryContainsPoint(geometry: BoundaryGeometry, point: GeoPoint): boolean {
  if (!isValidGeoPoint(point)) {
    return false;
  }

  const coordinate: LongitudeLatitude = [point.longitude, point.latitude];
  if (geometry.type === "Polygon") {
    return polygonContainsPoint(coordinate, geometry.coordinates);
  }

  return geometry.coordinates.some((polygon) => polygonContainsPoint(coordinate, polygon));
}
