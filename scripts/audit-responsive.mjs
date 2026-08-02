import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.APP_URL ?? "http://127.0.0.1:3000";
const browserPath = process.env.BROWSER_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDir = path.resolve("screenshots", "iteration-03", "responsive");
const phase = process.env.AUDIT_PHASE ?? "final";
const viewports = [
  { name: "390x844", width: 390, height: 844 },
  { name: "430x932", width: 430, height: 932 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1440x900", width: 1440, height: 900 },
];

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const report = [];

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(450);

  const journeyMetrics = await page.evaluate(() => {
    const active = document.querySelector(".day-cover.is-active")?.getBoundingClientRect();
    const nav = document.querySelector(".bottom-nav")?.getBoundingClientRect();
    const title = document.querySelector(".day-cover.is-active .cover-copy h2")?.getBoundingClientRect();
    const slides = [...document.querySelectorAll(".day-cover")].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.right > 0 && rect.left < window.innerWidth;
    }).length;
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      bodyOverflow: document.documentElement.scrollWidth - window.innerWidth,
      activeCover: active ? { left: active.left, right: active.right, width: active.width, bottom: active.bottom } : null,
      titleInsideCover: Boolean(active && title && title.left >= active.left && title.right <= active.right && title.bottom <= active.bottom),
      navOverlapsCover: Boolean(active && nav && nav.top < active.bottom && nav.bottom > active.top),
      visibleCovers: slides,
    };
  });
  await page.screenshot({ path: path.join(outputDir, `${phase}-${viewport.name}-journey.png`) });

  const selectedBefore = await page.locator(".day-cover.is-active").getAttribute("aria-label");
  await page.locator(".day-carousel").focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(300);
  const selectedAfter = await page.locator(".day-cover.is-active").getAttribute("aria-label");

  await page.getByRole("button", { name: "Guardados" }).click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(outputDir, `${phase}-${viewport.name}-saved.png`) });
  await page.getByRole("button", { name: "Viaje" }).click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(outputDir, `${phase}-${viewport.name}-trip.png`) });

  report.push({
    name: viewport.name,
    journey: journeyMetrics,
    keyboardArrowChangesDay: selectedBefore !== selectedAfter,
    consoleErrors,
  });
  await context.close();
}

await browser.close();
await fs.writeFile(path.join(outputDir, `${phase}-report.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
