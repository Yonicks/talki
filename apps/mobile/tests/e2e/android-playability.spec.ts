import { expect, test, type Locator, type Page } from '@playwright/test';

import { openApp } from './_helpers';

async function openRoute(page: Page, route: string) {
  await page.addInitScript(() => {
    (window as unknown as { __talkiAdReservedPx: number }).__talkiAdReservedPx = 50;
  });
  await openApp(page);
  await page.waitForFunction(() => Boolean((window as unknown as { __talkiRouterE2E?: unknown }).__talkiRouterE2E));
  await page.evaluate((path) => {
    (window as unknown as { __talkiRouterE2E: { push: (p: string) => void } }).__talkiRouterE2E.push(path);
  }, route);
}

async function contained(targets: Locator, bounds: Locator, margin = 0) {
  const area = await bounds.boundingBox();
  expect(area).not.toBeNull();
  expect(await targets.count()).toBeGreaterThan(0);
  for (const target of await targets.all()) {
    const box = await target.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(48);
    expect(box!.height).toBeGreaterThanOrEqual(48);
    expect(box!.x).toBeGreaterThanOrEqual(area!.x - 1);
    expect(box!.y).toBeGreaterThanOrEqual(area!.y - 1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(area!.x + area!.width + 1);
    expect(box!.y + box!.height).toBeLessThanOrEqual(area!.y + area!.height - margin + 1);
  }
}

test('Match last row is reachable without shrinking touch targets or scrolling the page', async ({ page }) => {
  await openRoute(page, '/game/match?catId=animals&seed=42');
  const scroll = page.getByTestId('match-scroll');
  await expect(scroll).toBeVisible();
  for (const prefix of ['match-left-', 'match-right-']) {
    const target = page.locator(`[data-testid^="${prefix}"]`).last();
    await target.scrollIntoViewIfNeeded();
    await contained(target, scroll);
    expect(await target.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return !!top && (top === el || el.contains(top));
    })).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 1)).toBe(false);
  await page.screenshot({ path: test.info().outputPath('match.png') });
});

for (const [game, prefix] of [['puzzle', 'puzzle-'], ['sort', 'sort-box-'], ['count', 'count-option-']] as const) {
  test(`${game} controls fit inside the play area`, async ({ page }) => {
    await openRoute(page, `/game/${game}?catId=animals&seed=42`);
    const targets = game === 'puzzle'
      ? page.locator('[data-testid^="puzzle-slot-"], [data-testid^="puzzle-piece-"]')
      : page.locator(`[data-testid^="${prefix}"]`);
    await expect(targets.first()).toBeVisible();
    await contained(targets, page.getByTestId('game-play-area'), game === 'count' ? 8 : 0);
    await page.screenshot({ path: test.info().outputPath(`${game}.png`) });
  });
}

test('Bubbles spawn with bottom clearance', async ({ page }) => {
  await openRoute(page, '/game/bubbles?catId=animals&seed=42');
  const bubble = page.locator('[data-testid^="bubbles-bubble-"]').first();
  await expect(bubble).toBeVisible({ timeout: 15000 });
  await contained(bubble, page.getByTestId('bubbles-root'), 12);
  await page.screenshot({ path: test.info().outputPath('bubbles.png') });
});

for (const hub of ['games', 'practice'] as const) {
  test(`${hub} shows six usable cards above the reserved ad strip`, async ({ page }) => {
    await openRoute(page, `/${hub}`);
    const cards = page.locator(`[data-testid^="${hub}-menu-card-"]`);
    await expect(cards).toHaveCount(6);
    const grid = page.getByTestId(`${hub}-menu-grid`);
    await contained(cards, grid);
    for (const card of await cards.all()) {
      expect((await card.boundingBox())!.height).toBeGreaterThanOrEqual(60);
    }
    const ad = await page.getByTestId('ad-reserved').boundingBox();
    expect(ad).not.toBeNull();
    const box = await grid.boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(ad!.y + 1);
    await page.screenshot({ path: test.info().outputPath(`${hub}.png`) });
  });
}
