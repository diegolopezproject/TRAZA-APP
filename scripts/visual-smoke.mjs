import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.APP_URL ?? "http://127.0.0.1:3000";
const browserPath = process.env.BROWSER_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDir = path.resolve("screenshots", "iteration-03");
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, reducedMotion: "no-preference" });
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("pageerror", (error) => consoleErrors.push(error.message));

async function ready() {
  await page.locator(".day-cover.is-active").waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

async function chooseDay(index) {
  const carousel = page.locator(".day-carousel");
  await carousel.focus();
  await page.keyboard.press("Home");
  for (let cursor = 0; cursor < index; cursor += 1) await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(280);
}

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await ready();

const covers = [
  [0, "01-portada-dia-06.png"], [1, "02-portada-dia-07.png"], [2, "03-portada-dia-08.png"],
  [3, "04-portada-dia-09.png"], [4, "05-portada-dia-10.png"],
];
for (const [index, filename] of covers) {
  await chooseDay(index);
  await page.screenshot({ path: path.join(outputDir, filename) });
}

await chooseDay(1);
const cover = await page.locator(".day-cover.is-active").boundingBox();
if (!cover) throw new Error("Active cover has no bounding box");
await page.mouse.move(cover.x + cover.width / 2, cover.y + cover.height * .73);
await page.mouse.down();
await page.mouse.move(cover.x + cover.width / 2, cover.y + cover.height * .58, { steps: 5 });
await page.waitForTimeout(80);
await page.screenshot({ path: path.join(outputDir, "06-apertura-frame.png") });
await page.mouse.move(cover.x + cover.width / 2, cover.y + cover.height * .43, { steps: 5 });
await page.mouse.up();
await page.locator(".day-open-layer").waitFor();
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(outputDir, "07-itinerario-dia-07.png") });

const itinerary = page.locator(".itinerary-scroll");
const skyCard = page.getByRole("button", { name: /Ver detalles: Sky Garden/i });
await skyCard.scrollIntoViewIfNeeded();
const scrollBeforeDetail = await itinerary.evaluate((element) => element.scrollTop);
await skyCard.click();
await page.locator(".detail-layer").waitFor();
await page.screenshot({ path: path.join(outputDir, "08-detalle-sky-garden.png") });
await page.getByLabel("Volver al itinerario").click();
await page.locator(".detail-layer").waitFor({ state: "detached" });
const scrollAfterDetail = await itinerary.evaluate((element) => element.scrollTop);
if (Math.abs(scrollAfterDetail - scrollBeforeDetail) > 2) throw new Error(`Itinerary scroll changed: ${scrollBeforeDetail} -> ${scrollAfterDetail}`);

