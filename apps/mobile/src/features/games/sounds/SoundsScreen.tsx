/* eslint-disable no-restricted-syntax -- mock-unit layout constants are physical canvas coordinates (see design-system/landscape/mock/MockStage.tsx) */
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { uiIcons } from '@/design-system/assets';
import { MockAction, MockBox, MockCard, MockChip, MockText } from '@/design-system/landscape';
import { v3 } from '@/design-system/theme/colors';
import { STAR_STEP } from '@/domain/progress/stars';
import type { TalkiCategory, TalkiSettings, WordStats } from '@/domain/types';
import { homeHref } from '@/domain/navigation/routes';
import { plain } from '@/domain/vocabulary/niqqud';
import { useGoBack } from '@/hooks/useGoBack';
import { useGuardedPush } from '@/hooks/useGuardedPush';
import { wordVoiceService } from '@/services/voice';
import { useProgressStore } from '@/state/progressStore';
import { useSettingsStore } from '@/state/settingsStore';
import { testIds } from '@/testing/testIds';

import { makeRnd, readE2ESeed } from '../shell/e2eSeed';
import { GameShell } from '../shell/GameShell';
import { WordArt } from '../shell/WordArt';
import { useGameSession, type GameSession } from '../shell/useGameSession';
import { initSounds, soundsChips, soundsReducer, soundsResult } from './soundsReducer';

export interface SoundsScreenProps {
  catId: string | null;
  seed?: number;
}

function e2ePlaceCorrectAt(): number | undefined {
  if (typeof window === 'undefined') return undefined;
  const raw = (window as unknown as { __talkiPlaceCorrectAt?: number }).__talkiPlaceCorrectAt;
  return typeof raw === 'number' ? raw : undefined;
}

function initialSounds(category: TalkiCategory, stats: Record<string, WordStats>, settings: TalkiSettings, seed?: number) {
  return initSounds({ category, stats, settings, rnd: makeRnd(seed) }, e2ePlaceCorrectAt());
}

export function SoundsScreen({ catId, seed }: SoundsScreenProps) {
  const goBack = useGoBack();
  const push = useGuardedPush();
  const session = useGameSession({ gameId: 'sounds', requestedCatId: catId, fixedCatId: 'animals' });

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
        title="🐮 מי אמר את זה?"
        chips={[]}
        done={false}
        result={{ score: 0, total: 6 }}
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
    <SoundsPlay key={`${session.category.id}:${session.epoch}`} category={session.category} session={session} seed={seed} />
  );
}

function SoundsPlay({
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
  const spoken = useRef<number | null>(null);
  const completeFired = useRef(false);
  const [state, dispatch] = useReducer(soundsReducer, undefined, () => initialSounds(category, stats, settings, seed));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { __talkiSoundsTarget?: string }).__talkiSoundsTarget = state.target.word;
    }
  }, [state.target.word]);

  useEffect(() => {
    if (state.done || !state.target.sound) return;
    if (spoken.current === state.i) return;
    spoken.current = state.i;
    void wordVoiceService.say('animals', state.target.sound, { core: true });
  }, [state.done, state.target.sound, state.i]);

  useEffect(() => {
    if (state.done && !completeFired.current) {
      completeFired.current = true;
      session.audio.complete();
    }
  }, [state.done, session.audio]);

  const replay = useCallback(() => {
    if (!state.target.sound) return;
    void wordVoiceService.say('animals', state.target.sound, { core: true });
  }, [state.target.sound]);

  const answer = useCallback(
    (word: string) => {
      if (!session.tryLock()) return;
      const ok = word === state.target.word;
      dispatch({ type: 'ANSWER', word });
      void recordSeen('animals', state.target.word, !ok);
      setFeedback({ word, ok });
      if (ok) {
        session.audio.correct();
        void wordVoiceService.say('animals', state.target.word);
        void markLearned('animals', word).then((r) => {
          if (r.added && r.size % STAR_STEP === 0) setCelebrate(`${r.size} מילים!`);
        });
        session.schedule(1100, () => {
          dispatch({ type: 'ADVANCE', rnd: makeRnd(seed ?? readE2ESeed()), placeCorrectAt: e2ePlaceCorrectAt() });
          setFeedback(null);
          session.unlock();
        });
      } else {
        session.audio.wrong();
        session.schedule(420, () => {
          dispatch({ type: 'UNLOCK' });
          setFeedback(null);
          session.unlock();
        });
      }
    },
    [session, state.target.word, markLearned, recordSeen, seed],
  );

  return (
    <GameShell
      title="מי אמר את זה? 🐮"
      chips={state.pool.length ? soundsChips(state) : []}
      done={state.done && state.pool.length > 0}
      result={soundsResult(state)}
      onBack={goBack}
      onReplay={session.restart}
      onHome={() => push(homeHref)}
      toast={session.toast}
      onDismissToast={session.dismissToast}
      celebrateMessage={celebrate}
      onDismissCelebrate={() => setCelebrate(null)}
      layout="free"
      scene="sounds"
    >
      <MockBox testID={testIds.sounds.root} {...SOUNDS.panel} />
      <MockChip testID={testIds.game.chip(1)} label={`${state.score} ✅`} {...SOUNDS.score} />
      <MockChip testID={testIds.game.chip(0)} label={`שאלה ${state.i + 1}/${state.pool.length}`} tint="lavender" {...SOUNDS.question} />
      <MockBox {...SOUNDS.title}>
        <MockText testID={testIds.game.headerTitle} size={SOUNDS.titleSize} align="right">
          מי אמר את זה? 🐮
        </MockText>
      </MockBox>
      <MockAction testID={testIds.sounds.play} label="לשמוע שוב" icon={uiIcons.speaker} direction="stack" onPress={replay} {...SOUNDS.replay} />
      {state.options.map((opt, index) => (
        <MockCard
          key={`${state.i}:${opt.word}`}
          testID={testIds.sounds.option(index)}
          accessibilityLabel={plain(opt.word)}
          onPress={() => answer(opt.word)}
          {...SOUNDS.cards[index]}
          width={SOUNDS.cardW}
          height={SOUNDS.cardH}
          style={feedback?.word === opt.word ? (feedback.ok ? styles.ok : styles.bad) : undefined}
        >
          <WordArt word={opt} size="84%" />
        </MockCard>
      ))}
    </GameShell>
  );
}

/** Sounds composition in mock units (mock "ChatGPT Image …-4"). */
const SOUNDS = {
  panel: { left: 321, top: 142, width: 1045, height: 532 },
  score: { left: 371, top: 202, width: 125, height: 74 },
  question: { left: 508, top: 202, width: 190, height: 74 },
  title: { left: 719, top: 196, width: 480, height: 80 },
  titleSize: 62,
  replay: { left: 1139, top: 387, width: 200, height: 133 },
  cardW: 237,
  cardH: 242,
  cards: [{ left: 880, top: 319 }, { left: 624, top: 319 }, { left: 369, top: 319 }],
} as const;

const styles = StyleSheet.create({
  ok: { borderColor: v3.green500, borderWidth: 3 },
  bad: { borderColor: v3.pink500, borderWidth: 3 },
});
