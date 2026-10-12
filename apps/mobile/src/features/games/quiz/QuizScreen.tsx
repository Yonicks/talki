/* eslint-disable no-restricted-syntax -- mock-unit layout constants are physical canvas coordinates (see design-system/landscape/mock/MockStage.tsx) */
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { uiIcons } from '@/design-system/assets';
import { MockAction, MockBox, MockChip, MockText } from '@/design-system/landscape';
import { mulberry32 } from '@/domain/games/shuffle';
import { STAR_STEP } from '@/domain/progress/stars';
import type { TalkiCategory, TalkiSettings, WordStats } from '@/domain/types';
import { plain } from '@/domain/vocabulary/niqqud';
import { homeHref } from '@/domain/navigation/routes';
import { useGoBack } from '@/hooks/useGoBack';
import { useGuardedPush } from '@/hooks/useGuardedPush';
import { wordVoiceService } from '@/services/voice';
import { useProgressStore } from '@/state/progressStore';
import { useSettingsStore } from '@/state/settingsStore';
import { testIds } from '@/testing/testIds';

import { GameShell } from '../shell/GameShell';
import { useGameSession, type GameSession } from '../shell/useGameSession';
import { QuizOption, type QuizOptionFeedback } from './QuizOption';
import { quizChips, quizResult } from './quizChips';
import { initQuiz, quizReducer } from './quizReducer';

export interface QuizScreenProps {
  catId: string | null;
  /** Test-only. Production never passes a seed. */
  seed?: number;
}

function e2ePlaceCorrectAt(): number | undefined {
  if (typeof window === 'undefined') return undefined;
  const raw = (window as unknown as { __talkiPlaceCorrectAt?: number }).__talkiPlaceCorrectAt;
  return typeof raw === 'number' ? raw : undefined;
}

function e2eForceDone(): { score: number; total: number } | undefined {
  if (typeof window === 'undefined') return undefined;
  const raw = (window as unknown as { __talkiQuizForceDone?: { score: number; total: number } }).__talkiQuizForceDone;
  return raw && typeof raw.score === 'number' ? raw : undefined;
}

/** Fresh generator per call so a remount cannot consume a leftover PRNG. */
function makeRnd(seed?: number): () => number {
  const fromWindow =
    typeof window !== 'undefined'
      ? (window as unknown as { __talkiQuizSeed?: number }).__talkiQuizSeed
      : undefined;
  const s = seed ?? fromWindow;
  return typeof s === 'number' ? mulberry32(s) : Math.random;
}

function initialQuiz(
  category: TalkiCategory,
  stats: Record<string, WordStats>,
  settings: TalkiSettings,
  seed?: number,
) {
  const next = initQuiz({ category, stats, settings, rnd: makeRnd(seed) }, { placeCorrectAt: e2ePlaceCorrectAt() });
  const forced = e2eForceDone();
  if (!forced) return next;
  return { ...next, score: forced.score, i: next.pool.length, done: true, locked: true, asked: true };
}

/**
 * index.html quiz loop (2557-2581, 3488-3510). Round state lives in
 * `quizReducer` — never Zustand (phase-08 standing rule).
 */
export function QuizScreen({ catId, seed }: QuizScreenProps) {
  const goBack = useGoBack();
  const push = useGuardedPush();
  const session = useGameSession({ gameId: 'quiz', requestedCatId: catId });

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
        title="🎧 איפה ה...?"
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
    <QuizPlay key={`${session.category.id}:${session.epoch}`} category={session.category} session={session} seed={seed} />
  );
}

