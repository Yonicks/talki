# Visual validation — landscape mocks (work in progress)

Tooling: `apps/mobile/tools/visual-validation/` (`shoot.mjs`, `compare.py`, `crop.py`, `screens.json`).
Plates: `apps/mobile/tools/mock-plate/` (`build-scenes.py`, `build-count-plate.py`, `build-detail-plate.py`).
Artifacts: `visual-validation/<screen>/<viewport>/` (reference, `itNN-actual/overlay/diff/sbs`, `metrics.json`).
Viewport `ref` = 844x395 @2x = the 1688x790 mock interior. Metrics exclude the mock's test-ad band where the mock has one.

| Screen | Mock | Status | Iterations | Latest MAE / SSIM |
|---|---|---|---|---|
| game-quiz | ...-6 | Implemented, not final | it00-it04 + s1 | 13.6 / 0.83 |
| game-sounds | ...-4 | Implemented, not final | it01, it02, s1 | 11.2 / 0.87 |
| game-count | ...-3 | Implemented, not final | it01-it04, s1 | 15.0 / 0.81 |
| game-memory | ...-7 | Implemented, not final | it01, s1 | 8.1 / 0.88 |
| game-missing | ...-8 | Implemented, not final | it01, it02 | 11.1 / 0.87 |
| cards | ...-5 | Implemented, not final | it01-it03 | 11.9 / 0.84 |
| gate, parent | ...-1, ...-2 | NOT STARTED | – | – |
| games hub, practice hub, rewards | Whimsical…, Fantasy Garden…, Sticker Meadow… | NOT STARTED | – | – |
| home | – | Untouched; baseline `visual-validation/home/ref/baseline-actual.png` | – | – |

Not done yet: 4-iteration minimum on every screen, Pixel 9 / iPhone captures for all screens,
Android emulator and iOS validation, home regression diff, functional/unit/e2e runs.
Known limits: per-screen scene plates are rebuilt from the mocks (no clean source art); mock
animals/emoji (headphones, monkey, dog) differ from app art; memory mock's third row sits under
the mock's ad band.
