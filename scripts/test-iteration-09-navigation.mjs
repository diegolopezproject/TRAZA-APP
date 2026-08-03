import path from "node:path";
import { spawn } from "node:child_process";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve("node_modules", "playwright-core", ".local-browsers");
const { chromium } = await import("playwright-core");
const appUrl = "http://127.0.0.1:3099";
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3099"], { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"], windowsHide: true });

async function waitForServer() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { if ((await fetch(appUrl)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Iteration 09 test server did not start");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function settle(page, delay = 320) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(delay);
}

async function historyDepth(page) {
  return page.evaluate(() => window.history.state?.__trazaNavigationV1?.depth ?? null);
}

async function browserBack(page, selectorToDisappear) {
  await page.evaluate(() => window.history.back());
  if (selectorToDisappear) await page.locator(selectorToDisappear).waitFor({ state: "detached" });
  await settle(page);
}

await waitForServer();
const browser = await chromium.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
const context = await browser.newContext({ viewport: { width: 402, height: 874 }, screen: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => { if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) errors.push(message.text()); });

try {
  await page.goto(appUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await settle(page);

  const navGeometry = await page.evaluate(() => {
    const items = [...document.querySelectorAll(".ds-bottom-navigation__item")];
    const rects = items.map((item) => item.getBoundingClientRect());
    const active = document.querySelector(".ds-bottom-navigation__item.is-active");
    const pill = document.querySelector(".ds-bottom-navigation__active-pill");
    return {
      count: items.length,
      widths: rects.map((rect) => Math.round(rect.width * 10) / 10),
      heights: rects.map((rect) => Math.round(rect.height * 10) / 10),
      activeColor: active ? getComputedStyle(active).color : null,
      pillColor: pill ? getComputedStyle(pill).backgroundColor : null,
      rootBackSwipeZones: document.querySelectorAll(".journey-view .app-back-swipe-zone").length,
    };
  });
  assert(navGeometry.count === 3, "Bottom navigation must expose three destinations");
  assert(new Set(navGeometry.widths).size === 1 && new Set(navGeometry.heights).size === 1, "Bottom navigation items must have equal geometry");
  assert(navGeometry.heights[0] >= 44, "Bottom navigation targets must be at least 44px");
  assert(navGeometry.pillColor === "rgb(213, 244, 59)" && navGeometry.activeColor === "rgb(22, 22, 22)", "Active navigation pill must be Lime with Ink content");
  assert(navGeometry.rootBackSwipeZones === 0, "Days root must not install an internal back swipe zone");

  const stage = page.locator(".ds-day-deck__stage");
  const stageBox = await stage.boundingBox();
  assert(stageBox, "Day deck bounds are required");
  const selectedBeforeSwipe = Number(await stage.getAttribute("aria-valuenow"));
  const start = { x: stageBox.x + stageBox.width * .62, y: stageBox.y + stageBox.height * .55 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x - stageBox.width * .3, start.y, { steps: 8 });
  const dragColors = await page.evaluate(() => [...document.querySelectorAll(".ds-day-deck__card")].map((card) => {
    const cover = card.querySelector(".ds-day-cover");
    const coverStyle = cover ? getComputedStyle(cover) : null;
    return { opacity: getComputedStyle(card).opacity, filter: getComputedStyle(card).filter, background: coverStyle?.backgroundColor ?? null, backgroundImage: coverStyle?.backgroundImage ?? null, coverColor: coverStyle?.getPropertyValue("--cover-bg").trim() ?? null };
  }));
  assert(dragColors.length <= 3 && dragColors.length >= 2, "Deck must keep at most previous/current/next mounted");
  assert(dragColors.every((card) => card.opacity === "1" && card.filter === "none" && Boolean(card.coverColor) && (card.background !== "rgba(0, 0, 0, 0)" || card.backgroundImage !== "none")), `Every card must keep its real color during drag: ${JSON.stringify(dragColors)}`);
  await page.mouse.up();
  await settle(page);
  const selectedAfterSwipe = Number(await stage.getAttribute("aria-valuenow"));
  assert(Math.abs(selectedAfterSwipe - selectedBeforeSwipe) <= 1, `A single swipe must move at most one day, got ${selectedBeforeSwipe} -> ${selectedAfterSwipe}`);

  await stage.focus();
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  await settle(page);
  const open = page.locator(".ds-day-cover.is-active .ds-day-cover__action button");
  await open.click();
  await settle(page, 500);
  const openState = await page.evaluate(() => ({ hash: location.hash, active: document.querySelector(".ds-day-cover.is-active")?.textContent?.replace(/\s+/g, " ").trim(), dayLayers: document.querySelectorAll(".day-open-layer").length, history: window.history.state?.__trazaNavigationV1 }));
  assert(openState.dayLayers === 1, `Opening day 7 failed: ${JSON.stringify(openState)}`);
  assert(await historyDepth(page) === 1, "Opening a day must push one history entry");
  const itinerary = page.locator(".itinerary-scroll");
  await itinerary.evaluate((element) => { element.scrollTop = 420; });
  const skyButton = page.getByRole("button", { name: /Ver detalles: Sky Garden/i });
  await skyButton.scrollIntoViewIfNeeded();
  const savedDayScroll = await itinerary.evaluate((element) => element.scrollTop);
  await skyButton.click();
  await page.locator(".detail-layer").waitFor();
  assert(await historyDepth(page) === 2, "Opening activity detail must push a second entry");
  await browserBack(page, ".detail-layer");
  assert(await page.locator(".day-open-layer").count() === 1, "First Android/browser Back must return to the open day");
  const restoredDayScroll = await itinerary.evaluate((element) => element.scrollTop);
  assert(Math.abs(restoredDayScroll - savedDayScroll) <= 2, "Itinerary scroll must be restored");
  const restoredFocus = await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent?.trim());
  assert(Boolean(restoredFocus?.includes("Sky Garden")), "Focus must return to the Sky Garden opener");
  await browserBack(page, ".day-open-layer");
  assert((await page.locator(".ds-day-cover.is-active").textContent())?.includes("07"), "Second Back must return to Days with day 7 selected");

  await page.getByRole("button", { name: "Guardados" }).click();
  const saved = page.locator(".saved-view");
  const mms = page.locator(".ds-saved-place-card").filter({ hasText: "M&M's London" }).first();
  await mms.scrollIntoViewIfNeeded();
  const savedScroll = await saved.evaluate((element) => element.scrollTop);
  await mms.getByRole("button", { name: "Detalle" }).click();
  await page.locator(".ds-sheet").waitFor();
  await browserBack(page, ".ds-sheet");
  assert(Math.abs((await saved.evaluate((element) => element.scrollTop)) - savedScroll) <= 2, "Saved scroll must be restored after place detail");
  assert((await page.evaluate(() => document.activeElement?.textContent?.trim())) === "Detalle", "Focus must return to the place detail trigger");

  await mms.getByRole("button", { name: /Añadir a un día|Asignado al/i }).click();
  await page.locator(".assignment-days > button").nth(1).click();
  assert(await page.getByText(/2 de 2/i).count() > 0, "Assignment step two must open");
  await browserBack(page);
  assert(await page.getByText(/1 de 2/i).count() > 0, "Back from assignment step two must return to step one");
  await browserBack(page, ".ds-sheet");

  await mms.getByRole("button", { name: "Detalle" }).click();
  const swipeZone = page.locator(".ds-sheet .app-back-swipe-zone");
  await page.locator(".ds-sheet").waitFor();
  await settle(page, 700);
  const zoneBox = await swipeZone.boundingBox();
  assert(zoneBox, "Secondary sheets must expose an edge swipe zone on touch devices");
  await page.mouse.move(zoneBox.x + zoneBox.width / 2, zoneBox.y + zoneBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(zoneBox.x + 150, zoneBox.y + zoneBox.height / 2, { steps: 10 });
  const swipeProgress = await page.locator(".ds-sheet").evaluate((element) => ({ transform: getComputedStyle(element).transform, inlineStyle: element.getAttribute("style") }));
  await page.mouse.up();
  await page.locator(".ds-sheet").waitFor({ state: "detached", timeout: 5000 });
  assert(new URL(page.url()).hash === "#saved", `Edge swipe must navigate back: ${JSON.stringify({ swipeProgress, hash: new URL(page.url()).hash, depth: await historyDepth(page) })}`);

  await page.getByRole("button", { name: /A(?:ñ|Ã±)adir lugar/i }).click();
  await page.locator(".ds-sheet").waitFor();
  assert(new URL(page.url()).hash.includes("#saved/form/"), "Opening the place form must push a saved form entry");
  await browserBack(page, ".ds-sheet");
  assert(new URL(page.url()).hash === "#saved", "Browser Back from the place form must restore Saved");

  await page.getByRole("button", { name: "Viaje" }).click();
  await page.getByRole("button", { name: "Editar" }).click();
  await page.locator(".transfer-fields").first().waitFor();
  assert(new URL(page.url()).hash === "#trip/transfers/edit", "Opening transfer editing must push a form entry");
  await browserBack(page, ".transfer-fields");
  assert(new URL(page.url()).hash === "#trip", "Browser Back from transfer editing must restore Trip");

  const direct = await context.newPage();
  await direct.goto(`${appUrl}/#days/2026-08-07/activity/2026-08-07-sky-garden-0`, { waitUntil: "networkidle" });
  await direct.locator(".detail-layer").waitFor();
  await direct.getByRole("button", { name: /Volver al itinerario/i }).first().click();
  await direct.locator(".detail-layer").waitFor({ state: "detached" });
  await direct.locator(".day-open-layer").waitFor({ state: "detached" });
  assert(direct.url().endsWith("#days"), "Direct-entry close must replace with a safe Days root");
  await direct.close();

  assert(errors.length === 0, `Browser errors: ${errors.join(" | ")}`);
  console.log(JSON.stringify({ pass: true, navGeometry, dragColors, history: ["Sky Garden", "día 7", "Días"], scroll: { savedDayScroll, restoredDayScroll, savedScroll }, errors }, null, 2));
} finally {
  await context.close();
  await browser.close();
  server.kill();
}
