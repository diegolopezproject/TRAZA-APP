import fs from "node:fs/promises";
import path from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve("node_modules", "playwright-core", ".local-browsers");
const { chromium, webkit } = await import("playwright-core");

const appUrl = process.env.APP_URL ?? "http://127.0.0.1:3000";
const root = path.resolve("screenshots", "iteration-12-full-bleed-preview");
const viewports = [
  { name: "360x800", width: 360, height: 800 },
  { name: "390x844", width: 390, height: 844 },
  { name: "412x915", width: 412, height: 915 },
  { name: "430x932", width: 430, height: 932 },
];
const expectedBackgrounds = [
  "rgb(124, 58, 67)",
  "rgb(15, 90, 80)",
  "rgb(138, 63, 118)",
  "rgb(76, 57, 115)",
  "rgb(164, 69, 46)",
  "rgb(47, 79, 143)",
  "rgb(63, 90, 52)",
  "rgb(41, 46, 51)",
];

await fs.mkdir(root, { recursive: true });

function watch(page, errors) {
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) {
      errors.push(`console: ${message.text()}`);
    }
  });
}

async function settle(page, delay = 300) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(delay);
}

async function selectDay(page, index) {
  const stage = page.locator(".ds-day-deck__stage");
  await stage.focus();
  await page.keyboard.press("Home");
  await settle(page, 40);
  for (let step = 0; step < index; step += 1) {
    await page.keyboard.press("ArrowRight");
    await settle(page, 40);
  }
  await settle(page, 120);
}

async function auditCover(page, index) {
  await selectDay(page, index);
  return page.evaluate(({ index, expectedBackground }) => {
    const cover = document.querySelector(".ds-day-cover.is-active");
    const nav = document.querySelector(".ds-bottom-navigation");
    if (!cover) throw new Error("No active DayCover");
    const coverRect = cover.getBoundingClientRect();
    const navRect = nav?.getBoundingClientRect();
    const rect = (selector) => {
      const element = cover.querySelector(selector);
      if (!element) throw new Error(`Missing ${selector}`);
      return element.getBoundingClientRect();
    };
    const regions = [".ds-day-cover__header", ".ds-day-cover__title", ".ds-day-cover__details", ".ds-day-cover__action"].map((selector) => ({ selector, rect: rect(selector) }));
    const title = cover.querySelector(".ds-day-cover__title h2");
    const titleStyle = getComputedStyle(title);
    const titleRect = title.getBoundingClientRect();
    const detailsRect = rect(".ds-day-cover__details");
    const actionRect = rect(".ds-day-cover__action");
    const fractions = cover.innerText.match(/\b\d+\s\/\s8\b/g) ?? [];
    return {
      index,
      background: getComputedStyle(cover).backgroundColor,
      expectedBackground,
      cover: { x: coverRect.x, y: coverRect.y, width: coverRect.width, height: coverRect.height, borderRadius: getComputedStyle(cover).borderRadius },
      regionsInside: regions.every(({ rect: region }) => region.left >= coverRect.left - .5 && region.right <= coverRect.right + .5 && region.top >= coverRect.top - .5 && region.bottom <= coverRect.bottom + .5),
      titleDetailsGap: +(detailsRect.top - titleRect.bottom).toFixed(1),
      detailsActionGap: +(actionRect.top - detailsRect.bottom).toFixed(1),
      titleLines: +(titleRect.height / parseFloat(titleStyle.lineHeight)).toFixed(1),
      fractionCount: fractions.length,
      progressMarks: cover.querySelectorAll(".ds-day-cover__progress i").length,
      ctaHeight: +rect(".ds-day-cover__action button").height.toFixed(1),
      ctaLabel: cover.querySelector(".ds-day-cover__action button")?.getAttribute("aria-label"),
      documentOverflowX: document.documentElement.scrollWidth - innerWidth,
      navOverlap: Boolean(navRect && coverRect.bottom > navRect.top + .5),
      artBorderWidth: getComputedStyle(cover.querySelector(".ds-day-cover__art")).borderWidth,
    };
  }, { index, expectedBackground: expectedBackgrounds[index] });
}

const reports = [];
for (const [engineName, engine, executablePath] of [
  ["chromium", chromium, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"],
  ["webkit", webkit, path.resolve("node_modules", "playwright-core", ".local-browsers", "webkit-2336", "Playwright.exe")],
]) {
  const browser = await engine.launch(engineName === "chromium" ? { executablePath, headless: true } : { headless: true });
  const errors = [];
  const engineReport = { engine: engineName, errors, viewports: [], collection: [] };
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    watch(page, errors);
    await page.goto(appUrl, { waitUntil: "networkidle", timeout: 60_000 });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle", timeout: 60_000 });
    await settle(page, 400);
    const day07 = await auditCover(page, 1);
    engineReport.viewports.push({ viewport, day07 });
    await page.screenshot({ path: path.join(root, `${engineName}-day-07-${viewport.name}.png`) });

    if (viewport.name === "390x844") {
      for (let index = 0; index < 8; index += 1) {
        const audit = await auditCover(page, index);
        engineReport.collection.push(audit);
        await page.screenshot({ path: path.join(root, `${engineName}-day-${String(index + 6).padStart(2, "0")}-390x844.png`) });
      }
    }
    await context.close();
  }
  await browser.close();
  reports.push(engineReport);
}

await fs.writeFile(path.join(root, "audit.json"), JSON.stringify(reports, null, 2), "utf8");

const failures = reports.flatMap((report) => {
  const audits = [...report.viewports.map((item) => item.day07), ...report.collection];
  return [
    ...report.errors,
    ...audits.flatMap((audit) => [
      audit.background !== audit.expectedBackground && `day ${audit.index}: wrong background`,
      !audit.regionsInside && `day ${audit.index}: region outside cover`,
      audit.titleDetailsGap < 0 && `day ${audit.index}: title/details collision`,
      audit.detailsActionGap < 0 && `day ${audit.index}: details/action collision`,
      audit.titleLines > 4 && `day ${audit.index}: ${audit.titleLines} title lines`,
      audit.fractionCount !== 1 && `day ${audit.index}: fraction count ${audit.fractionCount}`,
      audit.progressMarks !== 8 && `day ${audit.index}: progress count ${audit.progressMarks}`,
      audit.ctaHeight < 44 && `day ${audit.index}: CTA below touch target`,
      !audit.ctaLabel?.startsWith("Abrir día") && `day ${audit.index}: CTA label`,
      audit.documentOverflowX !== 0 && `day ${audit.index}: document overflow`,
      audit.navOverlap && `day ${audit.index}: nav overlap`,
      audit.artBorderWidth !== "0px" && `day ${audit.index}: framed art`,
    ].filter(Boolean)),
  ];
});

console.log(JSON.stringify({ reports: reports.map(({ engine, errors, viewports, collection }) => ({ engine, errors, viewports: viewports.length, collection: collection.length })), failures }, null, 2));
if (failures.length) throw new Error(`Visual gate failed with ${failures.length} issue(s).`);
