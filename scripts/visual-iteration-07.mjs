import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { chromium, webkit } from "playwright-core";

const engineName = process.env.PW_ENGINE ?? "webkit";
const engine = engineName === "chromium" ? chromium : webkit;
const appUrl = process.env.APP_URL ?? "http://127.0.0.1:3077";
const storybookUrl = process.env.STORYBOOK_URL ?? "http://127.0.0.1:6077";
const root = path.resolve("screenshots", "iteration-07", "after");
const output = engineName === "webkit" ? root : path.join(root, engineName);
const storyOutput = path.join(output, "storybook");
await fs.mkdir(storyOutput, { recursive: true });

const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
let appServer;
let storyServer;
const appLogs = [];
async function waitFor(url) { for (let attempt = 0; attempt < 80; attempt += 1) { try { const response = await fetch(url); if (response.ok) return; } catch {} await new Promise((resolve) => setTimeout(resolve, 250)); } throw new Error(`Server not ready: ${url}`); }
async function startServers() {
  appServer = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3077"], { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  appServer.stdout.on("data", (chunk) => appLogs.push(chunk.toString())); appServer.stderr.on("data", (chunk) => appLogs.push(chunk.toString()));
  const staticRoot = path.resolve("storybook-static");
  storyServer = createServer(async (request, response) => { const requestPath = decodeURIComponent(new URL(request.url ?? "/", storybookUrl).pathname); const relative = requestPath === "/" ? "index.html" : requestPath.slice(1); const target = path.resolve(staticRoot, relative); if (!target.startsWith(staticRoot)) { response.writeHead(403).end(); return; } try { const stat = await fs.stat(target); const file = stat.isDirectory() ? path.join(target, "index.html") : target; response.writeHead(200, { "Content-Type": mime[path.extname(file)] ?? "application/octet-stream" }); createReadStream(file).pipe(response); } catch { response.writeHead(404).end("Not found"); } });
  await new Promise((resolve) => storyServer.listen(6077, "127.0.0.1", resolve));
  await Promise.all([waitFor(appUrl), waitFor(storybookUrl)]);
}
async function stopServers() { if (appServer && !appServer.killed) appServer.kill(); if (storyServer) await new Promise((resolve) => storyServer.close(resolve)); }

await startServers();

const launchOptions = engineName === "chromium" ? { executablePath: process.env.BROWSER_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true } : { executablePath: path.resolve("node_modules", "playwright-core", ".local-browsers", "webkit-2336", "Playwright.exe"), headless: true };
const browser = await engine.launch(launchOptions);
const errors = [];
const watch = (page) => { page.on("console", (message) => { if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) errors.push(message.text()); }); page.on("response", (response) => { if (response.status() >= 400 && !response.url().includes("/.well-known/")) errors.push(`HTTP ${response.status()} ${response.url()}`); }); page.on("pageerror", (error) => errors.push(error.message)); };
const settle = async (page, delay = 250) => { await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(delay); };

