import { describe, expect, it } from "vitest";
import { validateDayCoverBounds } from "./day-cover";

const rect = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, right: left + width, bottom: top + height });
describe("DayCover 2.0 bounds", () => {
  it.each([390, 402, 430, 768])("keeps number, copy and art contract at %ipx", (width) => {
    const result = validateDayCoverBounds({ cover: rect(0, 0, width, 800), number: rect(12, 190, width * .72, 220), art: rect(12, 60, width - 24, 450), copy: rect(18, 500, width - 36, 110) });
    expect(result.numberVisible).toBe(true); expect(result.artOverlapSafe).toBe(true); expect(result.withinCover).toBe(true);
  });
  it("detects excessive editorial overlap", () => expect(validateDayCoverBounds({ cover: rect(0, 0, 390, 800), number: rect(12, 160, 270, 220), art: rect(12, 60, 366, 560), copy: rect(18, 500, 354, 110) }).artOverlapSafe).toBe(false));
});
