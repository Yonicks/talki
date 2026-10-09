/**
 * Every screen the screenshot sweeps capture, shared by the Chrome sweep
 * (`device-sweep.mjs`) and the Android sweep (`android-sweep.mjs`) so both
 * published sets always cover the same screens. `path` is an Expo Router path;
 * `root` is the screen's root testID (web only, used to wait for it).
 */
export const SCREENS = [
  { name: 'home', path: '/', root: 'home-root' },
  { name: 'games', path: '/games', root: 'games-menu-root' },
  { name: 'practice', path: '/practice', root: 'practice-menu-root' },
  { name: 'rewards', path: '/rewards', root: 'stickers-root' },
  { name: 'parent', path: '/parent?seed=42', root: 'parent-root' },
  { name: 'category', path: '/category/animals', root: 'category-root' },
  { name: 'cards', path: '/cards/animals', root: 'cards-root' },
  { name: 'game-quiz', path: '/game/quiz?catId=animals&seed=42' },
  { name: 'game-memory', path: '/game/memory?catId=animals&seed=42' },
  { name: 'game-missing', path: '/game/missing?catId=animals&seed=42' },
  { name: 'game-match', path: '/game/match?catId=animals&seed=42' },
  { name: 'game-bubbles', path: '/game/bubbles?catId=animals&seed=42' },
  { name: 'game-sounds', path: '/game/sounds?catId=animals&seed=42' },
  { name: 'game-count', path: '/game/count?catId=animals&seed=42' },
  { name: 'game-sort', path: '/game/sort?catId=animals&seed=42' },
  { name: 'game-puzzle', path: '/game/puzzle?catId=home&seed=42' },
  { name: 'practice-focus', path: '/practice/focus?catId=animals&seed=42' },
  { name: 'practice-cloze', path: '/practice/cloze?catId=animals&seed=42' },
  { name: 'practice-temptation', path: '/practice/temptation?catId=animals&seed=42' },
  { name: 'practice-receptive', path: '/practice/receptive?catId=animals&seed=42' },
  { name: 'practice-pairs', path: '/practice/pairs?catId=animals&seed=42' },
  { name: 'practice-combine', path: '/practice/combine?catId=animals&seed=42' },
];
