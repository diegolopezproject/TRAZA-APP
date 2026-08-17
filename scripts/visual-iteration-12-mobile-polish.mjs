import fs from "node:fs/promises";
import path from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve("node_modules", "playwright-core", ".local-browsers");
const { chromium, webkit } = await import("playwright-core");

const appUrl = process.env.APP_URL ?? "http://127.0.0.1:3100";
const root = path.resolve("screenshots", "iteration-12", "mobile-polish");
const viewports = [
  { name: "360x800", width: 360, height: 800 },
  { name: "390x844", width: 390, height: 844 },
  { name: "412x915", width: 412, height: 915 },
  { name: "430x932", width: 430, height: 932 },
];
const expectedBackgrounds = [
  "rgb(124, 58, 67)", "rgb(15, 90, 80)", "rgb(138, 63, 118)", "rgb(76, 57, 115)",
  "rgb(164, 69, 46)", "rgb(47, 79, 143)", "rgb(63, 90, 52)", "rgb(41, 46, 51)",
];

await fs.mkdir(root, { recursive: true });
const before = path.resolve("screenshots", "iteration-12-full-bleed-preview", "current-mobile-polish.png");
try { await fs.copyFile(before, path.join(root, "before-hard-bottom-cut.png")); } catch {}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function watch(page, errors) {
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) errors.push(`console: ${message.text()}`);
  });
}

async function settle(page, delay = 280) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(delay);
}

async function selectDay(page, index) {
  const stage = page.locator(".ds-day-deck__stage");
  await stage.focus();
  await page.keyboard.press("Home");
  for (let step = 0; step < index; step += 1) await page.keyboard.press("ArrowRight");
  await settle(page, 80);
}

async function auditCurrentCover(page, index, viewport) {
  return page.evaluate(({ index, viewport, expectedBackground }) => {
    const cover = document.querySelector(".ds-day-cover.is-active");
    const shell = document.querySelector(".app-shell--journey");
    const nav = document.querySelector(".ds-bottom-navigation");
    if (!cover || !shell || !nav) throw new Error("Missing Journey surface");
    const rect = (selector) => {
      const element = cover.querySelector(selector);
      if (!element) throw new Error(`Missing ${selector}`);
      return element.getBoundingClientRect();
    };
    const coverRect = cover.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    const headerRect = rect(".ds-day-cover__header");
    const titleRect = rect(".ds-day-cover__title h2");
    const artRect = rect(".ds-day-cover__art");
    const detailsRect = rect(".ds-day-cover__details");
    const actionRect = rect(".ds-day-cover__action");
    const titleStyle = getComputedStyle(cover.querySelector(".ds-day-cover__title h2"));
    const navItems = [...nav.querySelectorAll(".ds-bottom-navigation__item")].map((item) => item.getBoundingClientRect());
    return {
      index,
      viewport,
      background: getComputedStyle(cover).backgroundColor,
      shellBackground: getComputedStyle(shell).backgroundColor,
      expectedBackground,
      cover: { top: coverRect.top, bottom: coverRect.bottom, width: coverRect.width, height: coverRect.height },
      titleLines: titleRect.height / parseFloat(titleStyle.lineHeight),
      titleTypography: [titleStyle.fontFamily, titleStyle.fontSize, titleStyle.fontWeight, titleStyle.lineHeight, titleStyle.letterSpacing].join("|"),
      regionsInside: [headerRect, titleRect, detailsRect, actionRect].every((region) => region.left >= coverRect.left - .5 && region.right <= coverRect.right + .5 && region.top >= coverRect.top - .5 && region.bottom <= coverRect.bottom + .5),
      titleDetailsGap: detailsRect.top - titleRect.bottom,
      artDetailsGap: detailsRect.top - artRect.bottom,
      detailsActionGap: actionRect.top - detailsRect.bottom,
      actionNavGap: navRect.top - actionRect.bottom,
      nav: { left: navRect.left, top: navRect.top, width: navRect.width, height: navRect.height },
      equalNavItems: Math.max(...navItems.map((item) => item.width)) - Math.min(...navItems.map((item) => item.width)) < .1
        && Math.max(...navItems.map((item) => item.height)) - Math.min(...navItems.map((item) => item.height)) < .1,
      minNavTarget: Math.min(...navItems.map((item) => Math.min(item.width, item.height))),
      fractionCount: (cover.textContent?.match(/\d+\s*\/\s*8/g) ?? []).length,
      progressMarks: cover.querySelectorAll(".ds-day-cover__progress i").length,
      ctaHeight: rect(".ds-day-cover__action button").height,
      overflowX: document.documentElement.scrollWidth - innerWidth,
      overflowY: document.documentElement.scrollHeight - innerHeight,
      artBorder: getComputedStyle(cover.querySelector(".ds-day-cover__art")).borderWidth,
    };
  }, { index, viewport, expectedBackground: expectedBackgrounds[index] });
}

