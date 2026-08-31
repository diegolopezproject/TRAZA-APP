import { describe, expect, it } from "vitest";
import {
  GREATER_LONDON_BOUNDARY,
  GREATER_LONDON_BOUNDARY_SOURCE,
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

  it("refuses production success while the authoritative boundary asset is absent", () => {
    expect(
      validateGreaterLondonScope({
        countryCode: "GB",
        location: { latitude: 51.5, longitude: -0.1 },
      }),
    ).toEqual({ kind: "invalid-or-unknown", reason: "boundary-unavailable" });
    expect(GREATER_LONDON_BOUNDARY.geometry).toBeNull();
  });

  it("records only the approved authoritative source metadata", () => {
    expect(GREATER_LONDON_BOUNDARY_SOURCE).toEqual({
      publisher: "Greater London Authority",
      portal: "London Datastore",
      dataset: "Statistical GIS Boundary Files for London",
      resource: "Greater London boundary",
      maintainer: "GLA GIS",
      license: "Open Government Licence v2",
    });
  });
});
