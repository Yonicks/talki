/**
 * Home visual-fidelity capture harness (dev tool — not part of CI).
 *
 * Renders the real Home screen in Chromium against the running Expo web dev
 * server, seeds deterministic progress through the app's own E2E storage
 * bridge (12 learned animals ⇒ hero "חיות", 12/26, 8 words to the next star,
 * 12 points), reserves the ad strip from first paint, and writes:
 *
 *   artifacts/home-fidelity/<tag>-<viewport>.png        viewport + ad strip
 *   artifacts/home-fidelity/<tag>-<viewport>-stage.png  game stage only
 *
 * Usage: node tools/home-fidelity/capture.mjs <tag>
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const tag = process.argv[2] ?? 'pass';
const base = process.env.TALKI_URL ?? 'http://localhost:8081';
const OUT = path.resolve('artifacts/home-fidelity');
const AD_PX = 50;

/** Game area is <w>×<h>; the reserved ad strip is added below it. */
const VIEWPORTS = [
  // 900 × 390 is the mock's own canvas: at this size the implementation and
  // the mock are directly comparable 1:1, so it is the fidelity yardstick.
  { name: '900x390', w: 900, h: 390 },
  { name: '844x390', w: 844, h: 390 },
  { name: '667x375', w: 667, h: 375 },
  { name: '740x360', w: 740, h: 360 },
  { name: '915x412', w: 915, h: 412 },
  { name: '1024x600', w: 1024, h: 600 },
  { name: '1280x800', w: 1280, h: 800 },
];

/** First 12 `animals` words, verbatim from domain/vocabulary/categories.ts. */
const ANIMALS_12 = [
  'כֶּלֶב', 'חָתוּל', 'פָּרָה', 'אַרְיֵה', 'פִּיל', 'בַּרְוָוז',
  'סוּס', 'תַּרְנְגוֹלֶת', 'כִּבְשָׂה', 'קוֹף', 'חֲזִיר', 'צְפַרְדֵּעַ',
];

async function shoot(browser, vp) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h + AD_PX },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.addInitScript((px) => { window.__talkiAdReservedPx = px; }, AD_PX);
  await page.goto(`${base}/?intro=0`);
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => Boolean(window.__talkiStorageE2E));
  await page.evaluate(async (words) => {
    const b = window.__talkiStorageE2E;
    await b.set('lia:progress', words.map((w) => `animals:${w}`));
    await b.set('lia:lastcat', 'animals');
  }, ANIMALS_12);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[data-testid="home-hero"]');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);

  mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: path.join(OUT, `${tag}-${vp.name}.png`) });
  const stage = page.locator('[data-testid="home-stage"]');
  if (await stage.count()) {
    await stage.screenshot({ path: path.join(OUT, `${tag}-${vp.name}-stage.png`) });
  }

  const metrics = await page.evaluate((fn) => {
    const q = (id) => document.querySelector(`[data-testid="${id}"]`);
    const b = (id) => {
      const el = q(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const n = (v) => Math.round(v * 10) / 10;
      return { x: n(r.x), y: n(r.y), w: n(r.width), h: n(r.height) };
    };
    const cards = [...document.querySelectorAll('[data-testid^="home-category-"]')].map((el) => {
      const r = el.getBoundingClientRect();
      return { id: el.getAttribute('data-testid').replace('home-category-', ''), x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height) };
    });
    return {
      stage: b('home-stage'), music: b('topbar-music'), brand: b('topbar-brand'),
      profile: b('home-header-profile'), rewards: b('landscape-rewards-entry'),
      hero: b('home-hero'), cta: b('home-hero-continue'),
      strip: b('home-section-categories'), prev: b('home-categories-prev'), next: b('home-categories-next'),
      ad: b('ad-reserved'),
      cards: cards.slice(0, 10),
      doc: { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth },
    };
  });
  await ctx.close();
  return { vp, metrics };
}

const browser = await chromium.launch();
const out = [];
for (const vp of VIEWPORTS) out.push(await shoot(browser, vp));
await browser.close();
for (const r of out) {
  console.log(`\n=== ${r.vp.name} (game ${r.vp.w}x${r.vp.h} + ${AD_PX}px ad) ===`);
  console.log(JSON.stringify(r.metrics, null, 1));
}
