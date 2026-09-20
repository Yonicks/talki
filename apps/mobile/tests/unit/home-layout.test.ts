/**
 * Tier 1 for the Android Home mock geometry (`homeLayout.ts`) and the Home
 * category order. Pure functions only — the one React Native hook the layout
 * module imports is stubbed, because RN's Flow source cannot be parsed here.
 */
import { describe, expect, it, vi } from 'vitest';

import {
  CATEGORY_CARD_ASPECT,
  HOME_BASE,
  HOME_LAYOUT,
  MOCK_PX_PER_DP,
  homeHeroTop,
  homeMetricsFor,
  homeStripMetrics,
} from '@/design-system/landscape/homeLayout';
import { HOME_CATEGORY_ORDER, orderHomeCategories } from '@/features/home/homeCategoryOrder';
import type { TalkiCategory } from '@/domain/types';
import { allCats } from '@/domain/vocabulary/allCats';

// Hoisted above the imports by Vitest; RN's Flow source cannot be parsed here.
vi.mock('@/design-system/responsive/useLandscapeLayout', () => ({
  useLandscapeLayout: () => ({ usableWidth: 900, usableHeight: 417 }),
}));

const AD = 50;
/** Full landscape screens of the two required devices (+ Pixel 9 Pro), with the ad strip taken off. */
const DEVICES = [
  { name: 'Pixel 9', w: 808, h: 360 },
  { name: 'iPhone 17 Pro', w: 874, h: 402 },
  { name: 'Pixel 9 Pro', w: 952, h: 427 },
  { name: 'mock canvas', w: 900, h: 467 },
  { name: 'tablet 16:10', w: 1280, h: 800 },
];

describe('Home mock geometry', () => {
  it('maps the 1843 x 853 mock onto a 900 dp canvas', () => {
    expect(MOCK_PX_PER_DP).toBeCloseTo(1843 / 900, 6);
    expect(HOME_BASE.height).toBeCloseTo((853 * 900) / 1843, 1);
  });

  it('writes the hero card at the mock\'s measured pixel size', () => {
    const h = HOME_LAYOUT.hero;
    expect(h.width * MOCK_PX_PER_DP).toBeCloseTo(792.5, 0);
    expect(h.height * MOCK_PX_PER_DP).toBeCloseTo(371, 0);
    expect(h.copyWidth * MOCK_PX_PER_DP).toBeCloseTo(398, 0);
    expect(HOME_LAYOUT.header.height * MOCK_PX_PER_DP).toBeCloseTo(88, 0);
  });

  it('keeps the category card at the mock aspect', () => {
    expect(CATEGORY_CARD_ASPECT).toBeCloseTo(191.5 / 238.5, 4);
  });

  it('scales uniformly and never past MAX_SCALE', () => {
    expect(homeMetricsFor(900, HOME_BASE.height).scale).toBeCloseTo(1, 2);
    expect(homeMetricsFor(4000, 4000).scale).toBe(1.5);
    expect(homeMetricsFor(0, 0).scale).toBe(1);
  });
});

describe.each(DEVICES)('Home strip on $name', ({ w, h }) => {
  const metrics = homeMetricsFor(w, h - AD);
  const strip = homeStripMetrics(metrics);

  it('shows exactly eight whole cards — never a clipped ninth beside an arrow', () => {
    expect(strip.perPage).toBe(8);
    const rowWidth = 8 * strip.cardWidth + 7 * strip.gap;
    expect(strip.stripWidth).toBeCloseTo(Math.min(strip.innerWidth, rowWidth), 1);
    expect(strip.stripWidth).toBeLessThanOrEqual(strip.innerWidth + 0.01);
    // The ninth card would start after the visible strip ends.
    expect(strip.stripWidth).toBeLessThan(9 * strip.cardWidth + 8 * strip.gap);
  });

  it('keeps arrow · strip · arrow inside the stage', () => {
    const group = strip.stripWidth + 2 * (strip.arrowSize + strip.arrowGap);
    expect(group).toBeLessThanOrEqual(metrics.stageWidth + 0.01);
  });

  it('keeps every card touchable and the row clear of the ad strip with air above it', () => {
    expect(strip.cardWidth).toBeGreaterThanOrEqual(48);
    expect(strip.arrowSize).toBeGreaterThanOrEqual(48);
    const bottom = strip.top + strip.cardHeight;
    expect(bottom).toBeLessThanOrEqual(metrics.stageHeight - 8);
  });

  it('places the hero card between the header and the strip without overlapping either', () => {
    const heroHeight = metrics.s(HOME_LAYOUT.hero.height);
    const top = homeHeroTop(metrics, strip, heroHeight);
    const headerBottom = metrics.s(HOME_LAYOUT.header.top + HOME_LAYOUT.header.height);
    expect(top).toBeGreaterThanOrEqual(headerBottom - 0.01);
    expect(top + heroHeight).toBeLessThanOrEqual(strip.top + 0.01);
  });
});

describe('Home category order', () => {
  const cats = allCats();

  it('leads with the eight cards the mock shows, in the mock\'s order', () => {
    expect(orderHomeCategories(cats).slice(0, 8).map((c) => c.id)).toEqual([
      'animals', 'food', 'colors', 'home', 'outside', 'actions', 'family', 'body',
    ]);
  });

  it('keeps every category reachable, including numbers, emotions and the synthetic mine', () => {
    const ordered = orderHomeCategories(cats).map((c) => c.id);
    expect([...ordered].sort()).toEqual(cats.map((c) => c.id).sort());
    expect(ordered.slice(8)).toEqual(['numbers', 'emotions', 'mine']);
  });

  it('does not mutate its input and sorts unknown ids to the end, stably', () => {
    const extra = (id: string): TalkiCategory => ({ ...cats[0]!, id: id as TalkiCategory['id'] });
    const input = [extra('zeta'), cats[1]!, extra('alpha'), cats[0]!];
    const snapshot = input.map((c) => c.id);
    const out = orderHomeCategories(input).map((c) => c.id);
    expect(input.map((c) => c.id)).toEqual(snapshot);
    expect(out).toEqual(['animals', 'food', 'zeta', 'alpha']);
  });

  it('lists each id once', () => {
    expect(new Set(HOME_CATEGORY_ORDER).size).toBe(HOME_CATEGORY_ORDER.length);
  });
});
