import fs from "node:fs/promises";
import path from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve("node_modules", "playwright-core", ".local-browsers");
const { chromium, webkit } = await import("playwright-core");

const appUrl = process.env.APP_URL ?? "http://127.0.0.1:3000";
const chromePath = process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const engine = process.env.PW_ENGINE === "webkit" ? "webkit" : "chromium";
const outputRoot = path.resolve("screenshots", "iteration-11-open-design", "after", engine);
const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];

await fs.mkdir(outputRoot, { recursive: true });
const browser = engine === "webkit"
  ? await webkit.launch({ headless: true })
  : await chromium.launch({ headless: true, executablePath: chromePath });
const report = [];

async function pressDeckKey(page, key) {
  await page.locator('[role="region"][aria-roledescription="deck"]').evaluate((element, pressedKey) => {
    element.dispatchEvent(new KeyboardEvent("keydown", { key: pressedKey, bubbles: true }));
  }, key);
}

async function swipeDeck(page, direction) {
  const box = await page.locator('[role="region"][aria-roledescription="deck"]').boundingBox();
  if (!box) throw new Error("Day deck not found");
  const startX = box.x + box.width * (direction === "next" ? .78 : .22);
  const endX = box.x + box.width * (direction === "next" ? .22 : .78);
  const y = box.y + box.height * .5;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  for (let step = 1; step <= 8; step += 1) {
    await page.mouse.move(startX + (endX - startX) * (step / 8), y);
    await page.waitForTimeout(24);
  }
  await page.mouse.up();
  await page.waitForTimeout(560);
}

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(appUrl, { waitUntil: "networkidle" });
  const deck = page.locator('[role="region"][aria-roledescription="deck"]');
  await deck.focus();
  await pressDeckKey(page, "Home");
  await page.waitForTimeout(260);

  await page.screenshot({ path: path.join(outputRoot, `daycover-${viewport.width}x${viewport.height}.png`) });
  const metrics = await page.evaluate(() => {
    const current = document.querySelector(".ds-day-deck__card.is-current .ds-day-cover");
    const open = current?.querySelector(".ds-day-cover__action button");
    const title = current?.querySelector(".ds-day-cover__copy h2");
    const kicker = current?.querySelector(".ds-day-cover__kicker");
    const nav = document.querySelector(".ds-bottom-navigation__item");
    const rect = (element) => element ? {
      left: Math.round(element.getBoundingClientRect().left),
      right: Math.round(element.getBoundingClientRect().right),
      width: Math.round(element.getBoundingClientRect().width),
      height: Math.round(element.getBoundingClientRect().height),
    } : null;
    const titleStyle = title ? getComputedStyle(title) : null;
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      cover: rect(current),
      open: rect(open),
      kickerFontSize: kicker ? getComputedStyle(kicker).fontSize : null,
      navFontSize: nav ? getComputedStyle(nav).fontSize : null,
      titleLines: title && titleStyle ? Math.round(title.getBoundingClientRect().height / Number.parseFloat(titleStyle.lineHeight)) : null,
    };
  });

  report.push({ viewport, ...metrics, errors });
  await page.close();
}

const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await page.goto(appUrl, { waitUntil: "networkidle" });
const deck = page.locator('[role="region"][aria-roledescription="deck"]');
await deck.focus();
await swipeDeck(page, "previous");
for (let index = 0; index < 8; index += 1) {
  await page.screenshot({ path: path.join(outputRoot, `day-${String(index + 6).padStart(2, "0")}-390x844.png`) });
  if (index < 7) {
    await swipeDeck(page, "next");
  }
}
await page.close();

const screenChecks = [];
const activityPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await activityPage.goto(appUrl, { waitUntil: "networkidle" });
await activityPage.locator(".ds-day-deck__card.is-current .ds-day-cover__action button").click();
await activityPage.waitForTimeout(420);
await activityPage.screenshot({ path: path.join(outputRoot, "day-open-390x844.png") });
const compactActivity = activityPage.locator(".activity-card:not(.activity-card--sky)").first();
await compactActivity.scrollIntoViewIfNeeded();
await compactActivity.screenshot({ path: path.join(outputRoot, "activity-card-390.png") });
screenChecks.push({ screen: "activity", documentWidth: await activityPage.evaluate(() => document.documentElement.scrollWidth), viewportWidth: 390 });
await activityPage.close();

const savedPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await savedPage.goto(appUrl, { waitUntil: "networkidle" });
await savedPage.getByRole("button", { name: "Guardados" }).click();
await savedPage.waitForTimeout(180);
await savedPage.screenshot({ path: path.join(outputRoot, "saved-390x844.png") });
const hardRockCard = savedPage.locator(".ds-saved-place-card").filter({ hasText: "Hard Rock Cafe" });
await hardRockCard.scrollIntoViewIfNeeded();
await hardRockCard.screenshot({ path: path.join(outputRoot, "saved-hard-rock-390.png") });
screenChecks.push({ screen: "saved", documentWidth: await savedPage.evaluate(() => document.documentElement.scrollWidth), viewportWidth: 390 });
await savedPage.close();

const tripPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await tripPage.goto(appUrl, { waitUntil: "networkidle" });
await tripPage.getByRole("button", { name: "Viaje" }).click();
await tripPage.waitForTimeout(180);
await tripPage.screenshot({ path: path.join(outputRoot, "trip-390x844.png") });
const flightSection = tripPage.locator(".ds-trip-section-card").first();
await flightSection.scrollIntoViewIfNeeded();
await flightSection.screenshot({ path: path.join(outputRoot, "trip-flight-390.png") });
screenChecks.push({ screen: "trip", documentWidth: await tripPage.evaluate(() => document.documentElement.scrollWidth), viewportWidth: 390 });
await tripPage.close();

await browser.close();

const finalReport = { covers: report, screens: screenChecks };
await fs.writeFile(path.join(outputRoot, "report.json"), JSON.stringify(finalReport, null, 2));
console.log(JSON.stringify(finalReport, null, 2));
