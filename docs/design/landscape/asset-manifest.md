# Talki Landscape Asset Manifest

Status values:

- `REFERENCE` — committed visual reference only, not a production asset.
- `EXISTING` — current repository production asset can be reused.
- `NEEDED` — production asset is required.
- `DESIGN-BLOCKED` — cannot claim visual completion until supplied/approved.
- `OPTIONAL` — polish asset that does not block core implementation.

## Committed references

| Asset | Status | Purpose |
|---|---|---|
| `reference/talki-landscape-master.*` | REFERENCE (not committed, optional) | Original composite landscape mock — never supplied; absence is not a gate failure per `reference/README.md` |
| `reference/home.png` | REFERENCE | Home crop (1448×1086) — landscape Phase 16–20 target |
| `apps/mobile/assets/v3/mocks/mock_home_mobile_v3.png` | REFERENCE | Newer Home visual target (v3). Composition/chrome inspiration only — never runtime UI |
| `reference/games.png` | REFERENCE | Games hub crop (1672×941) |
| `reference/practice.png` | REFERENCE | Practice hub crop (1448×1086) |

## Production asset families

Statuses below were verified against `apps/mobile/src/design-system/assets.ts`
during the Phase 16 audit (see `docs/migration/phase-16-audit.md` §7).

### World backgrounds

| Asset family | Status | Notes |
|---|---|---|
| Home world background | EXISTING | `assets/v2/landscape/talki-landscape-bg-home.png` (1672×941) — registered as `landscapeBackgrounds.home` in `assets.ts` (Phase 18). Cover + focal `{x:0.48,y:0.42}` via `LandscapeWorldBackground` / expo-image `contentPosition`. Also reused by detail screens (Stickers; Category Phase 23). |
| Games world background | EXISTING | `assets/v2/landscape/talki-landscape-bg-games.png` (1672×941) — `landscapeBackgrounds.games`; focal `{x:0.55,y:0.4}` (castle bias). |
| Practice world background | EXISTING | `assets/v2/landscape/talki-landscape-bg-practice.png` (1672×941) — `landscapeBackgrounds.practice`; focal `{x:0.5,y:0.42}`. |
| Tablet-compatible crops/source | EXISTING (single source + focal) | Source is ~16:9. On 4:3 tablets (1024×768) cover crops top/bottom (`coverCropAxis` → vertical). Focal Y ~0.42 keeps path/meadow; no separate tablet crop file required. Resolution is sufficient for 1366×1024 (cover scales up modestly). Revisit only if native QA shows softness. |

### Shared brand/chrome

| Asset family | Status | Notes |
|---|---|---|
| Talki logo | EXISTING | `brand.headerLogo` (`assets/v2/brand/talki-header-logo.png`); verify fit at landscape scale |
| Yellow Talki mascot | EXISTING | Phase 20 Home uses `homeAssets.heroStar` in `LandscapeHeroPanel` (world-bg composition; no hero-scene card) |
| Music control art | EXISTING | `uiIcons.music` (`assets/v2/icons/talki-ui-icon-music.png`) |
| Parent/profile control art | VERIFY | `uiIcons.settings` exists but is not wired into `TopBar` today — the logo itself is the only tappable/long-press parent trigger (`src/components/shell/TopBar.tsx`); the reference shows a separate small parent icon. Open wiring decision, not a missing-art blocker |
| Star/reward art | EXISTING | `uiIcons.star` (`assets/v2/icons/talki-ui-icon-star.png`); note the current `TopBar` points pill is display-only, not tappable — see interaction-map "Stars/rewards" |
| Side navigation arrows | OPTIONAL / CAN-BE-UI | `uiIcons.chevron` (`assets/v2/icons/talki-chevron-left.png`) exists; the mirrored forward arrow can be a transform, no new art required |

### Home categories

10 built-in categories (verified via `src/domain/vocabulary/categories.ts`) plus
the synthetic `mine` (custom words) category.

