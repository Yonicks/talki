# Android landscape — page review and next-step plan

Evidence: every screen captured in Chromium on **Pixel 9** (808 × 360) and
**iPhone 17 Pro** (874 × 402), plus Pixel 9 Pro (952 × 427), with the 50 px ad
slot reserved. Sheets: `screenshots/android-home/all-screens-<device>-{1,2}.jpg`.
No screen scrolls the document. Home is done (see
[android-home-pixel-qa.md](android-home-pixel-qa.md)); this plan covers the rest.

Severity: **P0** content is clipped/overlapping or unreachable · **P1** far from
the committed reference · **P2** off the design system / too small or dense.
**Art** = blocked until new illustrations are supplied (AGENTS.md #19).

## Findings

| # | Screen | What the captures show | Sev |
|---|---|---|---|
| 1 | **Games hub** | Reference is a big title + subtitle pill over a **3 × 2 grid of large portrait art cards**. Ours spends ~55 % of the height on title, subtitle and an 11-chip category row, leaving flat 35 dp banners with the art cropped under a translucent label. Side-nav labels overlap ("תרגול דיבור" garbled at the left edge). | P1 |
| 2 | **Practice hub** | Same shape as Games: chip row + squashed wide cards; purple label pills are fine, art is hidden. Reference is 3 × 2 large art cards. | P1 |
| 3 | **Match** | Only ~4½ of 6 rows fit; the last rows are cut by the stage bottom on both devices. | **P0** |
| 4 | **Puzzle** | Two ~400 dp panels overflow the stage vertically; drop targets/pieces are tiny and cut off. | **P0** |
| 5 | **Sort** | Oversized butterfly; the answer word sits under the two boxes (overlap). *(Also crashed in dev with a null `measureInWindow` — fixed.)* | **P0** |
| 6 | **Count** | Answer buttons sit on the bottom edge with no margin; fish tiny. | P0 |
| 7 | **Bubbles** | Bottom-row bubbles touch/crop at the edge; upper 60 % empty. | P0 |
| 8 | **Category** | Progress panel + three action buttons take ~45 % of the height; on Pixel 9 the two word rows are squashed and labels are clipped by the card below. | P1 |
| 9 | **Cards** | Works; large card, small controls. Uses none of Home's chrome tokens. | P2 |
| 10 | **Quiz / Missing / Sounds** | HUD pills and prompt ≈ 11–12 dp text, option tiles ≈ 40 dp, a big empty middle. Playable, but tiny for a child. | P2 |
| 11 | **Memory** | Twelve plain white cards edge to edge with "?"; no card-back art; dense. | P2 |
| 12 | **Practice activities ×6** | Correct world background, content confined to the middle third at small scale; HUD tiny. | P2 |
| 13 | **Rewards** | Panel + chips fill the top; sticker grid is faded/locked and squeezed to two rows on Pixel 9. | P2 |
| 14 | **Parent** | Flat cream page — no world, none of the landscape shell. Gate keypad + prompt are usable. | P2 |
| 15 | **Shared top bar** | Logo carries a ~7 dp tagline; stars/back/music are fine. Games/Practice mocks want logo + profile + stars in one group with a large centred title instead. | P1 |

Ad strip: on the five ad-eligible hubs the content ends 24–30 px above the
banner slot; game/practice/category screens are ad-free per
`ad-placement-policy.md`. Nothing overlaps the reserved strip.

## Plan (each step ends with the pixel rig + both devices)

**A. Shared foundation — do first, unblocks everything**
- Promote Home's pieces to the shared system: `homeMock` palette (ink `#0B0044`,
  white surfaces), `LandscapeTouchSurface` (drawn size ≠ tap size), Rubik scale,
  card/label chrome, gradient CTA.
- One hub metrics module like `homeLayout.ts` (mock px → dp canvas) for Games and
  Practice, measured from their references with the same tools.
- Add **Pixel 9** and **iPhone 17 Pro** landscape projects to
  `playwright.config.ts` (project rule) and regenerate baselines on Linux — see CI
  below.

**B. Games and Practice hubs (P1, biggest visible gap)** — build the 3 × 2 art-card
grid at the reference proportions with paging; decide where the category chips
go (compact selector or the game's own start step — *needs your call*, they are
existing functionality and must stay reachable). **Art:** 6 game + 6 practice
card illustrations with baked scenes, like Home's.

**C. P0 layout fixes — small, independent, can ship before B**
Match (row budget / scroll), Puzzle (panel sizing to the stage), Sort (stack the
word above the boxes), Count and Bubbles (bottom margin ≥ the Home strip's air).
Each gets a Playwright assertion "nothing crosses the stage bottom" on both
devices, so they cannot regress.

**D. Category + Cards (P1/P2)** — compact the progress/action header, size word
cards from the same 2-row budget as Home's strip, keep labels inside their card.

**E. Game/practice stage scale (P2)** — one shared HUD size and stage scale so
the play area uses the screen (min 14 dp HUD text, ≥ 56 dp option tiles).

**F. Rewards and Parent (P2)** — put both on the shared shell/world; Parent may
stay denser (README allows it).

**G. Real-device pass** — Chromium cannot emulate iOS safe-area insets or the
live AdMob banner. Verify Pixel 9 and iPhone 17 Pro on emulators/devices:
banner load/collapse, notch spacing, touch targets.

Suggested order: **C → A → B → D → E → F → G** (C is quick wins and removes every
P0; A makes B–F cheaper).

## Decisions I need from you

1. **Art** for Home (list in the Home QA doc) and for the hubs — without it the
   illustrations cannot match, only the chrome.
2. Where the **category chips** live once the hubs use the big art grid.
3. **Regenerate the E2E baselines on Linux** (Docker Desktop + ~2 GB image, ~200
   PNGs rewritten) so CI can go green — or would you rather I change how the
   snapshots are taken?
4. Keep the **Practice/Games buttons** on Home, or relocate them?
5. Home label **"בית" vs "בבית"** — content change.
