/**
 * Deterministic screen capture for the mock-fidelity loop (dev tool).
 *
 *   node tools/visual-validation/shoot.mjs <screen> <label> [viewport]
 *
 * viewport: ref (844x395 @2x = the 1688x790 mock interior, default),
 *           pixel-9 | iphone-17-pro (Playwright descriptors, landscape screen).
 * Output: <repo>/visual-validation/<screen>/<viewport>/<label>-actual.png
 * Reserves the 50 px ad strip from first paint, reduces motion, seeds 43 learned
 * words (the mocks' star counter) through the app's own E2E storage bridge.
 */
import { chromium, devices } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const [screen, label = 'run', vp = 'ref'] = process.argv.slice(2);
const base = process.env.TALKI_URL ?? 'http://localhost:8092';
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const screens = JSON.parse(readFileSync(path.join(here, 'screens.json'), 'utf8'));
const sc = screens[screen];
if (!sc) throw new Error(`unknown screen ${screen}`);
const landscape = (s) => ({ width: Math.max(s.width, s.height), height: Math.min(s.width, s.height) });
const VPS = {
  ref: { viewport: { width: 844, height: 395 }, dsf: 2, ua: undefined },
  'pixel-9': { viewport: landscape(devices['Pixel 9'].screen), dsf: devices['Pixel 9'].deviceScaleFactor, ua: devices['Pixel 9'].userAgent },
  'iphone-17-pro': { viewport: landscape(devices['iPhone 17 Pro'].screen), dsf: devices['iPhone 17 Pro'].deviceScaleFactor, ua: devices['iPhone 17 Pro'].userAgent },
};
const v = VPS[vp];
if (vp === 'ref' && sc.vp) v.viewport = { width: sc.vp[0], height: sc.vp[1] };
const adPx = vp === 'ref' && sc.adPx ? sc.adPx : 50;
const out = path.resolve(here, '..', '..', '..', '..', 'visual-validation', screen, vp);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: v.viewport, deviceScaleFactor: v.dsf, userAgent: v.ua, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
const page = await ctx.newPage();
await page.addInitScript((px) => { window.__talkiAdReservedPx = px; }, adPx);
await page.goto(`${base}/?intro=0`);
await page.waitForLoadState('networkidle');
await page.waitForFunction(() => Boolean(window.__talkiStorageE2E));
await page.evaluate(async () => {
  const b = window.__talkiStorageE2E;
  await b.set('lia:progress', Array.from({ length: 43 }, (_, i) => `animals:w${i}`));
  await b.set('lia:lastcat', 'animals');
});
await page.reload();
await page.waitForLoadState('networkidle');
await page.waitForFunction(() => Boolean(window.__talkiRouterE2E));
if (screen !== 'home') {
  await page.evaluate((r) => window.__talkiRouterE2E.push(r), sc.route);
}
await page.waitForTimeout(1800);
if (sc.unlock) {
  const q = await page.locator('[data-testid="parent-gate-question"]').innerText();
  const [, a, b] = q.match(/(\d+)\s*×\s*(\d+)/) ?? [];
  for (const ch of String(Number(a) * Number(b))) await page.locator(`[data-testid="parent-gate-key-${ch}"]`).click();
  await page.locator('[data-testid="parent-gate-ok"]').click();
  await page.waitForTimeout(1200);
}
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({ content: '*{animation:none!important;transition:none!important;caret-color:transparent!important}' });
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(out, `${label}-actual.png`) });
await browser.close();
console.log(path.join(out, `${label}-actual.png`));
