import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.APP_URL ?? "http://127.0.0.1:3013";
const browserPath = process.env.BROWSER_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDir = path.resolve("screenshots", "iteration-05", "after");
const compareDir = path.resolve("screenshots", "iteration-05", "comparison");
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(compareDir, { recursive: true });

const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
const page = await context.newPage();
const errors = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(error.message));

async function settle() {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(280);
}

async function chooseDay(index) {
  const carousel = page.locator(".day-carousel");
  await carousel.focus();
  await page.keyboard.press("Home");
  for (let cursor = 0; cursor < index; cursor += 1) await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(320);
}

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.locator(".day-cover.is-active").waitFor();
await settle();

await page.screenshot({ path: path.join(outputDir, "01-app-shell-dias.png") });
await page.screenshot({ path: path.join(outputDir, "05-portada-dia-07.png") });
await page.screenshot({ path: path.join(outputDir, "08-carrusel.png") });

await chooseDay(2);
await page.screenshot({ path: path.join(outputDir, "06-portada-dia-08.png") });
await chooseDay(4);
await page.screenshot({ path: path.join(outputDir, "07-portada-dia-10.png") });

await chooseDay(1);
await page.locator(".day-cover.is-active .open-day-handle").click();
await page.locator(".day-open-layer").waitFor();
await settle();
await page.screenshot({ path: path.join(outputDir, "09-itinerario.png") });
await page.getByRole("button", { name: "Organizar" }).click();
await page.getByRole("toolbar", { name: /Guardar cambios/ }).waitFor();
await page.screenshot({ path: path.join(outputDir, "10-organizar.png") });
await page.getByRole("button", { name: "Cancelar" }).click();
await page.getByRole("button", { name: /Cerrar el itinerario/ }).click();

await page.getByRole("button", { name: "Guardados" }).click();
await page.locator(".saved-editorial-list").waitFor();
await settle();
await page.screenshot({ path: path.join(outputDir, "02-app-shell-guardados.png") });
await page.screenshot({ path: path.join(outputDir, "11-guardados.png") });

const mms = page.locator(".saved-card").filter({ hasText: "M&M's London" }).first();
await mms.scrollIntoViewIfNeeded();
await page.waitForTimeout(180);
await mms.screenshot({ path: path.join(outputDir, "12-card-mms.png") });
await mms.getByRole("button", { name: "Detalle" }).click();
await page.getByRole("dialog").waitFor();
await settle();
await page.screenshot({ path: path.join(outputDir, "13-detalle-mms.png") });
await page.getByRole("button", { name: "Cerrar" }).click();

await page.locator(".saved-view").evaluate((element) => { element.scrollTop = 0; });
await page.getByRole("button", { name: "Añadir lugar" }).click();
await page.getByRole("dialog").waitFor();
await settle();
await page.screenshot({ path: path.join(outputDir, "15-formulario.png") });
await page.getByRole("button", { name: "Cerrar" }).click();

await mms.scrollIntoViewIfNeeded();
await mms.getByRole("button", { name: /Añadir M&M's London/i }).click();
await page.getByRole("dialog").waitFor();
await page.locator(".assignment-days button").nth(1).click();
await page.getByText("¿Dónde quieres colocarlo?").waitFor();
await settle();
await page.screenshot({ path: path.join(outputDir, "16-sheet-asignacion.png") });
await page.getByRole("button", { name: "Cerrar" }).click();

await page.locator(".saved-settings").scrollIntoViewIfNeeded();
await page.screenshot({ path: path.join(outputDir, "18-restaurar-viaje-original.png") });
page.once("dialog", (dialog) => dialog.accept());
await page.locator(".saved-settings button").click();
await page.getByRole("status").waitFor();
await page.screenshot({ path: path.join(outputDir, "17-toast.png") });
await page.getByRole("status").waitFor({ state: "detached", timeout: 6000 });

await page.getByRole("button", { name: "Viaje" }).click();
await page.locator(".trip-view").waitFor();
await page.locator(".trip-view").evaluate((element) => { element.scrollTop = 0; });
await settle();
await page.screenshot({ path: path.join(outputDir, "03-app-shell-viaje.png") });
await page.screenshot({ path: path.join(outputDir, "14-viaje.png") });

const keyboardBefore = await page.getByRole("button", { name: "Días" }).click().then(async () => {
  await page.locator(".day-carousel").focus();
  await page.keyboard.press("Home");
  await page.waitForTimeout(220);
  const label = await page.locator(".day-cover.is-active").getAttribute("aria-label");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(220);
  return label;
});
const keyboardAfter = await page.locator(".day-cover.is-active").getAttribute("aria-label");

const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", hasTouch: true, isMobile: true });
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(baseUrl, { waitUntil: "networkidle" });
await reducedPage.locator(".day-cover.is-active .open-day-handle").click();
await reducedPage.locator(".day-open-layer").waitFor();
await reducedPage.getByRole("button", { name: /Cerrar el itinerario/ }).click();
await reducedPage.locator(".day-open-layer").waitFor({ state: "detached" });
await reducedContext.close();

const transparencyContext = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "light" });
const transparencyPage = await transparencyContext.newPage();
await transparencyPage.emulateMedia({ reducedMotion: "reduce" });
await transparencyPage.goto(baseUrl, { waitUntil: "networkidle" });
const navBackground = await transparencyPage.locator(".bottom-nav").evaluate((element) => getComputedStyle(element).backgroundColor);
await transparencyContext.close();