function QuizPlay({
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
  const [feedback, setFeedback] = useState<{ word: string; ok: boolean } | null>(null);
  const spokenRound = useRef<number | null>(null);
  const completeFired = useRef(false);
  const [state, dispatch] = useReducer(quizReducer, undefined, () => initialQuiz(category, stats, settings, seed));

  useEffect(() => {
    if (!state.target.word || state.done) return;
    if (spokenRound.current === state.i) return;
    spokenRound.current = state.i;
    void wordVoiceService.say(state.catId, plain(state.target.word));
  }, [state.target.word, state.done, state.i, state.catId]);

  useEffect(() => {
    if (state.done && state.pool.length > 0 && !completeFired.current) {
      completeFired.current = true;
      session.audio.complete();
    }
  }, [state.done, state.pool.length, session.audio]);

  const replayPrompt = useCallback(() => {
    if (!state.target.word) return;
    void wordVoiceService.say(state.catId, plain(state.target.word));
  }, [state.catId, state.target.word]);

  const answer = useCallback(
    (word: string) => {
      if (!session.tryLock()) return;
      const ok = word === state.target.word;
      dispatch({ type: 'ANSWER', word });
      void recordSeen(state.catId, state.target.word, !ok);
      setFeedback({ word, ok });
      if (ok) {
        session.audio.correct();
        void markLearned(state.catId, word).then((r) => {
          if (r.added && r.size % STAR_STEP === 0) setCelebrate(`${r.size} מילים!`);
        });
        setTimeout(() => {
          dispatch({
            type: 'ADVANCE',
            categoryItems: category.items,
            rnd: makeRnd(seed),
            placeCorrectAt: e2ePlaceCorrectAt(),
          });
          setFeedback(null);
          session.unlock();
        }, 750);
      } else {
        session.audio.wrong();
        setTimeout(() => {
          dispatch({ type: 'UNLOCK' });
          setFeedback(null);
          session.unlock();
        }, 420);
      }
    },
    [session, state.target.word, state.catId, recordSeen, markLearned, category.items, seed],
  );

  const optionFeedback = (w: string): QuizOptionFeedback => {
    if (!feedback || feedback.word !== w) return 'idle';
    return feedback.ok ? 'correct' : 'wrong';
  };
  return (
    <GameShell
      title="🎧 איפה ה...?"
      chips={state.pool.length ? quizChips(state) : []}
      done={state.done && state.pool.length > 0}
      result={quizResult(state)}
      onBack={goBack}
      onReplay={session.restart}
      onHome={() => push(homeHref)}
      toast={session.toast}
      onDismissToast={session.dismissToast}
      celebrateMessage={celebrate}
      onDismissCelebrate={() => setCelebrate(null)}
      layout="free"
      scene="quiz"
    >
      <MockBox testID={testIds.quiz.root} left={QUIZ.panel.left} top={QUIZ.panel.top} width={QUIZ.panel.width} height={QUIZ.panel.height} />
      {[`שאלה ${state.i + 1}/${state.pool.length}`, `${state.score} ✅`, `🔥 רצף ${state.streak}`].map((label, i) => (
        <MockChip key={label} testID={testIds.game.chip(i)} label={label} {...QUIZ.chips[i]} />
      ))}
      <MockBox left={QUIZ.title.left} top={QUIZ.title.top} width={QUIZ.title.width} height={QUIZ.title.height}>
        <MockText testID={testIds.game.headerTitle} size={QUIZ.title.size}>
          🎧 איפה זה...?
        </MockText>
      </MockBox>
      <MockBox left={QUIZ.prompt.left} top={QUIZ.prompt.top} width={QUIZ.prompt.width} height={QUIZ.prompt.height}>
        <MockText testID={testIds.quiz.prompt} size={QUIZ.prompt.size} weight="regular">
          לחצו על התמונה של המילה שאתם שומעים
        </MockText>
      </MockBox>
      <MockAction testID={testIds.quiz.replay} label="לשמוע שוב" icon={uiIcons.speaker} onPress={replayPrompt} {...QUIZ.replay} />
      {state.options.map((opt, index) => (
        <QuizOption
          key={`${state.i}:${opt.word}`}
          word={opt}
          index={index}
          feedback={optionFeedback(opt.word)}
          onPress={() => answer(opt.word)}
          placement={{ ...QUIZ.options[index], width: QUIZ.optionSize, height: QUIZ.optionHeight }}
        />
      ))}
    </GameShell>
  );
}

/** Quiz composition in mock units (1688-wide mock "ChatGPT Image …-6"). */
const QUIZ = {
  panel: { left: 321, top: 142, width: 1045, height: 530 },
  chips: [
    { left: 906, top: 176, width: 211 },
    { left: 760, top: 176, width: 123 },
    { left: 566, top: 176, width: 177 },
  ],
  title: { left: 783, top: 248, width: 520, height: 84, size: 62 },
  prompt: { left: 783, top: 334, width: 520, height: 48, size: 33 },
  replay: { left: 410, top: 270, width: 316, height: 93 },
  optionSize: 218,
  optionHeight: 230,
  options: [{ left: 1089, top: 400 }, { left: 852, top: 400 }, { left: 614, top: 400 }, { left: 378, top: 400 }],
} as const;
