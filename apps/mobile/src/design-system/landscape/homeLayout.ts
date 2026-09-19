/**
 * Home geometry measured from the user-supplied 1843 × 853 edge-to-edge mock.
 * Canvas coordinates are mock pixels × 900/1843. Artwork is never stretched.
 * The stage excludes the OS safe area and the live banner reservation.
 */
import { LANDSCAPE_MIN_TOUCH } from './tokens';
import { useLandscapeLayout } from '../responsive/useLandscapeLayout';

export const HOME_BASE = { width: 900, height: 416.55 } as const;
export const MOCK_PX_PER_DP = 1843 / 900;
export const WIDTH_RELIEF = 1;
export const MAX_SCALE = 1.5;
export const CATEGORY_CARD_ASPECT = 193 / 237;

export const HOME_LAYOUT = {
  header: {
    top: 15, padInline: 20, buttonWidth: 50, buttonHeight: 44,
    buttonRadius: 16, iconSize: 30, gap: 11, pillWidth: 83,
    pillStarSize: 36, pillTextSize: 23, logoWidth: 202, logoTop: 10,
  },
  hero: {
    rowTop: 74, rowInsetStart: 204, rowWidth: 531, rowHeight: 183,
    top: 0, width: 388, height: 183, radius: 24, padding: 8,
    columnGap: 10, thumbWidth: 160, thumbHeight: 167,
    thumbRadius: 18, thumbFrame: 4,
    eyebrowSize: 15, eyebrowLine: 18, titleSize: 36, titleLine: 40,
    titleStarSize: 38, subtitleSize: 15, subtitleLine: 18,
    progressPillHeight: 27, progressTrackHeight: 15, progressLabelSize: 15,
    ctaHeight: 45, ctaPlaySize: 40, ctaLabelSize: 22,
    gapTitle: 0, gapSubtitle: 0, gapProgress: 6, gapCta: 7, padTop: 1,
  },
  mascot: { width: 150, top: 28, insetStart: 382 },
  strip: {
    bottomGap: 32, cardWidth: 94, cardHeight: 116, cardRadius: 17,
    cardPadding: 4, labelHeight: 27, labelRadius: 15, labelSize: 16,
    gap: 5, gapMin: 4, gapMax: 6, arrowSize: 51, arrowGap: 5,
    chevronHeight: 29, padInline: 10, visibleCards: 8,
  },
} as const;

export interface HomeMetrics {
  scale: number;
  stageWidth: number;
  stageHeight: number;
  s: (n: number) => number;
  touch: (n: number) => number;
}
const round2 = (n: number) => Math.round(n * 100) / 100;

export function homeMetricsFor(usableWidth: number, usableHeight: number): HomeMetrics {
  const raw = Math.min(usableWidth / HOME_BASE.width, usableHeight / HOME_BASE.height);
  const scale = Math.min(MAX_SCALE, raw > 0 ? raw : 1);
  const s = (n: number) => round2(n * scale);
  return {
    scale, stageWidth: round2(usableWidth), stageHeight: round2(usableHeight), s,
    touch: (n: number) => Math.max(LANDSCAPE_MIN_TOUCH, s(n)),
  };
}
export function useHomeMetrics(): HomeMetrics {
  const layout = useLandscapeLayout();
  return homeMetricsFor(layout.usableWidth, layout.usableHeight);
}

export interface HomeStripMetrics {
  arrowSize: number; padInline: number; arrowGap: number; innerWidth: number;
  cardWidth: number; cardHeight: number; gap: number; perPage: number; top: number;
}
export function homeStripMetrics(metrics: HomeMetrics): HomeStripMetrics {
  const { s, touch } = metrics;
  const c = HOME_LAYOUT.strip;
  const arrowSize = touch(c.arrowSize);
  const padInline = s(c.padInline);
  const arrowGap = s(c.arrowGap);
  const innerWidth = Math.max(0, metrics.stageWidth - 2 * (padInline + arrowSize + arrowGap));
  const gapMin = s(c.gapMin);
  const cardWidth = Math.max(LANDSCAPE_MIN_TOUCH,
    Math.min(s(c.cardWidth), (innerWidth - (c.visibleCards - 1) * gapMin) / c.visibleCards));
  const gap = Math.min(s(c.gapMax), Math.max(gapMin,
    (innerWidth - c.visibleCards * cardWidth) / (c.visibleCards - 1)));
  const cardHeight = Math.min(s(c.cardHeight), cardWidth / CATEGORY_CARD_ASPECT);
  return {
    arrowSize, padInline, arrowGap, innerWidth,
    cardWidth: round2(cardWidth), cardHeight: round2(cardHeight), gap: round2(gap),
    perPage: Math.max(1, Math.floor((innerWidth + gap + 0.5) / (cardWidth + gap))),
    top: round2(metrics.stageHeight - s(c.bottomGap) - cardHeight),
  };
}

// Mock row extends from x337 through x1425; measure from the RTL inline start.
export const HERO_ROW_CENTER_FROM_END = 1 - ((337 + 1425) / 2) / 1843;
export function homeHeroPanelHeight(metrics: HomeMetrics): number {
  const h = HOME_LAYOUT.hero;
  const { s, touch } = metrics;
  const stack = s(h.eyebrowLine + h.gapTitle + h.titleLine + h.gapSubtitle +
    h.subtitleLine + h.gapProgress + h.progressPillHeight + h.gapCta) + touch(h.ctaHeight);
  return round2(Math.max(s(h.height), stack + 2 * s(h.padding) + s(h.padTop)));
}
export function homeHeroInsetStart(metrics: HomeMetrics, rowWidth: number): number {
  const raw = metrics.stageWidth * HERO_ROW_CENTER_FROM_END - rowWidth / 2;
  return round2(Math.max(0, Math.min(raw, metrics.stageWidth - rowWidth)));
}
export function homeHeroTop(metrics: HomeMetrics, strip: HomeStripMetrics, heroHeight: number): number {
  const h = HOME_LAYOUT.header;
  const bandTop = metrics.s(h.top) + metrics.touch(h.buttonHeight);
  const free = strip.top - bandTop;
  return round2(bandTop + Math.max(0, (free - heroHeight) / 2));
}
