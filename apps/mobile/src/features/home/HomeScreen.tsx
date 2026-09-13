import { useCallback } from 'react';
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
  homeStripMetrics,
  useHomeMetrics,
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
import { LandscapeCategoryCarousel } from './LandscapeCategoryCarousel';
import { LandscapeHomeHeader } from './LandscapeHomeHeader';
import { useHomeData } from './useHomeData';

/**
 * Landscape Home hub, composed to `assets/v3/mocks/mock_home_mobile_v3.png`.
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
  const metrics = useHomeMetrics();
  const data = useHomeData();
  const { settings, toggleMusic } = useSettingsStore();
  const parent = useParentBrand();

  const openCategory = useCallback(
    (id: CategoryId) => {
      push(categoryHref(id));
    },
    [push],
  );

  if (!data.ready) {
    return <LandscapeScreen testID={testIds.home.root}>{null}</LandscapeScreen>;
  }

  const heroIndex = data.hero ? data.categories.findIndex((c) => c.id === data.hero!.id) : 0;
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
            // regardless of text direction.
            // eslint-disable-next-line no-restricted-syntax
            paddingLeft: layout.safeInsets.left,
            // eslint-disable-next-line no-restricted-syntax
            paddingRight: layout.safeInsets.right,
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
                backgroundIndex={heroIndex < 0 ? 0 : heroIndex}
                onContinue={() => openCategory(data.hero!.id)}
              />
            </View>
          ) : null}

          <LandscapeCategoryCarousel
            metrics={metrics}
            categories={data.categories}
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
