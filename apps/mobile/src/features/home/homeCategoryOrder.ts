import type { TalkiCategory } from '@/domain/types';

/**
 * Display order of the Home category strip, taken from the v3 Android mock
 * (right → left in Hebrew): the eight cards the mock shows come first, so the
 * first viewport reads exactly like the approved composition. Everything else
 * keeps its place after them, so every category — including `numbers`,
 * `emotions` and the synthetic `mine` — stays reachable by scrolling / the
 * arrows (AGENTS.md non-negotiable 21).
 *
 * This is presentation only: `allCats()` and every other consumer keep the
 * domain order, and ids this list does not know (future categories) sort to
 * the end in their original relative order.
 */
export const HOME_CATEGORY_ORDER = [
  'animals',
  'food',
  'colors',
  'home',
  'outside',
  'actions',
  'family',
  'body',
  'numbers',
  'emotions',
  'mine',
] as const;

export function orderHomeCategories(categories: readonly TalkiCategory[]): TalkiCategory[] {
  const rank = (id: string) => {
    const i = (HOME_CATEGORY_ORDER as readonly string[]).indexOf(id);
    return i === -1 ? HOME_CATEGORY_ORDER.length : i;
  };
  return categories
    .map((cat, index) => ({ cat, index }))
    .sort((a, b) => rank(a.cat.id) - rank(b.cat.id) || a.index - b.index)
    .map(({ cat }) => cat);
}