async function appCaptures() {
  const context = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage(); watch(page); await page.goto(appUrl, { waitUntil: "networkidle" }); await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle" });
  await page.addStyleTag({ content: ":root{--safe-top:59px!important;--safe-bottom:34px!important;--ds-safe-top:59px!important;--ds-safe-bottom:34px!important}" }); await settle(page);
  const coverFiles = [];
  const carousel = page.locator(".day-carousel");
  for (const [index, file] of [[0, "01-day-06.png"], [1, "02-day-07.png"], [2, "03-day-08.png"], [4, "04-day-10.png"]]) {
    await carousel.focus(); await page.keyboard.press("Home"); await settle(page, 520); for (let step = 0; step < index; step += 1) { await page.keyboard.press("ArrowRight"); await settle(page, 360); } await page.locator(".ds-day-cover.is-active").waitFor(); await settle(page, 220); await page.screenshot({ path: path.join(output, file) }); coverFiles.push(file);
  }
  const bounds = await page.locator(".ds-day-cover.is-active").evaluate((cover) => {
    const get = (selector) => cover.querySelector(selector)?.getBoundingClientRect(); const rootRect = cover.getBoundingClientRect(); const number = get(".ds-day-cover__number"); const copy = get(".ds-day-cover__copy"); const title = cover.querySelector(".ds-day-cover__copy h2");
    if (!number || !copy || !title) return { pass: false, reason: "missing anatomy" };
    const visibleWidth = Math.max(0, Math.min(number.right, rootRect.right, innerWidth) - Math.max(number.left, rootRect.left, 0)); const visibleHeight = Math.max(0, Math.min(number.bottom, rootRect.bottom, innerHeight) - Math.max(number.top, rootRect.top, 0)); const visibleRatio = visibleWidth * visibleHeight / (number.width * number.height); const lineHeight = Number.parseFloat(getComputedStyle(title).lineHeight); const titleLines = Math.round(title.getBoundingClientRect().height / lineHeight); const rootStyle = getComputedStyle(document.documentElement);
    return { pass: visibleRatio >= .8 && titleLines <= 3 && copy.left >= 0 && copy.right <= innerWidth && rootRect.left >= 0 && rootRect.right <= innerWidth, visibleRatio, titleLines, cover: { left: rootRect.left, right: rootRect.right, width: rootRect.width }, safeLeft: rootStyle.getPropertyValue("--safe-left"), safeRight: rootStyle.getPropertyValue("--safe-right") };
  });
  await page.getByRole("button", { name: "Guardados" }).click(); await page.locator(".ds-saved-place-card").first().waitFor(); await settle(page); await page.screenshot({ path: path.join(output, "05-saved.png"), fullPage: true });
  await page.getByRole("button", { name: "Viaje" }).click(); await page.locator(".ds-trip-section-card").first().waitFor(); await settle(page); await page.screenshot({ path: path.join(output, "06-trip.png"), fullPage: true });
  await page.getByRole("button", { name: "Días" }).click(); await carousel.focus(); await page.keyboard.press("Home"); await page.keyboard.press("ArrowRight"); await page.locator(".ds-day-cover.is-active .ds-day-cover__action button").click(); await page.locator(".day-open-layer").waitFor(); await settle(page); await page.screenshot({ path: path.join(output, "07-day-open.png"), fullPage: true });
  const sky = page.getByRole("button", { name: /Ver detalles: Sky Garden/i }); await sky.scrollIntoViewIfNeeded(); await sky.click(); await page.locator(".detail-layer").waitFor(); await settle(page); await page.screenshot({ path: path.join(output, "08-sky-garden.png"), fullPage: true });
  const skyImage = await page.getByAltText(/Interior ajardinado de Sky Garden/i).count();
  await context.close();
  return { coverFiles, bounds, skyImage: skyImage > 0 };
}

const stories = [
  ["foundations-tokens--semantic-color", "00-foundations.png"],
  ["core-component-gallery--actions-and-status", "01-core-actions-status.png"],
  ["core-component-gallery--forms-and-feedback", "02-core-forms-feedback.png"],
  ["core-component-gallery--navigation-and-surfaces", "02b-core-navigation.png"],
  ["core-component-gallery--sheet-pattern", "02c-core-sheet.png"],
  ["patterns-daycover-lab--lab", "03-daycover-lab.png"],
  ["patterns-daycover-lab--debug-bounds", "04-daycover-debug.png"],
  ["patterns-daycover-lab--all-eight-chapters", "05-daycover-all-chapters.png"],
  ["patterns-product-patterns--journey", "06-pattern-journey.png"],
  ["patterns-product-patterns--saved", "07-pattern-saved.png"],
  ["patterns-product-patterns--trip", "08-pattern-trip.png"],
  ["patterns-product-patterns--assignment", "09-pattern-assignment.png"],
];
async function storyCaptures() {
  const context = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 }); const page = await context.newPage(); watch(page);
  for (const [id, file] of stories) { await page.goto(`${storybookUrl}/iframe.html?id=${id}&viewMode=story`, { waitUntil: "networkidle" }); await page.locator("#storybook-root").waitFor(); await settle(page, 180); await page.screenshot({ path: path.join(storyOutput, file), fullPage: true }); }
  await context.close(); return { captures: stories.length };
}

