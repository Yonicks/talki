/**
 * Dump the rects (in mock pixels) of every descendant of a test id, on the
 * same 900 × 467 @ 1843/900 rig as `pixel-capture.mjs` (dev tool).
 *
 * Usage: node tools/home-fidelity/dom-dump.mjs <testid> [maxDepth]
 */
import { chromium } from 'playwright';

const id = process.argv[2] ?? 'home-hero-panel';
const maxDepth = Number(process.argv[3] ?? 6);
const base = process.env.TALKI_URL ?? 'http://localhost:8081';
const DSF = 1843 / 900;

const EMOTIONS_8 = ['שְׂמֵחָה', 'עֲצוּבָה', 'כּוֹעֶסֶת', 'מְפֻחֶדֶת', 'עֲיֵפָה', 'מֻפְתַּעַת', 'אוֹהֶבֶת', 'מִתְבַּיֶּשֶׁת'];
const ANIMALS_4 = ['כֶּלֶב', 'חָתוּל', 'פָּרָה', 'אַרְיֵה'];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 900, height: 467 },
  deviceScaleFactor: DSF,
  isMobile: true,
  hasTouch: true,
  reducedMotion: 'reduce',
});
const page = await ctx.newPage();
await page.addInitScript(() => { window.__talkiAdReservedPx = 50; });
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
await page.waitForTimeout(800);

const rows = await page.evaluate(({ target, depth, dsf }) => {
  const root = document.querySelector(`[data-testid="${target}"]`);
  if (!root) return [`no element with data-testid=${target}`];
  const out = [];
  const walk = (el, d) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const f = (v) => Math.round(v * dsf * 10) / 10;
    const text = el.children.length === 0 ? (el.textContent || '').trim().slice(0, 16) : '';
    out.push(`${'  '.repeat(d)}${el.tagName.toLowerCase()}${el.dataset.testid ? '#' + el.dataset.testid : ''} ` +
      `x${f(r.x)}..${f(r.right)} y${f(r.y)}..${f(r.bottom)} (${f(r.width)}x${f(r.height)})` +
      `${text ? ` "${text}" ${cs.fontFamily.split(',')[0]} ${cs.fontSize}` : ''}`);
    if (d < depth) for (const c of el.children) walk(c, d + 1);
  };
  walk(root, 0);
  return out;
}, { target: id, depth: maxDepth, dsf: DSF });
await browser.close();
console.log(rows.join('\n'));
