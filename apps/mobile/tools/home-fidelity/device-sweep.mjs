/**
 * Device sweep (dev tool): Pixel 9 and iPhone 17 Pro, landscape, in Chromium.
 *
 * Project rule: every Playwright/Chromium check runs on these two emulated
 * phones (Pixel 9 Pro is added because it is the size the Home mock work was
 * first reviewed at). Each device is its Playwright descriptor — user agent,
 * device scale factor, touch — with the viewport set to the full landscape
 * *screen*, because the shipped app is native and has no browser chrome.
 * Chromium cannot emulate iOS safe-area insets, so notch/home-indicator
 * spacing is not covered here.
 *
 * The ad strip is reserved from first paint (`__talkiAdReservedPx`, 50 px), so
 * every ad-eligible screen is measured with the banner slot present.
 *
 *   node tools/home-fidelity/device-sweep.mjs home   # Home only, with layout checks
 *   node tools/home-fidelity/device-sweep.mjs all    # every screen
 *
 * Output: artifacts/device/<device>/<screen>.png and artifacts/device/report.json
 */
import { chromium, devices } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const mode = process.argv[2] ?? 'home';
const base = process.env.TALKI_URL ?? 'http://localhost:8081';
const OUT = path.resolve('artifacts/device');
const AD_PX = 50;

const landscape = (screen) => ({ width: Math.max(screen.width, screen.height), height: Math.min(screen.width, screen.height) });

const DEVICES = [
  { name: 'pixel-9', descriptor: devices['Pixel 9'], viewport: landscape(devices['Pixel 9'].screen) },
  { name: 'iphone-17-pro', descriptor: devices['iPhone 17 Pro'], viewport: landscape(devices['iPhone 17 Pro'].screen) },
  { name: 'pixel-9-pro', descriptor: devices['Pixel 9 Pro'], viewport: landscape(devices['Pixel 9 Pro'].screen) },
];

const EMOTIONS_8 = ['שְׂמֵחָה', 'עֲצוּבָה', 'כּוֹעֶסֶת', 'מְפֻחֶדֶת', 'עֲיֵפָה', 'מֻפְתַּעַת', 'אוֹהֶבֶת', 'מִתְבַּיֶּשֶׁת'];
const ANIMALS_4 = ['כֶּלֶב', 'חָתוּל', 'פָּרָה', 'אַרְיֵה'];

const SCREENS = [
  { name: 'home', path: '/', root: 'home-root' },
  { name: 'games', path: '/games', root: 'games-menu-root' },
  { name: 'practice', path: '/practice', root: 'practice-menu-root' },
  { name: 'rewards', path: '/rewards', root: 'stickers-root' },
  { name: 'parent', path: '/parent?seed=42', root: 'parent-root' },
  { name: 'category', path: '/category/animals', root: 'category-root' },
  { name: 'cards', path: '/cards/animals', root: 'cards-root' },
  { name: 'game-quiz', path: '/game/quiz?catId=animals&seed=42' },
  { name: 'game-memory', path: '/game/memory?catId=animals&seed=42' },
  { name: 'game-missing', path: '/game/missing?catId=animals&seed=42' },
  { name: 'game-match', path: '/game/match?catId=animals&seed=42' },
  { name: 'game-bubbles', path: '/game/bubbles?catId=animals&seed=42' },
  { name: 'game-sounds', path: '/game/sounds?catId=animals&seed=42' },
  { name: 'game-count', path: '/game/count?catId=animals&seed=42' },
  { name: 'game-sort', path: '/game/sort?catId=animals&seed=42' },
  { name: 'game-puzzle', path: '/game/puzzle?catId=home&seed=42' },
  { name: 'practice-focus', path: '/practice/focus?catId=animals&seed=42' },
  { name: 'practice-cloze', path: '/practice/cloze?catId=animals&seed=42' },
  { name: 'practice-temptation', path: '/practice/temptation?catId=animals&seed=42' },
  { name: 'practice-receptive', path: '/practice/receptive?catId=animals&seed=42' },
  { name: 'practice-pairs', path: '/practice/pairs?catId=animals&seed=42' },
  { name: 'practice-combine', path: '/practice/combine?catId=animals&seed=42' },
];

