# Phase 30 — Landscape Home rebuilt to the v3 mock

Scope: the landscape **Home** hub only, rebuilt so it matches
`apps/mobile/assets/v3/mocks/mock_home_mobile_v3.png` at composition and
measurement level. No other hub, game, practice mode, reducer, store, or
data contract was touched.

## 1. Measurement method

The mock's phone screen (inside its drawn bezel) occupies mock pixels
`x 52…1799`, `y 47…806` — **1747 × 759**. Every geometry number in
`apps/mobile/src/design-system/landscape/homeLayout.ts` is a measurement of
that image divided by `MOCK_PX_PER_DP = 1747 / 898 = 1.9462`, which maps the
mock onto a **898 × 390 dp design canvas** (390 dp = the short edge of the
844 × 390 primary target).

The canvas is 898 dp wide, not 844, because the mock's aspect ratio (2.30) is
wider than 844 × 390 (2.16). `useHomeMetrics()` therefore scales the whole
canvas uniformly — `scale = min(usableWidth / 898, usableHeight / 390)`,
capped at 1.5 — and centres it. The composition keeps the mock's exact
proportions on every landscape phone and tablet instead of reflowing; the
world background stays full-bleed behind it, so the letterboxed remainder is
never visible as an empty band.

Measured mock rectangles (screen-local mock px → canvas dp):

| Element | Mock px | Canvas dp |
|---|---|---|
| Header button (music / profile) | 108 × 88 @ x 50, y 29 | 56 × 45 @ 26, 15 |
| Reward pill | 159 × 88 | 84 × 45 |
| Brand lockup | 380 × 120 @ y 13 | 195 × 62 @ y 7 |
| Hero row (mascot + card) | 952 × 318 @ x 255, y 146 | 489 × 168 @ 278 (from end), 75 |
| Hero card | 603 × 310, r ≈ 47.5 | 310 × 159, r 24 |
| Hero thumbnail frame | 175 × 225 | 90 × 116 |
| Progress pill / track | 361 × 37 / 19 | 185 × 19 / 10 |
| CTA | 361 × 80 | 185 × 41 |
| Mascot | 281 × 261 | 144 × 134 |
| Category card | 169 × 205, gap 15 | 87 × 105, gap 8 |
| Card label pill | 158 × 55 | 81 × 28 |
| Carousel arrow | ⌀ 113 | ⌀ 58 |

### Verified render vs mock (844 × 390, measured from the live DOM)

| Element | Mock → expected | Rendered |
|---|---|---|
| Hero row | x 123.2, y 82.2, w 459.8 | x 123.2, y 82.2, w 459.6 |
| CTA | x 304.3, y 181.2, w 174.3 | x 301.6, y 182.9, w 178.6 |
| Category strip | x 69.5, y 249.8, w 704.6 | x 68.6, y 248.6, w 706.8 |
| Category card | 81.6 × 99.0 | 81.8 × 98.7 |
| Reward pill | x 738.9, w 76.8 | x 740.6, w 78.9 |
| Music button | x 24.1, w 52.2 | x 24.4, w 52.6 |
| Brand lockup | w 183.5 | w 183.3 |
| Carousel arrow | ⌀ 54.6 @ x 12.6 | ⌀ 54.5 @ x 12.2 |

Eight category cards fit the first viewport at the baseline, exactly as the
mock draws.

## 2. Files changed

New:

- `src/design-system/landscape/homeLayout.ts` — the measurement table
  (`HOME_LAYOUT`), the canvas (`HOME_BASE`), `useHomeMetrics()`,
  `categoriesPerPage()`.
- `src/features/home/LandscapeHomeHeader.tsx` — Home's top chrome.
- `src/features/home/LandscapeCategoryCarousel.tsx` — arrows + scrolling strip.
- `src/features/shell/useParentHold.ts` — the 900 ms parent-gate hold,
  extracted verbatim from `LandscapeTopBar` so two controls can host it.
- `assets/v3/cards/card_bg1…8.webp` — 420 × 560 derivatives of the committed
  scenic masters (see §4).

Rewritten:

- `src/features/home/HomeScreen.tsx` — three layers (full-bleed world,
  art-directed stage, carousel); absolute placement inside a scaled canvas.
