import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve("node_modules", "playwright-core", ".local-browsers");
const { chromium, webkit } = await import("playwright-core");

const appUrl = process.env.APP_URL ?? "https://traza-app-beige.vercel.app/";
const storybookUrl = "http://127.0.0.1:6111";
const root = path.resolve("screenshots", "iteration-11-open-design", "before");
const viewports = [
  { name: "360x800", width: 360, height: 800 },
  { name: "390x844", width: 390, height: 844 },
  { name: "412x915", width: 412, height: 915 },
  { name: "430x932", width: 430, height: 932 },
];
const canonical = viewports[1];
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2" };

await fs.mkdir(root, { recursive: true });

const staticRoot = path.resolve("storybook-static");
const storyServer = createServer(async (request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url ?? "/", storybookUrl).pathname);
  const relative = requestPath === "/" ? "index.html" : requestPath.slice(1);
  const target = path.resolve(staticRoot, relative);
  if (!target.startsWith(staticRoot)) { response.writeHead(403).end(); return; }
  try {
    const stat = await fs.stat(target);
    const file = stat.isDirectory() ? path.join(target, "index.html") : target;
    response.writeHead(200, { "Content-Type": mime[path.extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(response);
  } catch { response.writeHead(404).end("Not found"); }
});

await new Promise((resolve) => storyServer.listen(6111, "127.0.0.1", resolve));

function watch(page, errors) {
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) errors.push(`console: ${message.text()}`);
  });
}

async function settle(page, delay = 320) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(delay);
}

async function reset(page) {
  await page.goto(appUrl, { waitUntil: "networkidle", timeout: 60_000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle", timeout: 60_000 });
  await settle(page, 500);
}

async function selectDay(page, index) {
  const stage = page.locator(".ds-day-deck__stage");
  await stage.focus();
  await page.keyboard.press("Home");
  for (let step = 0; step < index; step += 1) await page.keyboard.press("ArrowRight");
  await settle(page, 150);
}

async function capture(page, output, file, options = {}) {
  await settle(page, 80);
  await page.screenshot({ path: path.join(output, file), ...options });
}

async function computedAudit(page) {
  return page.evaluate(() => {
    const sample = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        selector,
        rect: { x: +rect.x.toFixed(1), y: +rect.y.toFixed(1), width: +rect.width.toFixed(1), height: +rect.height.toFixed(1) },
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        color: style.color,
        backgroundColor: style.backgroundColor,
        border: style.border,
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
      };
    };
    const stage = document.querySelector(".ds-day-deck__stage")?.getBoundingClientRect();
    const cover = document.querySelector(".ds-day-cover.is-active")?.getBoundingClientRect();
    const art = document.querySelector(".ds-day-cover.is-active .ds-day-cover__art")?.getBoundingClientRect();
    const copy = document.querySelector(".ds-day-cover.is-active .ds-day-cover__copy")?.getBoundingClientRect();
    const nav = document.querySelector(".ds-bottom-navigation")?.getBoundingClientRect();
    const overlaps = (a, b) => Boolean(a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top);
    return {
      viewport: { width: innerWidth, height: innerHeight },
      documentOverflow: { x: document.documentElement.scrollWidth - innerWidth, y: document.documentElement.scrollHeight - innerHeight },
      activeCards: document.querySelectorAll(".ds-day-cover.is-active").length,
      mountedCards: document.querySelectorAll(".ds-day-deck__card").length,
      mobileArrows: [...document.querySelectorAll("button")].filter((button) => /Día anterior|Día siguiente/i.test(button.getAttribute("aria-label") ?? "")).length,
      geometry: { stage, cover, nav, artCopyOverlap: overlaps(art, copy) },
      fonts: [...document.fonts].map((font) => ({ family: font.family, weight: font.weight, status: font.status })),
      samples: [
        sample("body"),
        sample(".ds-day-cover.is-active .ds-day-cover__kicker"),
        sample(".ds-day-cover.is-active .ds-day-cover__number"),
        sample(".ds-day-cover.is-active .ds-day-cover__copy h2"),
        sample(".ds-day-cover.is-active .ds-day-cover__copy p"),
        sample(".ds-day-cover.is-active .ds-day-cover__status"),
        sample(".ds-bottom-navigation__item"),
      ],
    };
  });
}

