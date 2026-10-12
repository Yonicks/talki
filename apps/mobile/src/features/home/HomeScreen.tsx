import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ToastHost } from '@/components/shell';
import { landscapeBackgrounds } from '@/design-system/assets';
import {
  HOME_LAYOUT,
  LandscapeScreen,
  LandscapeWorldBackground,
  homeHeroInsetStart,
  homeHeroPanelHeight,
  homeHeroTop,
  homeMetricsFor,
  homeStripMetrics,
} from '@/design-system/landscape';
import { useLandscapeLayout } from '@/design-system/responsive/useLandscapeLayout';
import {
  categoryHref,
  gamesMenuHref,
  practiceMenuHref,
  rewardsHref,
} from '@/domain/navigation/routes';
import type { CategoryId } from '@/domain/types';
import { useGuardedPush } from '@/hooks/useGuardedPush';
import { useGuardedReplace } from '@/hooks/useGuardedReplace';
import { useParentBrand } from '@/hooks/useParentBrand';
import { useSettingsStore } from '@/state/settingsStore';
import { DevStorageProbe } from '@/testing/DevStorageProbe';
import { testIds } from '@/testing/testIds';

import { ContinueLearningHero } from './ContinueLearningHero';
import { orderHomeCategories } from './homeCategoryOrder';
import { LandscapeCategoryCarousel } from './LandscapeCategoryCarousel';
import { LandscapeHomeHeader } from './LandscapeHomeHeader';
import { useHomeData } from './useHomeData';

/**
 * Landscape Home hub, composed to the approved Home mock `docs/design/landscape/reference/c577a74e-1f80-4697-b832-e2e672fe9cb6.png`.
 *
 * Three layers, exactly as the mock reads:
 *   1. the full-bleed storybook world (edge to edge, behind everything);
 *   2. the art-directed stage — top chrome, mascot + continue-learning card;
 *   3. the category carousel along the bottom.
 *
 * The stage *fills* the safe viewport (`useHomeMetrics()`): sizes come from
 * one uniform scale off the mock's 900 × 390 dp canvas, while the header is
 * anchored to the top edge, the carousel to the bottom edge, and the hero
 * row centred in the band between them. See `homeLayout.ts` for why the
 * composition is anchored rather than letterboxed. Placement inside the
 * stage is absolute on purpose: this is a hand-composed game screen, not a
 * list.
 *
 * The stage is sized from `usableHeight`, which already excludes the
 * reserved ad strip (`useLandscapeLayout()`), so the banner sits *beneath*
 * the composition and the composition simply occupies what is left.
 *
 * Home does not use `LandscapeHubFrame`: that frame's full-height side-nav
 * lanes are what the mock replaces with the carousel arrows. Practice and
 * Games stay reachable from the header (see `LandscapeHomeHeader`).
 */
export function HomeScreen() {
  const push = useGuardedPush();
  const replace = useGuardedReplace();
  const layout = useLandscapeLayout();
  // The mock runs the stage edge to edge horizontally — header icons and
  // carousel arrows sit close to the physical corners (home.png). A
  // landscape-rotated camera cutout's OS safe-area inset only ever covers a
  // band around the screen's vertical centre on one edge, nowhere near
  // these corner controls, so padding the whole stage by it (symmetrically
  // or not) just pushes everything inward for no real protection. Home
  // therefore ignores left/right safe-area insets entirely, matching the
  // mock; `sideInset` stays 0 unless a future device proves this wrong.
  const sideInset = 0;
  const metrics = homeMetricsFor(layout.width, layout.usableHeight);
  const data = useHomeData();
  const { settings, toggleMusic } = useSettingsStore();
  const parent = useParentBrand();

  const openCategory = useCallback(
    (id: CategoryId) => {
      push(categoryHref(id));
    },
    [push],
  );

  const categories = useMemo(() => orderHomeCategories(data.categories), [data.categories]);

  if (!data.ready) {
    return <LandscapeScreen testID={testIds.home.root}>{null}</LandscapeScreen>;
  }

  const strip = homeStripMetrics(metrics);
  const heroRowWidth = metrics.s(HOME_LAYOUT.hero.rowWidth);
  const heroTop = homeHeroTop(metrics, strip, homeHeroPanelHeight(metrics));
  const heroInsetStart = homeHeroInsetStart(metrics, heroRowWidth);

  return (
    <LandscapeScreen testID={testIds.home.root} edgesHandledByShell>
      <LandscapeWorldBackground
        source={landscapeBackgrounds.home}
        world="home"
        deviceClass={layout.deviceClass}
        testID={`${testIds.home.root}-bg`}
      />

      <View
        pointerEvents="box-none"
        style={[
          styles.safe,
          {
            paddingTop: layout.safeInsets.top,
            paddingBottom: layout.safeInsets.bottom,
            // Physical OS safe-area edges — a notch sits on a physical side
            // regardless of text direction. Symmetric (see `sideInset`
            // above), not `layout.safeInsets.left/right` individually.
            // eslint-disable-next-line no-restricted-syntax
            paddingLeft: sideInset,
            // eslint-disable-next-line no-restricted-syntax
            paddingRight: sideInset,
          },
        ]}
      >
        <View
          testID={testIds.home.stage}
          pointerEvents="box-none"
          style={styles.stage}
        >
          <LandscapeHomeHeader
            metrics={metrics}
            points={data.points}
            musicOn={settings.music}
            onToggleMusic={() => void toggleMusic()}
            onPointsPress={() => push(rewardsHref)}
            onPracticePress={() => replace(practiceMenuHref)}
            onGamesPress={() => replace(gamesMenuHref)}
            onBrandLongPress={parent.onBrandLongPress}
            onBrandShortPress={parent.onBrandShortPress}
          />

          {data.hero ? (
            <View
              pointerEvents="box-none"
              style={[
                styles.heroSlot,
                {
                  top: heroTop,
                  insetInlineStart: heroInsetStart,
                },
              ]}
            >
              <ContinueLearningHero
                category={data.hero}
                learned={data.heroLearned}
                points={data.points}
                metrics={metrics}
                onContinue={() => openCategory(data.hero!.id)}
              />
            </View>
          ) : null}

          <LandscapeCategoryCarousel
            metrics={metrics}
            categories={categories}
            onOpen={openCategory}
          />
        </View>
      </View>

      <ToastHost message={parent.toast} onHide={parent.dismissToast} testID={testIds.parent.toast} />

      {/* Dev/native-only Maestro persistence hook — renders nothing on web or
          in a production build. Parked in a corner so it can never sit in the
          middle of the approved composition (see the current-state
          screenshot this redesign replaces). */}
      <View pointerEvents="box-none" style={styles.devProbe}>
        <DevStorageProbe />
      </View>
    </LandscapeScreen>
  );
}

const styles = StyleSheet.create({
  safe: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  /** Fills the safe box: the composition is anchored, never letterboxed. */
  stage: {
    flex: 1,
    position: 'relative',
  },
  heroSlot: {
    position: 'absolute',
    zIndex: 20,
  },
  devProbe: {
    position: 'absolute',
    bottom: 0,
    insetInlineStart: 0,
    opacity: 0.35,
    zIndex: 1,
  },
});
