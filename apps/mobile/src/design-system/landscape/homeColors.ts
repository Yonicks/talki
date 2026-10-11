/**
 * Colours sampled from `docs/design/landscape/reference/home-pixel-source.png`
 * (median of flat regions, not anti-aliased edges). Kept apart from `v3`,
 * which is a verbatim transcription of the legacy CSS palette.
 */
export const homeMock = {
  /** Every heading, label and figure on Home is this one near-black indigo. */
  ink: '#0B0044',
  /** Hero panel, header buttons, category frames: plain white, no cream tint. */
  surface: '#FFFFFF',
  /** Recessed progress track (cool grey-lavender) and its darker top edge. */
  track: '#CECEDB',
  trackEdge: '#C4C4D2',
  /** Progress fill and CTA: top → bottom gradient stops. */
  fillTop: '#8A4AEE',
  fillBottom: '#672CC6',
  ctaTop: '#8F50EC',
  ctaBottom: '#622CC0',
  /** CTA rim (darkest at the bottom edge) and the bright line under its top edge. */
  ctaRim: '#4B2296',
  ctaRimSide: 'rgba(75, 34, 150, 0.45)',
  ctaHighlight: '#C489FF',
  /** Play triangle inside the CTA's white disc. */
  play: '#763AD4',
  /** Profile glyph strokes (person + gear). */
  glyph: '#2E117D',
  /** Arrow chevron. */
  chevron: '#4A1FA8',
  /** Hairline that separates a category label from the white frame around it. */
  labelEdge: 'rgba(60, 40, 110, 0.10)',
  /** Secondary category caption under the hero progress bar. */
  captionMuted: '#BD80DE',
} as const;

/**
 * Hero card redesign (premium storybook panel) — deliberate departures from
 * the flat-white mock panel above, not colours sampled from it. Grouped
 * apart from `homeMock` because every other Home element (header, strip,
 * arrows) still draws from the mock's flat palette; only the hero panel's
 * own surface, border, glow and CTA get this richer treatment.
 */
export const heroCard = {
  /** Diagonal surface gradient (135deg): cream → peach → pink → lavender. */
  fillA: '#FFFDF7',
  fillB: '#FFF9ED',
  fillC: '#FFF5E2',
  fillD: '#FFF3DC',
  /** Soft warm highlight blob, layered on top near the upper-left to fake a
   *  radial glow (RN's LinearGradient has no radial mode). */
  highlight: 'rgba(255, 255, 255, 0.55)',
  /** Gradient border frame, diagonal top-left → bottom-right. Pixel-measured
   *  off the reference (color-transition scan through the rim at all four
   *  edges, e.g. top ≈ #E744C7, right ≈ #F73A9F, bottom ≈ #DE2680) — a
   *  vivid saturated magenta/pink/rose rim, not the soft pastel it was. */
  borderA: '#F687D9',
  borderB: '#CD7CF5',
  borderC: '#F35BBC',
  borderD: '#FF83AD',
  /** Layered halo behind the card: a wide, faint ambient purple wash and a
   *  tighter, slightly stronger pink/lavender ring closer to the rim. */
  glowAmbient: 'rgba(103, 44, 160, 0.05)',
  glowNear: 'rgba(224, 142, 255, 0.12)',
  /** Progress track: recessed lavender-grey, glossy purple fill. */
  trackTop: '#E7E5E6',
  trackBottom: '#DEDBDE',
  fillGlossTop: '#C66AFF',
  fillGlossMid: '#B446F8',
  fillGlossLow: '#9834F0',
  fillGlossBottom: '#852CEC',
  /** CTA: horizontal colour sweep, then a vertical gloss overlay on top. */
  ctaSweepA: '#ED6BFC',
  ctaSweepB: '#BB43FF',
  ctaSweepC: '#A326F9',
  ctaSweepD: '#9221F2',
  ctaSweepE: '#A345FF',
  ctaGlossTop: 'rgba(255, 255, 255, 0.65)',
  ctaGlossMid: 'rgba(255, 255, 255, 0.08)',
  ctaGlossLow: 'rgba(101, 0, 255, 0.55)',
  ctaGlossBottom: 'rgba(94, 0, 245, 0.78)',
  /** Opaque white rim (pixel-measured ~4px band around the CTA, not
   *  translucent) and a vivid pink halo outside it — the same saturated
   *  magenta family as the card border, not the duller purple it was. */
  ctaHaloInner: '#FFFFFF',
  ctaHaloMid: 'rgba(247, 58, 219, 0.24)',
  ctaHaloOuter: 'rgba(231, 68, 199, 0.09)',
  /** Thumbnail frame: lavender gradient + small category badge. */
  thumbA: '#D0A8FF',
  thumbB: '#B994F2',
  thumbC: '#F1D7FF',
  badgeFill: '#8530DB',
  /** Gold sparkle palette (centre → outer). */
  sparkleCore: '#FFF6AD',
  sparkleMid: '#FFD86B',
  sparkleEdge: '#FFB93F',
} as const;
