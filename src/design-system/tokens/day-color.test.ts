import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const tokens = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");
const globalStyles = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");
const days = ["06", "07", "08", "09", "10", "11", "12", "13"];

function token(day: string, role: string) {
  const match = tokens.match(new RegExp(`--ds-day-${day}-${role}:\\s*(#[0-9a-f]{6})`, "i"));
  if (!match) throw new Error(`Missing day ${day} ${role}`);
  return match[1];
}

function rgb(hex: string) {
  return [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
}

function luminance(hex: string) {
  const channels = rgb(hex).map((value) => value / 255).map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
}

function contrast(left: string, right: string) {
  const values = [luminance(left), luminance(right)].sort((a, b) => b - a);
  return (values[0] + .05) / (values[1] + .05);
}

describe("two-level day color system", () => {
  it.each(days)("derives Day %s surface from the same Base→Text relationship", (day) => {
    const base = rgb(token(day, "base"));
    const text = rgb(token(day, "text"));
    const surface = rgb(token(day, "surface"));
    surface.forEach((channel, index) => expect(Math.abs(channel - (base[index] * .42 + text[index] * .58))).toBeLessThanOrEqual(1));
  });

  it.each(days)("keeps all Day %s hero copy above WCAG AA", (day) => {
    expect(contrast(token(day, "surface"), token(day, "ink"))).toBeGreaterThanOrEqual(4.5);
  });

  it("maps all eight DayDetail heroes to shared semantic roles", () => {
    for (const day of days) {
      expect(globalStyles).toContain(`--day-surface: var(--ds-day-${day}-surface)`);
      expect(globalStyles).toContain(`--cover-fg: var(--ds-day-${day}-ink)`);
    }
    expect(globalStyles).toMatch(/\.open-day-hero \{[^}]*border-radius:\s*0 0 var\(--ds-radius-hero\) var\(--ds-radius-hero\)/);
  });
});
