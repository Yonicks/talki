# Android Home pixel QA

The Home geometry was re-measured from the supplied 1843×853 mock and applied to the real React Native components in `src/design-system/landscape/homeLayout.ts`.

## Target

- landscape Android phone stage
- live bottom ad reservation below the stage
- RTL Hebrew layout
- no vertical page scroll
- eight category cards visible between the arrows at the reference phone width
- all existing Home controls and category routes remain reachable

## Measured values

The mock maps to a 900 dp design canvas. The stage uses uniform scale based on the usable width and height. The hero panel, mascot, header controls, category cards, borders, radii, spacing, and CTA were re-measured from the supplied mock. Raster art keeps its aspect ratio.

## Playwright sweep

Run from `apps/mobile/` after exporting the web build:

```bash
npx expo export --platform web
npx playwright test tests/e2e/home-composition.spec.ts tests/e2e/full-sweep.spec.ts --workers=1
```

The full sweep captures Home, category, cards, Games, Practice, Rewards, Parent, every game, and every practice activity at the configured landscape viewports. Review the generated screenshots in `test-results/` and `tests/e2e/__screenshots__/`.

## Current validation

- TypeScript: passed.
- ESLint for the changed geometry file: passed.
- Focused Home unit tests: 27 passed.
- Playwright execution is pending a fresh browser binary and successful Expo web export in the current environment.

## Next visual pass

1. Capture the Android emulator viewport with a seeded returning user so the progress pill is visible.
2. Compare the Home stage and mock at the same pixel size with an image diff.
3. Adjust only measured residuals: hero x/y, panel radius/shadow, category gap, and ad boundary.
4. Capture all routes with the full sweep and create a route-by-route backlog for Games, Practice, Category, Cards, Rewards, and Parent.
