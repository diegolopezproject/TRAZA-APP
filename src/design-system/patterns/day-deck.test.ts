import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resolveDayDeckGesture, visibleDayDeckIndices } from "./day-deck";

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
});
