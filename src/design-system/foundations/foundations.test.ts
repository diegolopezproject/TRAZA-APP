import { describe, expect, it } from "vitest";
import { coreStatusVariants, trazaViewports } from "./foundations";

describe("TRAZA foundations", () => {
  it("keeps required QA viewports", () => expect(Object.keys(trazaViewports)).toEqual(["mobile390", "mobile402", "mobile430", "tablet768", "desktop1440"]));
  it("keeps status names unique and stable", () => expect(new Set(coreStatusVariants).size).toBe(coreStatusVariants.length));
});
