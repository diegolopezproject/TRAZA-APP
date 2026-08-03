import { describe, expect, it } from "vitest";
import { appReducer, initialAppState } from "./app-state";

describe("appReducer", () => {
  it("blocks horizontal day changes while a day is open", () => {
    const open = appReducer(initialAppState, {
      type: "OPEN_DAY",
      dayId: "2026-08-07",
    });
    expect(appReducer(open, { type: "SELECT_DAY", index: 4 })).toBe(open);
  });

  it("preserves the open day when closing an activity detail", () => {
    const open = appReducer(initialAppState, {
      type: "OPEN_DAY",
      dayId: "2026-08-07",
    });
    const detail = appReducer(open, {
      type: "OPEN_DETAIL",
      activityId: "sky-garden",
    });
    expect(appReducer(detail, { type: "CLOSE_DETAIL" })).toMatchObject({
      openDayId: "2026-08-07",
      detailActivityId: null,
    });
  });

  it("clears nested navigation when changing tabs", () => {
    const nested = {
      ...initialAppState,
      openDayId: "2026-08-07",
      detailActivityId: "sky-garden",
    };
    expect(appReducer(nested, { type: "CHANGE_TAB", tab: "saved" })).toMatchObject({
      tab: "saved",
      openDayId: null,
      detailActivityId: null,
    });
  });

  it("keeps assignment-sheet navigation isolated from trip data", () => {
    const open = appReducer(initialAppState, { type: "OPEN_ASSIGNMENT", placeId: "kynance-mews" });
    expect(open.assignmentPlaceId).toBe("kynance-mews");
    expect(appReducer(open, { type: "CLOSE_ASSIGNMENT" }).assignmentPlaceId).toBeNull();
  });
});