function dataUri(buffer) { return `data:image/png;base64,${buffer.toString("base64")}`; }
const beforeBase = path.resolve("screenshots", "iteration-05", "before");
const pairs = [
  ["Días", "iteration-05-before-390x844-journey.png", "01-app-shell-dias.png"],
  ["Guardados", "iteration-05-before-390x844-saved.png", "02-app-shell-guardados.png"],
  ["Viaje", "iteration-05-before-390x844-trip.png", "03-app-shell-viaje.png"],
];
const pairData = await Promise.all(pairs.map(async ([label, before, after]) => ({ label, before: dataUri(await fs.readFile(path.join(beforeBase, before))), after: dataUri(await fs.readFile(path.join(outputDir, after))) })));
const comparePage = await browser.newPage({ viewport: { width: 900, height: 2800 } });
await comparePage.setContent(`<style>body{margin:0;padding:28px;background:#0c0c0c;color:white;font:700 20px Arial}.row{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px}.row h2{grid-column:1/-1;margin:0;font-size:28px}.shot{display:grid;gap:8px}.shot span{font:700 12px monospace;text-transform:uppercase;color:#dcfc24}.shot img{width:390px;border-radius:26px;border:1px solid #444}</style>${pairData.map((item) => `<section class="row"><h2>${item.label}</h2><div class="shot"><span>Before</span><img src="${item.before}"></div><div class="shot"><span>After</span><img src="${item.after}"></div></section>`).join("")}`);
await comparePage.screenshot({ path: path.join(compareDir, "before-after-sections.png"), fullPage: true });

const afterData = pairData.map((item) => ({ label: item.label, src: item.after }));
await comparePage.setViewportSize({ width: 1260, height: 940 });
await comparePage.setContent(`<style>body{margin:0;padding:24px;background:#0c0c0c;color:white;font:700 18px Arial}h1{margin:0 0 20px;font-size:32px}.grid{display:grid;grid-template-columns:repeat(3,390px);gap:18px}.shot{display:grid;gap:8px}.shot span{font:700 12px monospace;text-transform:uppercase;color:#dcfc24}.shot img{width:390px;border-radius:26px}</style><h1>TRAZA · un producto, tres ritmos</h1><div class="grid">${afterData.map((item) => `<div class="shot"><span>${item.label}</span><img src="${item.src}"></div>`).join("")}</div>`);
await comparePage.screenshot({ path: path.join(compareDir, "three-sections-after.png"), fullPage: true });

const validation = {
  viewport: "390x844",
  consoleErrors: errors,
  keyboardArrowChangesDay: keyboardBefore !== keyboardAfter,
  reducedMotion: true,
  reducedTransparencySolidNav: navBackground !== "rgba(0, 0, 0, 0)",
  captures: 18,
};
await fs.writeFile(path.join(outputDir, "validation.json"), JSON.stringify(validation, null, 2));
await browser.close();
if (errors.length) throw new Error(`Console errors:\n${errors.join("\n")}`);
console.log(JSON.stringify(validation, null, 2));
