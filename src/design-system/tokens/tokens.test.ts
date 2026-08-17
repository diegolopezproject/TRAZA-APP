import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { token } from "./tokens";

describe("TRAZA semantic tokens", () => {
  const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");
  it("defines critical semantic contracts in the CSS source of truth", () => {
    for (const name of ["--ds-color-text-primary", "--ds-color-surface-canvas", "--ds-color-focus", "--ds-space-page-inline", "--ds-radius-card", "--ds-duration-base", "--ds-safe-bottom", "--ds-layer-overlay"]) expect(css).toContain(name);
  });
  it("exposes references rather than duplicate physical values to TypeScript", () => {
    expect(token.color.textPrimary).toBe("var(--ds-color-text-primary)");
    expect(JSON.stringify(token)).not.toMatch(/#[0-9a-f]{3,8}/i);
  });
  it("derives navigation and content offsets from real safe-area environment values", () => {
    expect(css).toContain("--ds-safe-top: env(safe-area-inset-top, 0px)");
    expect(css).toContain("--ds-safe-bottom: env(safe-area-inset-bottom, 0px)");
    expect(css).toContain("--ds-safe-top-content: calc(var(--ds-safe-top) + var(--ds-space-3))");
    expect(css).toContain("--ds-safe-bottom-content: calc(var(--ds-safe-bottom) + var(--ds-navigation-gap))");
    expect(css).toContain("--ds-navigation-reserve: calc(var(--ds-navigation-safe) + var(--ds-space-4))");
  });
  it("fits the active navigation item inside the bordered navigation content box", () => {
    expect(css).toContain("--ds-navigation-height: 3.875rem");
    expect(css).toContain("--ds-navigation-item-height: 3.25rem");
  });
});
