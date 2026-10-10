# Landscape Reference Images

This directory is the **single canonical location for every landscape mock**.
Nothing lives outside it — not `apps/mobile/assets/`, not anywhere else. If a
new mock arrives, it goes here.

Committed here:

- `home.png` — current Home composition target (v3, phone-framed). The
  primary reference for Home — look here first.
- `home-pixel-source.png` — the edge-to-edge 1843×853 source `homeLayout.ts`
  measures its exact pixel geometry from (see that file's header comment and
  `tools/home-fidelity/`). Load-bearing for code, not just visual inspiration
  — don't replace it without re-running the fidelity rig.
- `home-historical.png` — the original landscape-redesign Home crop (Phase
  16–20 target), kept for history now that `home.png` supersedes it as the
  composition target.
- `games.png` — Games hub mock. No v3 refresh exists yet; this is still the
  current target.
- `practice.png` — Practice hub mock. Same as `games.png`.
- `talki-landscape-master.jpg` — optional original composite containing
  Games, Practice, and Home (never supplied; see `reference/README.md`
  history below — its absence is not a gate failure).

No mock exists yet for any other screen (every individual game, every
practice activity, Cards, Category, Parent, Rewards). When one is supplied,
commit it here as `<screen>.png`, using the same screen id
`tools/home-fidelity/screens.mjs` already uses for the Android/Chrome
screenshot sweep (`game-quiz`, `practice-cloze`, `rewards`, …) — that keeps
one mock side by side with one real capture, same name, two folders
(`docs/design/landscape/reference/` vs `docs/screenshots/{chrome,android}/`).

## Rule: one current file per screen, never two

A screen's mock is always the plain `<screen>.png` — nothing else here
should be mistaken for "the current one." When a newer mock replaces an
existing file:

1. If the old one is still worth keeping for history, rename it first —
   `<screen>-historical.png` (or `-v2`, `-v3`, … if there's already more than
   one predecessor).
2. Then commit the new mock as the plain `<screen>.png`.

Never leave two files that could both read as "the latest" for the same
screen.

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

Phase 16 must mark the reference-image acceptance criterion BLOCKED if
`home.png`, `games.png`, and `practice.png` are not present and inspectable.
