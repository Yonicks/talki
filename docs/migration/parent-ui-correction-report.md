# Parent UI and RTL correction — 2026-10-12

## Scope and pre-flight

User-requested correction of the parent screenshot, followed by RTL correction
across every parent tab. This is a bounded UI correction, not a new release phase
or a Phase 29 gate rerun. Historical reports and the release NO-GO remain intact.

Inspected the landscape contract, roadmap, active Phase 29 plan, preceding
Phase 28 report, parent reference and asset manifest, current parent screens,
shared shell/text, settings/progress integrations, lock lifecycle, ad placement,
and parent functional tests. The previous parent center used an absolute mock
canvas with duplicate navigation and scaled tabs; settings still used physical
left alignment and mock-unit typography. The existing ParentShell provides a
bounded, keyboard-aware adult reading surface. No new artwork is required.

## Changes

- Use ParentShell for the unlocked center, one return action, fixed 48 dp tabs,
  and independently scrolling tab content. Preserve all five tabs and data flows.
- Make the parent route ad-free in the centralized policy. Native ad creative
  painted its own black margins; background styling alone could not fix that.
  Child hub eligibility remains unchanged.
- Scope RTL reading context to the parent shell. Shared text and headings use
  bidi-aware alignment there, with explicit RTL writing direction. Other screens
  keep their previous alignment behavior.
- Replace settings' mock-unit text and physical left alignment with shared text;
  place heading/labels at logical start and keep segmented controls at least 48 dp.
- Set Hebrew custom-word input direction explicitly; improve Method typography,
  contrast and section separation. Preserve mixed-language text and all copy.
- Enlarge parent-gate return/key targets uncovered by the existing touch audit.

## Validation

- TypeScript and lint: PASS.
- Ad-placement unit tests: 7 passed, including parent suppression.
- Full parent functional suite on Pixel 9, iPhone 17 Pro and 1280×800 tablet:
  9 passed. Covers gate/re-lock, all tabs, settings persistence, backup import,
  custom-word creation, persistence, reachability and deletion.
- Additional all-five-tab RTL assertions, Hebrew input direction, ad reclamation,
  and final-paragraph reachability on those three sizes: 3 passed.
- Tests use the category's current accessible home action instead of the removed
  category-back test ID, and scope parent entry to visible controls during route
  transitions. No assertions were removed or weakened.
- Android emulator inspected with native screenshots: confirmed RTL in Method,
  recordings and word form, and removal of the banner/black margins. Raw captures
  are local under `apps/mobile/artifacts/parent-ui/`; never commit that directory.
  Native inspection is supplementary, not five-device release attestation.

Earlier broad runs exposed compact gate key targets below 48 dp and a stale
category-back selector. Both were corrected. Final compact regression on 667×375
and 740×360: **6 passed**, including touch-target and reachability audits.

No merge, deployment, Capacitor change, or native cutover was performed.