function coverFailures(audit) {
  return [
    audit.background !== audit.expectedBackground && `day ${audit.index}: wrong cover color`,
    audit.shellBackground !== audit.expectedBackground && `day ${audit.index}: shell does not continue the day color`,
    Math.abs(audit.cover.top) > .5 || Math.abs(audit.cover.bottom - audit.viewport.height) > .5 ? `day ${audit.index}: cover is not full viewport` : false,
    !audit.regionsInside && `day ${audit.index}: content outside cover`,
    audit.titleLines > 4.05 && `day ${audit.index}: ${audit.titleLines.toFixed(1)} title lines`,
    audit.titleDetailsGap < 0 && `day ${audit.index}: title/details collision`,
    audit.artDetailsGap < -4 && `day ${audit.index}: art/details collision`,
    audit.detailsActionGap < 12 && `day ${audit.index}: details/action gap`,
    audit.actionNavGap < 12 && `day ${audit.index}: action/navigation gap`,
    !audit.equalNavItems && `day ${audit.index}: unequal navigation items`,
    audit.minNavTarget < 44 && `day ${audit.index}: navigation target below 44px`,
    audit.fractionCount !== 1 && `day ${audit.index}: fraction count ${audit.fractionCount}`,
    audit.progressMarks !== 8 && `day ${audit.index}: progress segments`,
    audit.ctaHeight < 44 && `day ${audit.index}: CTA below 44px`,
    audit.overflowX !== 0 && `day ${audit.index}: horizontal document overflow`,
    audit.overflowY !== 0 && `day ${audit.index}: Journey scrolls vertically`,
    audit.artBorder !== "0px" && `day ${audit.index}: framed illustration`,
  ].filter(Boolean);
}

