import fs from "node:fs/promises";
import path from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve("node_modules", "playwright-core", ".local-browsers");
const { chromium, webkit } = await import("playwright-core");

const appUrl = process.env.APP_URL ?? "http://127.0.0.1:3100";
const outputRoot = path.resolve("screenshots", "iteration-12");
const rawRoot = path.join(outputRoot, "day-system-raw");
const viewports = [
  { name: "360x800", width: 360, height: 800 },
  { name: "390x844", width: 390, height: 844 },
  { name: "412x915", width: 412, height: 915 },
  { name: "430x932", width: 430, height: 932 },
];
const expectedBase = ["rgb(124, 58, 67)", "rgb(15, 90, 80)", "rgb(138, 63, 118)", "rgb(76, 57, 115)", "rgb(164, 69, 46)", "rgb(47, 79, 143)", "rgb(63, 90, 52)", "rgb(41, 46, 51)"];
const expectedSurface = ["rgb(200, 168, 166)", "rgb(154, 182, 170)", "rgb(206, 170, 191)", "rgb(178, 168, 189)", "rgb(217, 173, 158)", "rgb(164, 178, 208)", "rgb(171, 182, 159)", "rgb(160, 161, 158)"];

await fs.mkdir(rawRoot, { recursive: true });

function watch(page, errors) {
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) errors.push(`console: ${message.text()}`);
  });
}

async function settle(page, delay = 80) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(delay);
}

async function selectDay(page, index) {
  const stage = page.locator(".ds-day-deck__stage");
  await stage.focus();
  await page.keyboard.press("Home");
  for (let step = 0; step < index; step += 1) await page.keyboard.press("ArrowRight");
  await settle(page);
}

async function auditCover(page, index, viewport) {
  return page.evaluate(({ index, viewport, expected }) => {
    const cover = document.querySelector(".ds-day-cover.is-active");
    const nav = document.querySelector(".ds-bottom-navigation");
    if (!cover || !nav) throw new Error("Missing DayCover surface");
    const get = (selector) => {
      const element = cover.querySelector(selector);
      if (!element) throw new Error(`Missing ${selector}`);
      return element.getBoundingClientRect();
    };
    const art = get(".ds-day-cover__art");
    const details = get(".ds-day-cover__details");
    const button = get(".ds-day-cover__action button");
    const progress = get(".ds-day-cover__progress");
    const navRect = nav.getBoundingClientRect();
    const title = cover.querySelector(".ds-day-cover__title h2");
    const titleRect = title.getBoundingClientRect();
    const titleStyle = getComputedStyle(title);
    return {
      index,
      viewport,
      background: getComputedStyle(cover).backgroundColor,
      expected,
      artMetadataGap: details.top - art.bottom,
      metadataCtaGap: button.top - details.bottom,
      ctaProgressGap: progress.top - button.bottom,
      progressNavGap: navRect.top - progress.bottom,
      titleLines: titleRect.height / parseFloat(titleStyle.lineHeight),
      overflowX: document.documentElement.scrollWidth - innerWidth,
      overflowY: document.documentElement.scrollHeight - innerHeight,
    };
  }, { index, viewport, expected: expectedBase[index] });
}

