/**
 * index.html 57-63 — the four-step CSS box-shadow scale.
 *
 * Every step is a React Native `boxShadow` string, which RN draws natively
 * on Android and iOS (new architecture) and react-native-web passes straight
 * through to CSS. One value therefore renders the same soft, warm shadow on
 * every platform. The previous `shadow*` + `elevation` pair did not: Android
 * ignores `shadow*` and draws `elevation` as a hard, grey Material shadow
 * (ignoring the tint and opacity), and elevation also re-orders siblings on
 * Android only — so the native Home looked visibly heavier than Chrome and
 * the mock.
 *
 * The numbers are the ones phase-05-report.md tuned (offset, blur, colour +
 * opacity); the strings are exactly what react-native-web generated from
 * the old `shadow*` props, so the web rendering is unchanged.
 *
 * Deliberate deviation from phase-05-plan.md: shadow colour is the same
 * ink/brown family the CSS uses (`rgba(73,46,25,*)` etc, not pure black),
 * because Talki's shadows are consistently warm-toned, not neutral.
 */
export interface ShadowStyle {
  boxShadow: string;
}

function shadow(
  rgb: string,
  offset: { width: number; height: number },
  opacity: number,
  blur: number,
): ShadowStyle {
  return {
    boxShadow: `${offset.width}px ${offset.height}px ${blur}px rgba(${rgb},${opacity})`,
  };
}

/** Removes a step's shadow (e.g. a pressed card sinking onto the page). */
export const shadowNone: ShadowStyle = { boxShadow: 'none' };

/** CSS: `0 2px 6px rgba(65,39,26,.06)`. Lightest step — a barely-there card
 *  lift, e.g. a pill or a resting button. */
export const shadowSm = shadow('65,39,26', { width: 0, height: 2 }, 0.06, 6);

/** CSS: `0 6px 16px rgba(73,46,25,.09)`. The default resting card shadow —
 *  the workhorse used by cat-card/game-card in legacy. */
export const shadowCard = shadow('73,46,25', { width: 0, height: 4 }, 0.09, 10);

/** CSS: `0 10px 28px rgba(73,46,25,.13)`. A raised/floating element — reward
 *  overlays, toasts, anything overlaying page content. */
export const shadowFloating = shadow('73,46,25', { width: 0, height: 6 }, 0.13, 16);

/** CSS: `0 6px 18px -6px rgba(109,59,96,.10), 0 2px 8px -2px rgba(160,120,90,.08)`.
 *  Two soft, negative-spread layers in CSS approximate a diffuse sticky-header
 *  lift; kept as the single wider, softer layer phase 05 chose so the look
 *  does not change. Used only by TopBar. */
export const shadowTopbar = shadow('109,59,96', { width: 0, height: 3 }, 0.1, 12);

/** index.html 108-112 — the four-step scale, in one place for
 *  `theme.shadows.<step>`. */
export const shadows = {
  sm: shadowSm,
  card: shadowCard,
  floating: shadowFloating,
  topbar: shadowTopbar,
} as const;
