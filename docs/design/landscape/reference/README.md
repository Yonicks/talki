# Landscape Reference Images

This directory is the canonical location for the landscape redesign mocks.

Committed here:

- `talki-landscape-master.jpg` — optional original composite containing Games, Practice, and Home.
- `home.png` — crop of the Home mock (landscape Phase 16–20 target).
- `games.png` — crop of the Games mock.
- `practice.png` — crop of the Practice mock.

Newer Home visual target (v3), stored with production assets but **reference-only**:

- `apps/mobile/assets/v3/mocks/mock_home_mobile_v3.png`

The original crops came from the approved landscape composite for the redesign program. The v3 mock is the current Home composition inspiration; it does not replace Games/Practice references.

## Important

These files are **visual references only**.

Do not use them as production screen backgrounds or as baked UI.

Production implementation must keep:

- labels as real React Native text;
- cards/buttons as real interactive components;
- progress as real UI;
- navigation as real UI;
- world/background artwork as separate production assets.

## Gate

Phase 16 must mark the reference-image acceptance criterion BLOCKED if `home.png`, `games.png`, and `practice.png` are not present and inspectable.
