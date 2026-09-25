/**
 * Talki is Hebrew and right-to-left. Every layout uses logical start/end,
 * never left/right — phase-05-plan.md "RTL through logical properties,
 * always". React Native's own logical style props (`marginStart`,
 * `paddingEnd`, `insetInlineStart`, `borderStartWidth`, `start`, `end`, ...)
 * flip correctly under `I18nManager.forceRTL()` on native, and under a
 * `writingDirection: 'rtl'` style (which react-native-web compiles to CSS
 * `direction: rtl`) on web — see `TalkiScreen`, the one place that sets it,
 * app-wide, once. This module exists for the handful of cases those props do
 * not cover — reading direction to decide an icon or an animation direction
 * — not to reinvent the style props themselves.
 *
 * Deliberate deviation: `isRTL()` is a hardcoded constant, not a read of
 * `I18nManager.isRTL`. Talki has no language switcher and is never shipped
 * in LTR (legacy: `<html lang="he" dir="rtl">`, unconditionally, index.html
 * line 2); react-native-web's `I18nManager` is a stub that always reports
 * `isRTL: false` regardless of `forceRTL()` (it has no effect on web — RTL
 * there comes entirely from the `direction` CSS property), so reading it
 * would make every helper below silently wrong on the web test surface.
 */
export type LogicalDirection = 'start' | 'end';

export function isRTL(): boolean {
  return true;
}

/**
 * A *physical* left/right pair (an OS safe-area inset, a bitmap pan, a shape
 * that must point one way) expressed as the logical inline edges that land
 * on those sides.
 *
 * Never write the physical props (`left`, `paddingLeft`, `borderLeftWidth`…)
 * for this: native React Native reads them as start/end under RTL
 * (`I18nManager.swapLeftAndRightInRTL`, on by default) while
 * react-native-web keeps them physical, so the same style renders mirrored
 * on Android/iOS versus Chrome. Logical edges resolve the same on both.
 */
export function physicalInline<T>(left: T, right: T): { start: T; end: T } {
  return isRTL() ? { start: right, end: left } : { start: left, end: right };
}

/** For the rare case a component computes a numeric transform (e.g. a
 *  chevron rotation or a swipe-direction sign) that has no `start`/`end`
 *  style prop equivalent. Returns 1 in LTR, -1 in RTL, so `direction() * dx`
 *  reads correctly in both without an if/else at every call site. */
export function directionSign(): 1 | -1 {
  return isRTL() ? -1 : 1;
}

/** A chevron/arrow that implies travel direction (e.g. "forward" in a list
 *  row) must point start-to-end, i.e. it visually points left in RTL and
 *  right in LTR — the opposite of what an English-language reflex expects.
 *  Centralised here so a component asks this instead of writing its own
 *  `isRTL() ? ... : ...` inline, which is exactly the kind of one-off that
 *  is invisible to review. */
export function forwardChevronRotation(): '0deg' | '180deg' {
  return isRTL() ? '180deg' : '0deg';
}
