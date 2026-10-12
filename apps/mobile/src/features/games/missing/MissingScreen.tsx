/* eslint-disable no-restricted-syntax -- mock-unit layout constants are physical canvas coordinates (see design-system/landscape/mock/MockStage.tsx) */
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AppState, StyleSheet } from 'react-native';

import { MockBox, MockCard, MockChip, MockText } from '@/design-system/landscape';
import { STAR_STEP } from '@/domain/progress/stars';
import type { TalkiCategory, TalkiSettings, WordStats } from '@/domain/types';
import { homeHref } from '@/domain/navigation/routes';
import { display } from '@/domain/vocabulary/niqqud';
import { useGoBack } from '@/hooks/useGoBack';
import { useGuardedPush } from '@/hooks/useGuardedPush';
import { wordVoiceService } from '@/services/voice';
import { useProgressStore } from '@/state/progressStore';
import { useSettingsStore } from '@/state/settingsStore';
import { testIds } from '@/testing/testIds';

import { makeRnd } from '../shell/e2eSeed';
import { GameShell } from '../shell/GameShell';
import { WordArt } from '../shell/WordArt';
import { useGameSession, type GameSession } from '../shell/useGameSession';
import {
  initMissing,
  missingChips,
  missingFinish,
  missingReducer,
  missingResult,
  setupMissingRound,
  shouldFinishMissing,
  type MissingState,
} from './missingReducer';

export const MISSING_SHOW_MS = 2600;
const MISSING_PROMPT = 'מָה נֶעֱלַם?';

function showDurationMs(): number {
  if (typeof window === 'undefined') return MISSING_SHOW_MS;
  const override = (window as unknown as { __talkiMissingShowMs?: number }).__talkiMissingShowMs;
  return typeof override === 'number' ? override : MISSING_SHOW_MS;
}

export interface MissingScreenProps {
  catId: string | null;
  seed?: number;
}

function initialMissing(category: TalkiCategory, stats: Record<string, WordStats>, settings: TalkiSettings, seed?: number): MissingState {
  return initMissing({ category, stats, settings, rnd: makeRnd(seed) });
}

export function MissingScreen({ catId, seed }: MissingScreenProps) {
  const goBack = useGoBack();
  const push = useGuardedPush();
  const session = useGameSession({ gameId: 'missing', requestedCatId: catId });

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
        title="🙈 מה נעלם?"
        chips={[]}
        done={false}
        result={{ score: 0, total: 5 }}
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
    <MissingPlay key={`${session.category.id}:${session.epoch}`} category={session.category} session={session} seed={seed} />
  );
}

