import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validateDayCoverBounds } from "./day-cover";

const rect = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, right: left + width, bottom: top + height });
describe("DayCover Full Bleed bounds", () => {
  it.each([360, 390, 412, 430])("keeps every functional region inside at %ipx", (width) => {
    const result = validateDayCoverBounds({ cover: rect(0, 0, width, 800), header: rect(24, 24, width - 48, 44), title: rect(24, 96, width - 48, 172), details: rect(24, 628, width - 48, 42), action: rect(24, 688, width - 48, 86) });
    expect(result.withinCover).toBe(true); expect(result.titleClear).toBe(true); expect(result.actionClear).toBe(true);
  });
  it("detects title and action collisions", () => {
    const result = validateDayCoverBounds({ cover: rect(0, 0, 390, 800), header: rect(24, 24, 342, 44), title: rect(24, 96, 342, 560), details: rect(24, 620, 342, 60), action: rect(24, 660, 342, 116) });
    expect(result.titleClear).toBe(false); expect(result.actionClear).toBe(false);
  });
  it("uses the approved integrated Full Bleed structure", () => {
    const css = readFileSync(new URL("./patterns.css", import.meta.url), "utf8");
    expect(css).toMatch(/\.ds-day-cover__art[^}]*position:\s*absolute/);
    expect(css).toMatch(/\.ds-day-cover__action button[^}]*min-height:\s*3\.375rem/);
    expect(css).toContain("--ds-day-cover-ui");
    expect(css).not.toContain("ds-day-cover__number");
  });
});