async function captureCanonicalFlow(page, output, evidence) {
  for (const [index, file] of [[0, "02-day-06.png"], [1, "03-day-07.png"], [3, "04-day-09.png"], [4, "05-day-10.png"]]) {
    await selectDay(page, index);
    await capture(page, output, file);
  }

  await selectDay(page, 1);
  const stage = page.locator(".ds-day-deck__stage");
  const indicator = page.locator(".ds-day-deck__indicator");
  const before = Number(await indicator.getAttribute("aria-valuenow"));
  const box = await stage.boundingBox();
  if (!box) throw new Error("No DayDeck bounds");
  const start = { x: box.x + box.width * 0.7, y: box.y + box.height * 0.55 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x - box.width * 0.38, start.y, { steps: 10 });
  await capture(page, output, "06-swipe-intermediate.png");
  await page.mouse.up();
  await settle(page, 420);
  const after = Number(await indicator.getAttribute("aria-valuenow"));
  evidence.swipe = { before, after, delta: after - before, oneDayMaximum: Math.abs(after - before) <= 1 };

  await selectDay(page, 1);
  await page.locator(".ds-day-cover.is-active .ds-day-cover__action button").click();
  await page.locator(".day-open-layer").waitFor();
  await settle(page, 500);
  await capture(page, output, "07-day-open.png");
  await page.locator(".itinerary-actions").screenshot({ path: path.join(output, "08-day-actions.png") });

  const itinerary = page.locator(".itinerary-scroll");
  const activityEvidence = [];
  for (const [selector, file, label] of [
    [".activity-card--sky", "09-activity-confirmed-featured.png", "featured-confirmed"],
    [".activity-card--intention", "10-activity-flexible.png", "intention"],
  ]) {
    const target = page.locator(selector).first();
    if (await target.count()) {
      await target.scrollIntoViewIfNeeded();
      await target.screenshot({ path: path.join(output, file) });
      activityEvidence.push({ label, selector, present: true });
    } else activityEvidence.push({ label, selector, present: false });
  }
  evidence.activities = activityEvidence;
  await itinerary.evaluate((element) => { element.scrollTop = 0; });

  const skyButton = page.getByRole("button", { name: /Ver detalles: Sky Garden/i });
  await skyButton.scrollIntoViewIfNeeded();
  await skyButton.click();
  await page.locator(".detail-layer").waitFor();
  await settle(page, 650);
  await capture(page, output, "12-activity-detail.png");
  const nearby = page.locator(".nearby-block");
  if (await nearby.count()) {
    await nearby.scrollIntoViewIfNeeded();
    await nearby.screenshot({ path: path.join(output, "11-nearby-option.png") });
    activityEvidence.push({ label: "nearby", selector: ".nearby-block", present: true });
  } else activityEvidence.push({ label: "nearby", selector: ".nearby-block", present: false });
  await page.evaluate(() => history.back());
  await page.locator(".detail-layer").waitFor({ state: "detached" });
  await page.evaluate(() => history.back());
  await page.locator(".day-open-layer").waitFor({ state: "detached" });

  await page.getByRole("button", { name: "Guardados" }).click();
  await settle(page, 350);
  await capture(page, output, "13-saved.png");
  const savedCard = page.locator(".ds-saved-place-card").filter({ hasText: "Hard Rock Cafe" }).first();
  await savedCard.scrollIntoViewIfNeeded();
  await savedCard.screenshot({ path: path.join(output, "14-saved-place-card.png") });
  await savedCard.getByRole("button", { name: "Detalle" }).click();
  await page.locator(".ds-sheet").waitFor();
  await settle(page, 500);
  await capture(page, output, "15-saved-detail.png");
  await page.evaluate(() => history.back());
  await page.locator(".ds-sheet").waitFor({ state: "detached" });
  await page.getByRole("button", { name: /Añadir lugar/i }).click();
  await page.locator(".ds-sheet").waitFor();
  await settle(page, 400);
  await capture(page, output, "16-place-form.png");
  await page.evaluate(() => history.back());
  await page.locator(".ds-sheet").waitFor({ state: "detached" });

  await page.getByRole("button", { name: "Viaje" }).click();
  await settle(page, 350);
  await capture(page, output, "17-trip.png");
  await page.locator(".ds-flight-ticket").first().screenshot({ path: path.join(output, "18-flight.png") });
  const hotel = page.locator(".travel-doc--stay");
  await hotel.scrollIntoViewIfNeeded();
  await hotel.screenshot({ path: path.join(output, "19-hotel.png") });
  await page.locator(".ds-bottom-navigation").screenshot({ path: path.join(output, "20-bottom-navigation.png") });

  evidence.screenStyles = await page.evaluate(() => {
    const style = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const computed = getComputedStyle(element);
      return { fontFamily: computed.fontFamily, fontSize: computed.fontSize, fontWeight: computed.fontWeight, lineHeight: computed.lineHeight, border: computed.border, borderRadius: computed.borderRadius, boxShadow: computed.boxShadow, backgroundColor: computed.backgroundColor, color: computed.color };
    };
    return {
      savedHeader: style(".saved-header"),
      savedTitle: style(".saved-header h1"),
      savedCard: style(".ds-saved-place-card"),
      savedTag: style(".ds-saved-place-card .ds-tag"),
      tripHeader: style(".trip-header"),
      tripSection: style(".ds-trip-section-card"),
      flight: style(".ds-flight-ticket"),
      nav: style(".ds-bottom-navigation"),
    };
  });
}

