import { describe, expect, it } from "vitest";
import { initialAppState, rootAppState } from "./app-state";
import { createAppHistoryEntry, directEntryFallback, navigationFromHash, navigationHash, readAppHistoryEntry } from "./use-app-navigation";

describe("app navigation state", () => {
  it("returns to a safe Days root while preserving the selected day and filter", () => {
    const nested = { ...initialAppState, tab: "saved" as const, selectedDay: 3, savedFilter: "food-drink", placeDetailId: "mms-london" };
    expect(directEntryFallback(nested)).toEqual({ ...initialAppState, selectedDay: 3, savedFilter: "food-drink" });
  });

  it("clears nested contexts when moving to a root tab", () => {
    const nested = { ...initialAppState, openDayId: "2026-08-07", detailActivityId: "sky-garden", dayMode: "organize" as const };
    expect(rootAppState(nested, "trip")).toMatchObject({ tab: "trip", openDayId: null, detailActivityId: null, dayMode: "view" });
  });

  it("serializes and restores the Android back sequence for Sky Garden", () => {
    const detail = { ...initialAppState, openDayId: "2026-08-07", detailActivityId: "sky-garden" };
    const restored = navigationFromHash(navigationHash(detail));
    expect(restored).toMatchObject({ tab: "journey", selectedDay: 1, openDayId: "2026-08-07", detailActivityId: "sky-garden" });
  });

  it("serializes assignment steps as distinct history levels", () => {
    const stepTwo = { ...initialAppState, tab: "saved" as const, assignmentPlaceId: "mms-london", assignmentStep: 2 as const };
    expect(navigationHash(stepTwo)).toBe("#saved/assignment/mms-london/step/2");
    expect(navigationFromHash(navigationHash(stepTwo))).toMatchObject({ assignmentPlaceId: "mms-london", assignmentStep: 2 });
  });

  it("ignores unknown plan views from external hashes", () => {
    expect(navigationFromHash("#days/2026-08-07/plan/unknown").planSheet).toBeNull();
  });

  it("recognizes only versioned TRAZA history entries", () => {
    const entry = createAppHistoryEntry(initialAppState, 2);
    expect(readAppHistoryEntry({ __trazaNavigationV1: entry })).toEqual(entry);
    expect(readAppHistoryEntry({ navigation: initialAppState })).toBeNull();
  });
});
