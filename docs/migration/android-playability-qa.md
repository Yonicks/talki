# Android landscape playability follow-up

Scope: the user requested completion of the game layout defects and hub layout
work in `android-pages-plan.md`, validated in Chrome as an Android emulator.
This is a follow-up to Phase 29's existing NO-GO, not native cutover.

## Pre-flight

- Reviewed repository instructions, landscape design contract, roadmap,
  Phase 29 plan, Phase 28 acceptance report, current page review and asset manifest.
- Match still combined five minimum-height rows with a clipped game shell.
- Puzzle slots had a height cap, but the tray did not have a bounded row and
  piece artwork used percentage height without a defined parent height.
- Sort's image consumed a percentage of its entire prompt, leaving insufficient
  space for the word and instruction.
- Games and Practice already preserved all content through 3×2 grids and paging,
  but title/subtitle and category chips consumed separate vertical bands.
- Game and practice card illustrations are registered production assets; Home
  mock-specific artwork remains marked DESIGN-BLOCKED in the asset manifest.

## Changes

- Match scrolls its two columns together within the play area; touch targets
  remain at least 48 dp and the document does not become a scrolling page.
- Puzzle reserves bounded slot/tray rows and gives each tray piece explicit
  dimensions. Existing tap and drag interactions remain in place.
- Sort gives its artwork the remaining space above the word/instruction.
- Count gains bottom clearance. Bubbles gain a 16 dp bottom inset and horizontal
  drift respects the actual distance to each stage edge.
- Games/Practice share an inline title/category header; phone subtitles are
  omitted to recover card height. Every category remains available in the
  horizontal selector; game paging and all six practice modes remain intact.
- Side navigation labels are constrained to their lanes.
- Pixel 9 (808×360) and iPhone 17 Pro (874×402) join the browser test matrix.
- Added `android-playability.spec.ts` and a CI gate for both phone projects,
  with screenshot evidence uploaded as `phone-layout-evidence`.

## Validation

| Check | Result |
|---|---|
| `npm run mobile:typecheck` | PASS |
| `npm run mobile:lint` | PASS |
| `npm run mobile:test` | PASS — 54 files, 5,585 tests |
| `npm run mobile:export` | PASS |
| Phone layout regression in CI | PASS — 14 checks, Pixel 9 + iPhone 17 Pro |
| Full functional browser regression | Pending |
| `npm run doctor --workspace=mobile` | FAIL — 19/21 checks |

Initial unit failures came from missing assets/fixtures in the partial checkout.
After restoring them, the complete unit suite passed. Generated registries
were restored; no empty registry or test weakening is included in the change.

First browser evidence run:
`https://github.com/Yonicks/talki/actions/runs/37543925991`.
The follow-up also uses each phone's user agent, touch and device scale factor,
with landscape screen dimensions; it preserves phone screenshots separately
from the full suite's output. Final results and evidence will be appended below.

Expo Doctor flags competing static/dynamic app configuration and 18 SDK package
patch-version mismatches in the unchanged configuration/dependencies. These
remain release follow-ups, rather than being silently waived by a passing
web build. Maximum browser validation rounds for this follow-up: three.

Local browser execution is blocked: Chrome failed creating its process socket
(`Operation not permitted`); connected browser creation timed out. Android
Studio/SDK and real hardware are unavailable here. CI is the browser validation
path; results must be recorded before declaring these layouts validated.

Native release status remains **NO-GO**. Mock-specific Home artwork remains
**DESIGN-BLOCKED**. No native capability or pixel-perfect artwork parity is
attested by this work.
