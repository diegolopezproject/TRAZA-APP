import { describe, expect, it } from "vitest";
import type { NormalizedPlaceCandidate } from "./place-import";
import {
  evaluateProductionGreaterLondonScope,
  GREATER_LONDON_BOUNDARY,
  GREATER_LONDON_BOUNDARY_RUNTIME_CRS,
  GREATER_LONDON_BOUNDARY_SOURCE,
  GREATER_LONDON_BOUNDARY_VERSION,
  loadGreaterLondonBoundaryAsset,
  validateGreaterLondonScope,
  type VersionedGreaterLondonBoundary,
} from "./london-scope";

// TEST FIXTURE only. This square is not a Greater London boundary approximation.
const TEST_FIXTURE_BOUNDARY: VersionedGreaterLondonBoundary = {
  id: "greater-london",
  version: "TEST FIXTURE v1",
  source: {
    publisher: "TEST FIXTURE",
    portal: "TEST FIXTURE",
    dataset: "TEST FIXTURE",
    resource: "TEST FIXTURE",
    maintainer: "TEST FIXTURE",
    license: "TEST FIXTURE",
  },
  crs: "EPSG:4326",
  geometry: {
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
  },
};

const VALID_MINIMAL_ASSET = {
  id: "greater-london",
  version: GREATER_LONDON_BOUNDARY_VERSION,
  source: GREATER_LONDON_BOUNDARY_SOURCE,
  crs: GREATER_LONDON_BOUNDARY_RUNTIME_CRS,
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 0],
      ],
    ],
  },
};

function productionOuterRing() {
  const geometry = GREATER_LONDON_BOUNDARY.geometry;
  if (!geometry || geometry.type !== "Polygon") {
    throw new Error("Expected the reviewed Greater London Polygon asset");
  }
  return geometry.coordinates[0];
}

describe("validateGreaterLondonScope", () => {
  it.each(["GB", "UK", "gb", " uk "])("accepts %s country evidence inside the boundary", (countryCode) => {
    expect(
      validateGreaterLondonScope(
        { countryCode, location: { latitude: 5, longitude: 5 } },
        TEST_FIXTURE_BOUNDARY,
      ),
    ).toEqual({ kind: "inside" });
  });

  it("rejects non-UK country evidence even when geometry is inside", () => {
    expect(
      validateGreaterLondonScope(
        { countryCode: "FR", location: { latitude: 5, longitude: 5 } },
        TEST_FIXTURE_BOUNDARY,
      ),
    ).toEqual({ kind: "outside", reason: "country" });
  });

  it("rejects a UK point outside the boundary", () => {
    expect(
      validateGreaterLondonScope(
        { countryCode: "GB", location: { latitude: 15, longitude: 15 } },
        TEST_FIXTURE_BOUNDARY,
      ),
    ).toEqual({ kind: "outside", reason: "boundary" });
  });

  it("reports missing country evidence", () => {
    expect(
      validateGreaterLondonScope(
        { location: { latitude: 5, longitude: 5 } },
        TEST_FIXTURE_BOUNDARY,
      ),
    ).toEqual({ kind: "invalid-or-unknown", reason: "missing-country" });
  });

  it("reports missing coordinates", () => {
    expect(validateGreaterLondonScope({ countryCode: "GB" }, TEST_FIXTURE_BOUNDARY)).toEqual({
      kind: "invalid-or-unknown",
      reason: "missing-location",
    });
  });

  it("reports invalid coordinates", () => {
    expect(
      validateGreaterLondonScope(
        { countryCode: "GB", location: { latitude: 95, longitude: 5 } },
        TEST_FIXTURE_BOUNDARY,
      ),
    ).toEqual({ kind: "invalid-or-unknown", reason: "invalid-location" });
  });

  it("fails closed when boundary geometry is unavailable", () => {
    expect(
      validateGreaterLondonScope(
        { countryCode: "GB", location: { latitude: 51.5007, longitude: -0.1246 } },
        { ...GREATER_LONDON_BOUNDARY, geometry: null },
      ),
    ).toEqual({ kind: "invalid-or-unknown", reason: "boundary-unavailable" });
  });
});

