import fs from "node:fs/promises";
import path from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve("node_modules", "playwright-core", ".local-browsers");
const { chromium, webkit } = await import("playwright-core");

const appUrl = process.env.APP_URL ?? "http://127.0.0.1:3100";
const outputRoot = path.resolve("screenshots", "iteration-12", "iphone17");
const approvalFile = path.resolve("screenshots", "iteration-12", "iteration-12-iphone17-approval.png");
const safeAreaCss = ":root{--ds-safe-top:47px!important;--ds-safe-right:0px!important;--ds-safe-bottom:34px!important;--ds-safe-left:0px!important}";
const viewports = [
  { name: "360x800", width: 360, height: 800 },
  { name: "390x844", width: 390, height: 844 },
  { name: "393x852", width: 393, height: 852 },
  { name: "412x915", width: 412, height: 915 },
  { name: "430x932", width: 430, height: 932 },
];

await fs.mkdir(outputRoot, { recursive: true });

function watch(page, errors) {
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) errors.push(`console: ${message.text()}`);
  });
}

async function settle(page, delay = 120) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(delay);
}

async function open(page, hash) {
  await page.goto("about:blank");
  await page.goto(`${appUrl}/${hash}`, { waitUntil: "networkidle", timeout: 60_000 });
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

async function auditShared(page, viewport) {
  return page.evaluate(({ viewport }) => {
    const nav = document.querySelector(".ds-bottom-navigation");
    if (!nav) throw new Error("BottomNavigation missing");
    const navRect = nav.getBoundingClientRect();
    const items = [...nav.querySelectorAll(".ds-bottom-navigation__item")];
    const itemAudits = items.map((item) => {
      const itemRect = item.getBoundingClientRect();
      const icon = item.querySelector(".ds-bottom-navigation__icon")?.getBoundingClientRect();
      const label = item.querySelector(".ds-bottom-navigation__label")?.getBoundingClientRect();
      if (!icon || !label) throw new Error("Navigation content missing");
      const contentTop = Math.min(icon.top, label.top);
      const contentBottom = Math.max(icon.bottom, label.bottom);
      return {
        targetHeight: itemRect.height,
        centerDelta: Math.abs((contentTop + contentBottom) / 2 - (itemRect.top + itemRect.bottom) / 2),
        display: getComputedStyle(item).display,
        direction: getComputedStyle(item).flexDirection,
      };
    });
    const scrolling = document.querySelector("[data-navigation-scroll]");
    return {
      viewport,
      navBottomClearance: innerHeight - navRect.bottom,
      navTop: navRect.top,
      itemAudits,
      scrollPaddingBottom: scrolling ? parseFloat(getComputedStyle(scrolling).paddingBottom) : null,
      overflowX: document.documentElement.scrollWidth - innerWidth,
    };
  }, { viewport });
}

async function auditCover(page, viewport) {
  return page.evaluate(({ viewport }) => {
    const cover = document.querySelector(".ds-day-cover.is-active");
    const header = cover?.querySelector(".ds-day-cover__header");
    const metadata = cover?.querySelector(".ds-day-cover__date");
    if (!cover || !header || !metadata) throw new Error("DayCover missing");
    const coverRect = cover.getBoundingClientRect();
    const metadataRect = metadata.getBoundingClientRect();
    return {
      viewport,
      metadataTop: metadataRect.top - coverRect.top,
      coverHeight: coverRect.height,
      viewportHeight: innerHeight,
      documentOverflowY: document.documentElement.scrollHeight - innerHeight,
      coverOverflowY: cover.scrollHeight - cover.clientHeight,
    };
  }, { viewport });
}

async function auditDetail(page, viewport) {
  return page.evaluate(({ viewport }) => {
    const header = document.querySelector(".ds-day-header");
    const close = document.querySelector(".ds-day-header__close");
    const route = document.querySelector(".ds-day-hero .ds-eyebrow");
    const title = document.querySelector(".ds-day-hero h1");
    const content = document.querySelector(".itinerary-content");
    if (!header || !close || !route || !title || !content) throw new Error("DayDetail anatomy missing");
    const lineCount = (element) => {
      const rect = element.getBoundingClientRect();
      return rect.height / parseFloat(getComputedStyle(element).lineHeight);
    };
    const headerRect = header.getBoundingClientRect();
    const closeRect = close.getBoundingClientRect();
    return {
      viewport,
      headerTop: headerRect.top,
      closeTop: closeRect.top,
      closeSize: { width: closeRect.width, height: closeRect.height },
      routeLines: lineCount(route),
      titleLines: lineCount(title),
      contentPaddingBottom: parseFloat(getComputedStyle(content).paddingBottom),
      overflowX: document.documentElement.scrollWidth - innerWidth,
    };
  }, { viewport });
}

function sharedFailures(audit) {
  return [
    Math.abs(audit.navBottomClearance - 44) > 1 && `navigation clearance ${audit.navBottomClearance}px (expected 44px in QA simulation)`,
    audit.itemAudits.some((item) => item.targetHeight < 44) && "navigation touch target below 44px",
    audit.itemAudits.some((item) => item.centerDelta > 1) && `navigation content off-center ${Math.max(...audit.itemAudits.map((item) => item.centerDelta)).toFixed(2)}px`,
    audit.itemAudits.some((item) => item.display !== "flex" || item.direction !== "column") && "navigation is not a shared centered flex column",
    audit.overflowX !== 0 && `horizontal overflow ${audit.overflowX}px`,
  ].filter(Boolean);
}

function coverFailures(audit) {
  return [
    audit.metadataTop < 59 && `cover metadata starts at ${audit.metadataTop}px`,
    audit.documentOverflowY !== 0 && `DayCover document overflow ${audit.documentOverflowY}px`,
    audit.coverOverflowY !== 0 && `DayCover internal overflow ${audit.coverOverflowY}px`,
  ].filter(Boolean);
}

function detailFailures(audit) {
  return [
    audit.headerTop !== 0 && `detail header starts at ${audit.headerTop}px`,
    audit.closeTop < 59 && `close control starts at ${audit.closeTop}px`,
    (audit.closeSize.width < 44 || audit.closeSize.height < 44) && `close target ${audit.closeSize.width}×${audit.closeSize.height}`,
    audit.routeLines > 2.15 && `route uses ${audit.routeLines.toFixed(1)} lines`,
    audit.titleLines > 4.15 && `title uses ${audit.titleLines.toFixed(1)} lines`,
    audit.contentPaddingBottom < 100 && `itinerary reserve ${audit.contentPaddingBottom}px`,
    audit.overflowX !== 0 && `detail horizontal overflow ${audit.overflowX}px`,
  ].filter(Boolean);
}

async function screenshot(page, name) {
  await page.screenshot({ path: path.join(outputRoot, name), fullPage: false });
}

async function showDayDetail(page, index) {
  await open(page, "#days");
  await selectDay(page, index);
  await page.locator(".ds-day-cover.is-active .ds-day-cover__action button").evaluate((button) => button.click());
  await page.locator(".day-open-layer").waitFor();
  await settle(page);
}

async function changeTab(page, name, selector) {
  await open(page, "#days");
  await page.getByRole("button", { name, exact: true }).click();
  await page.locator(selector).waitFor();
  await settle(page);
}

async function captureReferenceSet(page) {
  const covers = [[0, "01-daycover-06.png"], [1, "02-daycover-07.png"], [2, "03-daycover-08.png"], [6, "04-daycover-12.png"]];
  for (const [index, file] of covers) {
    await open(page, "#days");
    await selectDay(page, index);
    await screenshot(page, file);
  }
  for (const [index, file] of [[0, "05-daydetail-06.png"], [1, "06-daydetail-07.png"], [2, "07-daydetail-08.png"]]) {
    await showDayDetail(page, index);
    await screenshot(page, file);
  }
  await changeTab(page, "Guardados", ".saved-view");
  await screenshot(page, "08-guardados.png");
  await page.getByRole("button", { name: "Detalle" }).first().click();
  await page.locator(".ds-sheet").waitFor();
  await settle(page, 500);
  await screenshot(page, "09-saved-detail.png");
  await changeTab(page, "Viaje", ".trip-view");
  await screenshot(page, "10-viaje.png");
  await showDayDetail(page, 1);
  await page.getByRole("button", { name: /Añadir plan/i }).click();
  await page.locator(".ds-sheet").waitFor();
  await settle(page, 500);
  await screenshot(page, "11-add-plan.png");
  await showDayDetail(page, 1);
  await page.getByRole("button", { name: "Organizar", exact: true }).click();
  await page.locator(".organize-bar").waitFor();
  await settle(page);
  await screenshot(page, "12-organizar.png");
}

async function imageData(file) {
  return `data:image/png;base64,${(await fs.readFile(file)).toString("base64")}`;
}

async function renderApprovalBoard(browser) {
  const sources = await Promise.all(["02-daycover-07.png", "06-daydetail-07.png", "04-daycover-12.png"].map((file) => imageData(path.join(outputRoot, file))));
  const labels = ["DAYCOVER 07", "DAYDETAIL 07", "DAYCOVER 12"];
  const page = await browser.newPage({ viewport: { width: 1600, height: 1120 }, deviceScaleFactor: 1 });
  const devices = sources.map((src, index) => `<article><div class="device"><img src="${src}" alt="${labels[index]}"></div><h2>${labels[index]}</h2></article>`).join("");
  await page.setContent(`<!doctype html><html><head><style>
    *{box-sizing:border-box}body{margin:0;padding:52px;background:#f4f1ea;color:#161616;font-family:Arial,sans-serif}header{display:flex;justify-content:space-between;align-items:end;padding-bottom:20px;border-bottom:2px solid #161616}h1{margin:0;font-size:38px;letter-spacing:-.04em}header p,h2{margin:0;font:700 12px/1.2 monospace;letter-spacing:.06em}.devices{display:flex;justify-content:center;gap:54px;margin-top:44px}article{text-align:center}.device{width:393px;height:852px;padding:7px;border:3px solid #161616;border-radius:54px;background:#161616;box-shadow:0 20px 42px rgba(22,22,22,.16);overflow:hidden}.device img{display:block;width:100%;height:100%;border-radius:45px;object-fit:cover}h2{margin-top:18px}
  </style></head><body><header><h1>TRAZA · DEVICE FIT</h1><p>IPHONE 17 BASELINE · 393×852 · REAL CAPTURES</p></header><main class="devices">${devices}</main></body></html>`, { waitUntil: "load" });
  await page.evaluate(() => Promise.all([...document.images].map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => image.addEventListener("load", resolve, { once: true })))));
  await page.screenshot({ path: approvalFile, fullPage: true });
  await page.close();
}

