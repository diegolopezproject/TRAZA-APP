import fs from "node:fs/promises";
import path from "node:path";
import { chromium, webkit } from "playwright-core";

const engineName = process.env.PW_ENGINE ?? "webkit";
const engine = engineName === "chromium" ? chromium : webkit;
const baseUrl = process.env.APP_URL ?? "http://127.0.0.1:3016";
const rootOutput = path.resolve("screenshots", "iteration-06", "after");
const outputDir = engineName === "webkit" ? rootOutput : path.join(rootOutput, engineName);
await fs.mkdir(outputDir, { recursive: true });

const launchOptions = engineName === "chromium"
  ? { executablePath: process.env.BROWSER_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true }
  : { headless: true };
const browser = await engine.launch(launchOptions);
const errors = [];

function watch(page) {
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
}

async function settle(page, delay = 480) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(delay);
}

async function applyPhoneInsets(page) {
  await page.addStyleTag({ content: ":root{--safe-top:59px!important;--safe-bottom:34px!important}" });
  await page.waitForTimeout(120);
}

async function auditTargets(page, screen) {
  const violations = await page.evaluate(() => [...document.querySelectorAll("button, a[href], input, select, textarea")].flatMap((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" || rect.width === 0 || rect.height === 0 || rect.bottom < 0 || rect.top > innerHeight) return [];
    return rect.width < 44 || rect.height < 44 ? [{ tag: element.tagName, text: element.textContent?.trim().slice(0, 40), width: Math.round(rect.width), height: Math.round(rect.height) }] : [];
  }));
  return violations.map((item) => ({ screen, ...item }));
}

async function chooseDay(page, index) {
  const carousel = page.locator(".day-carousel");
  await carousel.focus();
  await page.keyboard.press("Home");
  for (let cursor = 0; cursor < index; cursor += 1) await page.keyboard.press("ArrowRight");
  await page.locator(".day-slide").nth(index).locator(".day-cover.is-active").waitFor();
  await page.waitForTimeout(360);
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
}