async function auditDetail(page, index, viewport) {
  return page.evaluate(({ index, viewport, expected }) => {
    const hero = document.querySelector(".open-day-hero");
    const layer = document.querySelector(".day-open-layer");
    if (!hero || !layer) throw new Error("Missing DayDetail hero");
    const parseRgb = (value) => (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const luminance = (value) => {
      const channels = parseRgb(value).map((channel) => channel / 255).map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
      return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
    };
    const contrast = (left, right) => {
      const values = [luminance(left), luminance(right)].sort((a, b) => b - a);
      return (values[0] + .05) / (values[1] + .05);
    };
    const style = getComputedStyle(hero);
    const background = style.backgroundColor;
    const selectors = [".ds-day-header__close", ".ds-day-header > span:nth-child(2)", ".ds-day-header > span:last-child", ".ds-day-hero .ds-eyebrow", ".ds-day-hero h1", ".ds-day-hero__copy > p"];
    const contrastByRole = Object.fromEntries(selectors.map((selector) => {
      const element = hero.querySelector(selector);
      if (!element) throw new Error(`Missing ${selector}`);
      return [selector, contrast(background, getComputedStyle(element).color)];
    }));
    const rect = hero.getBoundingClientRect();
    return {
      index,
      viewport,
      base: style.getPropertyValue("--day-base").trim(),
      surface: style.getPropertyValue("--day-surface").trim(),
      background,
      expected,
      color: style.color,
      contrastByRole,
      minimumContrast: Math.min(...Object.values(contrastByRole)),
      hero: { top: rect.top, bottom: rect.bottom, height: rect.height },
      bottomRadius: [style.borderBottomLeftRadius, style.borderBottomRightRadius],
      itinerarySurface: getComputedStyle(layer).backgroundColor,
      overflowX: document.documentElement.scrollWidth - innerWidth,
    };
  }, { index, viewport, expected: expectedSurface[index] });
}

function failuresForCover(audit) {
  return [
    audit.background !== audit.expected && `wrong dayBase ${audit.background}`,
    audit.artMetadataGap < 16 && `art→metadata ${audit.artMetadataGap.toFixed(1)}px`,
    audit.artMetadataGap > 28 && `art→metadata excessively loose ${audit.artMetadataGap.toFixed(1)}px`,
    audit.metadataCtaGap < 16 && `metadata→CTA ${audit.metadataCtaGap.toFixed(1)}px`,
    audit.ctaProgressGap < 8 && `CTA→progress ${audit.ctaProgressGap.toFixed(1)}px`,
    audit.progressNavGap < 12 && `progress→nav ${audit.progressNavGap.toFixed(1)}px`,
    audit.titleLines > 4.05 && `title ${audit.titleLines.toFixed(1)} lines`,
    audit.overflowX !== 0 && `horizontal overflow ${audit.overflowX}px`,
    audit.overflowY !== 0 && `vertical overflow ${audit.overflowY}px`,
  ].filter(Boolean);
}

function failuresForDetail(audit) {
  return [
    audit.background !== audit.expected && `wrong daySurface ${audit.background}`,
    !audit.base || !audit.surface && "missing day semantic properties",
    audit.minimumContrast < 4.5 && `contrast ${audit.minimumContrast.toFixed(2)}:1`,
    audit.bottomRadius.some((value) => value === "0px") && `missing bottom transition radius`,
    audit.itinerarySurface !== "rgb(244, 241, 234)" && `itinerary is not warm neutral`,
    audit.hero.height > audit.viewport.height && `hero exceeds viewport`,
    audit.overflowX !== 0 && `horizontal overflow ${audit.overflowX}px`,
  ].filter(Boolean);
}

async function dataUrl(file) {
  return `data:image/png;base64,${(await fs.readFile(file)).toString("base64")}`;
}

async function renderBoard(browser, file, kind) {
  const days = await Promise.all(Array.from({ length: 8 }, async (_, index) => {
    const number = String(index + 6).padStart(2, "0");
    return { number, cover: await dataUrl(path.join(rawRoot, `day-${number}-cover.png`)), detail: kind === "system" ? await dataUrl(path.join(rawRoot, `day-${number}-detail.png`)) : null };
  }));
  const page = await browser.newPage({ viewport: { width: kind === "system" ? 1200 : 1080, height: 900 }, deviceScaleFactor: 1 });
  const items = days.map((day) => kind === "system"
    ? `<article><h2>${day.number} <span>COVER → DETAIL</span></h2><div class="pair"><img src="${day.cover}"><img src="${day.detail}"></div></article>`
    : `<article><h2>DÍA ${day.number}</h2><img src="${day.cover}"></article>`).join("");
  await page.setContent(`<!doctype html><html><head><style>
    *{box-sizing:border-box}body{margin:0;padding:36px;background:#f4f1ea;color:#161616;font-family:Arial,sans-serif}header{display:flex;justify-content:space-between;align-items:end;margin-bottom:28px;border-bottom:2px solid #161616;padding-bottom:16px}h1{margin:0;font-size:32px;letter-spacing:-.04em}header p{margin:0;font:700 11px/1.3 monospace;text-transform:uppercase}.grid{display:grid;grid-template-columns:repeat(${kind === "system" ? 2 : 4},minmax(0,1fr));gap:24px}article{min-width:0}h2{margin:0 0 8px;font:700 12px/1 monospace}h2 span{font-weight:500;color:#555}.pair{display:grid;grid-template-columns:1fr 1fr;gap:8px}img{display:block;width:100%;height:auto;border:1px solid rgba(22,22,22,.18)}
  </style></head><body><header><h1>${kind === "system" ? "TRAZA · DAY COLOR SYSTEM" : "TRAZA · DAYCOVER RHYTHM"}</h1><p>ITERATION 12 · 390×844</p></header><main class="grid">${items}</main></body></html>`, { waitUntil: "load" });
  await page.evaluate(() => Promise.all([...document.images].map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => image.addEventListener("load", resolve, { once: true })) )));
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
}

