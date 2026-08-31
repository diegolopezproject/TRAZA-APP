import { describe, expect, it } from "vitest";
import {
  boundaryContainsPoint,
  isValidGeoPoint,
  type MultiPolygonGeometry,
  type PolygonGeometry,
} from "./geometry";

// TEST FIXTURE only. These coordinates do not represent Greater London.
const TEST_FIXTURE_SQUARE: PolygonGeometry = {
  type: "Polygon",
  coordinates: [
    [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ],
  ],
};

// TEST FIXTURE only. These coordinates do not represent Greater London.
const TEST_FIXTURE_MULTIPOLYGON: MultiPolygonGeometry = {
  type: "MultiPolygon",
  coordinates: [
    TEST_FIXTURE_SQUARE.coordinates,
    [
      [
        [20, 20],
        [30, 20],
        [30, 30],
        [20, 30],
        [20, 20],
      ],
    ],
  ],
};

describe("boundaryContainsPoint", () => {
  it("distinguishes points inside and outside a polygon", () => {
    expect(boundaryContainsPoint(TEST_FIXTURE_SQUARE, { latitude: 5, longitude: 5 })).toBe(true);
    expect(boundaryContainsPoint(TEST_FIXTURE_SQUARE, { latitude: 5, longitude: 15 })).toBe(false);
  });

  it("counts edge and vertex points as inside", () => {
    expect(boundaryContainsPoint(TEST_FIXTURE_SQUARE, { latitude: 5, longitude: 0 })).toBe(true);
    expect(boundaryContainsPoint(TEST_FIXTURE_SQUARE, { latitude: 0, longitude: 0 })).toBe(true);
  });

  it("supports multipolygons", () => {
    expect(
      boundaryContainsPoint(TEST_FIXTURE_MULTIPOLYGON, { latitude: 25, longitude: 25 }),
    ).toBe(true);
    expect(
      boundaryContainsPoint(TEST_FIXTURE_MULTIPOLYGON, { latitude: 15, longitude: 15 }),
    ).toBe(false);
  });

  it("respects longitude-latitude coordinate order", () => {
    const TEST_FIXTURE_ASYMMETRIC: PolygonGeometry = {
      type: "Polygon",
      coordinates: [
        [
          [20, 1],
          [30, 1],
          [30, 3],
          [20, 3],
          [20, 1],
        ],
      ],
    };

    expect(
      boundaryContainsPoint(TEST_FIXTURE_ASYMMETRIC, { latitude: 2, longitude: 25 }),
    ).toBe(true);
    expect(
      boundaryContainsPoint(TEST_FIXTURE_ASYMMETRIC, { latitude: 25, longitude: 2 }),
    ).toBe(false);
  });

  it("excludes polygon holes while treating their boundary as inclusive", () => {
    const TEST_FIXTURE_WITH_HOLE: PolygonGeometry = {
      type: "Polygon",
      coordinates: [
        TEST_FIXTURE_SQUARE.coordinates[0],
        [
          [4, 4],
          [6, 4],
          [6, 6],
          [4, 6],
          [4, 4],
        ],
      ],
    };

    expect(boundaryContainsPoint(TEST_FIXTURE_WITH_HOLE, { latitude: 5, longitude: 5 })).toBe(false);
    expect(boundaryContainsPoint(TEST_FIXTURE_WITH_HOLE, { latitude: 5, longitude: 4 })).toBe(true);
  });

  it("rejects invalid coordinates", () => {
    expect(boundaryContainsPoint(TEST_FIXTURE_SQUARE, { latitude: 91, longitude: 5 })).toBe(false);
    expect(boundaryContainsPoint(TEST_FIXTURE_SQUARE, { latitude: 5, longitude: 181 })).toBe(false);
    expect(boundaryContainsPoint(TEST_FIXTURE_SQUARE, { latitude: Number.NaN, longitude: 5 })).toBe(
      false,
    );
  });
});

describe("isValidGeoPoint", () => {
  it("accepts valid limits and rejects non-finite values", () => {
    expect(isValidGeoPoint({ latitude: 90, longitude: 180 })).toBe(true);
    expect(isValidGeoPoint({ latitude: -90, longitude: -180 })).toBe(true);
    expect(isValidGeoPoint({ latitude: Number.POSITIVE_INFINITY, longitude: 0 })).toBe(false);
  });
});
