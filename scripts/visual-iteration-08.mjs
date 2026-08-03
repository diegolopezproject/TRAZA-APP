import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve("node_modules", "playwright-core", ".local-browsers");
const { chromium, webkit } = await import("playwright-core");

const engineName = process.env.PW_ENGINE ?? "chromium";
const engine = engineName === "webkit" ? webkit : chromium;
const appUrl = "http://127.0.0.1:3088";
const storybookUrl = "http://127.0.0.1:6088";
const root = path.resolve("screenshots", "iteration-08", "after");
const output = engineName === "chromium" ? path.join(root, "chromium") : path.join(root, "webkit");
const storyOutput = path.join(output, "storybook");
const videoOutput = path.join(root, "video");
await Promise.all([fs.mkdir(storyOutput, { recursive: true }), fs.mkdir(videoOutput, { recursive: true })]);

const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
let appServer;
let storyServer;
async function waitFor(url) { for (let attempt = 0; attempt < 100; attempt += 1) { try { const response = await fetch(url); if (response.ok) return; } catch {} await new Promise((resolve) => setTimeout(resolve, 250)); } throw new Error(`Server not ready: ${url}`); }
async function startServers() {
  appServer = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3088"], { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  const staticRoot = path.resolve("storybook-static");
  storyServer = createServer(async (request, response) => { const requestPath = decodeURIComponent(new URL(request.url ?? "/", storybookUrl).pathname); const relative = requestPath === "/" ? "index.html" : requestPath.slice(1); const target = path.resolve(staticRoot, relative); if (!target.startsWith(staticRoot)) { response.writeHead(403).end(); return; } try { const stat = await fs.stat(target); const file = stat.isDirectory() ? path.join(target, "index.html") : target; response.writeHead(200, { "Content-Type": mime[path.extname(file)] ?? "application/octet-stream" }); createReadStream(file).pipe(response); } catch { response.writeHead(404).end("Not found"); } });
  await new Promise((resolve) => storyServer.listen(6088, "127.0.0.1", resolve));
  await Promise.all([waitFor(appUrl), waitFor(storybookUrl)]);
}
async function stopServers() { if (appServer && !appServer.killed) appServer.kill(); if (storyServer) await new Promise((resolve) => storyServer.close(resolve)); }

