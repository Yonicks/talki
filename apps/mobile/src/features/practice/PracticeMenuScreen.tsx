import { useCallback, useEffect } from 'react';

import { ToastHost } from '@/components/shell';
import { hubMockArt } from '@/design-system/assets';
import { MockBox, MockHubCard } from '@/design-system/landscape';
import { gameCatChips } from '@/domain/games/gameCatChips';
import { PRACTICE_LIST } from '@/domain/practice/list';
import { practiceCardImage } from '@/domain/practice/practiceCards';
import { practiceHref } from '@/domain/navigation/routes';
import type { CategoryId, PracticeModeId } from '@/domain/types';
import { MockHubFrame } from '@/features/shell/MockHubFrame';
import { useGuardedPush } from '@/hooks/useGuardedPush';
import { useParentBrand } from '@/hooks/useParentBrand';
import { useProgressStore } from '@/state/progressStore';
import { useSettingsStore } from '@/state/settingsStore';
import { testIds } from '@/testing/testIds';

/**
 * Landscape Practice hub (Phase 22).
 *
 * Composition (matches `docs/design/landscape/reference/Talki Fantasy Garden Game Menu.png`):
 *   world background + top chrome (no side nav, no category chips — see
 *   PracticeMenuScreen's MockHubFrame usage)
 *   3×2 LandscapeActivityGrid for all six PRACTICE_LIST modes
 *
 * All six registered practice modes remain reachable; launch/gating
 * semantics are unchanged (practiceHref + chip category context).
 */
export function PracticeMenuScreen() {
  const push = useGuardedPush();
  const { hydrated, custom, lastCat, learned, hydrate } = useProgressStore();
  const { settings, toggleMusic } = useSettingsStore();
  const parent = useParentBrand();
  useEffect(() => {
    if (!hydrated) void hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once on mount
  }, []);

  // No chip picker is shown on this hub anymore; a mode still opens in the
  // last-active category context so progress/learned state stays correct.
  const currentChip = gameCatChips(custom, lastCat as CategoryId | null)?.current ?? null;

  const openPractice = useCallback(
    (id: PracticeModeId) => {
      push(practiceHref(id, currentChip));
    },
    [push, currentChip],
  );

  return (
    <MockHubFrame
      hub="practice"
      testID={testIds.practiceMenu.root}
      points={learned.size}
      musicOn={settings.music}
      onToggleMusic={() => void toggleMusic()}
      onBrandLongPress={parent.onBrandLongPress}
      onBrandShortPress={parent.onBrandShortPress}
      hideSideNav
    >
      <ToastHost message={parent.toast} onHide={parent.dismissToast} testID={testIds.parent.toast} />
      <MockBox testID={testIds.practiceMenu.title} left={0} top={0} width={1} height={1} pointerEvents="none" />
      <MockBox testID={testIds.practiceMenu.grid} left={0} top={0} width={1609} height={650} pointerEvents="box-none">
        {PRACTICE_LIST.map(([id, , title], i) => (
          <MockHubCard
            key={id}
            testID={testIds.practiceMenu.card(id)}
            title={title}
            image={hubMockArt[`practice:${id}`] ?? practiceCardImage(id)}
            onPress={() => openPractice(id)}
            // RTL reading order: the first card sits at the physical right.
            left={PRACTICE_GRID.cols[i % 3]!}
            top={PRACTICE_GRID.rows[Math.floor(i / 3)]!.top}
            width={PRACTICE_GRID.w}
            height={PRACTICE_GRID.rows[Math.floor(i / 3)]!.h}
            plate={PRACTICE_GRID.plate}
            radius={36}
            titleSize={32}
          />
        ))}
      </MockBox>
    </MockHubFrame>
  );
}

/** Practice hub grid in mock units (mock "Talki Fantasy Garden Game Menu"). */
const PRACTICE_GRID = {
  cols: [1022, 593, 163],
  rows: [{ top: 188, h: 212 }, { top: 410, h: 214 }],
  w: 420,
  plate: { inStart: 24, inEnd: 24, bottom: 14, height: 52 },
} as const;
