/**
 * Landscape Home geometry — the v3 Home mock, measured.
 *
 * Source of truth: `apps/mobile/assets/v3/mocks/mock_home_mobile_v3.png`.
 * The mock's phone screen (inside its rendered bezel) is the rect
 * (48, 47)–(1800, 806), i.e. 1752 × 759 mock pixels. Scaling that to a
 * 390 dp short edge (the primary landscape phone target) maps the mock onto
 * a **900 × 390 dp design canvas**, and every number in `HOME_LAYOUT` is a
 * measurement from that image expressed in those canvas dp. Comments carry
 * the measured canvas rect so a re-measure can be checked against the table.
 *
 * ## Why the stage fills the viewport instead of letterboxing
 *
 * The canvas is 2.31:1; a real landscape phone is 2.16:1 (844 × 390) and a
 * landscape tablet is nearer 1.6:1. Scaling the canvas uniformly and
 * centring it — the previous model — left a visible band of unused
 * composition above and below on every phone and shrank every control by
 * ~6% on the reference viewport.
 *
 * Instead the stage *is* the usable viewport, and the composition is
 * anchored inside it:
 *
 *   • sizes come from one uniform `scale` (never a per-axis stretch), so
 *     artwork and type keep the mock's proportions;
 *   • the header band is anchored to the top edge and the category row to
 *     the bottom edge, both at scaled insets;
 *   • the hero row is centred in the band left between them;
 *   • the category row's card width and gaps are solved from the real stage
 *     width so the mock's eight cards always fit edge to edge.
 *
 * `scale` divides the width by `HOME_BASE.width * WIDTH_RELIEF` rather than
 * by the full canvas width: only the category row is horizontally rigid,
 * and it needs ~95.5% of the canvas width, so a 844 dp viewport earns the
 * full height-driven scale instead of being penalised for the 6% of canvas
 * width it does not have.
 *
 * Two deliberate deviations from a pure proportional scale:
 *
 *  1. `touch()` floors interactive boxes at `LANDSCAPE_MIN_TOUCH` (48 dp) —
 *     AGENTS.md non-negotiable 16 outranks a 45 dp mock measurement, and
 *     the Playwright touch-target audit enforces it.
 *  2. `scale` is capped at `MAX_SCALE` so a 1366 × 1024 tablet gains
 *     breathing room without inflating every control to cartoon size
 *     (AGENTS.md non-negotiable 22).
 *
 * Feature components read these through `useHomeMetrics()`; they must not
 * re-derive viewport numbers themselves (AGENTS.md non-negotiables 11/12).
 */
import { LANDSCAPE_MIN_TOUCH } from './tokens';
import { useLandscapeLayout } from '../responsive/useLandscapeLayout';

/** The design canvas every `HOME_LAYOUT` number is expressed in. */
export const HOME_BASE = { width: 900, height: 390 } as const;

/** mock pixels per canvas dp — 1752 / 900. Kept for the report/tests. */
export const MOCK_PX_PER_DP = 1.9467;

/**
 * Fraction of the canvas width the composition is actually rigid about.
 * Only the category row is horizontally rigid, and at scale 1 it needs
 * 2 × (14 + 52 + 10) + 8 × 81 + 7 × 6 ≈ 844 dp — the reference landscape
 * phone's long edge. Dividing the viewport width by this (rather than by
 * the full 900 dp canvas) is what lets 844 × 390 render the composition at
 * exactly the mock's dp sizes instead of 6% under them; anything wider
 * simply widens the cards and gaps.
 */
export const WIDTH_RELIEF = 844 / 900;

/** Tablets scale the composition up, but not without bound. */
export const MAX_SCALE = 1.5;

/** Category card proportions in the mock — 85 × 105. Never stretched. */
export const CATEGORY_CARD_ASPECT = 85 / 105;

/**
 * Every measured dimension, in canvas dp.
 */
