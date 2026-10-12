import { useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

import { ToastHost } from '@/components/shell';
import { hubMockArt } from '@/design-system/assets';
import { MockBox, MockHubCard } from '@/design-system/landscape';
import { gameCatChips } from '@/domain/games/gameCatChips';
import { PRACTICE_LIST } from '@/domain/practice/list';
import { practiceCardImage } from '@/domain/practice/practiceCards';
import { practiceHref } from '@/domain/navigation/routes';
import type { CategoryId, PracticeModeId } from '@/domain/types';
import { GameCatChipRow } from '@/features/games/GameCatChipRow';
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
 *   world background + top chrome + side nav (LandscapeHubFrame)
 *   LandscapeTitle with the reference subtitle
 *   category chips (preserved launch context)
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

  const chips = gameCatChips(custom, lastCat as CategoryId | null);
  const [activeChip, setActiveChip] = useState<CategoryId | null>(chips?.current ?? null);
  const currentChip = activeChip ?? chips?.current ?? null;

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
      {chips ? (
        <MockBox left={160} top={640} width={1290} height={76} pointerEvents="box-none">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <GameCatChipRow chips={chips} current={currentChip} onSelect={setActiveChip} nowrap testIDFactory={(id) => testIds.practiceMenu.chip(id)} />
          </ScrollView>
        </MockBox>
      ) : null}
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