async function preferenceAndInteractionRun() {
  const context = await browser.newContext({ viewport: { width: 402, height: 874 }, reducedMotion: "reduce" }); const page = await context.newPage(); watch(page);
  await page.goto(`${storybookUrl}/iframe.html?id=core-component-gallery--navigation-and-surfaces&viewMode=story`, { waitUntil: "networkidle" }); await page.locator(".ds-bottom-navigation").waitFor();
  const reducedMotion = await page.evaluate(() => ({ media: matchMedia("(prefers-reduced-motion: reduce)").matches, duration: getComputedStyle(document.documentElement).getPropertyValue("--ds-duration-base").trim() }));
  const navContract = await page.locator(".ds-bottom-navigation").evaluate((nav) => ({ items: nav.querySelectorAll("button").length, current: nav.querySelectorAll('[aria-current="page"]').length }));
  const transparency = await page.locator('[data-transparency="full"]').first().evaluate((wrapper) => { const nav = wrapper.querySelector(".ds-bottom-navigation"); if (!nav) return { pass: false, before: "missing", after: "missing" }; const before = getComputedStyle(nav).backgroundColor; wrapper.setAttribute("data-transparency", "reduced"); const after = getComputedStyle(nav).backgroundColor; return { pass: before !== after, before, after }; });
  await page.goto(`${storybookUrl}/iframe.html?id=core-component-gallery--sheet-pattern&viewMode=story`, { waitUntil: "networkidle" }); const dialog = page.getByRole("dialog"); await dialog.waitFor(); await settle(page, 320); await dialog.getByRole("button", { name: "Cerrar" }).focus(); const sheetFocus = await dialog.evaluate((element) => ({ inside: Boolean(document.activeElement?.closest('[role="dialog"]')), controls: element.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])').length, label: document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent?.trim() }));
  await page.goto(`${storybookUrl}/iframe.html?id=core-component-gallery--forms-and-feedback&viewMode=story`, { waitUntil: "networkidle" }); const formContract = { fields: await page.locator("input, textarea, select").count(), invalid: await page.locator('[aria-invalid="true"]').count() };
  await context.close();
  return { reducedMotion: { ...reducedMotion, pass: reducedMotion.media && reducedMotion.duration === ".01ms" }, reducedTransparency: transparency, navbar: { ...navContract, pass: navContract.items === 3 && navContract.current === 1 }, sheetFocus: { ...sheetFocus, pass: sheetFocus.inside && sheetFocus.controls >= 5 }, forms: { ...formContract, pass: formContract.fields >= 4 && formContract.invalid >= 1 } };
}

async function responsiveMatrix() {
  const rows = [];
  for (const [width, height] of [[390, 844], [402, 874], [430, 932], [768, 1024]]) { const context = await browser.newContext({ viewport: { width, height }, isMobile: width <= 430, hasTouch: true }); const page = await context.newPage(); watch(page); await page.goto(appUrl, { waitUntil: "networkidle" }); await settle(page, 100); const result = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, cover: Boolean(document.querySelector(".ds-day-cover.is-active")), nav: Boolean(document.querySelector(".ds-bottom-navigation")) })); rows.push({ viewport: `${width}x${height}`, ...result, pass: result.overflow <= 0 && result.cover && result.nav }); await context.close(); }
  return rows;
}

async function montage(files, target, title) { const encoded = await Promise.all(files.map(async ([file, label]) => [Buffer.from(await fs.readFile(file)).toString("base64"), label])); const page = await browser.newPage({ viewport: { width: 1320, height: 1000 } }); await page.setContent(`<style>body{margin:0;padding:28px;background:#161616;color:white;font:700 16px Arial}h1{margin:0 0 24px;color:#d5f43b}.grid{display:grid;grid-template-columns:repeat(${encoded.length},1fr);gap:18px}.item{display:grid;gap:8px}.item span{font:700 11px monospace}.item img{width:100%;max-height:820px;object-fit:contain;object-position:top;border-radius:20px;background:#f4f1ea}</style><h1>${title}</h1><div class="grid">${encoded.map(([src, label]) => `<div class="item"><span>${label}</span><img src="data:image/png;base64,${src}"></div>`).join("")}</div>`); await page.screenshot({ path: target, fullPage: true }); await page.close(); }

const app = await appCaptures(); const storybook = await storyCaptures(); const preferences = await preferenceAndInteractionRun(); const matrix = await responsiveMatrix();
if (engineName === "webkit") {
  await montage([[path.join(output, "01-day-06.png"), "JOURNEY"], [path.join(output, "05-saved.png"), "SAVED"], [path.join(output, "06-trip.png"), "TRIP"]], path.join(output, "app-three-sections-montage.png"), "TRAZA · Design System 1.0 · aplicación");
  await montage([[path.resolve("screenshots", "iteration-07", "before", "05-carrusel.png"), "BEFORE · ITERACIÓN 06"], [path.join(output, "01-day-06.png"), "AFTER · DAYCOVER 2.0"]], path.join(output, "design-system-before-after.png"), "TRAZA · Design System 1.0 · before / after");
  await montage([[path.join(output, "01-day-06.png"), "DÍAS"], [path.join(output, "05-saved.png"), "GUARDADOS"], [path.join(output, "06-trip.png"), "VIAJE"]], path.join(output, "three-sections-system-comparison.png"), "TRAZA · comparación de las tres secciones");
  await montage([[path.join(storyOutput, "01-core-actions-status.png"), "CORE"], [path.join(storyOutput, "03-daycover-lab.png"), "DAYCOVER LAB"], [path.join(storyOutput, "06-pattern-journey.png"), "PATTERNS"]], path.join(output, "storybook-core-patterns-montage.png"), "TRAZA · Storybook · Core + Patterns");
}
const validation = { engine: engineName, app, storybook, preferences, matrix, errors };
await fs.writeFile(path.join(output, "validation.json"), JSON.stringify(validation, null, 2)); await browser.close(); await stopServers();
if (!app.bounds.pass || !app.skyImage || Object.values(preferences).some((result) => !result.pass) || matrix.some((row) => !row.pass) || errors.length) throw new Error(JSON.stringify(validation, null, 2));
console.log(JSON.stringify(validation, null, 2));
