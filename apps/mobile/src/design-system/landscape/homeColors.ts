/**
 * Colours sampled from `assets/v3/mocks/mock_home_android_1843x853.png`
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
} as const;