- `src/design-system/landscape/LandscapeHeroPanel.tsx` — mascot + large white
  card, copy column with progress and CTA **inside** the card, thumbnail
  frame on the card's end side.
- `src/design-system/landscape/LandscapeCategoryCard.tsx` — scenic fill,
  character art, floating white label pill; explicit size props.
- `src/design-system/landscape/LandscapeProgress.tsx` — added the `inline`
  variant (white pill, count at the physical start, fill growing rightwards).
- `src/features/home/ContinueLearningHero.tsx` — passes the new art slots
  through; behaviour (fresh vs returning) unchanged.
- `src/design-system/assets.ts` — registered `brand.logoMark`; pointed
  `categoryCardBackgrounds` at the card derivatives.
- `src/services/ads/adPlacement.ts` — Home is no longer banner-eligible.

Deleted: `src/features/home/HomeCategoryStrip.tsx` (superseded by the
carousel). `LandscapeCategoryStrip` remains for the dev shell.

## 3. Behaviour preserved

- Music toggle, reward counter → `/rewards`, continue CTA, category
  selection, category screen routing, RTL, progress data, custom words.
- All eleven categories (including synthetic `mine`) stay rendered and
  reachable: the strip is still a real horizontal ScrollView, so touch scroll
  and `scrollIntoViewIfNeeded()` both work; the arrows page by the number of
  cards that fit.
- Parent gate: the brand lockup keeps `testIds.parent.button`,
  `topbar-brand`, and the 900 ms hold + short-tap toast.
- Practice / Games hub navigation keeps `testIds.nav.sideStart` /
  `sideEnd` — see §5.
- `DevStorageProbe` (Maestro's native/dev-only persistence hook) still
  mounts, parked in a corner instead of in the middle of the composition. It
  renders `null` on web and in production builds.

## 4. Assets

Reused, exactly as the mock draws them: `talki-hero-star.webp` (mascot),
`talki-logo-mark.png` (wordmark + star lockup, no tagline),
`talki-star-mark.png` (title star), `talki-ui-icon-star.png`,
`talki-ui-icon-music.png`, `talki-chevron-left.png`, `category_*.png`
(strip and thumbnail art), `category_bg*.png` (scenic fills),
`talki-landscape-bg-home.png` (world).

Derived: the eight scenic fills are ~2 MB masters at 1086 × 1448. Home paints
eleven of them at ~82 × 99 dp, so shipping the masters into that box cost
~17 MB of decode on the app's first screen. `assets/v3/cards/card_bg*.webp`
(420 × 560, ~45 KB each, 369 KB total) are downscale-only derivatives — same
artwork, no crop, no recolour. The masters remain the source of truth.

Missing (recorded in `asset-manifest.md` as DESIGN-BLOCKED, substituted
rather than invented). Marked up on the mock itself in
`docs/migration/screenshots/phase-30/mock-missing-assets.png`:

1. **Profile icon** — the mock draws a purple person+gear outline; the
   repository only has the blue gear `talki-ui-icon-settings.png`.
2. **CTA play glyph** — the mock draws a solid triangle; `talki-ui-icon-play.png`
   is a blue-circled glyph that is wrong inside a white circle, so the CTA
   uses the purple chevron rotated 180°.
3. **Hero thumbnail art** — the mock's heart+children scene has no repository
   equivalent; Home shows the current category's own art over a scenic fill.
4. **World background** — the mock's background (tree hard left, river right,
   ferris wheel) is not a committed asset; Home keeps the production
   `talki-landscape-bg-home.png` (same world, tree centred).

## 5. Deliberate deviations from the mock