const reports = [];
const failures = [];
for (const [engineName, engine, launchOptions] of [
  ["chromium", chromium, { executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true }],
  ["webkit", webkit, { headless: true }],
]) {
  const browser = await engine.launch(launchOptions);
  const engineReport = { engine: engineName, errors: [], viewports: [] };
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, screen: viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const page = await context.newPage();
    watch(page, engineReport.errors);
    await open(page, "#days");
    await selectDay(page, 1);
    const cover = await auditCover(page, viewport);
    const coverShared = await auditShared(page, viewport);
    failures.push(...coverFailures(cover).map((failure) => `${engineName}/${viewport.name}/cover: ${failure}`));
    failures.push(...sharedFailures(coverShared).map((failure) => `${engineName}/${viewport.name}/cover: ${failure}`));
    await page.locator(".ds-day-cover.is-active .ds-day-cover__action button").evaluate((button) => button.click());
    await page.locator(".day-open-layer").waitFor();
    await settle(page);
    const detail = await auditDetail(page, viewport);
    const detailShared = await auditShared(page, viewport);
    failures.push(...detailFailures(detail).map((failure) => `${engineName}/${viewport.name}/detail: ${failure}`));
    failures.push(...sharedFailures(detailShared).map((failure) => `${engineName}/${viewport.name}/detail: ${failure}`));
    if (viewport.name === "393x852") {
      const motifs = await page.evaluate(() => ({ detail: Boolean(document.querySelector(".ds-day-hero__motif .day-motif--london")) }));
      await page.getByRole("button", { name: /Cerrar el itinerario/i }).click();
      await page.locator(".day-open-layer").waitFor({ state: "detached" });
      const coverMotif = await page.evaluate(() => Boolean(document.querySelector(".ds-day-cover.is-active .day-motif--london")));
      if (!motifs.detail || !coverMotif) failures.push(`${engineName}/393x852: Day 07 does not reuse the canonical London motif`);
    }
    engineReport.viewports.push({ viewport, cover, coverShared, detail, detailShared });
    await context.close();
  }
  failures.push(...engineReport.errors.map((error) => `${engineName}: ${error}`));
  if (engineName === "chromium") {
    const context = await browser.newContext({ viewport: { width: 393, height: 852 }, screen: { width: 393, height: 852 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const page = await context.newPage();
    watch(page, engineReport.errors);
    await captureReferenceSet(page);
    await context.close();
    await renderApprovalBoard(browser);
  }
  reports.push(engineReport);
  await browser.close();
}

const summary = { pass: failures.length === 0, appUrl, simulatedSafeArea: { top: 47, bottom: 34 }, engines: reports.map((report) => ({ engine: report.engine, viewports: report.viewports.length, errors: report.errors })), failures };
await fs.writeFile(path.join(outputRoot, "validation.json"), JSON.stringify({ summary, reports }, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));
if (failures.length) throw new Error(`iPhone 17 validation failed with ${failures.length} issue(s)`);
