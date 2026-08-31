import { describe, expect, it } from "vitest";
import { selectGoogleTextSearchCandidate } from "./google-place-candidate-selection";
import type { GoogleTextSearchCandidate } from "./google-places-types";

function candidate(
  id: string,
  displayName: string,
  latitude = 51.5,
  longitude = -0.1,
): GoogleTextSearchCandidate {
  return {
    id,
    displayName,
    formattedAddress: `${displayName}, London`,
    location: { latitude, longitude },
  };
}

describe("selectGoogleTextSearchCandidate", () => {
  it("fails for zero candidates and selects a single viable candidate", () => {
    expect(selectGoogleTextSearchCandidate({ query: "Tate", candidates: [] })).toEqual({
      kind: "failed",
      reason: "no-candidates",
    });

    const only = candidate("one", "Tate Modern");
    expect(selectGoogleTextSearchCandidate({ query: "Tate", candidates: [only] })).toEqual({
      kind: "selected",
      candidate: only,
      evidence: "single",
    });
  });

  it("selects one exact normalized name match, including case and accents", () => {
    const exact = candidate("exact", "Café Royal");
    const other = candidate("other", "Royal Cafe East");
    expect(
      selectGoogleTextSearchCandidate({ query: "  CAFE ROYAL ", candidates: [other, exact] }),
    ).toEqual({ kind: "selected", candidate: exact, evidence: "exact-name" });
  });

  it("uses strong coordinate separation as deterministic evidence", () => {
    const near = candidate("near", "Shared Name", 51.5001, -0.1);
    const far = candidate("far", "Shared Name", 51.51, -0.1);
    expect(
      selectGoogleTextSearchCandidate({
        query: "Shared Name",
        coordinates: { latitude: 51.5, longitude: -0.1 },
        candidates: [far, near],
      }),
    ).toEqual({ kind: "selected", candidate: near, evidence: "coordinates" });
  });

  it("returns identity-ambiguous for multiple plausible candidates instead of choosing first", () => {
    const first = candidate("first", "Museum One");
    const second = candidate("second", "Museum Two");
    const result = selectGoogleTextSearchCandidate({
      query: "Museum",
      candidates: [first, second],
    });
    expect(result).toEqual({ kind: "failed", reason: "identity-ambiguous" });
    expect(result).not.toMatchObject({ candidate: first });
  });

  it("keeps close coordinate ties ambiguous", () => {
    expect(
      selectGoogleTextSearchCandidate({
        query: "Shared",
        coordinates: { latitude: 51.5, longitude: -0.1 },
        candidates: [
          candidate("first", "One", 51.5001, -0.1),
          candidate("second", "Two", 51.5002, -0.1),
        ],
      }),
    ).toEqual({ kind: "failed", reason: "identity-ambiguous" });
  });
});
