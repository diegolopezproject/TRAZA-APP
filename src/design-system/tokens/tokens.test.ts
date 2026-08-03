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
});
