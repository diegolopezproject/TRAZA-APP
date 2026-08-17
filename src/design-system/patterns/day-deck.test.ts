import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resistDayDeckEdge, resolveDayDeckAxis, resolveDayDeckGesture, visibleDayDeckIndices } from "./day-deck";

describe("resolveDayDeckGesture", () => {
  it("moves at most one day after a very strong flick", () => {
    expect(resolveDayDeckGesture({ axis: "x", currentIndex: 1, total: 8, offsetX: -900, offsetY: 0, velocityX: -8, velocityY: 0, width: 393 }).index).toBe(2);
  });
  it("does not loop at either boundary", () => {
    expect(resolveDayDeckGesture({ axis: "x", currentIndex: 0, total: 8, offsetX: 180, offsetY: 0, velocityX: 2, velocityY: 0, width: 393 }).index).toBe(0);
    expect(resolveDayDeckGesture({ axis: "x", currentIndex: 7, total: 8, offsetX: -180, offsetY: 0, velocityX: -2, velocityY: 0, width: 393 }).index).toBe(7);
  });
  it("opens only for an upward vertical gesture", () => {
    expect(resolveDayDeckGesture({ axis: "y", currentIndex: 1, total: 8, offsetX: 12, offsetY: -90, velocityX: 0, velocityY: -.2, width: 393 })).toEqual({ index: 1, open: true });
    expect(resolveDayDeckGesture({ axis: "y", currentIndex: 1, total: 8, offsetX: 12, offsetY: 90, velocityX: 0, velocityY: .8, width: 393 }).open).toBe(false);
  });
  it("returns below threshold", () => {
    expect(resolveDayDeckGesture({ axis: "x", currentIndex: 3, total: 8, offsetX: -34, offsetY: 4, velocityX: -.1, velocityY: 0, width: 393 }).index).toBe(3);
  });
  it("locks to one axis only after intentional movement", () => {
    expect(resolveDayDeckAxis(5, 5)).toBeNull();
    expect(resolveDayDeckAxis(14, 6)).toBe("x");
    expect(resolveDayDeckAxis(5, -14)).toBe("y");
  });
  it("adds bounded resistance at the collection edges", () => {
    expect(resistDayDeckEdge(180, false)).toBe(180);
    expect(resistDayDeckEdge(180, true)).toBeGreaterThan(0);
    expect(resistDayDeckEdge(180, true)).toBeLessThanOrEqual(36);
    expect(resistDayDeckEdge(-900, true)).toBeCloseTo(-36, 3);
  });
  it("mounts only previous, active and next before a commit", () => {
    expect(visibleDayDeckIndices(3, 8)).toEqual([2, 3, 4]);
    expect(visibleDayDeckIndices(0, 8)).toEqual([0, 1]);
  });
  it("keeps every mounted card at full color without a deck crossfade", () => {
    const css = readFileSync(new URL("./patterns.css", import.meta.url), "utf8");
    expect(css).toMatch(/\.ds-day-deck__card[^}]*opacity:\s*1;[^}]*filter:\s*none;/);
    expect(css).not.toMatch(/\.ds-day-deck__card[^}]*brightness\(/);
    expect(css).not.toMatch(/is-settling[^}]*opacity/);
  });
  it("integrates progress into the DayCover action row", () => {
    const css = readFileSync(new URL("./patterns.css", import.meta.url), "utf8");
    expect(css).toContain(".ds-day-cover__progress");
    expect(css).not.toContain(".ds-day-deck__indicator");
    expect(css).toContain("--ds-segment-active");
  });
});
