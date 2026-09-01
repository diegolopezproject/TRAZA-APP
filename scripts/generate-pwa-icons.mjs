import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const output = path.resolve("public", "icons");
const sourceIcon = await readFile(path.resolve("public", "brand", "traza-app-icon.svg"), "utf8");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });

async function renderIcon(size, fileName, maskable = false) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  const icon = maskable ? sourceIcon.replace('rx="230"', 'rx="0"') : sourceIcon;
  await page.setContent(
    `<!doctype html><style>html,body,svg{display:block;margin:0;width:100%;height:100%;overflow:hidden}</style>${icon}`,
  );
  await page.screenshot({ path: path.join(output, fileName), omitBackground: true });
  await page.close();
}

await renderIcon(192, "traza-192.png");
await renderIcon(512, "traza-512.png");
await renderIcon(512, "traza-maskable-512.png", true);
await browser.close();
