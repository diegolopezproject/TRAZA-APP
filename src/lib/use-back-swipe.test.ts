import { describe, expect, it } from "vitest";
import { resolvesBackSwipe } from "./use-back-swipe";

describe("edge swipe back", () => {
  it("commits after the distance threshold", () => {
    expect(resolvesBackSwipe({ distance: 112, velocity: .1, width: 402 })).toBe(true);
  });

  it("commits a deliberate fast swipe but cancels a short drag", () => {
    expect(resolvesBackSwipe({ distance: 48, velocity: .7, width: 402 })).toBe(true);
    expect(resolvesBackSwipe({ distance: 32, velocity: .9, width: 402 })).toBe(false);
  });
});
