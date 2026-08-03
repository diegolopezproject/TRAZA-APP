import { describe, expect, it } from "vitest";
import { classifyMedia } from "./media-classification";

describe("classifyMedia", () => {
  it("never reports a generated asset as documentary photography", () => {
    expect(classifyMedia({ src: "/generated.png", alt: "Editorial", kind: "photo", generatedAt: "2026-08-02" })).toBe("generated-editorial");
  });

  it("keeps explicit licensed and fallback classifications", () => {
    expect(classifyMedia({ src: "/commons.jpg", alt: "Place", kind: "photo", classification: "licensed-photo" })).toBe("licensed-photo");
    expect(classifyMedia({ src: "fallback://place", alt: "Pending", kind: "fallback" })).toBe("graphic-fallback");
  });
});