describe("authoritative Greater London boundary asset", () => {
  it("loads the reviewed version, source, CRS and complete source ring", () => {
    expect(GREATER_LONDON_BOUNDARY).toMatchObject({
      id: "greater-london",
      version: "gla-greater-london-boundary-2025-03-13",
      source: GREATER_LONDON_BOUNDARY_SOURCE,
      crs: "EPSG:4326",
    });
    expect(productionOuterRing()).toHaveLength(10_921);
  });

  it.each([
    ["Westminster", -0.1246, 51.5007],
    ["Canary Wharf", -0.0235, 51.5054],
    ["Richmond", -0.3037, 51.4613],
    ["Enfield", -0.0815, 51.6521],
  ])("classifies %s as inside Greater London", (_name, longitude, latitude) => {
    expect(validateGreaterLondonScope({ countryCode: "GB", location: { longitude, latitude } })).toEqual({
      kind: "inside",
    });
  });

  it.each([
    ["Watford", -0.3903, 51.6565],
    ["Brighton", -0.1372, 50.8225],
    ["Guildford", -0.5704, 51.2362],
  ])("classifies %s as outside Greater London", (_name, longitude, latitude) => {
    expect(validateGreaterLondonScope({ countryCode: "GB", location: { longitude, latitude } })).toEqual({
      kind: "outside",
      reason: "boundary",
    });
  });

  it("keeps the existing inclusive-edge policy for a real boundary vertex", () => {
    const [longitude, latitude] = productionOuterRing()[0];
    expect(validateGreaterLondonScope({ countryCode: "GB", location: { longitude, latitude } })).toEqual({
      kind: "inside",
    });
  });

  it("still requires structured UK country evidence with the real boundary", () => {
    const location = { latitude: 51.5007, longitude: -0.1246 };
    expect(validateGreaterLondonScope({ countryCode: "FR", location })).toEqual({
      kind: "outside",
      reason: "country",
    });
    expect(validateGreaterLondonScope({ location })).toEqual({
      kind: "invalid-or-unknown",
      reason: "missing-country",
    });
  });

  it("accepts a normalized production candidate through the injectable evaluator", () => {
    const candidate: NormalizedPlaceCandidate = {
      provider: "google",
      externalPlaceId: "fixed-test-place-id",
      countryCode: "GB",
      location: { latitude: 51.5007, longitude: -0.1246 },
      types: ["museum"],
    };

    expect(evaluateProductionGreaterLondonScope(candidate)).toEqual({ kind: "inside" });
  });
});

describe("loadGreaterLondonBoundaryAsset", () => {
  it("accepts a structurally valid reviewed asset", () => {
    expect(loadGreaterLondonBoundaryAsset(VALID_MINIMAL_ASSET)).toMatchObject({
      id: "greater-london",
      version: GREATER_LONDON_BOUNDARY_VERSION,
      crs: GREATER_LONDON_BOUNDARY_RUNTIME_CRS,
    });
  });

  it.each([
    [null],
    [{ ...VALID_MINIMAL_ASSET, id: "another-boundary" }],
    [{ ...VALID_MINIMAL_ASSET, version: "unreviewed-version" }],
    [{ ...VALID_MINIMAL_ASSET, crs: "EPSG:27700" }],
    [{ ...VALID_MINIMAL_ASSET, source: { ...GREATER_LONDON_BOUNDARY_SOURCE, publisher: "Other" } }],
    [{ ...VALID_MINIMAL_ASSET, geometry: { type: "LineString", coordinates: [] } }],
    [{ ...VALID_MINIMAL_ASSET, geometry: { type: "Polygon", coordinates: [] } }],
    [{
      ...VALID_MINIMAL_ASSET,
      geometry: { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1]]] },
    }],
    [{
      ...VALID_MINIMAL_ASSET,
      geometry: { type: "Polygon", coordinates: [[[0, 0], [181, 0], [1, 1], [0, 0]]] },
    }],
  ])("rejects malformed, substituted or wrongly projected data", (asset) => {
    expect(loadGreaterLondonBoundaryAsset(asset)).toBeNull();
  });
});