function MissingPlay({
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
  const { stats, recordSeen, markLearned } = useProgressStore();
  const settings = useSettingsStore((s) => s.settings);
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const spoken = useRef(false);
  const completeFired = useRef(false);
  const showStarted = useRef(0);
  const [state, dispatch] = useReducer(missingReducer, undefined, () =>
    initialMissing(category, stats, settings, seed),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    (window as unknown as { __talkiMissingWord?: string }).__talkiMissingWord = state.missing.word;
  }, [state.missing.word]);

  useEffect(() => {
    if (state.done && !completeFired.current) {
      completeFired.current = true;
      session.audio.complete();
    }
  }, [state.done, session.audio]);

  useEffect(() => {
    if (state.phase !== 'show' || state.done) return;
    showStarted.current = Date.now();
    spoken.current = false;
    const wait = showDurationMs();
    const id = session.schedule(wait, () => dispatch({ type: 'ASK' }));
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active' && Date.now() - showStarted.current >= wait) {
        dispatch({ type: 'ASK' });
      }
    });
    return () => {
      session.cancel(id);
      sub.remove();
    };
  }, [state.phase, state.round, state.done, session]);

  useEffect(() => {
    if (state.phase !== 'ask' || state.done || spoken.current) return;
    spoken.current = true;
    void wordVoiceService.say(category.id, MISSING_PROMPT, { core: true });
  }, [state.phase, state.done, category.id]);

  const guess = useCallback(
    (word: string) => {
      if (state.phase !== 'ask' || !session.tryLock()) return;
      const ok = word === state.missing.word;
      dispatch({ type: 'GUESS', word });
      void recordSeen(category.id, state.missing.word, !ok);
      if (ok) {
        session.audio.correct();
        void wordVoiceService.say(category.id, state.missing.word);
        void markLearned(category.id, state.missing.word).then((r) => {
          if (r.added && r.size % STAR_STEP === 0) setCelebrate(`${r.size} מילים!`);
        });
      } else {
        session.audio.wrong();
      }
      session.schedule(ok ? 900 : 500, () => {
        session.unlock();
        if (shouldFinishMissing(state)) {
          dispatch({ type: 'ADVANCE', next: missingFinish({ ...state, locked: true, score: ok ? state.score + 1 : state.score }) });
          return;
        }
        const next = setupMissingRound(
          { category, stats, settings, rnd: makeRnd((seed ?? 1) + (state.round + 1) * 1009) },
          state.round + 1,
          ok ? state.score + 1 : state.score,
        );
        dispatch({ type: 'ADVANCE', next });
      });
    },
    [state, session, category, stats, settings, seed, recordSeen, markLearned],
  );

  const showing = state.phase === 'show';
  const n = state.set.length;
  const cardW = Math.min(MISSING.cardW, (MISSING.rowW - (n - 1) * MISSING.gap) / n);
  const rowLeft = MISSING.rowCenterX - (n * cardW + (n - 1) * MISSING.gap) / 2;
  const itemH = showing ? MISSING.cardH : MISSING.askCardH;
  // RTL reading order: the first item sits at the physical right.
  const slot = (i: number) => rowLeft + (n - 1 - i) * (cardW + MISSING.gap);

  return (
    <GameShell
      title="🐵 מה נעלם?"
      chips={missingChips(state)}
      done={state.done}
      result={missingResult(state)}
      onBack={goBack}
      onReplay={session.restart}
      onHome={() => push(homeHref)}
      toast={session.toast}
      onDismissToast={session.dismissToast}
      celebrateMessage={celebrate}
      onDismissCelebrate={() => setCelebrate(null)}
      layout="free"
      scene="missing"
    >
      <MockBox testID={testIds.missing.root} left={0} top={0} width={1688} height={697} />
      <MockChip testID={testIds.game.chip(1)} label={`${state.score} ⭐`} {...MISSING.score} />
      <MockChip testID={testIds.game.chip(0)} label={`סיבוב ${state.round + 1}/5`} {...MISSING.round} />
      <MockBox {...MISSING.title}>
        <MockText testID={testIds.game.headerTitle} size={MISSING.titleSize} align="right">
          🐵 מה נעלם?
        </MockText>
      </MockBox>
      <MockBox testID={showing ? testIds.missing.phaseShow : testIds.missing.phaseAsk} {...MISSING.prompt}>
        <MockText size={MISSING.promptSize} weight="regular">
          {showing ? 'מסתכלים טוב על התמונות...' : 'איזו תמונה נעלמה? לוחצים על השם שלה'}
        </MockText>
      </MockBox>
      {state.set.map((it, index) => {
        const gone = !showing && it.word === state.missing.word;
        return (
          <MockCard
            key={`item-${it.word}`}
            testID={testIds.missing.item(index)}
            left={slot(index)}
            top={MISSING.cardTop}
            width={cardW}
            height={itemH}
            radius={48}
            style={[styles.tall, gone && styles.gone]}
          >
            {gone ? null : <WordArt word={it} size="68%" />}
          </MockCard>
        );
      })}
      {showing
        ? null
        : state.askOrder.map((it, index) => (
            <MockCard
              key={`guess-${it.word}`}
              testID={testIds.missing.guess(index)}
              accessibilityLabel={display(it.word, settings.niqqud)}
              onPress={() => guess(it.word)}
              left={rowLeft + (state.askOrder.length - 1 - index) * (cardW + MISSING.gap)}
              top={MISSING.guessTop}
              width={cardW}
              height={MISSING.guessH}
              radius={40}
              style={styles.tall}
            >
              <MockText size={44}>{display(it.word, settings.niqqud)}</MockText>
            </MockCard>
          ))}
    </GameShell>
  );
}

/** Missing composition in mock units (mock "ChatGPT Image …-8"). */
const MISSING = {
  score: { left: 518, top: 170, width: 102, height: 60 },
  round: { left: 632, top: 170, width: 156 , height: 60 },
  title: { left: 800, top: 164, width: 330, height: 76 },
  titleSize: 56,
  prompt: { left: 560, top: 246, width: 570, height: 44 },
  promptSize: 31,
  cardW: 198,
  cardH: 341,
  askCardH: 196,
  gap: 22,
  rowCenterX: 844,
  rowW: 900,
  cardTop: 327,
  guessTop: 545,
  guessH: 123,
} as const;

const styles = StyleSheet.create({
  tall: { backgroundColor: '#FFFCF5', borderColor: '#EDC060' },
  gone: { opacity: 0.35 },
});
