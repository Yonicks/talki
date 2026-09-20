/**
 * Home geometry measured from the user-supplied 1843 × 853 edge-to-edge mock
 * (`assets/v3/mocks/mock_home_android_1843x853.png`).
 *
 * Every number is written as `px(<mock pixels>)`, so the source measurement
 * stays visible next to the dp it becomes. The mock maps to a 900 dp canvas
 * (1843 / 900 = 2.0478 mock px per dp); the stage scales uniformly from it.
 * Artwork is never stretched. The stage excludes the OS safe area and the
 * live banner reservation.
 *
 * Verify with `tools/home-fidelity/pixel_report.py`: it re-measures a capture
 * at 1 screenshot px = 1 mock px and prints each edge's delta from the mock.
 */
import { LANDSCAPE_MIN_TOUCH } from './tokens';
import { useLandscapeLayout } from '../responsive/useLandscapeLayout';

export const MOCK_PX_PER_DP = 1843 / 900;
const round2 = (n: number) => Math.round(n * 100) / 100;
/** Mock pixels → design-canvas dp. */
const px = (n: number) => round2(n / MOCK_PX_PER_DP);

export const HOME_BASE = { width: 900, height: 416.55 } as const;
export const WIDTH_RELIEF = 1;
export const MAX_SCALE = 1.5;
export const CATEGORY_CARD_ASPECT = 191.5 / 238.5;

export const HOME_LAYOUT = {
  header: {
    top: px(32), height: px(88), gap: px(24),
    padInlineStart: px(40), padInlineEnd: px(43),
    musicWidth: px(97), profileWidth: px(104), pillWidth: px(169),
    radius: px(27),
    musicIconSize: px(62), musicIconNudge: { x: -px(3), y: px(1) }, profileIconNudge: { x: -px(1), y: px(2) }, profileIconSize: px(59), pillStarSize: px(96),
    pillTextSize: 24, pillPadCount: px(28), pillTextDrop: -px(4), pillPadStar: px(20), pillGap: px(3),
    logoWidth: 202, logoTop: 10,
  },
  hero: {
    // Row = mascot stage + card. Card edges: x 630.5..1423, y 152.5..523.5.
    rowWidth: px(1086), width: px(792.5), height: px(371), radius: px(46),
    padTop: px(32), padBottom: px(22.5),
    padInlineStart: px(21), padInlineEnd: px(30.5), columnGap: px(16),
    // Thumbnail frame (white) around the art: x 1074..1402, y 163..512.
    thumbWidth: px(328), thumbHeight: px(349), thumbTop: px(10.5), thumbRadius: px(31), thumbFrame: px(7.5),
    // Copy column (CTA width) and the narrower text block inside it.
    copyWidth: px(398), textBlockWidth: px(357), textBlockInset: px(8),
    eyebrowSize: 16.2, eyebrowBox: px(26),
    titleSize: 44, titleRow: px(71), titleStarSize: px(71), titleStarBox: px(100), titleGap: px(6.5),
    titleTextDrop: px(6), titleGroupShift: px(31),
    subtitleSize: 14.6, subtitleBox: px(28),
    eyebrowLift: px(2.5), eyebrowShift: px(8), gapEyebrowTitle: px(3), gapTitleSubtitle: px(15.5), subtitleShift: px(6), gapSubtitleProgress: px(13), gapProgressCta: px(15),
    progressPillWidth: px(383), progressPillInset: px(4), progressPillHeight: px(56), progressTrackHeight: px(31),
    progressLabelSize: 12, progressPadCount: px(23), progressPadTrack: px(17), progressGap: px(14),
    ctaHeight: px(91), ctaPlaySize: px(87), ctaPlayInset: px(2.5), ctaLabelSize: 22, ctaLabelShift: px(14), ctaLabelDrop: px(6),
  },
  mascot: { width: 150, top: 28, insetStart: 382 },
  // The card centre (y338) sits 4 mock px below the centre of the free band
  // between the header bottom (y120) and the strip top (y548): (120+548)/2=334.
  heroBias: px(4),
  strip: {
    bottomGap: px(67.5), cardWidth: px(191.5), cardHeight: px(238), cardRadius: px(32),
    cardPadding: px(9.5), labelHeight: px(50), labelSize: 15,
    gap: px(7.5), gapMin: 4, gapMax: px(12), arrowSize: px(104), arrowGap: px(11),
    arrowLift: px(4), chevronHeight: px(59), chevronNudge: px(5), padInline: px(21), visibleCards: 8,
  },
} as const;

export interface HomeMetrics {
  scale: number;
  stageWidth: number;
  stageHeight: number;
  s: (n: number) => number;
  touch: (n: number) => number;
}

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
  /** Width of the scroller: exactly `perPage` cards and their gaps, so no card
   *  is ever half-visible beside an arrow. Any spare width becomes margin. */
  stripWidth: number;
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
  const perPage = c.visibleCards;
  const stripWidth = perPage * cardWidth + (perPage - 1) * gap;
  return {
    arrowSize, padInline, arrowGap, innerWidth,
    stripWidth: round2(Math.min(innerWidth, stripWidth)),
    cardWidth: round2(cardWidth), cardHeight: round2(cardHeight), gap: round2(gap),
    perPage,
    top: round2(metrics.stageHeight - s(c.bottomGap) - cardHeight),
  };
}

// Mock card row extends from x630.5 through x1423 (panel) plus the mascot.
export const HERO_ROW_CENTER_FROM_END = 1 - ((337 + 1423) / 2) / 1843;
export function homeHeroPanelHeight(metrics: HomeMetrics): number {
  return round2(metrics.s(HOME_LAYOUT.hero.height));
}
export function homeHeroInsetStart(metrics: HomeMetrics, rowWidth: number): number {
  const raw = metrics.stageWidth * HERO_ROW_CENTER_FROM_END - rowWidth / 2;
  return round2(Math.max(0, Math.min(raw, metrics.stageWidth - rowWidth)));
}
export function homeHeroTop(metrics: HomeMetrics, strip: HomeStripMetrics, heroHeight: number): number {
  const h = HOME_LAYOUT.header;
  const bandTop = metrics.s(h.top + h.height);
  const free = strip.top - bandTop;
  return round2(bandTop + Math.max(0, (free - heroHeight) / 2 + metrics.s(HOME_LAYOUT.heroBias)));
}