async function openDevice(browser, dev) {
  const d = dev.descriptor;
  const ctx = await browser.newContext({
    userAgent: d.userAgent,
    deviceScaleFactor: d.deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
    viewport: dev.viewport,
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
  await page.waitForTimeout(1000);
  return { ctx, page };
}

/** Layout facts for Home: is anything under the ad strip, and how much air is there? */
async function homeChecks(page) {
  return page.evaluate(() => {
    const r = (id) => {
      const el = document.querySelector(`[data-testid="${id}"]`);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: b.x, y: b.y, w: b.width, h: b.height, bottom: b.bottom, right: b.right };
    };
    const ad = r('ad-reserved');
    const stage = r('home-stage');
    const hero = r('home-hero-panel');
    const strip = r('home-section-categories');
    const prev = r('home-categories-prev');
    const music = r('topbar-music');
    const brand = r('topbar-brand');
    const cards = [...document.querySelectorAll('[data-testid^="home-category-"]')].map((el) => el.getBoundingClientRect());
    const visible = cards.filter((c) => strip && c.x >= strip.x - 0.5 && c.right <= strip.right + 0.5).length;
    const doc = document.documentElement;
    return {
      viewport: { w: innerWidth, h: innerHeight },
      ad, stage, hero, strip, prev, music, brand,
      gapStripToAd: ad && strip ? Math.round((ad.y - prev.bottom) * 10) / 10 : null,
      gapCardsToAd: ad && strip ? Math.round((ad.y - strip.bottom) * 10) / 10 : null,
      gapHeroToStrip: hero && strip ? Math.round((strip.y - hero.bottom) * 10) / 10 : null,
      gapHeaderToHero: hero && music ? Math.round((hero.y - music.bottom) * 10) / 10 : null,
      cardsWhollyVisible: visible,
      scrollX: doc.scrollWidth > doc.clientWidth + 1,
      scrollY: doc.scrollHeight > doc.clientHeight + 1,
    };
  });
}

async function pushRoute(page, p) {
  await page.waitForFunction(() => Boolean(window.__talkiRouterE2E));
  await page.evaluate((route) => window.__talkiRouterE2E.push(route), p);
}

const browser = await chromium.launch();
const report = {};
for (const dev of DEVICES) {
  const { ctx, page } = await openDevice(browser, dev);
  const dir = path.join(OUT, dev.name);
  mkdirSync(dir, { recursive: true });
  report[dev.name] = { viewport: dev.viewport, dsf: dev.descriptor.deviceScaleFactor, screens: {} };

  const screens = mode === 'all' ? SCREENS : SCREENS.slice(0, 1);
  for (const sc of screens) {
    if (sc.name !== 'home') {
      await pushRoute(page, sc.path);
      await page.waitForTimeout(1200);
    }
    if (sc.root) await page.waitForSelector(`[data-testid="${sc.root}"]`, { timeout: 6000 }).catch(() => {});
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(dir, `${sc.name}.png`) });
    const entry = { ok: true };
    if (sc.name === 'home') Object.assign(entry, await homeChecks(page));
    entry.overflow = await page.evaluate(() => ({
      x: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      y: document.documentElement.scrollHeight > document.documentElement.clientHeight + 1,
    }));
    report[dev.name].screens[sc.name] = entry;
    if (sc.name !== 'home') {
      await pushRoute(page, '/');
      await page.waitForTimeout(400);
    }
  }
  await ctx.close();
}
await browser.close();

mkdirSync(OUT, { recursive: true });
writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
for (const [name, r] of Object.entries(report)) {
  const h = r.screens.home;
  console.log(`\n=== ${name}  ${r.viewport.width}x${r.viewport.height} @${r.dsf}x  (+${AD_PX}px ad reserved) ===`);
  if (h) {
    console.log(`  stage ${h.stage.w}x${h.stage.h}  ad y=${h.ad?.y}  cards fully visible: ${h.cardsWhollyVisible}`);
    console.log(`  air (css px): header→hero ${h.gapHeaderToHero}  hero→strip ${h.gapHeroToStrip}  strip→ad ${h.gapCardsToAd}  arrows→ad ${h.gapStripToAd}`);
    console.log(`  doc scroll x=${h.scrollX} y=${h.scrollY}`);
  }
  if (mode === 'all') {
    const bad = Object.entries(r.screens).filter(([, e]) => e.overflow.x || e.overflow.y).map(([n]) => n);
    console.log(`  screens captured: ${Object.keys(r.screens).length}   with document scroll: ${bad.length ? bad.join(', ') : 'none'}`);
  }
}
