# Visual validation — landscape mocks

Tooling: `apps/mobile/tools/visual-validation/` (`shoot.mjs`, `compare.py`, `crop.py`, `screens.json`).
Scene art: `apps/mobile/tools/mock-plate/` (`build-scenes.py`, `build-count-plate.py`, `build-detail-plate.py`, `extract-hub-art.py`).
Artifacts: `visual-validation/<screen>/<viewport>/` (git-ignored: `reference.png`, `itNN-actual/overlay/diff/sbs`, `final-*`, `metrics.json`).

Capture: Chromium at the mock's own aspect (`ref`, 2x), plus Pixel 9 and iPhone 17 Pro landscape screens (`final-actual.png`).
Metrics (MAE, % pixels over tolerance 32, SSIM) exclude the mock's test-ad band. `reference.png` is the mock crop, never a
screenshot of the app. Numbers are diagnostic only: the mocks show different animals / emoji art than the app's seeded
content, and the Games / Practice / Rewards numbers include controls the mocks omit (side arrows, category chips).

| Screen | Mock | Files | Iterations | MAE / SSIM (final) | Status |
|---|---|---|---|---|---|
| Quiz `/game/quiz` | `ChatGPT Image …-6` | QuizScreen, QuizOption | it00-it04, s1, final | 13.6 / 0.83 | Implemented |
| Sounds `/game/sounds` | `…-4` | SoundsScreen | it01, it02, s1, final | 11.2 / 0.87 | Implemented |
| Count `/game/count` | `…-3` | CountScreen | it01-it04, s1, final | 15.0 / 0.81 | Implemented |
| Memory `/game/memory` | `…-7` | MemoryScreen, MemoryCard | it01, s1, final | 7.7 / 0.88 | Implemented |
| Missing `/game/missing` | `…-8` | MissingScreen | it01, it02, final | 11.1 / 0.87 | Implemented |
| Cards `/cards/:cat` | `…-5` | CardsScreen | it01-it03, final | 11.9 / 0.84 | Implemented |
| Parent gate `/parent` | `…-1` | ParentGateScreen | it01, final | 8.7 / 0.88 | Implemented |
| Parent center `/parent` | `…-2` | ParentScreen, SettingsTab | it01-it03, final | 9.9 / 0.87 | Implemented (Settings tab matches; other tabs keep their old card styling) |
| Games hub `/games` | `Whimsical Talki Game Selection Screen` | GamesMenuScreen, MockHubFrame, MockHubCard | it01-it03, final | 21.8 / 0.73 | Implemented |
| Practice hub `/practice` | `Talki Fantasy Garden Game Menu` | PracticeMenuScreen | it01-it03, final | 24.7 / 0.66 | Implemented |
| Rewards `/rewards` | `Talki Sticker Meadow Adventure` | StickersScreen | it01-it04, final | 24.2 / 0.76 | Implemented |
| Home `/` | `c577a74e-….png` | — | baseline vs final | pixel-identical (max diff 0) | Untouched |

Other detail games (match, bubbles, sort, puzzle, speech) and the practice activities have no mock; they pick up the new stage,
header and a generic cream panel through `GameShell`.

## Validation status
- Chrome: all screens captured on the mock viewport, Pixel 9 and iPhone 17 Pro. `docs/screenshots/chrome/` refreshed (22 screens).
- Android emulator: **not validated** — no `adb`/emulator on the machine that did this work; `docs/screenshots/android/` is stale.
- iOS: **not validated** (no simulator available); Chromium cannot emulate safe-area insets.
- Unit tests 5585 passed, lint and typecheck clean. Playwright e2e was not run to completion for this change.
- Home regression: capture after all changes is pixel-identical to the baseline taken before.

## Known remaining differences
- Hub card pictures and the scene art are cut from the mocks (no separate clean art exists); bridging / repainted areas under removed UI
  are approximate (Count meadow, Rewards tile "glass").
- Emoji standing in for mock art: headphones (Quiz), monkey (Missing), dog (Sounds), padlock (gate), card/heart icons (Memory).
- Games / Practice mocks omit side arrows and category chips; both are kept (reduced prominence). The Practice mock's second page dot
  is not drawn (there is a single page of six modes).
- Memory's third card row sits under the ad band in the mock; kept as drawn.
- Copy kept from the app where it differs from the mock: "משחק זיכרון" (mock reads "זכרון"), "הצנצנת" (mock reads "הצבעות").
- Hub header Home button lacks the mock's violet ring.
