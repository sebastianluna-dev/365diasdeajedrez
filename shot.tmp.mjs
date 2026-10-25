import { chromium } from "playwright";
const [, , id, out, width = "1280", height = "900", scheme = "light"] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) }, colorScheme: scheme });
await page.goto(`http://localhost:6021/iframe.html?id=${id}&viewMode=story`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
