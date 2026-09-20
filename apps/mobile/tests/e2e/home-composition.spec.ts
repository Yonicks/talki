import { expect, test, type Page } from '@playwright/test';

import { testIds } from '../../src/testing/testIds';
import { openApp } from './_helpers';

/**
 * The v3 Home composition contract: the parts of the approved mock that are
 * *behavioural*, not just pixels — the art-directed stage owning the whole
 * usable viewport, the ad strip living strictly beneath it, the carousel
 * arrows paging the real scroller, and every control the mock draws still
 * doing its job.
 *
 * Geometry is asserted as relationships (stage above ad, cards inside the
 * stage, eight cards on the reference viewport), not as fixed pixel values,
 * so the suite keeps its meaning on every viewport in the matrix.
 */

const AD_PX = 50;

type StorageBridge = { set<T>(key: string, value: T): Promise<void> };

/** First twelve `animals` words — 12 points, 12/26 learned, 8 to the next star. */
const ANIMALS_12 = [
  'כֶּלֶב', 'חָתוּל', 'פָּרָה', 'אַרְיֵה', 'פִּיל', 'בַּרְוָוז',
  'סוּס', 'תַּרְנְגוֹלֶת', 'כִּבְשָׂה', 'קוֹף', 'חֲזִיר', 'צְפַרְדֵּעַ',
];

async function seedAnimals(page: Page): Promise<void> {
  await page.waitForFunction(() =>
    Boolean((window as unknown as { __talkiStorageE2E?: unknown }).__talkiStorageE2E),
  );
  await page.evaluate(async (words) => {
    const bridge = (window as unknown as { __talkiStorageE2E: StorageBridge }).__talkiStorageE2E;
    await bridge.set('lia:progress', words.map((w) => `animals:${w}`));
    await bridge.set('lia:lastcat', 'animals');
  }, ANIMALS_12);
  await page.reload();
  await page.waitForLoadState('networkidle');
}

async function reserveAd(page: Page, px = AD_PX): Promise<void> {
  await page.addInitScript((n) => {
    (window as unknown as { __talkiAdReservedPx?: number }).__talkiAdReservedPx = n;
  }, px);
}