async function captureStorybook(browser, engineName, output, errors) {
  const context = await browser.newContext({ viewport: { width: 820, height: 932 } });
  const page = await context.newPage();
  watch(page, errors);
  const stories = [
    ["patterns-daycover-lab--long-title", "storybook-day-cover-long-title.png"],
    ["patterns-daycover-lab--all-eight-chapters", "storybook-day-cover-all-eight.png"],
    ["patterns-product-patterns--journey", "storybook-journey.png"],
    ["patterns-product-patterns--saved", "storybook-saved.png"],
    ["patterns-product-patterns--trip", "storybook-trip.png"],
  ];
  const results = [];
  for (const [id, file] of stories) {
    const response = await page.goto(`${storybookUrl}/iframe.html?id=${id}&viewMode=story`, { waitUntil: "networkidle", timeout: 30_000 });
    await settle(page, 200);
    const found = Boolean(response?.ok()) && (await page.locator("#storybook-root").count()) > 0;
    if (found) await page.screenshot({ path: path.join(output, file), fullPage: true });
    results.push({ id, found, file });
  }
  await context.close();
  return { engine: engineName, stories: results };
}

const reports = [];
try {
  for (const [engineName, engine, executablePath] of [
    ["chromium", chromium, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"],
    ["webkit", webkit, path.resolve("node_modules", "playwright-core", ".local-browsers", "webkit-2336", "Playwright.exe")],
  ]) {
    const output = path.join(root, engineName);
    await fs.mkdir(output, { recursive: true });
    const browser = await engine.launch({ executablePath, headless: true });
    const errors = [];
    const matrix = [];
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport, screen: viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
      const page = await context.newPage();
      watch(page, errors);
      await reset(page);
      await selectDay(page, 1);
      await capture(page, output, `01-deck-${viewport.name}.png`);
      const audit = await computedAudit(page);
      matrix.push({ name: viewport.name, ...audit });
      await context.close();
    }

    const context = await browser.newContext({ viewport: canonical, screen: canonical, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const page = await context.newPage();
    watch(page, errors);
    await reset(page);
    const evidence = {};
    await captureCanonicalFlow(page, output, evidence);

    const reduced = await browser.newContext({ viewport: canonical, screen: canonical, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const reducedPage = await reduced.newPage();
    watch(reducedPage, errors);
    await reset(reducedPage);
    evidence.reducedMotion = await reducedPage.evaluate(() => ({ matches: matchMedia("(prefers-reduced-motion: reduce)").matches, durations: getComputedStyle(document.documentElement).getPropertyValue("--ds-duration-base").trim() }));
    await reduced.close();

    const storybook = await captureStorybook(browser, engineName, output, errors);
    await context.close();
    await browser.close();
    const report = { engine: engineName, appUrl, commit: "85f3fb0478d9b9a0044324fe74d0277d3ae1b1b5", matrix, evidence, storybook, errors };
    await fs.writeFile(path.join(output, "audit.json"), JSON.stringify(report, null, 2));
    reports.push(report);
  }
} finally {
  await new Promise((resolve) => storyServer.close(resolve));
}

await fs.writeFile(path.join(root, "summary.json"), JSON.stringify(reports, null, 2));
console.log(JSON.stringify(reports.map((report) => ({ engine: report.engine, matrix: report.matrix.map(({ name, documentOverflow, mountedCards, mobileArrows }) => ({ name, documentOverflow, mountedCards, mobileArrows })), swipe: report.evidence.swipe, reducedMotion: report.evidence.reducedMotion, errors: report.errors })), null, 2));
