import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "./manifest";

function readPngSize(buffer: Buffer): { width: number; height: number } {
  expect(buffer.subarray(1, 4).toString("ascii")).toBe("PNG");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

describe("TRAZA web app manifest", () => {
  it("declares the installable standalone application identity", () => {
    expect(manifest()).toMatchObject({
      name: "TRAZA",
      short_name: "TRAZA",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#f4f1ea",
      theme_color: "#161616",
    });
  });

  it("declares PNG install icons at 192 and 512 pixels plus a maskable asset", async () => {
    const icons = manifest().icons ?? [];
    expect(icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: "/icons/traza-192.png", sizes: "192x192" }),
        expect.objectContaining({ src: "/icons/traza-512.png", sizes: "512x512" }),
        expect.objectContaining({
          src: "/icons/traza-maskable-512.png",
          sizes: "512x512",
          purpose: "maskable",
        }),
      ]),
    );

    for (const [fileName, expectedSize] of [
      ["traza-192.png", 192],
      ["traza-512.png", 512],
      ["traza-maskable-512.png", 512],
    ] as const) {
      const filePath = path.resolve("public", "icons", fileName);
      await expect(stat(filePath)).resolves.toMatchObject({ isFile: expect.any(Function) });
      expect(readPngSize(await readFile(filePath))).toEqual({
        width: expectedSize,
        height: expectedSize,
      });
    }
  });

  it("registers the exact POST multipart Web Share Target contract", () => {
    expect(manifest().share_target).toEqual({
      action: "/share",
      method: "POST",
      enctype: "multipart/form-data",
      params: { title: "title", text: "text", url: "url" },
    });
  });

  it("links the manifest and keeps the service worker lifecycle-only", async () => {
    const [layoutSource, serviceWorkerSource, registrationSource] = await Promise.all([
      readFile(path.resolve("src", "app", "layout.tsx"), "utf8"),
      readFile(path.resolve("public", "sw.js"), "utf8"),
      readFile(path.resolve("src", "components", "service-worker-registration.tsx"), "utf8"),
    ]);

    expect(layoutSource).toContain('manifest: "/manifest.webmanifest"');
    expect(registrationSource).toContain('register("/sw.js", { scope: "/" })');
    expect(serviceWorkerSource).toContain('addEventListener("install"');
    expect(serviceWorkerSource).toContain('addEventListener("activate"');
    expect(serviceWorkerSource).not.toContain('addEventListener("fetch"');
    expect(serviceWorkerSource).not.toMatch(/\bcaches\b/u);
  });
});