const lunchButton = page.getByRole("button", { name: "Elegir restaurante" }).first();
await lunchButton.scrollIntoViewIfNeeded();
await lunchButton.click();
await page.getByRole("dialog").waitFor();
await page.waitForTimeout(450);
await page.screenshot({ path: path.join(outputDir, "09-selector-restaurante.png") });
await page.getByRole("button", { name: /GAIL's Bakery London Bridge/i }).click();
await page.getByText(/Comida · GAIL's Bakery London Bridge/i).waitFor();

await page.reload({ waitUntil: "networkidle" });
await ready();
await page.locator(".day-cover.is-active .open-day-handle").click();
await page.getByText(/Comida · GAIL's Bakery London Bridge/i).waitFor();
await page.getByRole("button", { name: "Cambiar restaurante" }).first().click();
await page.getByRole("button", { name: /Bread Ahead Bakery/i }).click();
await page.getByText(/Comida · Bread Ahead Bakery/i).waitFor();
await page.getByRole("button", { name: "Cambiar restaurante" }).first().click();
await page.getByRole("button", { name: "Quitar restaurante" }).click();
await page.getByRole("button", { name: "Elegir restaurante" }).first().waitFor();

await page.getByRole("button", { name: "Cerrar el itinerario y volver a la portada" }).click();
await page.getByRole("button", { name: "Guardados" }).click();
await page.locator(".saved-editorial-list").waitFor();
await page.locator(".saved-editorial-list").scrollIntoViewIfNeeded();
await page.screenshot({ path: path.join(outputDir, "10-guardados-28-lugares.png") });
await page.locator(".assignment-toast").waitFor({ state: "detached" });
await page.getByRole("button", { name: "Añadir lugar" }).click();
await page.getByRole("dialog").waitFor();
await page.waitForTimeout(450);
await page.screenshot({ path: path.join(outputDir, "11-formulario-anadir-lugar.png") });
await page.getByLabel("Nombre *").fill("Electric Test Café");
await page.getByLabel("Zona").fill("City de Londres");
await page.getByLabel("Etiquetas separadas por comas").fill("café, prueba local");
await page.getByRole("button", { name: "Guardar" }).click();
await page.getByText("29", { exact: true }).first().waitFor();
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("button", { name: "Guardados" }).click();
await page.getByText("29", { exact: true }).first().waitFor();
await page.getByText("Electric Test Café").waitFor();

const humbleCard = page.locator(".saved-card").filter({ hasText: "Humble Crumble" });
await humbleCard.scrollIntoViewIfNeeded();
await humbleCard.getByRole("button", { name: /Añadir Humble Crumble/i }).click();
await page.getByRole("dialog").waitFor();
await page.getByRole("button", { name: /viernes · 7 de agosto/i }).click();
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("button", { name: "Guardados" }).click();
await page.locator(".saved-card").filter({ hasText: "Humble Crumble" }).getByText(/Añadido al 7 de agosto/i).waitFor();

await page.getByRole("button", { name: "Días" }).click();
await page.locator(".day-cover.is-active .open-day-handle").click();
await page.getByRole("heading", { name: "Opciones cercanas" }).scrollIntoViewIfNeeded();
await page.getByText("Humble Crumble / Camden Market").waitFor();
const assignedCard = page.locator(".assigned-place-card").filter({ hasText: "Humble Crumble" });
await assignedCard.getByRole("button", { name: "Detalle" }).click();
await page.getByRole("dialog").getByRole("heading", { name: "Humble Crumble / Camden Market" }).waitFor();
await page.getByRole("dialog").getByRole("button", { name: "Cerrar" }).click();
await page.getByRole("button", { name: "Añadir plan" }).click();
await page.getByRole("button", { name: "Crear un plan" }).click();
await page.waitForTimeout(250);
await page.screenshot({ path: path.join(outputDir, "12-formulario-anadir-plan.png") });
await page.getByLabel("Nombre *").fill("Paseo por Leadenhall Market");
await page.getByLabel("Hora opcional").fill("16:15");
await page.getByLabel("Zona").fill("City de Londres");
await page.getByRole("button", { name: "Guardar" }).click();
await page.getByText("Paseo por Leadenhall Market").waitFor();
await page.reload({ waitUntil: "networkidle" });
await ready();
await page.locator(".day-cover.is-active .open-day-handle").click();
await page.getByText("Paseo por Leadenhall Market").waitFor();

const customCard = page.locator(".activity-card").filter({ hasText: "Paseo por Leadenhall Market" });
await customCard.getByRole("button", { name: "Editar plan" }).click();
await page.getByLabel("Fecha").selectOption("2026-08-08");
await page.getByRole("button", { name: "Guardar" }).click();
await page.getByText("Paseo por Leadenhall Market").waitFor({ state: "detached" });
await page.getByRole("button", { name: "Cerrar el itinerario y volver a la portada" }).click();
await chooseDay(2);
await page.locator(".day-cover.is-active .open-day-handle").click();
await page.getByText("Paseo por Leadenhall Market").waitFor();
await page.locator(".itinerary-scroll").evaluate((element) => { element.scrollTop = 0; });
await page.screenshot({ path: path.join(outputDir, "13-itinerario-dia-08.png") });
await page.locator(".activity-card").filter({ hasText: "Paseo por Leadenhall Market" }).getByRole("button", { name: "Editar plan" }).click();
await page.getByRole("button", { name: "Eliminar" }).click();
await page.getByText("Paseo por Leadenhall Market").waitFor({ state: "detached" });

await page.getByRole("button", { name: "Cerrar el itinerario y volver a la portada" }).click();
await page.getByRole("button", { name: "Guardados" }).click();
const testCard = page.locator(".saved-card").filter({ hasText: "Electric Test Café" });
await testCard.scrollIntoViewIfNeeded();
await testCard.getByRole("button", { name: "Editar" }).click();
page.once("dialog", (dialog) => dialog.accept());
await page.getByRole("button", { name: "Eliminar" }).click();
await page.getByText("28", { exact: true }).first().waitFor();
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("button", { name: "Guardados" }).click();
await page.getByText("28", { exact: true }).first().waitFor();
await page.getByRole("button", { name: "Viaje" }).click();
await page.getByRole("heading", { name: "Llegar y volver." }).scrollIntoViewIfNeeded();
await page.waitForTimeout(450);
await page.screenshot({ path: path.join(outputDir, "14-viaje-traslados.png") });
await page.getByRole("button", { name: "Consultar todos los puntos clave" }).scrollIntoViewIfNeeded();
await page.getByRole("button", { name: "Consultar todos los puntos clave" }).click();
await page.getByText("Sky Garden").waitFor();

const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(baseUrl, { waitUntil: "networkidle" });
await reducedPage.locator(".day-cover.is-active .open-day-handle").click();
await reducedPage.locator(".day-open-layer").waitFor();
await reducedPage.getByRole("button", { name: "Cerrar el itinerario y volver a la portada" }).click();
await reducedPage.locator(".day-open-layer").waitFor({ state: "detached" });
await reducedContext.close();

if (consoleErrors.length) throw new Error(`Console errors:\n${consoleErrors.join("\n")}`);
const validation = {
  viewport: "390x844", consoleErrors, scrollPositionPreserved: true, reducedMotion: true,
  localPlacePersistence: true, localPlanPersistence: true, mealSelectionPersistence: true,
  placeDeletionPersistence: true, assignmentPersistence: true, nearbyPlaceDetail: true, planMoveAndRemoval: true,
  mealChangeAndRemoval: true, dragOpening: true, handleOpening: true, visibleCloseControl: true,
};
await fs.writeFile(path.join(outputDir, "validation.json"), JSON.stringify(validation, null, 2));
await browser.close();
console.log(JSON.stringify(validation, null, 2));
