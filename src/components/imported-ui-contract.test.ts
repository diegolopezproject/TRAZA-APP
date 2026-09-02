import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("imported place UI contract", () => {
  it("routes the hybrid collection through existing SavedView and SavedPlaceCard", async () => {
    const tripApp = await readFile(path.resolve("src/components/trip-app.tsx"), "utf8");
    const savedView = await readFile(path.resolve("src/components/saved-view.tsx"), "utf8");
    expect(tripApp).toContain("places={combinedPlaces}");
    expect(savedView).toContain("<SavedPlaceCard");
    expect(savedView).not.toMatch(/ImportedPlaceCard|GooglePlaceCard/u);
  });

  it("reuses MobileSheet and the existing placement option language for category choice", async () => {
    const categorySheet = await readFile(
      path.resolve("src/components/import-category-sheet.tsx"),
      "utf8",
    );
    expect(categorySheet).toContain("<MobileSheet");
    expect(categorySheet).toContain('className="placement-options"');
    expect(categorySheet).not.toMatch(/alert\(|confirm\(|prompt\(/u);
  });

  it("keeps one existing assignment-toast implementation with unchanged timing", async () => {
    const tripApp = await readFile(path.resolve("src/components/trip-app.tsx"), "utf8");
    expect(tripApp).toContain('className="assignment-toast"');
    expect(tripApp).toContain("4200");
    expect(tripApp).not.toContain("ToastProvider");
  });

  it("centers the existing toast without a horizontal transform that Motion can replace", async () => {
    const css = await readFile(path.resolve("src/app/globals.css"), "utf8");
    const blocks = css.match(/\.assignment-toast\s*\{[^}]*\}/gu) ?? [];
    const effectiveBlock = blocks.find((block) => block.includes("var(--safe-left)")) ?? "";
    expect(effectiveBlock).toMatch(/left:\s*max\(14px, var\(--safe-left\)\)/u);
    expect(effectiveBlock).toMatch(/right:\s*max\(14px, var\(--safe-right\)\)/u);
    expect(effectiveBlock).toContain("width: fit-content");
    expect(effectiveBlock).toContain("margin-inline: auto");
    expect(effectiveBlock).not.toContain("translateX");
    expect(css).toMatch(/\.assignment-toast > span\s*\{[^}]*overflow-wrap:\s*anywhere/u);
  });

  it("shows Google and author attribution only for Google photo media", async () => {
    const mediaFrame = await readFile(path.resolve("src/components/media-frame.tsx"), "utf8");
    expect(mediaFrame).toContain("media.googleMapsAttribution ?");
    expect(mediaFrame).toContain('<span translate="no">Google Maps</span>');
    expect(mediaFrame).toContain("attribution.sourcePhotoUrl");
    expect(mediaFrame).toContain("author.profileUrl");
    expect(mediaFrame).toContain("author.avatarUrl");
    expect(mediaFrame).toContain(": <MediaAttribution");
  });
});