async function mainCaptureRun() {
  const context = await browser.newContext({
    viewport: { width: 402, height: 874 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const targetAudits = [];
  watch(page);
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await applyPhoneInsets(page);
  await page.locator(".day-cover.is-active").waitFor();
  await settle(page);

  const coverCaptures = [[0, "01-portada-dia-06.png"], [1, "02-portada-dia-07.png"], [2, "03-portada-dia-08.png"], [4, "04-portada-dia-10.png"]];
  for (const [index, filename] of coverCaptures) {
    await chooseDay(page, index);
    await page.screenshot({ path: path.join(outputDir, filename) });
  }

  await chooseDay(page, 1);
  await page.screenshot({ path: path.join(outputDir, "05-carrusel.png") });
  targetAudits.push(...await auditTargets(page, "carrusel"));
  await page.locator(".day-cover.is-active .open-day-handle").click();
  await page.locator(".day-open-layer").waitFor();
  await settle(page, 650);
  await page.screenshot({ path: path.join(outputDir, "06-dia-abierto.png") });
  targetAudits.push(...await auditTargets(page, "día abierto"));

  const skyCard = page.getByRole("button", { name: /Ver detalles: Sky Garden/i });
  await skyCard.scrollIntoViewIfNeeded();
  await skyCard.click();
  await page.locator(".detail-layer").waitFor();
  await settle(page, 650);
  await page.screenshot({ path: path.join(outputDir, "07-detalle-sky-garden.png") });
  targetAudits.push(...await auditTargets(page, "detalle Sky Garden"));
  await page.locator(".detail-back").click();
  await page.locator(".detail-layer").waitFor({ state: "detached" });
  await page.locator(".itinerary-scroll").evaluate((element) => { element.scrollTop = 0; });
  await page.getByRole("button", { name: "Organizar" }).click();
  await page.getByRole("toolbar", { name: /Guardar cambios/ }).waitFor();
  await settle(page, 240);
  await page.screenshot({ path: path.join(outputDir, "08-organizar.png") });
  targetAudits.push(...await auditTargets(page, "organizar"));
  await page.getByRole("button", { name: "Cancelar" }).click();
  await page.getByRole("button", { name: /Cerrar el itinerario/ }).click();
  await page.locator(".day-open-layer").waitFor({ state: "detached" });

  await page.getByRole("button", { name: "Guardados" }).click();
  await page.locator(".saved-editorial-list").waitFor();
  await page.locator(".saved-view").evaluate((element) => { element.scrollTop = 0; });
  await settle(page, 300);
  await page.screenshot({ path: path.join(outputDir, "09-guardados.png") });
  targetAudits.push(...await auditTargets(page, "guardados"));

  const mms = page.locator(".saved-card").filter({ hasText: "M&M's London" }).first();
  await mms.scrollIntoViewIfNeeded();
  await mms.getByRole("button", { name: "Detalle" }).click();
  await page.getByRole("dialog").waitFor();
  await settle(page, 420);
  await page.screenshot({ path: path.join(outputDir, "10-detalle-mms.png") });
  targetAudits.push(...await auditTargets(page, "detalle M&M's"));
  await page.getByRole("button", { name: "Cerrar" }).click();
  await page.locator(".assignment-backdrop").waitFor({ state: "detached" });

  await mms.scrollIntoViewIfNeeded();
  await mms.getByRole("button", { name: /Añadir M&M's London/i }).click();
  await page.getByRole("heading", { name: "¿Qué día encaja mejor?" }).waitFor();
  await settle(page, 420);
  await page.screenshot({ path: path.join(outputDir, "11-asignar-paso-1.png") });
  targetAudits.push(...await auditTargets(page, "asignar paso 1"));
  await page.locator(".assignment-days button").nth(1).click();
  await page.getByRole("heading", { name: "¿En qué momento?" }).waitFor();
  await page.locator(".placement-options button").first().waitFor();
  await settle(page, 520);
  await page.screenshot({ path: path.join(outputDir, "12-asignar-paso-2.png") });
  targetAudits.push(...await auditTargets(page, "asignar paso 2"));
  await page.getByRole("button", { name: "Cerrar" }).click();
  await page.locator(".assignment-backdrop").waitFor({ state: "detached" });

  await page.locator(".saved-view").evaluate((element) => { element.scrollTop = 0; });
  await page.getByRole("button", { name: "Añadir lugar" }).click();
  await page.getByRole("dialog").waitFor();
  await settle(page, 420);
  await page.screenshot({ path: path.join(outputDir, "13-anadir-lugar.png") });
  targetAudits.push(...await auditTargets(page, "añadir lugar"));
  const nameInput = page.getByLabel("Nombre *");
  await nameInput.focus();
  await page.setViewportSize({ width: 402, height: 560 });
  await page.waitForTimeout(260);
  const keyboardState = await page.evaluate(() => {
    const input = document.activeElement?.getBoundingClientRect();
    const save = document.querySelector('.sheet-footer .primary-button')?.getBoundingClientRect();
    return { inputBottom: input?.bottom, saveBottom: save?.bottom, visibleHeight: window.visualViewport?.height ?? innerHeight };
  });
  await page.screenshot({ path: path.join(outputDir, "14-anadir-lugar-teclado-simulado.png") });
  await page.setViewportSize({ width: 402, height: 874 });
  await applyPhoneInsets(page);
  await page.getByRole("button", { name: "Cerrar" }).click();
  await page.locator(".assignment-backdrop").waitFor({ state: "detached" });

  await page.locator(".saved-view").evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await settle(page, 220);
  await page.screenshot({ path: path.join(outputDir, "15-ultima-card-sobre-navbar.png") });
  const lastCardClearance = await page.evaluate(() => {
    const card = document.querySelector(".saved-card:last-child")?.getBoundingClientRect();
    const nav = document.querySelector(".bottom-nav")?.getBoundingClientRect();
    return { cardBottom: card ? Math.round(card.bottom) : null, navTop: nav ? Math.round(nav.top) : null, pass: Boolean(card && nav && card.bottom <= nav.top) };
  });

  await page.locator(".saved-settings").scrollIntoViewIfNeeded();
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator(".saved-settings button").click();
  await page.getByRole("status").waitFor();
  await page.screenshot({ path: path.join(outputDir, "16-toast.png") });
  await page.getByRole("status").waitFor({ state: "detached", timeout: 6500 });

  await page.getByRole("button", { name: "Viaje" }).click();
  await page.locator(".trip-view").waitFor();
  await page.locator(".trip-view").evaluate((element) => { element.scrollTop = 0; });
  await settle(page, 300);
  await page.screenshot({ path: path.join(outputDir, "17-viaje.png") });

  targetAudits.push(...await auditTargets(page, "viaje"));
  const interactiveViolations = targetAudits;
  const overflow = await page.evaluate(() => ({ document: document.documentElement.scrollWidth - innerWidth, body: document.body.scrollWidth - innerWidth }));
  await context.close();
  return { keyboardState, lastCardClearsNav: lastCardClearance.pass, lastCardClearance, interactiveViolations, overflow };
}

async function matrixRun() {
  const viewports = [[390, 844], [393, 852], [402, 874], [430, 932], [768, 1024], [1440, 900]];
  const rows = [];
  for (const [width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: width <= 430 ? 3 : 1, isMobile: width <= 430, hasTouch: width <= 768 });
    const page = await context.newPage();
    watch(page);
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    if (width <= 430) await applyPhoneInsets(page);
    await settle(page, 160);
    const values = await page.evaluate(() => {
      const nav = document.querySelector(".bottom-nav")?.getBoundingClientRect();
      const active = document.querySelector(".day-cover.is-active")?.getBoundingClientRect();
      return { overflow: document.documentElement.scrollWidth - innerWidth, navBottom: nav ? Math.round(innerHeight - nav.bottom) : null, coverTop: active ? Math.round(active.top) : null, coverBottom: active ? Math.round(active.bottom) : null };
    });
    rows.push({ viewport: `${width}x${height}`, safeTop: width <= 430 ? 59 : 0, safeBottom: width <= 430 ? 34 : 0, navbar: values.navBottom !== null ? "visible" : "missing", keyboard: width === 402 ? "simulated separately" : "not applicable", scroll: values.overflow <= 0 ? "pass" : "fail", sheet: "covered in primary flow", result: values.overflow <= 0 ? "pass" : "fail", capture: width === 402 ? "05-carrusel.png" : "matrix data", incidence: values.overflow <= 0 ? "none" : `horizontal overflow ${values.overflow}px`, ...values });
    await context.close();
  }
  return rows;
}

async function landscapeRun() {
  const context = await browser.newContext({ viewport: { width: 874, height: 402 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  const page = await context.newPage();
  watch(page);
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ":root{--safe-top:0px!important;--safe-right:59px!important;--safe-bottom:21px!important;--safe-left:59px!important}" });
  await settle(page, 260);
  await page.screenshot({ path: path.join(outputDir, "18-landscape-sanity.png") });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await context.close();
  return { overflow };
}

async function reducedMotionRun() {
  const context = await browser.newContext({ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  watch(page);
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await applyPhoneInsets(page);
  await page.locator(".day-cover.is-active .open-day-handle").click();
  await page.locator(".day-open-layer").waitFor();
  await page.getByRole("button", { name: /Cerrar el itinerario/ }).click();
  await page.locator(".day-open-layer").waitFor({ state: "detached" });
  await context.close();
  return true;
}

const primary = await mainCaptureRun();
const matrix = await matrixRun();
const landscape = await landscapeRun();
const reducedMotion = await reducedMotionRun();

if (engineName === "webkit") {
  const beforePath = path.resolve("screenshots", "iteration-06", "before", "01-app-shell-dias.png");
  const afterPath = path.join(outputDir, "05-carrusel.png");
  const [before, after] = await Promise.all([fs.readFile(beforePath), fs.readFile(afterPath)]);
  const comparison = await browser.newPage({ viewport: { width: 900, height: 1100 } });
  await comparison.setContent(`<style>body{margin:0;padding:24px;background:#0c0c0c;color:white;font:700 18px Arial}h1{font-size:28px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.shot{display:grid;gap:8px}.shot span{color:#dcfc24;font:700 12px monospace}.shot img{width:402px;border-radius:28px}</style><h1>TRAZA · Iteración 06 · mobile before / after</h1><div class="grid"><div class="shot"><span>BEFORE · ITERACIÓN 05</span><img src="data:image/png;base64,${before.toString("base64")}"></div><div class="shot"><span>AFTER · WEBKIT · 402×874</span><img src="data:image/png;base64,${after.toString("base64")}"></div></div>`);
  await comparison.screenshot({ path: path.join(rootOutput, "mobile-before-after.png"), fullPage: true });
  await comparison.close();
}

const validation = { engine: engineName, viewport: "402x874@3", simulatedInsets: { top: 59, bottom: 34 }, errors, primary, matrix, landscape, reducedMotion, captures: 18 };
await fs.writeFile(path.join(outputDir, "validation.json"), JSON.stringify(validation, null, 2));
await browser.close();
if (errors.length) throw new Error(`Console errors (${engineName}):\n${errors.join("\n")}`);
if (primary.overflow.document > 0 || primary.overflow.body > 0 || landscape.overflow > 0) throw new Error(`Overflow detected: ${JSON.stringify({ primary: primary.overflow, landscape })}`);
console.log(JSON.stringify(validation, null, 2));
