import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
const require = createRequire(path.join(os.homedir(), ".claude/skills/app-designer-pro/package.json"));
const { chromium } = require("playwright-core");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1900, height: 1200 }, deviceScaleFactor: 3 });
await page.goto("file://" + path.resolve("banners.html"));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);
fs.mkdirSync("shots/banners", { recursive: true });
for (const r of ["16x9", "21x9", "3x2"]) {
  await page.locator(`[data-ratio="${r}"]`).screenshot({ path: `shots/banners/${r}.png` });
}
await browser.close();
