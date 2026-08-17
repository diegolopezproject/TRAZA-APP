import fs from "node:fs/promises";
import path from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve("node_modules", "playwright-core", ".local-browsers");
const { chromium, webkit } = await import("playwright-core");

const appUrl = process.env.APP_URL ?? "http://127.0.0.1:3100";
const outputRoot = path.resolve("screenshots", "iteration-12", "final-micro-polish");
const safeAreaCss = ":root{--ds-safe-top:47px!important;--ds-safe-right:0px!important;--ds-safe-bottom:34px!important;--ds-safe-left:0px!important}";
const viewports = [
  { name: "360x800", width: 360, height: 800 },
  { name: "390x844", width: 390, height: 844 },
  { name: "393x852", width: 393, height: 852 },
  { name: "412x915", width: 412, height: 915 },
  { name: "430x932", width: 430, height: 932 },
];

await fs.mkdir(outputRoot, { recursive: true });

async function settle(page, delay = 100) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(delay);
}

async function openRoot(page) {
  await page.goto("about:blank");
  await page.goto(`${appUrl}/#days`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.addStyleTag({ content: safeAreaCss });
  await settle(page);
}

async function selectDay(page, index) {
  const stage = page.locator(".ds-day-deck__stage");
  await stage.focus();
  await page.keyboard.press("Home");
  for (let step = 0; step < index; step += 1) await page.keyboard.press("ArrowRight");
  await settle(page);
}

async function openDay(page, index) {
  await openRoot(page);
  await selectDay(page, index);
  await page.locator(".ds-day-cover.is-active .ds-day-cover__action button").evaluate((button) => button.click());
  await page.locator(".day-open-layer").waitFor();
  await settle(page);
}

async function auditDetail(page, viewport, index) {
  return page.evaluate(({ viewport, index }) => {
    const hero = document.querySelector(".open-day-hero");
    const body = document.querySelector(".ds-day-hero");
    const copy = document.querySelector(".ds-day-hero__copy");
    const motif = document.querySelector(".ds-day-hero__motif");
    const motifGraphic = motif?.querySelector("svg");
    const title = document.querySelector(".ds-day-hero h1");
    const actions = document.querySelector(".itinerary-actions");
    if (!hero || !body || !copy || !motif || !motifGraphic || !title || !actions) throw new Error("DayDetail anatomy missing");
    const rect = (element) => {
      const value = element.getBoundingClientRect();
      return { top: value.top, bottom: value.bottom, height: value.height };
    };
    const titleRect = title.getBoundingClientRect();
    return {
      viewport,
      index,
      hero: rect(hero),
      body: rect(body),
      copy: rect(copy),
      motif: rect(motif),
      motifGraphic: rect(motifGraphic),
      actions: rect(actions),
      bodyMinHeight: getComputedStyle(body).minHeight,
      titleLines: titleRect.height / parseFloat(getComputedStyle(title).lineHeight),
      overflowX: document.documentElement.scrollWidth - innerWidth,
    };
  }, { viewport, index });
}

async function auditNavigation(page, active) {
  return page.evaluate((active) => {
    const nav = document.querySelector(".ds-bottom-navigation");
    const item = nav?.querySelector(".ds-bottom-navigation__item.is-active");
    const pill = item?.querySelector(".ds-bottom-navigation__active-pill");
    const icon = item?.querySelector(".ds-bottom-navigation__icon");
    const label = item?.querySelector(".ds-bottom-navigation__label");
    if (!nav || !item || !pill || !icon || !label) throw new Error("Active navigation anatomy missing");
    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const pillRect = pill.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    const contentTop = Math.min(iconRect.top, labelRect.top);
    const contentBottom = Math.max(iconRect.bottom, labelRect.bottom);
    return {
      active,
      nav: { width: navRect.width, height: navRect.height, bottomClearance: innerHeight - navRect.bottom },
      pill: { width: pillRect.width, height: pillRect.height },
      insets: { top: pillRect.top - navRect.top, right: navRect.right - pillRect.right, bottom: navRect.bottom - pillRect.bottom, left: pillRect.left - navRect.left },
      contentCenterDelta: Math.abs((contentTop + contentBottom) / 2 - (itemRect.top + itemRect.bottom) / 2),
      itemHeight: itemRect.height,
    };
  }, active);
}

function detailFailures(audit) {
  return [
    audit.bodyMinHeight !== "0px" && `day ${audit.index}: fixed body min-height ${audit.bodyMinHeight}`,
    audit.copy.bottom > audit.hero.bottom && `day ${audit.index}: copy outside hero`,
    audit.motif.bottom > audit.hero.bottom && `day ${audit.index}: motif outside hero`,
    audit.motifGraphic.bottom > audit.hero.bottom && `day ${audit.index}: motif graphic outside hero`,
    audit.hero.bottom - audit.motifGraphic.bottom < 12 && `day ${audit.index}: motif too close to hero edge`,
    audit.hero.bottom - audit.motifGraphic.bottom > 36 && `day ${audit.index}: excessive motif-to-edge gap`,
    audit.titleLines > 4.15 && `day ${audit.index}: title uses ${audit.titleLines.toFixed(1)} lines`,
    audit.overflowX !== 0 && `day ${audit.index}: horizontal overflow ${audit.overflowX}px`,
  ].filter(Boolean);
}

function navigationFailures(audit) {
  return [
    Math.abs(audit.insets.top - audit.insets.bottom) > .5 && `${audit.active}: asymmetric vertical insets ${audit.insets.top}/${audit.insets.bottom}`,
    audit.contentCenterDelta > 1 && `${audit.active}: icon/label off-center ${audit.contentCenterDelta.toFixed(2)}px`,
    audit.itemHeight < 44 && `${audit.active}: touch target below 44px`,
    Math.abs(audit.nav.bottomClearance - 44) > 1 && `${audit.active}: safe-bottom position changed`,
  ].filter(Boolean);
}

async function activateTab(page, label, selector) {
  await openRoot(page);
  if (label !== "Días") {
    await page.getByRole("button", { name: label, exact: true }).click();
    await page.locator(selector).waitFor();
    await settle(page);
  }
}

async function asDataUrl(file) {
  return `data:image/png;base64,${(await fs.readFile(file)).toString("base64")}`;
}

async function renderStatesBoard(browser, captures) {
  const items = await Promise.all(captures.map(async ({ label, file }) => ({ label, src: await asDataUrl(file) })));
  const page = await browser.newPage({ viewport: { width: 1200, height: 560 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><style>*{box-sizing:border-box}body{margin:0;padding:48px;background:#f4f1ea;color:#161616;font-family:Arial,sans-serif}header{display:flex;justify-content:space-between;align-items:end;padding-bottom:18px;border-bottom:2px solid #161616}h1{margin:0;font-size:34px;letter-spacing:-.04em}header p,h2{margin:0;font:700 12px/1.2 monospace;letter-spacing:.06em}.states{display:grid;gap:30px;margin-top:34px}article{display:grid;grid-template-columns:140px 1fr;align-items:center;gap:28px}h2{text-align:right}img{display:block;width:704px;height:124px;image-rendering:auto}</style></head><body><header><h1>TRAZA · ACTIVE NAV GEOMETRY</h1><p>393×852 · REAL COMPONENT CROPS</p></header><main class="states">${items.map((item) => `<article><h2>${item.label.toUpperCase()}</h2><img src="${item.src}"></article>`).join("")}</main></body></html>`, { waitUntil: "load" });
  await page.evaluate(() => Promise.all([...document.images].map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => image.addEventListener("load", resolve, { once: true })))));
  await page.screenshot({ path: path.join(outputRoot, "C-navigation-three-states-393x852.png") });
  await page.close();
}

const failures = [];
const reports = [];
for (const [engineName, engine, launchOptions] of [
  ["chromium", chromium, { executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true }],
  ["webkit", webkit, { headless: true }],
]) {
  const browser = await engine.launch(launchOptions);
  const report = { engine: engineName, responsive: [], collection: [], navigation: [] };
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, screen: viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const page = await context.newPage();
    await openDay(page, 1);
    const audit = await auditDetail(page, viewport, 7);
    failures.push(...detailFailures(audit).map((failure) => `${engineName}/${viewport.name}: ${failure}`));
    report.responsive.push(audit);
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 393, height: 852 }, screen: { width: 393, height: 852 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  for (let index = 0; index < 8; index += 1) {
    await openDay(page, index);
    const audit = await auditDetail(page, { name: "393x852", width: 393, height: 852 }, index + 6);
    failures.push(...detailFailures(audit).map((failure) => `${engineName}/collection: ${failure}`));
    report.collection.push(audit);
    if (engineName === "chromium" && index === 1) await page.screenshot({ path: path.join(outputRoot, "A-daydetail-07-393x852.png") });
  }
  const crops = [];
  for (const [label, selector] of [["Días", ".journey-view"], ["Guardados", ".saved-view"], ["Viaje", ".trip-view"]]) {
    await activateTab(page, label, selector);
    const audit = await auditNavigation(page, label);
    failures.push(...navigationFailures(audit).map((failure) => `${engineName}/navigation: ${failure}`));
    report.navigation.push(audit);
    if (engineName === "chromium") {
      const file = path.join(outputRoot, `.nav-${label.toLowerCase()}.png`);
      await page.locator(".ds-bottom-navigation").screenshot({ path: file, scale: "device" });
      crops.push({ label, file });
      if (label === "Días") {
        const zoom = await browser.newPage({ viewport: { width: 1120, height: 360 }, deviceScaleFactor: 1 });
        const src = await asDataUrl(file);
        await zoom.setContent(`<!doctype html><html><head><style>*{box-sizing:border-box}body{margin:0;padding:44px;background:#f4f1ea;display:grid;place-items:center}img{display:block;width:1056px;height:186px}</style></head><body><img src="${src}"></body></html>`, { waitUntil: "load" });
        await zoom.screenshot({ path: path.join(outputRoot, "B-bottom-navigation-active-zoom-393x852.png") });
        await zoom.close();
      }
    }
  }
  if (engineName === "chromium") {
    await renderStatesBoard(browser, crops);
    await Promise.all(crops.map(({ file }) => fs.unlink(file)));
  }
  await context.close();
  reports.push(report);
  await browser.close();
}

const summary = { pass: failures.length === 0, appUrl, engines: reports.map((report) => ({ engine: report.engine, responsive: report.responsive.length, collection: report.collection.length, navigation: report.navigation.length })), failures };
await fs.writeFile(path.join(outputRoot, "validation.json"), JSON.stringify({ summary, reports }, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (failures.length) throw new Error(`Final micro-polish failed with ${failures.length} issue(s)`);
