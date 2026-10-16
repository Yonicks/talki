/* eslint-disable no-restricted-syntax -- mock-unit layout constants are physical canvas coordinates (see design-system/landscape/mock/MockStage.tsx) */
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { RewardOverlay, ToastHost } from '@/components/shell';
import { landscapeScenes } from '@/design-system/assets';
import { TalkiText } from '@/design-system/components';
import { MockBox, MockHeader, MockPanel, MockStage, landscapeTokens } from '@/design-system/landscape';
import { useLandscapeLayout } from '@/design-system/responsive/useLandscapeLayout';
import { v3 } from '@/design-system/theme/colors';
import { useGoHome } from '@/hooks/useGoHome';
import { useParentBrand } from '@/hooks/useParentBrand';
import { useProgressStore } from '@/state/progressStore';
import { useSettingsStore } from '@/state/settingsStore';
import { testIds } from '@/testing/testIds';

import { DoneCard } from './DoneCard';
import { GameChips } from './GameChips';
import type { GameResult } from './types';

export interface GameShellProps {
  title: string;
  chips: string[];
  done: boolean;
  result: GameResult;
  onBack: () => void;
  onReplay: () => void;
  onHome: () => void;
  toast: string | null;
  onDismissToast: () => void;
  celebrateMessage: string | null;
  onDismissCelebrate: () => void;
  /** `false` for cards — a flashcard browser, not a scored game. */
  scoring?: boolean;
  chipTestIDs?: (string | undefined)[];
  /** Kept for call-site compatibility; every detail screen shares one world. */
  world?: 'games' | 'practice';
  /**
   * `panel` (default): shell draws the cream panel with title, chips and the
   * board in a flowing column. `free`: the screen positions its own pieces in
   * mock units (see MockStage) and owns title/chips itself.
   */
  layout?: 'panel' | 'free';
  /** This screen's own painted scene (see landscapeScenes); the shared plate sits beneath it. */
  scene?: keyof typeof landscapeScenes;
  children: ReactNode;
}

/** Wide generic panel for games that have no dedicated mock composition. */
const PANEL = { left: 150, top: 140, width: 1388, height: 540 } as const;

/**
 * Shared landscape game-detail frame: mock stage (painted garden), mock header
 * (music / Talki lockup / back / points / home), then either the generic cream
 * panel or the screen's own free composition; toast, celebration and done card.
 */
export function GameShell({
  title,
  chips,
  done,
  result,
  onBack,
  onReplay,
  toast,
  onDismissToast,
  celebrateMessage,
  onDismissCelebrate,
  scoring = true,
  chipTestIDs,
  layout: mode = 'panel',
  scene,
  children,
}: GameShellProps) {
  const layout = useLandscapeLayout();
  const tokens = landscapeTokens(layout.deviceClass, layout.uiScale);
  const learned = useProgressStore((s) => s.learned);
  const { settings, toggleMusic } = useSettingsStore();
  const parent = useParentBrand();
  const goHome = useGoHome();
  const showDone = scoring && done;

  const content = showDone ? (
    <MockBox testID="game-play-area" left={PANEL.left} top={PANEL.top} width={PANEL.width} height={PANEL.height} style={styles.center}>
      <DoneCard result={result} onReplay={onReplay} onHome={goHome} />
    </MockBox>
  ) : mode === 'free' ? (
    <View testID="game-play-area" style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {children}
    </View>
  ) : (
    <MockPanel left={PANEL.left} top={PANEL.top} width={PANEL.width} height={PANEL.height} style={styles.panel}>
      <View style={[styles.frame, { gap: Math.max(2, tokens.gap - 4) }]}>
        <View style={[styles.chrome, { gap: Math.max(4, tokens.gap - 4) }]}>
          <TalkiText
            testID={testIds.game.headerTitle}
            weight="extrabold"
            color={v3.purple800}
            align="center"
            style={{ fontSize: tokens.gameTitleSize }}
          >
            {title}
          </TalkiText>
          <GameChips chips={chips} chipTestIDs={chipTestIDs} gap={Math.max(6, tokens.gap - 2)} />
        </View>
        <View testID="game-play-area" style={styles.body}>
          {children}
        </View>
      </View>
    </MockPanel>
  );

  return (
    <MockStage testID={testIds.game.shellRoot} scene={scene ? landscapeScenes[scene] : undefined}>
      <MockHeader
        points={learned.size}
        musicOn={settings.music}
        onToggleMusic={() => void toggleMusic()}
        onBack={onBack}
        onHome={goHome}
        onBrandLongPress={parent.onBrandLongPress}
        onBrandShortPress={parent.onBrandShortPress}
      />
      {content}
      <ToastHost message={toast} onHide={onDismissToast} testID="game-toast" />
      <ToastHost message={parent.toast} onHide={parent.dismissToast} testID={testIds.parent.toast} />
      <RewardOverlay
        visible={celebrateMessage !== null}
        title={celebrateMessage ?? ''}
        onDismiss={onDismissCelebrate}
        testID="game-celebrate"
      />
    </MockStage>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  panel: { padding: 8 },
  frame: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  chrome: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
