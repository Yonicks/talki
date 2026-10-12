/* eslint-disable no-restricted-syntax -- mock-unit layout constants are physical canvas coordinates */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ToastHost } from '@/components/shell';
import { hubMockArt } from '@/design-system/assets';
import { LandscapePageIndicator, MockBox, MockHubCard } from '@/design-system/landscape';
import { gameCardImage } from '@/domain/games/gameCards';
import { gameCatChips } from '@/domain/games/gameCatChips';
import { GAMES_HUB_PAGE_SIZE, gameHubPages } from '@/domain/games/gameHubPages';
import { GAMES } from '@/domain/games/ids';
import { gameHref } from '@/domain/navigation/routes';
import type { CategoryId } from '@/domain/types';
import { MockHubFrame } from '@/features/shell/MockHubFrame';
import { useGuardedPush } from '@/hooks/useGuardedPush';
import { useParentBrand } from '@/hooks/useParentBrand';
import { useProgressStore } from '@/state/progressStore';
import { useSettingsStore } from '@/state/settingsStore';
import { testIds } from '@/testing/testIds';

import { GameCatChipRow } from './GameCatChipRow';

/**
 * Landscape Games hub (Phase 21).
 *
 * Composition (matches `docs/design/landscape/reference/Whimsical Talki Game Selection Screen.png`):
 *   world background + top chrome + side nav (LandscapeHubFrame)
 *   LandscapeTitle + category chips (preserved launch context)
 *   3×2 LandscapeActivityGrid for the active page (page size 6)
 *   LandscapePageIndicator when more than one page
 *
 * All eleven registered games remain reachable via child-friendly page
 * dots; only the active page mounts cards so the hub stays viewport-bound
 * and off-page controls are not hit-test ghosts.
 */
export function GamesMenuScreen() {
  const push = useGuardedPush();
  const { hydrated, custom, lastCat, learned, hydrate } = useProgressStore();
  const { settings, toggleMusic } = useSettingsStore();
  const parent = useParentBrand();
  useEffect(() => {
    if (!hydrated) void hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once on mount
  }, []);

  const chips = gameCatChips(custom, lastCat as CategoryId | null);
  const [activeChip, setActiveChip] = useState<CategoryId | null>(chips?.current ?? null);
  const currentChip = activeChip ?? chips?.current ?? null;

  const pages = useMemo(() => gameHubPages(GAMES, GAMES_HUB_PAGE_SIZE), []);
  const [pageIndex, setPageIndex] = useState(0);
  const activePage = pages[pageIndex] ?? pages[0] ?? [];

  const selectPage = useCallback(
    (index: number) => {
      setPageIndex(Math.max(0, Math.min(index, pages.length - 1)));
    },
    [pages.length],
  );

  const openGame = useCallback(
    (id: (typeof GAMES)[number]['id']) => {
      push(gameHref(id, currentChip as CategoryId | null));
    },
    [push, currentChip],
  );

  return (
    <MockHubFrame
      hub="games"
      testID={testIds.gamesMenu.root}
      points={learned.size}
      musicOn={settings.music}
      onToggleMusic={() => void toggleMusic()}
      onBrandLongPress={parent.onBrandLongPress}
      onBrandShortPress={parent.onBrandShortPress}
    >
      <ToastHost message={parent.toast} onHide={parent.dismissToast} testID={testIds.parent.toast} />
      <MockBox testID={testIds.gamesMenu.title} left={0} top={0} width={1} height={1} pointerEvents="none" />
      <MockBox testID={testIds.gamesMenu.grid} left={0} top={0} width={1730} height={640} pointerEvents="box-none">
        <MockBox testID={testIds.gamesMenu.page(pageIndex)} left={0} top={0} width={1730} height={640} pointerEvents="box-none">
          {activePage.map((game, i) => (
            <MockHubCard
              key={game.id}
              testID={testIds.gamesMenu.card(game.id)}
              title={game.title}
              image={hubMockArt[`games:${game.id}`] ?? gameCardImage(game.id)}
              onPress={() => openGame(game.id)}
              // RTL reading order: the first card sits at the physical right.
              left={GAMES_GRID.cols[i % 3]!.left}
              top={GAMES_GRID.rows[Math.floor(i / 3)]!.top}
              width={GAMES_GRID.cols[i % 3]!.w}
              height={GAMES_GRID.rows[Math.floor(i / 3)]!.h}
            />
          ))}
        </MockBox>
      </MockBox>
      {chips ? (
        <MockBox left={170} top={612} width={1050} height={76} pointerEvents="box-none">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <GameCatChipRow chips={chips} current={currentChip} onSelect={setActiveChip} nowrap />
          </ScrollView>
        </MockBox>
      ) : null}
      <MockBox left={1240} top={622} width={300} height={60} pointerEvents="box-none" style={styles.dots}>
        <LandscapePageIndicator
          testID={testIds.gamesMenu.pageIndicator}
          pageCount={pages.length}
          activeIndex={pageIndex}
          onSelect={selectPage}
        />
      </MockBox>
    </MockHubFrame>
  );
}

/** Games hub grid in mock units (mock "Whimsical Talki Game Selection Screen"). */
const GAMES_GRID = {
  cols: [{ left: 1090, w: 442 }, { left: 650, w: 432 }, { left: 195, w: 447 }],
  rows: [{ top: 175, h: 208 }, { top: 395, h: 210 }],
} as const;

const styles = StyleSheet.create({
  dots: { alignItems: 'center', justifyContent: 'center' },
});
