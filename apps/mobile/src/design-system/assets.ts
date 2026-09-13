/**
 * Real Talki art used by the design system's shell components and gallery —
 * no emoji placeholders. Production category strip art prefers
 * `apps/mobile/assets/v3/` when a v3 file exists; remaining families still
 * load from `apps/mobile/assets/v2/` (copied from repository-root
 * `assets/v2/`, which is never edited in place).
 *
 * `apps/mobile/assets/v3/mocks/` holds visual references only — never load a
 * mock screenshot as production UI (AGENTS.md landscape rule 4).
 */
export const navIcons = {
  home: require('../../assets/v2/nav/talki-nav-home.png'),
  games: require('../../assets/v2/nav/talki-nav-games.png'),
  stickers: require('../../assets/v2/nav/talki-nav-rewards.png'),
} as const;

export const uiIcons = {
  back: require('../../assets/v2/icons/talki-ui-icon-back.png'),
  close: require('../../assets/v2/icons/talki-ui-icon-close.png'),
  music: require('../../assets/v2/icons/talki-ui-icon-music.png'),
  speaker: require('../../assets/v2/icons/talki-ui-icon-speaker.png'),
  star: require('../../assets/v2/icons/talki-ui-icon-star.png'),
  gift: require('../../assets/v2/icons/talki-ui-icon-gift.png'),
  chevron: require('../../assets/v2/icons/talki-chevron-left.png'),
  settings: require('../../assets/v2/icons/talki-ui-icon-settings.png'),
  games: require('../../assets/v2/icons/talki-ui-icon-games.png'),
} as const;

export const practiceIcons = {
  bubble: require('../../assets/v2/icons/talki-speech-bubble.png'),
  focus: require('../../assets/v2/icons/talki-speech-target.png'),
  receptive: require('../../assets/v2/icons/talki-speech-pointing-hand.png'),
  cloze: require('../../assets/v2/icons/talki-speech-pause.png'),
} as const;

export const brand = {
  headerLogo: require('../../assets/v2/brand/talki-header-logo.png'),
  /** Wordmark + star with no tagline lockup — the lockup the v3 Home mock
   *  shows as the centred top-bar logo (440×136). */
  logoMark: require('../../assets/v2/brand/talki-logo-mark.png'),
  starMark: require('../../assets/v2/brand/talki-star-mark.png'),
} as const;

/** Ten built-in categories' icon art (index.html `.cat-card .hero-chip img`
 *  equivalent). `mine` (custom words) has no dedicated icon in legacy either
 *  — it reuses the emoji 💜, which is out of scope for this art registry. */
/** Opening-sequence art (Phase 6) — the same files `sw.js` 18-25 precaches
 *  and comments "opening bumper art — the intro must survive an offline
 *  launch". Copied from the repository-root `assets/v2/` exactly like every
 *  other art registry entry in this file. */
export const introAssets = {
  background: require('../../assets/v2/backgrounds/talki-bg-home-hero.png'),
  star: require('../../assets/v2/mascot/talki-star-waving.png'),
  sparkleYellow: require('../../assets/v2/effects/talki-particle-star-yellow.png'),
  sparklePurple: require('../../assets/v2/effects/talki-particle-star-purple.png'),
  sparkleGreen: require('../../assets/v2/effects/talki-particle-star-green.png'),
  sparkleSmall: require('../../assets/v2/effects/talki-particle-star-small.png'),
  wordmark: require('../../assets/v2/brand/talki-logo-mark.png'),
} as const;

/** Home hero art (Phase 7). `talki-home-hero-mockup.png`'s newer intent —
 *  these three files were untracked when the phase started (see
 *  phase-07-report.md "Findings and drift"); `talki-home-hero-art.webp`
 *  (the older single-scene asset the approved mock predates) was deleted
 *  from the repository, so the compact/wide scene pair is the only art
 *  available for the hero today. */
export const homeAssets = {
  heroSceneCompact: require('../../assets/v2/home/talki-hero-scene-compact.webp'),
  heroSceneWide: require('../../assets/v2/home/talki-hero-scene-wide.webp'),
  heroStar: require('../../assets/v2/home/talki-hero-star.webp'),
} as const;

/**
 * Landscape world backgrounds (Phase 18). Full-bleed painterly scenes with
 * no baked UI chrome. Source size 1672×941 — cover + focal crop via
 * `LandscapeWorldBackground`; never use reference/*.png as runtime art.
 */
export const landscapeBackgrounds = {
  home: require('../../assets/v2/landscape/talki-landscape-bg-home.png'),
  games: require('../../assets/v2/landscape/talki-landscape-bg-games.png'),
  practice: require('../../assets/v2/landscape/talki-landscape-bg-practice.png'),
} as const;