export const HOME_LAYOUT = {
  header: {
    /** button band top edge — measured y 16. */
    top: 16,
    /** music x 30 from the start edge; points pill ends 28 from the other. */
    padInline: 29,
    /** music 53 × 44, profile 57 × 45 — one box at 55 × 45 serves both. */
    buttonWidth: 55,
    buttonHeight: 45,
    buttonRadius: 15,
    /** glyph visible inside the button. */
    iconSize: 30,
    /** measured gap between the profile button and the points pill. */
    gap: 11,
    /** pill measured x 786–872. */
    pillWidth: 86,
    /** star glyph 34 visible inside a 0.71-fill asset frame. */
    pillStarSize: 34,
    pillTextSize: 19,
    /** lockup measured x 373–537, y 9–67; the production asset carries the
     *  wordmark band only (no floating star), which measures y 17–67. */
    logoWidth: 164,
    logoTop: 16,
  },
  hero: {
    /** The hero row = mascot + panel. Panel measured x 314–621, y 75–236;
     *  mascot bbox x 142–275, y 97–235. `rowInsetStart` is the distance from
     *  the canvas end (physical right in Hebrew) to the panel's outer edge. */
    rowTop: 75,
    rowInsetStart: 279,
    rowWidth: 487,
    rowHeight: 161,
    top: 0,
    /** panel 307 × 161. `height` is a minimum, not a fixed box: the CTA is
     *  floored at the 48 dp touch minimum, which is taller than the mock's
     *  42 dp, so the card hugs its content downwards rather than letting the
     *  CTA spill past the card edge. */
    width: 307,
    height: 160,
    radius: 23,
    padding: 13,
    columnGap: 5,
    /** thumbnail frame measured x 518–610, y 88–222. */
    thumbWidth: 92,
    thumbHeight: 134,
    thumbRadius: 15,
    thumbFrame: 4,
    /** "ממשיכים עם" glyph box 11 tall; line boxes below are the mock's
     *  measured baseline-to-baseline spacing, tighter than a 1.2 leading. */
    eyebrowSize: 15,
    eyebrowLine: 17,
    /** "רגשות" glyph box 20 tall. */
    titleSize: 29,
    titleLine: 30,
    /** star-mark glyph 27 visible inside a 0.71-fill asset frame. */
    titleStarSize: 36,
    subtitleSize: 14,
    subtitleLine: 17,
    /** white progress pill measured y 152–176; inner track 12 tall. */
    progressPillHeight: 24,
    progressTrackHeight: 12,
    progressLabelSize: 13,
    /** CTA measured x 326–511, y 180–222. */
    ctaHeight: 42,
    ctaPlaySize: 29,
    ctaLabelSize: 20,
    /** vertical rhythm inside the copy column (mock deltas). */
    gapTitle: 0,
    gapSubtitle: 0,
    gapProgress: 4,
    gapCta: 4,
    /** Negative: the rounded Hebrew face sets its first line lower inside a
     *  17 dp line box than the mock's baseline, so the copy column starts
     *  above the card padding to land the eyebrow on the mock's y. */
    padTop: -7,
  },
  mascot: {
    /** positioned inside the hero row, so `top`/`insetStart` are row-relative. */
    width: 140,
    top: 22,
    insetStart: 345,
  },
  strip: {
    /** card row measured y 252–357, i.e. 33 dp clear of the canvas bottom. */
    bottomGap: 33,
    /** cards measured 85 × 105 with a 10 dp gap and ⌀52 arrows at a 14 dp
     *  edge inset. `cardWidth`/`cardHeight` are *maxima*: `homeStripMetrics`
     *  solves the real width so the mock's eight cards fit the actual stage,
     *  compressing the gaps (and only then the cards) rather than dropping a
     *  card off the row. */
    cardWidth: 85,
    cardHeight: 105,
    cardRadius: 14,
    cardPadding: 2,
    /** label pill measured 82 × 27, flush with the card's bottom padding. */
    labelHeight: 27,
    labelRadius: 14,
    labelSize: 13,
    gap: 10,
    gapMin: 6,
    gapMax: 14,
    /** arrow circles measured ⌀52, 14 from the canvas edge, 10 from the row. */
    arrowSize: 52,
    arrowGap: 10,
    chevronHeight: 26,
    padInline: 14,
    /** cards the mock shows at once on the reference phone viewport. */
    visibleCards: 8,
  },
} as const;