| Asset family | Status | Notes |
|---|---|---|
| Category icons / strip art (v3) | EXISTING | All 10 built-ins use `apps/mobile/assets/v3/category_*.png` via `categoryIcons` + `categoryArt`. Domain **colors** ← file `category_art.png` |
| Category scenic fills (v3) | EXISTING | Masters `assets/v3/category_bg1.png`…`bg8.png` (1086×1448, ~2 MB each). Home paints them behind the strip cards' character art and behind the hero thumbnail, exactly as the v3 mock draws them |
| Category scenic fills — card derivatives | EXISTING (derived) | `assets/v3/cards/card_bg1.webp`…`bg8.webp` (420×560, ~45 KB each) — same artwork, downscaled only. `categoryCardBackgrounds` points here because Home draws eleven of them at ~82×99 dp and the masters cost ~17 MB of decode on the app's first screen. Regenerate from the masters if the masters change |
| Home mascot | EXISTING | `assets/v2/home/talki-hero-star.webp` — the exact mascot the v3 mock draws |
| Home brand lockup | EXISTING | `assets/v2/brand/talki-logo-mark.png` (440×136, wordmark + star, no tagline) — the exact lockup the v3 mock draws. `talki-header-logo.png` (with tagline) still serves `LandscapeTopBar` on other hubs |
| Home hero title star | EXISTING | `assets/v2/brand/talki-star-mark.png` — the small character star beside the category title |
| Missing-asset markup | REFERENCE | `docs/migration/screenshots/phase-30/mock-missing-assets.png` — the v3 Home mock with every DESIGN-BLOCKED slot below boxed and numbered |
| Home profile/parent icon | **DESIGN-BLOCKED (substituted)** | The v3 mock draws a purple person+gear outline. No such asset exists; Home renders `assets/v2/icons/talki-ui-icon-settings.png` (blue gear) in that slot |
| Home CTA play glyph | **DESIGN-BLOCKED (substituted)** | The v3 mock draws a solid play triangle in the CTA's white circle. `talki-ui-icon-play.png` is a blue-circled glyph, wrong inside a white circle, so the CTA uses the purple `talki-chevron-left.png` rotated 180° |
| Home hero thumbnail art | **DESIGN-BLOCKED (substituted)** | The v3 mock's hero thumbnail is a bespoke heart+children scene with no repository equivalent. Home shows the current category's own `categoryArt` over a scenic fill instead |
| Home world background | **DESIGN-BLOCKED (substituted)** | The v3 mock's background (tree hard left, river right, ferris wheel) is not a committed asset. Home keeps `assets/v2/landscape/talki-landscape-bg-home.png` (same world, tree centred) |
| `mine` (custom words) art | EXISTING (fallback) | No dedicated art; falls back to `brand.starMark`, matching legacy behavior |

### Games

The current app registers **11 games** (`src/features/games/shell/gameRegistry.ts`).

| Asset family | Status | Notes |
|---|---|---|
| Card art — memory, quiz, missing, cards, sounds, count, puzzle (7) | EXISTING | `gameCardAssets` in `assets.ts` |
| Card art — match, bubbles, sort, speech (4) | EXISTING | `apps/mobile/assets/v2/game-menu/talki-game-card-{match,bubbles,sort,speech}.png` — registered in `gameCardAssets` (Phase 21) |

### Practice

**Six practice modes** (`src/features/practice/practiceRegistry.ts`) require six
card illustrations matching the reference visual language.

| Asset family | Status | Notes |
|---|---|---|
| Card art — focus, cloze, temptation, receptive, pairs, combine (6) | EXISTING | `assets/v2/practice-menu/talki-practice-card-{focus,cloze,temptation,receptive,pairs,combine}.png` — registered in `practiceCardAssets` (Phase 22) |

## Asset implementation rules

- Do not use the reference screenshot as a card/background production asset.
- Do not bake interactive labels into raster art.
- Do not stretch source art.
- Record source dimensions and focal crop notes once production assets are approved.
- Prefer explicit asset registry entries over ad-hoc `require()` calls scattered across screens.
- Missing required art must remain visible in reports as a design dependency.
