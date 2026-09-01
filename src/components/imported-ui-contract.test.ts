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
});