export interface HomeMetrics {
  /** Uniform canvas scale — never a per-axis stretch. */
  scale: number;
  /** The stage box: the usable viewport, which the composition fills. */
  stageWidth: number;
  stageHeight: number;
  /** `n` canvas dp in device dp. */
  s: (n: number) => number;
  /** `s(n)`, floored at the 48 dp child touch minimum. */
  touch: (n: number) => number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function homeMetricsFor(usableWidth: number, usableHeight: number): HomeMetrics {
  const raw = Math.min(
    usableWidth / (HOME_BASE.width * WIDTH_RELIEF),
    usableHeight / HOME_BASE.height,
  );
  const scale = Math.min(MAX_SCALE, raw > 0 ? raw : 1);
  const s = (n: number) => round2(n * scale);
  return {
    scale,
    stageWidth: round2(usableWidth),
    stageHeight: round2(usableHeight),
    s,
    touch: (n: number) => Math.max(LANDSCAPE_MIN_TOUCH, s(n)),
  };
}

export function useHomeMetrics(): HomeMetrics {
  const layout = useLandscapeLayout();
  return homeMetricsFor(layout.usableWidth, layout.usableHeight);
}

export interface HomeStripMetrics {
  /** Arrow circle edge, and its inset from the stage edge. */
  arrowSize: number;
  padInline: number;
  arrowGap: number;
  /** Width available to the cards + gaps, between the two arrows. */
  innerWidth: number;
  cardWidth: number;
  cardHeight: number;
  gap: number;
  /** Cards the arrows page by — the whole cards that fit `innerWidth`. */
  perPage: number;
  /** Row top edge inside the stage (the row is anchored to the bottom). */
  top: number;
}

/**
 * Solve the category row for a real stage width.
 *
 * The mock shows eight cards between two arrows. Rather than letting a
 * narrower-than-canvas viewport drop one, the solver spends the shortfall on
 * the gaps first (down to `gapMin`) and only then narrows the cards, and it
 * keeps the mock's card proportions by deriving the height from the width
 * whenever width is the binding constraint (AGENTS.md non-negotiable 17 —
 * never stretch raster artwork).
 */
export function homeStripMetrics(metrics: HomeMetrics): HomeStripMetrics {
  const { s, touch } = metrics;
  const c = HOME_LAYOUT.strip;
  const arrowSize = touch(c.arrowSize);
  const padInline = s(c.padInline);
  const arrowGap = s(c.arrowGap);
  const innerWidth = Math.max(0, metrics.stageWidth - 2 * (padInline + arrowSize + arrowGap));

  const n = c.visibleCards;
  const gapMin = s(c.gapMin);
  const maxCard = s(c.cardWidth);
  const cardWidth = Math.max(
    LANDSCAPE_MIN_TOUCH,
    Math.min(maxCard, (innerWidth - (n - 1) * gapMin) / n),
  );
  const slack = innerWidth - n * cardWidth;
  const gap = Math.min(s(c.gapMax), Math.max(gapMin, slack / (n - 1)));
  const cardHeight = Math.min(s(c.cardHeight), cardWidth / CATEGORY_CARD_ASPECT);

  return {
    arrowSize,
    padInline,
    arrowGap,
    innerWidth,
    cardWidth: round2(cardWidth),
    cardHeight: round2(cardHeight),
    gap: round2(gap),
    perPage: Math.max(1, Math.floor((innerWidth + gap + 0.5) / (cardWidth + gap))),
    top: round2(metrics.stageHeight - s(c.bottomGap) - cardHeight),
  };
}

/**
 * Where the mock puts the hero row's centre, as a fraction of the canvas
 * measured from the inline end (physical right in Hebrew): the row spans
 * canvas x 135–622, so its centre sits at 378.5, i.e. 57.9% of the way in
 * from the end. Anchoring by centre fraction rather than by a fixed end
 * inset keeps the mascot-and-card group in the same relative place on a
 * viewport narrower or wider than the canvas.
 */
export const HERO_ROW_CENTER_FROM_END = (HOME_BASE.width - 378.5) / HOME_BASE.width;

/**
 * The continue-learning panel's real height: the mock's rhythm plus the
 * touch-floored CTA, which is 6 dp taller than the mock draws. Used both as
 * the hero row's box and as the height `homeHeroTop` centres, so the panel
 * lands on the mock's y instead of 6 dp below it.
 */
export function homeHeroPanelHeight(metrics: HomeMetrics): number {
  const h = HOME_LAYOUT.hero;
  const { s, touch } = metrics;
  const stack =
    s(h.eyebrowLine) +
    s(h.gapTitle) +
    s(h.titleLine) +
    s(h.gapSubtitle) +
    s(h.subtitleLine) +
    s(h.gapProgress) +
    s(h.progressPillHeight) +
    s(h.gapCta) +
    touch(h.ctaHeight);
  return round2(Math.max(s(h.height), stack + 2 * s(h.padding) + s(h.padTop)));
}

/** Inline-start inset that centres the hero row at the mock's fraction. */
export function homeHeroInsetStart(metrics: HomeMetrics, rowWidth: number): number {
  const raw = metrics.stageWidth * HERO_ROW_CENTER_FROM_END - rowWidth / 2;
  return round2(Math.max(0, Math.min(raw, metrics.stageWidth - rowWidth)));
}

/**
 * Vertical band the hero row is centred in: everything between the header
 * band and the category row. Keeps the mock's y on the reference phone and
 * gives a 4:3 tablet's extra height to the middle of the composition rather
 * than to a gap under the cards.
 */
export function homeHeroTop(metrics: HomeMetrics, strip: HomeStripMetrics, heroHeight: number): number {
  const h = HOME_LAYOUT.header;
  const bandTop = metrics.s(h.top) + metrics.touch(h.buttonHeight);
  const free = strip.top - bandTop;
  return round2(bandTop + Math.max(0, (free - heroHeight) / 2));
}