test.describe('v3 Home composition', () => {
  test('the stage fills the usable viewport and the ad strip sits strictly beneath it', async ({
    page,
  }) => {
    await reserveAd(page);
    await openApp(page);
    await seedAnimals(page);

    const stage = page.getByTestId(testIds.home.stage);
    const ad = page.getByTestId(testIds.ads.reserved);
    await expect(stage).toBeVisible();
    await expect(ad).toBeVisible();

    const [stageBox, adBox] = await Promise.all([stage.boundingBox(), ad.boundingBox()]);
    const viewport = page.viewportSize()!;

    // Ad strictly below the stage — no overlay, no overlap.
    expect(adBox!.y).toBeGreaterThanOrEqual(stageBox!.y + stageBox!.height - 1);
    expect(adBox!.height).toBeGreaterThanOrEqual(AD_PX);

    // The stage takes every pixel the ad leaves: no letterbox band.
    expect(stageBox!.width).toBeGreaterThanOrEqual(viewport.width - 1);
    expect(stageBox!.height).toBeGreaterThanOrEqual(viewport.height - AD_PX - 1);

    // Nothing in the composition reaches into the ad strip.
    for (const id of [testIds.home.hero, testIds.home.sectionCategories, 'home-categories-next']) {
      const box = await page.getByTestId(id).boundingBox();
      expect(box!.y + box!.height, `${id} overlaps the ad strip`).toBeLessThanOrEqual(adBox!.y + 1);
    }
  });

  test('a late-loading banner does not shift the composition it was already reserved for', async ({
    page,
  }) => {
    await reserveAd(page);
    await openApp(page);
    await seedAnimals(page);

    const before = await page.getByTestId(testIds.home.heroContinue).boundingBox();
    // The strip was reserved from first paint; re-asserting the same height
    // (what a banner finally filling it does) must not move anything.
    await page.evaluate((n) => {
      (window as unknown as { __talkiSetAdReserved?: (px: number) => void }).__talkiSetAdReserved?.(n);
    }, AD_PX);
    await page.waitForTimeout(200);
    const after = await page.getByTestId(testIds.home.heroContinue).boundingBox();

    expect(after!.y).toBeCloseTo(before!.y, 0);
    expect(after!.height).toBeCloseTo(before!.height, 0);
  });

  test('the reference landscape phone shows the mock\'s eight category cards between the arrows', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'landscape-844', 'mock-count assertion is for the reference viewport');
    await reserveAd(page, 0);
    await openApp(page);
    await seedAnimals(page);

    const strip = await page.getByTestId(testIds.home.sectionCategories).boundingBox();
    const cards = page.locator('[data-testid^="home-category-"]');
    const total = await cards.count();
    let whollyVisible = 0;
    for (let i = 0; i < total; i++) {
      const box = await cards.nth(i).boundingBox();
      if (!box) continue;
      if (box.x >= strip!.x - 0.5 && box.x + box.width <= strip!.x + strip!.width + 0.5) {
        whollyVisible++;
      }
    }
    expect(whollyVisible).toBe(8);

    // The arrows flank the row rather than sitting on top of a card.
    const [prev, next] = await Promise.all([
      page.getByTestId('home-categories-prev').boundingBox(),
      page.getByTestId('home-categories-next').boundingBox(),
    ]);
    expect(Math.min(prev!.x, next!.x) + Math.min(prev!.width, next!.width)).toBeLessThanOrEqual(strip!.x + 1);
    expect(Math.max(prev!.x, next!.x)).toBeGreaterThanOrEqual(strip!.x + strip!.width - 1);
  });

  test('both carousel arrows move the strip, and the far end stays reachable', async ({ page }) => {
    await openApp(page);
    await seedAnimals(page);

    const scroller = page.getByTestId(testIds.home.sectionCategories);
    const at = () => scroller.evaluate((el) => el.scrollLeft);

    const start = await at();
    await page.getByTestId('home-categories-next').click();
    await page.waitForTimeout(700);
    const paged = await at();
    expect(Math.abs(paged - start), 'the end-ward arrow paged the strip').toBeGreaterThan(10);

    await page.getByTestId('home-categories-prev').click();
    await page.waitForTimeout(700);
    const back = await at();
    expect(Math.abs(back - start), 'the start-ward arrow paged back').toBeLessThan(
      Math.abs(paged - start),
    );

    // Every category — including the synthetic `mine` — is still attached.
    for (const id of ['animals', 'food', 'colors', 'home', 'outside', 'actions', 'family', 'body', 'numbers', 'emotions', 'mine']) {
      await expect(page.getByTestId(testIds.home.category(id))).toBeAttached();
    }
  });

  test('every control the composition draws still does its job', async ({ page }) => {
    await openApp(page);
    await seedAnimals(page);

    // Music toggles the persisted setting.
    const music = page.getByTestId('topbar-music');
    const label = () => music.getAttribute('aria-label');
    const first = await label();
    await music.click();
    await expect.poll(label).not.toBe(first);

    // Points pill opens Rewards.
    await page.getByTestId(testIds.nav.rewards).click();
    await expect(page.getByTestId(testIds.stickers.root)).toBeVisible();
    await page.goBack();
    await expect(page.getByTestId(testIds.home.root)).toBeVisible();

    // Profile is parent-gated: a short tap raises the hold hint, not the gate.
    await page.getByTestId('home-header-profile').click();
    await expect(page.getByTestId(testIds.parent.toast)).toBeVisible();
    await expect(page.getByTestId(testIds.parent.gateQuestion)).toHaveCount(0);

    // Continue-learning opens the hero's category.
    await page.getByTestId(testIds.home.heroContinue).click();
    await expect(page.getByTestId(testIds.category.root)).toBeVisible();
    await expect(page.getByTestId(testIds.category.title)).toHaveText('חיות');
    await page.goBack();

    // A category card opens that category. The screen title keeps niqqud;
    // the card label is the `plain()` form the mock draws.
    await page.getByTestId(testIds.home.category('food')).click();
    await expect(page.getByTestId(testIds.category.title)).toHaveText('אוֹכֶל');
  });

  test('resizing across the landscape range never produces document scroll', async ({ page }) => {
    await openApp(page);
    await seedAnimals(page);

    for (const size of [
      { width: 844, height: 390 },
      { width: 915, height: 412 },
      { width: 1024, height: 600 },
      { width: 1280, height: 800 },
      { width: 667, height: 375 },
    ]) {
      await page.setViewportSize(size);
      await page.waitForTimeout(150);
      const overflow = await page.evaluate(() => ({
        x: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        y: document.documentElement.scrollHeight > document.documentElement.clientHeight + 1,
      }));
      expect(overflow.x, `horizontal scroll at ${size.width}x${size.height}`).toBe(false);
      expect(overflow.y, `vertical scroll at ${size.width}x${size.height}`).toBe(false);

      const stage = await page.getByTestId(testIds.home.stage).boundingBox();
      expect(stage!.width).toBeGreaterThanOrEqual(size.width - 1);
      await expect(page.getByTestId(testIds.home.heroContinue)).toBeVisible();
      await expect(page.getByTestId('home-categories-next')).toBeVisible();
    }
  });
});
