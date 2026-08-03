import fs from "node:fs/promises";
import path from "node:path";
import { chromium, webkit } from "playwright-core";

const appUrl = process.env.APP_URL ?? "https://traza-app-beige.vercel.app/";
const engineName = process.env.PW_ENGINE ?? "chromium";
const engine = engineName === "webkit" ? webkit : chromium;
const output = path.resolve("screenshots", "iteration-08", "before", engineName);
const viewports = [
  [360, 800],
  [393, 873],
  [402, 874],
  [412, 915],
  [430, 932],
];

await fs.mkdir(output, { recursive: true });

const executablePath = engineName === "webkit"
  ? path.resolve("node_modules", "playwright-core", ".local-browsers", "webkit-2336", "Playwright.exe")
  : process.env.BROWSER_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const browser = await engine.launch({ executablePath, headless: true });
const errors = [];
const results = [];

function watch(page) {
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
}

async function settle(page, delay = 300) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(delay);
}

async function snapshot(page, width, height, label, fullPage = true) {
  await settle(page);
  await page.screenshot({
    path: path.join(output, `${width}x${height}-${label}.png`),
    fullPage,
  });
}

for (const [width, height] of viewports) {
  const context = await browser.newContext({
    viewport: { width, height },
    screen: { width, height },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    serviceWorkers: "allow",
  });
  const page = await context.newPage();
  watch(page);
  const response = await page.goto(appUrl, { waitUntil: "networkidle", timeout: 60_000 });
  await settle(page);

  const initial = await page.evaluate(() => {
    const sample = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const style = getComputedStyle(element);
      return {
        selector,
        family: style.fontFamily,
        weight: style.fontWeight,
        size: style.fontSize,
        lineHeight: style.lineHeight,
      };
    };
    const buttons = [...document.querySelectorAll("button")].map((button) => ({
      text: button.textContent?.trim() ?? "",
      ariaLabel: button.getAttribute("aria-label"),
      className: button.className,
    }));
    return {
      title: document.title,
      url: location.href,
      viewport: { width: innerWidth, height: innerHeight },
      document: {
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        overflowX: document.documentElement.scrollWidth - innerWidth,
        overflowY: document.documentElement.scrollHeight - innerHeight,
      },
      fonts: {
        body: sample("body"),
        cover: sample(".ds-day-cover__copy h2, .day-card h2, h1"),
        navigation: sample(".ds-bottom-navigation, nav"),
      },
      fontFaces: [...document.fonts].map((font) => ({ family: font.family, weight: font.weight, status: font.status })),
      buttons,
      arrows: buttons.filter((button) => /anterior|siguiente|left|right/i.test(`${button.text} ${button.ariaLabel ?? ""}`)).length,
      activeCover: document.querySelector(".ds-day-cover.is-active")?.textContent?.replace(/\s+/g, " ").trim() ?? null,
      displayMode: {
        standalone: matchMedia("(display-mode: standalone)").matches,
        browser: matchMedia("(display-mode: browser)").matches,
      },
    };
  });

  await snapshot(page, width, height, "days", false);

  if (width === 402) {
    const saved = page.getByRole("button", { name: /Guardados/i });
    if (await saved.count()) {
      await saved.click();
      await snapshot(page, width, height, "saved");
    }
    const trip = page.getByRole("button", { name: /Viaje/i });
    if (await trip.count()) {
      await trip.click();
      await snapshot(page, width, height, "trip");
    }
    const days = page.getByRole("button", { name: /D[ií]as/i });
    if (await days.count()) {
      await days.click();
      const carousel = page.locator(".day-carousel");
      if (await carousel.count()) {
        await carousel.focus();
        await page.keyboard.press("Home");
        await page.keyboard.press("ArrowRight");
        await settle(page, 500);
      }
      const open = page.locator(".ds-day-cover.is-active .ds-day-cover__action button");
      if (await open.count()) {
        await open.click();
        await snapshot(page, width, height, "day-07-open");
        const sky = page.getByRole("button", { name: /Sky Garden/i }).first();
        if (await sky.count()) {
          await sky.scrollIntoViewIfNeeded();
          await sky.click();
          await snapshot(page, width, height, "sky-garden");
        }
      }
    }
  }

  const manifest = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]');
    const registrations = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistrations() : [];
    return {
      href: link?.href ?? null,
      serviceWorkers: registrations.map((registration) => registration.scope),
    };
  });

  results.push({
    engine: engineName,
    viewport: `${width}x${height}`,
    status: response?.status() ?? null,
    initial,
    manifest,
  });
  await context.close();
}

await browser.close();
await fs.writeFile(
  path.join(output, "audit.json"),
  JSON.stringify({ appUrl, engine: engineName, results, errors }, null, 2),
);
console.log(JSON.stringify({ appUrl, engine: engineName, results, errors }, null, 2));