const reports = [];
const failures = [];
for (const [engineName, engine, executablePath] of [
  ["chromium", chromium, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"],
  ["webkit", webkit, path.resolve("node_modules", "playwright-core", ".local-browsers", "webkit-2336", "Playwright.exe")],
]) {
  const browser = await engine.launch(engineName === "chromium" ? { executablePath, headless: true } : { headless: true });
  const engineReport = { engine: engineName, errors: [], audits: [] };
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, screen: viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const page = await context.newPage();
    watch(page, engineReport.errors);
    await page.goto(appUrl, { waitUntil: "networkidle", timeout: 60_000 });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle", timeout: 60_000 });
    await settle(page);
    for (let index = 0; index < 8; index += 1) {
      await selectDay(page, index);
      const cover = await auditCover(page, index, viewport);
      failures.push(...failuresForCover(cover).map((failure) => `${engineName}/${viewport.name}/day-${index + 6}/cover: ${failure}`));
      if (engineName === "chromium" && viewport.name === "390x844") await page.screenshot({ path: path.join(rawRoot, `day-${String(index + 6).padStart(2, "0")}-cover.png`) });
      await page.locator(".ds-day-cover.is-active .ds-day-cover__action button").click();
      await page.locator(".day-open-layer").waitFor();
      await settle(page);
      const detail = await auditDetail(page, index, viewport);
      failures.push(...failuresForDetail(detail).map((failure) => `${engineName}/${viewport.name}/day-${index + 6}/detail: ${failure}`));
      if (engineName === "chromium" && viewport.name === "390x844") await page.screenshot({ path: path.join(rawRoot, `day-${String(index + 6).padStart(2, "0")}-detail.png`) });
      engineReport.audits.push({ cover, detail });
      await page.getByRole("button", { name: /Cerrar día/i }).click();
      await page.locator(".day-open-layer").waitFor({ state: "detached" });
      await settle(page);
    }
    await context.close();
  }
  failures.push(...engineReport.errors.map((error) => `${engineName}: ${error}`));
  reports.push(engineReport);
  if (engineName === "chromium") {
    await renderBoard(browser, path.join(outputRoot, "iteration-12-day-system.png"), "system");
    await renderBoard(browser, path.join(outputRoot, "iteration-12-daycover-rhythm.png"), "rhythm");
  }
  await browser.close();
}

const summary = { pass: failures.length === 0, appUrl, engines: reports.map((report) => ({ engine: report.engine, audits: report.audits.length, errors: report.errors })), failures };
await fs.writeFile(path.join(outputRoot, "day-system-validation.json"), JSON.stringify({ summary, reports }, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));
if (failures.length) throw new Error(`Day system validation failed with ${failures.length} issue(s)`);
