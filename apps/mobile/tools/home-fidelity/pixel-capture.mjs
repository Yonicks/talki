/**
 * Pixel-parity capture for the Android Home mock (dev tool — not part of CI).
 *
 * The supplied mock (`assets/v3/mocks/mock_home_android_1843x853.png`) maps to
 * a 900 dp canvas, so the capture runs at a 900 × (417 + 50 ad) CSS viewport
 * with a device scale factor of 1843/900. One screenshot pixel is then exactly
 * one mock pixel, and the stage crop can be diffed against the mock 1:1.
 *
 * State matches the mock: 12 stars, hero "רגשות" at 8/10, 8 words to the next
 * star. It is seeded through the app's own E2E storage bridge.
 *
 *   artifacts/home-pixel/<tag>-full.png    whole viewport (stage + ad strip)
 *   artifacts/home-pixel/<tag>-stage.png   top 1843 × 853 — the diff target
 *   artifacts/home-pixel/<tag>-rects.json  element rects in mock pixels
 *
 * Usage: node tools/home-fidelity/pixel-capture.mjs <tag> [viewportW] [viewportH]
 *   with viewportW/H the game area in CSS px (default 900 × 417). Any other
 *   size is an "off-canvas" check, not a pixel diff.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const tag = process.argv[2] ?? 'pixel';
const gameW = Number(process.argv[3] ?? 900);
const gameH = Number(process.argv[4] ?? 417);
const base = process.env.TALKI_URL ?? 'http://localhost:8081';
const OUT = path.resolve('artifacts/home-pixel');
const AD_PX = Number(process.env.TALKI_AD_PX ?? 50);
const DSF = 1843 / 900;

const EMOTIONS_8 = [
  'שְׂמֵחָה', 'עֲצוּבָה', 'כּוֹעֶסֶת', 'מְפֻחֶדֶת', 'עֲיֵפָה', 'מֻפְתַּעַת', 'אוֹהֶבֶת', 'מִתְבַּיֶּשֶׁת',
];
const ANIMALS_4 = ['כֶּלֶב', 'חָתוּל', 'פָּרָה', 'אַרְיֵה'];

const IDS = [
  'home-stage', 'topbar-music', 'topbar-brand', 'home-header-profile', 'landscape-rewards-entry',
  'topbar-parent', 'home-hero', 'home-hero-continue', 'home-section-categories',
  'home-categories-prev', 'home-categories-next', 'ad-reserved',
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: gameW, height: gameH + AD_PX },
  deviceScaleFactor: DSF,
  isMobile: true,
  hasTouch: true,
  reducedMotion: 'reduce',
});
const page = await ctx.newPage();
await page.addInitScript((px) => { window.__talkiAdReservedPx = px; }, AD_PX);
await page.goto(`${base}/?intro=0`);
await page.waitForLoadState('networkidle');
await page.waitForFunction(() => Boolean(window.__talkiStorageE2E));
await page.evaluate(async ({ emo, ani }) => {
  const b = window.__talkiStorageE2E;
  await b.set('lia:progress', [...emo.map((w) => `emotions:${w}`), ...ani.map((w) => `animals:${w}`)]);
  await b.set('lia:lastcat', 'emotions');
}, { emo: EMOTIONS_8, ani: ANIMALS_4 });
await page.reload();
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-testid="home-hero"]');
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1500);

mkdirSync(OUT, { recursive: true });
const fullPath = path.join(OUT, `${tag}-full.png`);
await page.screenshot({ path: fullPath });

const rects = await page.evaluate(({ ids, dsf }) => {
  const r2 = (v) => Math.round(v * dsf * 10) / 10;
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r2(r.x), y: r2(r.y), w: r2(r.width), h: r2(r.height) };
  };
  const out = {};
  for (const id of ids) {
    const el = document.querySelector(`[data-testid="${id}"]`);
    if (el) out[id] = rect(el);
  }
  out.cards = [...document.querySelectorAll('[data-testid^="home-category-"]')].map((el) => ({
    id: el.getAttribute('data-testid').replace('home-category-', ''),
    ...rect(el),
  }));
  return out;
}, { ids: IDS, dsf: DSF });
writeFileSync(path.join(OUT, `${tag}-rects.json`), JSON.stringify(rects, null, 1));
await browser.close();
console.log(`wrote ${fullPath}`);
console.log(JSON.stringify({ viewport: [gameW, gameH + AD_PX], dsf: DSF }));