await startServers();
const executablePath = engineName === "webkit" ? path.resolve("node_modules", "playwright-core", ".local-browsers", "webkit-2336", "Playwright.exe") : "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browser = await engine.launch({ executablePath, headless: true });
const errors = [];
function watch(page) { page.on("console", (message) => { if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) errors.push(`console: ${message.text()}`); }); page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`)); }
async function settle(page, delay = 260) { await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(delay); }
async function reset(page) { await page.goto(appUrl, { waitUntil: "networkidle" }); await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle" }); await settle(page); }
async function selectIndex(page, index) { const stage = page.locator(".ds-day-deck__stage"); await stage.focus(); await page.keyboard.press("Home"); for (let step = 0; step < index; step += 1) await page.keyboard.press("ArrowRight"); await settle(page, 120); }
async function drag(page, dx, dy, steps = 8, release = true) { const stage = page.locator(".ds-day-deck__stage"); const box = await stage.boundingBox(); if (!box) throw new Error("Missing DayDeck bounds"); const start = { x: box.x + box.width / 2, y: box.y + box.height * .58 }; await page.mouse.move(start.x, start.y); await page.mouse.down(); for (let step = 1; step <= steps; step += 1) { await page.mouse.move(start.x + dx * step / steps, start.y + dy * step / steps); await page.waitForTimeout(16); } if (release) { await page.mouse.up(); await settle(page, 280); } return { start, box }; }
async function screenshot(page, name, options = {}) { await settle(page, 80); await page.screenshot({ path: path.join(output, name), ...options }); }

const context = await browser.newContext({ viewport: { width: 402, height: 874 }, screen: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
const page = await context.newPage(); watch(page); await reset(page);

await selectIndex(page, 0); await screenshot(page, "01-day-06.png");
await selectIndex(page, 1); await screenshot(page, "02-day-07.png");
await selectIndex(page, 4); await screenshot(page, "03-day-10.png");

await selectIndex(page, 0); await drag(page, -118, 0, 7, false); await screenshot(page, "04-swipe-intermediate.png"); await page.mouse.up(); await settle(page, 280);
await selectIndex(page, 0); await drag(page, 105, 4, 7, false); await screenshot(page, "05-first-day-resistance.png"); await page.mouse.up(); await settle(page, 260);
await selectIndex(page, 7); await drag(page, -105, -3, 7, false); await screenshot(page, "06-last-day-resistance.png"); await page.mouse.up(); await settle(page, 260);
await selectIndex(page, 1); await drag(page, -72, 0, 5, false); await page.locator(".ds-day-deck__indicator").screenshot({ path: path.join(output, "07-progress.png") }); await page.mouse.up(); await settle(page, 260);

await selectIndex(page, 1); await drag(page, 3, -112, 8, true); await page.locator(".day-open-layer").waitFor(); await screenshot(page, "08-day-07-open.png");
await page.locator(".itinerary-actions").screenshot({ path: path.join(output, "09-day-actions.png") });
await page.getByRole("heading", { name: "Mañana" }).scrollIntoViewIfNeeded(); await page.getByRole("heading", { name: "Mañana" }).locator("xpath=ancestor::header").screenshot({ path: path.join(output, "10-morning-header.png") });
const skyCard = page.locator(".activity-card").filter({ hasText: "Sky Garden" }).first(); await skyCard.scrollIntoViewIfNeeded(); await skyCard.screenshot({ path: path.join(output, "11-sky-garden-card.png") });
await page.getByRole("button", { name: /Ver detalles: Sky Garden/i }).click(); await page.locator(".detail-layer").waitFor(); await screenshot(page, "12-sky-garden-detail.png");
await page.getByRole("button", { name: /Volver al itinerario/i }).first().click(); await page.getByRole("button", { name: esRegex("Cerrar el itinerario") }).click();

await page.getByRole("button", { name: "Guardados" }).click(); await settle(page); await screenshot(page, "13-saved.png");
const hardRock = page.locator(".ds-saved-place-card").filter({ hasText: "Hard Rock Cafe" }).first(); await hardRock.scrollIntoViewIfNeeded(); await hardRock.screenshot({ path: path.join(output, "14-hard-rock.png") });
const mms = page.locator(".ds-saved-place-card").filter({ hasText: "M&M's London" }).first(); await mms.scrollIntoViewIfNeeded(); await mms.screenshot({ path: path.join(output, "15-mms.png") });

await page.getByRole("button", { name: "Viaje" }).click(); await settle(page); await screenshot(page, "16-trip.png");
await page.locator(".ds-flight-ticket").first().screenshot({ path: path.join(output, "17-outbound-flight.png") });
const tripScroll = page.locator(".trip-view"); await tripScroll.evaluate((element) => { element.scrollTop = element.scrollHeight; }); await settle(page); await screenshot(page, "18-navbar-final-content.png");

const contracts = await page.evaluate(() => {
  const nav = document.querySelector(".ds-bottom-navigation");
  const scroll = document.querySelector(".trip-view");
  const last = scroll?.lastElementChild;
  const navRect = nav?.getBoundingClientRect();
  const lastRect = last?.getBoundingClientRect();
  return { navBackground: nav ? getComputedStyle(nav).backgroundColor : null, navTop: navRect?.top, lastBottom: lastRect?.bottom, lastAboveNav: Boolean(navRect && lastRect && lastRect.bottom <= navRect.top - 16), reserve: getComputedStyle(document.documentElement).getPropertyValue("--ds-navigation-reserve").trim() };
});

const matrix = [];
for (const [width, height] of [[360, 800], [393, 873], [402, 874], [412, 915], [430, 932]]) {
  const mobile = await browser.newContext({ viewport: { width, height }, screen: { width, height }, isMobile: true, hasTouch: true }); const mobilePage = await mobile.newPage(); watch(mobilePage); await reset(mobilePage);
  if (engineName === "chromium") { const client = await mobile.newCDPSession(mobilePage); await client.send("Emulation.setEmulatedMedia", { features: [{ name: "display-mode", value: "standalone" }] }); }
  const row = await mobilePage.evaluate(() => { const journey = document.querySelector(".journey-view"); const stage = document.querySelector(".ds-day-deck__stage"); const cover = document.querySelector(".ds-day-cover.is-active"); const nav = document.querySelector(".ds-bottom-navigation"); const fonts = [...document.fonts].map((font) => `${font.family}:${font.status}`); return { overflowX: document.documentElement.scrollWidth - innerWidth, overflowY: document.documentElement.scrollHeight - innerHeight, journeyHeight: journey?.getBoundingClientRect().height, stage: Boolean(stage), visibleCards: document.querySelectorAll(".ds-day-deck__card").length, arrows: [...document.querySelectorAll("button")].filter((button) => /Día anterior|Día siguiente/i.test(button.getAttribute("aria-label") ?? "")).length, cover: Boolean(cover), nav: Boolean(nav), displayStandalone: matchMedia("(display-mode: standalone)").matches, fonts }; });
  matrix.push({ viewport: `${width}x${height}`, ...row, pass: row.overflowX <= 0 && row.overflowY <= 0 && Math.abs(row.journeyHeight - height) <= .5 && row.visibleCards <= 3 && row.arrows === 0 && row.cover && row.nav }); await mobile.close();
}

const fontAudit = await page.evaluate(() => { const sample = (selector) => { const element = document.querySelector(selector); if (!element) return null; const style = getComputedStyle(element); return { selector, family: style.fontFamily, weight: style.fontWeight }; }; return [sample("body"), sample(".trip-header h1"), sample(".ds-flight-ticket strong"), sample(".ds-bottom-navigation"), sample("button")]; });
await context.close();

const stories = [["expression-daycover-atmospheric--flat-vs-atmospheric", "01-atmospheric.png"], ["core-bottomnavigation-ink-comparison--variants", "02-navigation-ab.png"], ["patterns-product-patterns--journey", "03-day-patterns.png"], ["patterns-product-patterns--saved", "04-saved-place-card.png"], ["patterns-product-patterns--trip", "05-flight-card.png"], ["experiments-day-navigation-vertical-stack--comparison-only", "06-vertical-stack.png"]];
const storyContext = await browser.newContext({ viewport: { width: 820, height: 932 } }); const storyPage = await storyContext.newPage(); watch(storyPage); for (const [id, file] of stories) { await storyPage.goto(`${storybookUrl}/iframe.html?id=${id}&viewMode=story`, { waitUntil: "networkidle" }); await settle(storyPage, 160); await storyPage.screenshot({ path: path.join(storyOutput, file), fullPage: true }); } await storyContext.close();

let videoPath = null;
if (engineName === "chromium") {
  const videoContext = await browser.newContext({ viewport: { width: 402, height: 874 }, screen: { width: 402, height: 874 }, isMobile: true, hasTouch: true, recordVideo: { dir: videoOutput, size: { width: 402, height: 874 } } });
  const videoPage = await videoContext.newPage(); watch(videoPage); await reset(videoPage); const video = videoPage.video();
  await selectIndex(videoPage, 0); await videoPage.waitForTimeout(450);
  await drag(videoPage, -125, 0, 9, true); await videoPage.waitForTimeout(500);
  await drag(videoPage, -125, 0, 9, true); await videoPage.waitForTimeout(500);
  await drag(videoPage, -330, 0, 3, true); await videoPage.waitForTimeout(550);
  await selectIndex(videoPage, 1); await drag(videoPage, 2, -118, 9, true); await videoPage.locator(".day-open-layer").waitFor(); await videoPage.waitForTimeout(650);
  await videoPage.getByRole("button", { name: esRegex("Cerrar el itinerario") }).click(); await videoPage.waitForTimeout(450);
  await videoPage.getByRole("button", { name: "Guardados" }).click(); await videoPage.waitForTimeout(550);
  const videoHardRock = videoPage.locator(".ds-saved-place-card").filter({ hasText: "Hard Rock Cafe" }).first(); await videoHardRock.scrollIntoViewIfNeeded(); await videoPage.waitForTimeout(400);
  await videoHardRock.getByRole("button", { name: "Detalle" }).click(); await videoPage.waitForTimeout(650);
  await videoPage.getByRole("button", { name: "Cerrar" }).click(); await videoPage.waitForTimeout(420);
  await videoHardRock.getByRole("button", { name: /Añadir a un día|Asignado al/i }).click(); await videoPage.waitForTimeout(500);
  await videoPage.getByRole("button", { name: /viernes · 7 de agosto/i }).click(); await videoPage.waitForTimeout(450);
  await videoPage.getByRole("button", { name: /Mañana/i }).click(); await videoPage.getByRole("button", { name: "Añadir al día" }).click(); await videoPage.waitForTimeout(800);
  await videoPage.close(); await videoContext.close(); videoPath = video ? await video.path() : null;
  if (videoPath) { const target = path.join(videoOutput, "iteration-08-mobile-flow.webm"); await fs.copyFile(videoPath, target); videoPath = target; }
}

async function montage(files, target) { const encoded = await Promise.all(files.map(async ([file, label]) => [Buffer.from(await fs.readFile(file)).toString("base64"), label])); const montagePage = await browser.newPage({ viewport: { width: 1260, height: 950 } }); await montagePage.setContent(`<style>body{margin:0;padding:24px;background:#161616;color:#fff;font:700 14px Arial}.grid{display:grid;grid-template-columns:repeat(${encoded.length},1fr);gap:16px}.item{display:grid;gap:8px}.item img{width:100%;max-height:850px;object-fit:contain;object-position:top;border-radius:20px;background:#f4f1ea}.item span{color:#d5f43b}</style><div class="grid">${encoded.map(([src,label])=>`<div class="item"><span>${label}</span><img src="data:image/png;base64,${src}"></div>`).join("")}</div>`); await montagePage.screenshot({ path: target, fullPage: true }); await montagePage.close(); }
await montage([[path.join(output,"02-day-07.png"),"DÍAS"],[path.join(output,"13-saved.png"),"GUARDADOS"],[path.join(output,"16-trip.png"),"VIAJE"]], path.join(output,"19-three-sections.png"));

const validation = { engine: engineName, matrix, contracts, fontAudit, stories: stories.length, videoPath, errors };
await fs.writeFile(path.join(output, "validation.json"), JSON.stringify(validation, null, 2));
await browser.close(); await stopServers();
if (matrix.some((row) => !row.pass) || !contracts.lastAboveNav || !String(contracts.navBackground).includes("22") || errors.length) throw new Error(JSON.stringify(validation, null, 2));
console.log(JSON.stringify(validation, null, 2));

function esRegex(value) { return new RegExp(value, "i"); }
