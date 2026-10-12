/* eslint-disable no-restricted-syntax -- mock-unit layout constants are physical canvas coordinates (see design-system/landscape/mock/MockStage.tsx) */
import { useCallback, useEffect, useReducer, useRef } from 'react';

import { MockBox, MockChip, MockText } from '@/design-system/landscape';
import { STAR_STEP } from '@/domain/progress/stars';
import type { TalkiCategory, TalkiSettings, WordStats } from '@/domain/types';
import { homeHref } from '@/domain/navigation/routes';
import { useGoBack } from '@/hooks/useGoBack';
import { useGuardedPush } from '@/hooks/useGuardedPush';
import { wordVoiceService } from '@/services/voice';
import { useProgressStore } from '@/state/progressStore';
import { useSettingsStore } from '@/state/settingsStore';
import { testIds } from '@/testing/testIds';

import { makeRnd } from '../shell/e2eSeed';
import { GameShell } from '../shell/GameShell';
import { useGameSession, type GameSession } from '../shell/useGameSession';
import { MemoryCard } from './MemoryCard';
import { initMemory, memoryChips, memoryReducer, memoryResult, type MemoryState } from './memoryReducer';

export interface MemoryScreenProps {
  catId: string | null;
  seed?: number;
}

function initialMemory(category: TalkiCategory, stats: Record<string, WordStats>, settings: TalkiSettings, seed?: number): MemoryState {
  return initMemory({ category, stats, settings, rnd: makeRnd(seed) });
}

export function MemoryScreen({ catId, seed }: MemoryScreenProps) {
  const goBack = useGoBack();
  const push = useGuardedPush();
  const session = useGameSession({ gameId: 'memory', requestedCatId: catId });

  useEffect(() => {
    if (session.failed) {
      const t = setTimeout(() => push(homeHref), 400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [session.failed, push]);

  if (!session.ready || !session.category) {
    return (
      <GameShell
        title="🃏 משחק זיכרון"
        chips={[]}
        done={false}
        result={{ score: 0, total: 0 }}
        onBack={goBack}
        onReplay={session.restart}
        onHome={() => push(homeHref)}
        toast={session.toast}
        onDismissToast={session.dismissToast}
        celebrateMessage={null}
        onDismissCelebrate={() => undefined}
      >
        {null}
      </GameShell>
    );
  }

  return (
    <MemoryPlay key={`${session.category.id}:${session.epoch}`} category={session.category} session={session} seed={seed} />
  );
}

function MemoryPlay({
  category,
  session,
  seed,
}: {
  category: TalkiCategory;
  session: GameSession;
  seed?: number;
}) {
  const goBack = useGoBack();
  const push = useGuardedPush();
  const { stats, markLearned } = useProgressStore();
  const settings = useSettingsStore((s) => s.settings);
  const completeFired = useRef(false);
  const [state, dispatch] = useReducer(memoryReducer, undefined, () => initialMemory(category, stats, settings, seed));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    (window as unknown as { __talkiMemoryLayout?: { idx: number; pair: number; word: string }[] }).__talkiMemoryLayout =
      state.cards.map((c) => ({ idx: c.idx, pair: c.pair, word: c.it.word }));
  }, [state.cards]);

  useEffect(() => {
    if (state.done && !completeFired.current) {
      completeFired.current = true;
      session.audio.complete();
    }
  }, [state.done, session.audio]);

  const flip = useCallback(
    (idx: number) => {
      const card = state.cards[idx];
      if (!card || card.open || card.matched || state.locked) return;
      const willBeSecond = state.first !== null;
      dispatch({ type: 'FLIP', idx });
      void wordVoiceService.say(category.id, card.it.word);
      if (!willBeSecond) return;
      const first = state.cards[state.first!];
      if (first && first.pair === card.pair && first.idx !== card.idx) {
        session.audio.correct();
        void markLearned(category.id, card.it.word).then((r) => {
          if (r.added && r.size % STAR_STEP === 0) {
            /* celebrate is owned by GameShell via quiz; memory has no overlay hook here */
          }
        });
      } else {
        session.audio.wrong();
        session.schedule(900, () => dispatch({ type: 'CLOSE' }));
      }
    },
    [state, category.id, session, markLearned],
  );

  const n = state.cards.length;
  const rows = Math.max(1, Math.ceil(n / MEMORY.cols));
  const cardH = Math.min(MEMORY.cardH, (MEMORY.gridBottom - MEMORY.gridTop - MEMORY.gapY * (rows - 1)) / rows);
  const cardW = cardH === MEMORY.cardH ? MEMORY.cardW : (MEMORY.cardW * cardH) / MEMORY.cardH;
  const gridW = MEMORY.cols * cardW + (MEMORY.cols - 1) * MEMORY.gapX;
  const gridLeft = MEMORY.gridCenterX - gridW / 2;

  return (
    <GameShell
      title="🃏 משחק זיכרון"
      chips={memoryChips(state)}
      done={state.done}
      result={memoryResult(state)}
      onBack={goBack}
      onReplay={session.restart}
      onHome={() => push(homeHref)}
      toast={session.toast}
      onDismissToast={session.dismissToast}
      celebrateMessage={null}
      onDismissCelebrate={() => undefined}
      chipTestIDs={[testIds.memory.chipPairs]}
      layout="free"
      scene="memory"
    >
      <MockBox testID={testIds.memory.root} left={0} top={0} width={1688} height={697} />
      <MockChip testID={testIds.memory.chipPairs} label={`🃏 זוגות ${state.found}/${state.total}`} {...MEMORY.pairs} />
      <MockChip testID={testIds.game.chip(1)} label={`🩷 ניסיונות ${state.moves}`} {...MEMORY.moves} />
      <MockBox {...MEMORY.title}>
        <MockText testID={testIds.game.headerTitle} size={MEMORY.titleSize} align="right">
          🎉 משחק זיכרון
        </MockText>
      </MockBox>
      {state.cards.map((card) => {
        const col = card.idx % MEMORY.cols;
        const row = Math.floor(card.idx / MEMORY.cols);
        return (
          <MemoryCard
            key={card.idx}
            card={card}
            niqqud={settings.niqqud}
            onPress={() => flip(card.idx)}
            placement={{
              // RTL reading order: the first card sits at the physical right.
              left: gridLeft + (MEMORY.cols - 1 - col) * (cardW + MEMORY.gapX),
              top: MEMORY.gridTop + row * (cardH + MEMORY.gapY),
              width: cardW,
              height: cardH,
            }}
          />
        );
      })}
    </GameShell>
  );
}

/** Memory composition in mock units (mock "ChatGPT Image …-7"). */
const MEMORY = {
  bar: { left: 455, top: 132, width: 793, height: 80 },
  pairs: { left: 698, top: 141, width: 202, height: 62 },
  moves: { left: 470, top: 141, width: 202, height: 62 },
  title: { left: 760, top: 140, width: 470, height: 66 },
  titleSize: 46,
  cols: 4,
  cardW: 187,
  cardH: 154,
  gapX: 24,
  gapY: 14,
  gridCenterX: 843,
  gridTop: 232,
  /** Third row of the mock sits under the ad; the app keeps every row above it. */
  gridBottom: 800,
} as const;