/** Game card art — all eleven registered games (Phase 21). Files live under
 *  `apps/mobile/assets/v2/game-menu/`; match/bubbles/sort/speech were added
 *  to close the former plain-card gap (see asset-manifest.md). */
export const gameCardAssets = {
  memory: require('../../assets/v2/game-menu/talki-game-card-memory.png'),
  quiz: require('../../assets/v2/game-menu/talki-game-card-where-is.png'),
  missing: require('../../assets/v2/game-menu/talki-game-card-missing.png'),
  cards: require('../../assets/v2/game-menu/talki-game-card-flashcards.png'),
  sounds: require('../../assets/v2/game-menu/talki-game-card-animal-sounds.png'),
  count: require('../../assets/v2/game-menu/talki-game-card-counting.png'),
  puzzle: require('../../assets/v2/game-menu/talki-game-card-challenge.png'),
  match: require('../../assets/v2/game-menu/talki-game-card-match.png'),
  bubbles: require('../../assets/v2/game-menu/talki-game-card-bubbles.png'),
  sort: require('../../assets/v2/game-menu/talki-game-card-sort.png'),
  speech: require('../../assets/v2/game-menu/talki-game-card-speech.png'),
} as const;

/** Practice card art — all six PRACTICE_LIST modes (Phase 22). Files live
 *  under `apps/mobile/assets/v2/practice-menu/` (see asset-manifest.md). */
export const practiceCardAssets = {
  focus: require('../../assets/v2/practice-menu/talki-practice-card-focus.png'),
  cloze: require('../../assets/v2/practice-menu/talki-practice-card-cloze.png'),
  temptation: require('../../assets/v2/practice-menu/talki-practice-card-temptation.png'),
  receptive: require('../../assets/v2/practice-menu/talki-practice-card-receptive.png'),
  pairs: require('../../assets/v2/practice-menu/talki-practice-card-pairs.png'),
  combine: require('../../assets/v2/practice-menu/talki-practice-card-combine.png'),
} as const;

/**
 * Category strip / theme icons. All ten built-ins use v3 glossy character art.
 * Domain id `colors` maps to file `category_art.png` (צבעים וצורות).
 */
export const categoryIcons = {
  animals: require('../../assets/v3/category_animals.png'),
  food: require('../../assets/v3/category_food.png'),
  colors: require('../../assets/v3/category_art.png'),
  home: require('../../assets/v3/category_home.png'),
  family: require('../../assets/v3/category_family.png'),
  body: require('../../assets/v3/category_body.png'),
  actions: require('../../assets/v3/category_actions.png'),
  numbers: require('../../assets/v3/category_numbers.png'),
  outside: require('../../assets/v3/category_outside.png'),
  emotions: require('../../assets/v3/category_emotions.png'),
} as const;

/** Home category-card art — same v3 sources as `categoryIcons`.
 *  `mine` falls back to `brand.starMark` at the call site. */
export const categoryArt = {
  animals: require('../../assets/v3/category_animals.png'),
  food: require('../../assets/v3/category_food.png'),
  colors: require('../../assets/v3/category_art.png'),
  home: require('../../assets/v3/category_home.png'),
  family: require('../../assets/v3/category_family.png'),
  body: require('../../assets/v3/category_body.png'),
  actions: require('../../assets/v3/category_actions.png'),
  numbers: require('../../assets/v3/category_numbers.png'),
  outside: require('../../assets/v3/category_outside.png'),
  emotions: require('../../assets/v3/category_emotions.png'),
} as const;

/**
 * Scenic fills behind category-card character art. Cover-cropped into the
 * card art panel — never stretched. Call sites cycle with
 * `index % categoryCardBackgrounds.length` so every category (incl. mine)
 * gets a tile without inventing extra art.
 *
 * These are 420×560 WebP derivatives of the committed 1086×1448 masters in
 * `assets/v3/category_bg*.png` (same artwork, no crop, no recolour). Home
 * paints eleven of them at ~82×99 dp; the masters are ~2 MB each, so
 * shipping them into that box cost ~17 MB of decode on the app's first
 * screen. The masters stay in the repository as the source of truth — see
 * `docs/design/landscape/asset-manifest.md`.
 */
export const categoryCardBackgrounds = [
  require('../../assets/v3/cards/card_bg1.webp'),
  require('../../assets/v3/cards/card_bg2.webp'),
  require('../../assets/v3/cards/card_bg3.webp'),
  require('../../assets/v3/cards/card_bg4.webp'),
  require('../../assets/v3/cards/card_bg5.webp'),
  require('../../assets/v3/cards/card_bg6.webp'),
  require('../../assets/v3/cards/card_bg7.webp'),
  require('../../assets/v3/cards/card_bg8.webp'),
] as const;
