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
  drift respects the actual distance to each stage edge. Native horizontal
  motion uses the shared RTL direction sign so logical spawn coordinates and
  physical transforms stay consistent.
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
| Full functional browser regression | PASS — 582 passed, 3 skipped, three viewports |
| `npm run doctor --workspace=mobile` | FAIL — 19/21 checks |

Initial unit failures came from missing assets/fixtures in the partial checkout.
After restoring them, the complete unit suite passed. Generated registries
were restored; no empty registry or test weakening is included in the change.

Validated code commit: `4c7b20b28d51b1a4352df8c33cbc03cf9d4dd0bb`.
Final CI run: [37544863153](https://github.com/Yonicks/talki/actions/runs/37544863153),
all required steps successful, including main-flow screenshot capture. The
phone tests use Chromium with each device's user agent, touch and device scale
factor, and landscape screen dimensions. This is browser emulation.

Reviewed all 14 phone layout screenshots. Six hub cards fit above the reserved
ad strip; Match's last row is reachable by internal scrolling; Puzzle, Sort
and Count controls fit the play area; bubble spawn has bottom clearance.
The screenshots use existing production artwork. No pixel-diff baseline or
native hardware approval is asserted. The full functional suite reports three
skips; no failing or flaky tests were reported.

Evidence: `phone-layout-evidence` artifact 11450173209,
`main-flow-screenshots` artifact 11450337939. Contact sheets:

- [Pixel 9](screenshots/android-playability/pixel-9.jpg)
- [iPhone 17 Pro](screenshots/android-playability/iphone-17-pro.jpg)

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