| Deviation | Why |
|---|---|
| Two extra header buttons (Practice, Games) beside the music button | The mock draws no route to those hubs, and the carousel arrows are carousel arrows. Dropping them would strand the child on Home — AGENTS.md non-negotiable 6. They keep `testIds.nav.sideStart` / `sideEnd`, so every existing navigation spec still passes. |
| Header buttons 48 dp tall (mock: 45), CTA 48 dp (mock: 41), arrows floored at 48 | AGENTS.md non-negotiable 16 — 48 dp minimum child touch target, enforced by `auditTouchTargets`. |
| Hero card hugs its content (min height = the mock's 159 dp) | The 48 dp CTA floor is taller than the mock's proportional CTA; letting the card grow is better than letting the CTA spill past the card edge. At 844 × 390 the card renders ~10 px taller than the mock proportion. |
| Subtitle keeps its word count (`עוד N מילים לכוכב הבא`) | The mock's filler subtitle drops the number. The count is real progress information — current source is behavioural truth (AGENTS.md). |
| Card order follows `allCats()`, not the mock's card order | The mock's left-to-right order matches no RTL reading of the domain order; product order is preserved and the *count* of visible cards matches. |
| Tablets letterbox the composition vertically | Uniform scale + `MAX_SCALE 1.5` keeps mock proportions and sensible maximum control sizes (AGENTS.md 22) rather than stretching the composition to a 4:3 short edge. |
| Home shows no ad banner | See §6. |

## 6. Ads

Home is removed from `BANNER_ELIGIBLE_EXACT_PATHS` and reports the new
`art_directed_home` ineligibility reason. Every other eligible surface
(`/games`, `/practice`, `/rewards`, `/parent`) is unchanged, and no AdMob
code, config, child-safety flag, or unit id was touched — only the route
decision table. `useLandscapeLayout().usableHeight` therefore subtracts 0 on
Home, so the composition gets the whole landscape viewport.

`docs/design/landscape/ad-placement-policy.md` is updated to match.

## 7. Validation

- `npx tsc --noEmit` — clean.
- `npx eslint src app` — clean (no physical left/right layout props; the two
  physical-anchor exceptions carry inline justifications).
- `npm test` (vitest) — 53 files, 5552 tests, all passing, including the
  updated `ad-placement.test.ts`.
- Playwright, `landscape-844`: `home.spec.ts` (11/12 — see below),
  `navigation.spec.ts`, `parent.spec.ts`, `ad-layout.spec.ts`,
  `stickers.spec.ts` all pass, including `auditTouchTargets`,
  `auditReachability`, and the no-horizontal-overflow check.
- Visual sweep at 667 × 375, 844 × 390, 932 × 430, 1024 × 768, 1366 × 1024 —
  no clipping, no overflow, composition intact.
- Home screenshot baselines regenerated across all eight viewports.

Known flake, **pre-existing**: `home.spec.ts` "burst(home-category-animals,
10) navigates exactly once" fails under parallel workers and passes with
`--workers=1`. Verified by stashing this phase's changes and re-running: it
fails identically on the pre-change tree.

Other specs' screenshot baselines (games, practice, every game and practice
detail) were already stale before this phase, because the working tree's v3
category art swap changed art the whole app renders. Those are not
regenerated here — they belong to whichever phase owns that swap.

## 8. Evidence

- `docs/migration/screenshots/phase-30/mock-vs-implementation-844x390.png` —
  the approved mock above the 844 × 390 render.
- `docs/migration/screenshots/phase-30/mock-missing-assets.png` — the mock
  with the four DESIGN-BLOCKED assets of §4 boxed and numbered.
- `docs/migration/screenshots/phase-30/667x375-home.png`,
  `1366x1024-home.png` — the extremes of the viewport matrix.
- `docs/migration/screenshots/phase-30/844x390-ad-ineligible-home.png`,
  `844x390-ad-eligible-practice.png` — the ad-policy change.
- `docs/migration/screenshots/phase-20/*-home*.png` — the full eight-viewport
  Home matrix (written by `home.spec.ts`'s `captureMatrix(page, '20', …)`).
- `apps/mobile/tests/e2e/__screenshots__/home.spec.ts/`,
  `smoke.spec.ts/`, `landscape-shell.spec.ts/` — regenerated baselines.

## 9. Remaining pixel-level differences

- Header button and CTA heights are 3–7 dp taller than the mock (touch floor).
- The hero card's copy column is ~4 px wider than the mock, because the mock's
  card uses asymmetric horizontal padding (13.4 dp start, 18.5 dp end) and
  this implementation uses 13 dp on both sides.
- The brand lockup is centred; the mock's is ~7 px left of centre.
- Card label text is 13 dp; long labels ("צבעים וצורות") fit at 844 × 390 and
  above but ellipsise at 667 × 375.
- The four substituted assets listed in §4.