async function drag(page, dx, dy, hold) {
  const box = await page.locator(".ds-day-deck__stage").boundingBox();
  assert(box, "Missing DayDeck bounds");
  const start = { x: box.x + box.width * .62, y: box.y + box.height * .53 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  for (let step = 1; step <= 8; step += 1) {
    await page.mouse.move(start.x + dx * step / 8, start.y + dy * step / 8);
    await page.waitForTimeout(18);
  }
  if (hold) await hold();
  await page.waitForTimeout(70);
  await page.mouse.move(start.x + dx - Math.sign(dx || 1), start.y + dy - Math.sign(dy || 1));
  await page.mouse.up();
}

const reports = [];
const failures = [];
for (const [engineName, engine, executablePath] of [
  ["chromium", chromium, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"],
  ["webkit", webkit, path.resolve("node_modules", "playwright-core", ".local-browsers", "webkit-2336", "Playwright.exe")],
]) {
  const browser = await engine.launch(engineName === "chromium" ? { executablePath, headless: true } : { headless: true });
  const engineReport = { engine: engineName, errors: [], responsive: [], collection: [] };
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, screen: viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const page = await context.newPage();
    watch(page, engineReport.errors);
    await page.goto(appUrl, { waitUntil: "networkidle", timeout: 60_000 });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle", timeout: 60_000 });
    await settle(page);
    const day07 = await auditCurrentCover(page, 1, viewport);
    engineReport.responsive.push(day07);
    failures.push(...coverFailures(day07).map((failure) => `${engineName}/${viewport.name}: ${failure}`));
    await page.screenshot({ path: path.join(root, `${engineName}-day-07-${viewport.name}.png`) });

    if (viewport.name === "390x844") {
      for (let index = 0; index < 8; index += 1) {
        await selectDay(page, index);
        const audit = await auditCurrentCover(page, index, viewport);
        engineReport.collection.push(audit);
        failures.push(...coverFailures(audit).map((failure) => `${engineName}/collection: ${failure}`));
        await page.screenshot({ path: path.join(root, `${engineName}-day-${String(index + 6).padStart(2, "0")}.png`) });
      }
      assert(new Set(engineReport.collection.map((audit) => audit.titleTypography)).size === 1, `${engineName}: DayCover typography differs by day`);
    }
    await context.close();
  }
  failures.push(...engineReport.errors.map((error) => `${engineName}: ${error}`));
  reports.push(engineReport);
  await browser.close();
}

const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, screen: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, recordVideo: { dir: root, size: { width: 390, height: 844 } } });
const page = await context.newPage();
const sequenceErrors = [];
watch(page, sequenceErrors);
await page.goto(appUrl, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await settle(page);
await page.screenshot({ path: path.join(root, "sequence-01-day07-rest.png") });
const navBefore = await page.locator(".ds-bottom-navigation").boundingBox();

await drag(page, -48, 0, async () => {
  const state = await page.evaluate(() => ({ axis: document.querySelector(".ds-day-deck")?.getAttribute("data-axis"), progress: Number(document.querySelector(".ds-day-deck")?.getAttribute("data-drag-progress")), opacity: [...document.querySelectorAll(".ds-day-deck__card")].map((card) => getComputedStyle(card).opacity) }));
  assert(state.axis === "x" && state.progress > 0 && state.opacity.every((value) => value === "1"), `Drag is not direct: ${JSON.stringify(state)}`);
  await page.screenshot({ path: path.join(root, "sequence-02-cancel-mid-drag.png") });
});
await settle(page);
assert((await page.locator(".ds-day-cover.is-active .ds-day-cover__count").textContent()) === "2 / 8", "Canceled swipe changed day");
await page.screenshot({ path: path.join(root, "sequence-03-cancel-restored.png") });

await drag(page, -124, 0, async () => {
  const navDuring = await page.locator(".ds-bottom-navigation").boundingBox();
  assert(JSON.stringify(navDuring) === JSON.stringify(navBefore), "Navigation moved during deck drag");
  await page.screenshot({ path: path.join(root, "sequence-04-commit-mid-drag.png") });
});
await settle(page);
assert((await page.locator(".ds-day-cover.is-active .ds-day-cover__count").textContent()) === "3 / 8", "Committed swipe did not move exactly one day");
await page.screenshot({ path: path.join(root, "sequence-05-day08-settled.png") });

await selectDay(page, 0);
await drag(page, 220, 0, async () => {
  const progress = Number(await page.locator(".ds-day-deck").getAttribute("data-drag-progress"));
  assert(progress <= .1, `Edge resistance is too loose: ${progress}`);
  await page.screenshot({ path: path.join(root, "sequence-06-first-day-edge-resistance.png") });
});
await settle(page);
assert((await page.locator(".ds-day-cover.is-active .ds-day-cover__count").textContent()) === "1 / 8", "First-day edge looped");

await selectDay(page, 1);
await drag(page, 0, -104, async () => {
  assert((await page.locator(".ds-day-deck").getAttribute("data-axis")) === "y", "Vertical opening gesture did not lock vertically");
  await page.screenshot({ path: path.join(root, "sequence-07-open-vertical-drag.png") });
});
await page.waitForTimeout(150);
await page.screenshot({ path: path.join(root, "sequence-08-opening-continuity.png") });
await page.locator(".day-open-layer").waitFor();
await settle(page, 500);
await page.screenshot({ path: path.join(root, "sequence-09-day-detail.png") });
assert(new URL(page.url()).hash.includes("2026-08-07"), "Vertical gesture opened the wrong day");

await page.goBack();
await page.waitForTimeout(70);
await page.screenshot({ path: path.join(root, "sequence-10-android-back-transition.png") });
await page.locator(".day-open-layer").waitFor({ state: "detached" });
await settle(page);
assert((await page.locator(".ds-day-cover.is-active .ds-day-cover__count").textContent()) === "2 / 8", "Android Back did not restore Day 07");

await page.locator(".ds-day-cover.is-active .ds-day-cover__action button").click();
await page.locator(".day-open-layer").waitFor();
await settle(page, 450);
const zone = page.locator(".day-open-layer .app-back-swipe-zone");
const zoneBox = await zone.boundingBox();
assert(zoneBox, "DayDetail has no coarse-pointer back edge");
await page.mouse.move(zoneBox.x + zoneBox.width / 2, zoneBox.y + 300);
await page.mouse.down();
await page.mouse.move(zoneBox.x + 155, zoneBox.y + 300, { steps: 10 });
await page.screenshot({ path: path.join(root, "sequence-11-edge-back-progress.png") });
await page.mouse.up();
await page.locator(".day-open-layer").waitFor({ state: "detached" });
await settle(page);
assert((await page.locator(".ds-day-cover.is-active .ds-day-cover__count").textContent()) === "2 / 8", "Edge Back did not restore Day 07");

await page.locator(".ds-day-cover.is-active .ds-day-cover__action button").click();
await page.locator(".day-open-layer").waitFor();
await settle(page, 450);
await page.getByRole("button", { name: /Cerrar día/i }).click();
await page.locator(".day-open-layer").waitFor({ state: "detached" });
await settle(page);
assert((await page.locator(".ds-day-cover.is-active .ds-day-cover__count").textContent()) === "2 / 8", "Close button did not restore Day 07");
await page.screenshot({ path: path.join(root, "sequence-12-all-returns-restored.png") });
failures.push(...sequenceErrors.map((error) => `sequence: ${error}`));

const video = page.video();
await context.close();
if (video) {
  const generatedVideo = await video.path();
  await fs.copyFile(generatedVideo, path.join(root, "mobile-polish-sequences.webm"));
}
await browser.close();

const summary = {
  pass: failures.length === 0,
  appUrl,
  engines: reports.map((report) => ({ engine: report.engine, responsive: report.responsive.length, collection: report.collection.length, errors: report.errors })),
  sequences: ["cancel", "commit-one-day", "edge-resistance", "vertical-open", "android-back", "edge-back", "close-button"],
  failures,
};
await fs.writeFile(path.join(root, "validation.json"), JSON.stringify({ summary, reports }, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));
if (failures.length) throw new Error(`Iteration 12 mobile polish failed with ${failures.length} issue(s)`);
