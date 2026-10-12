/* eslint-disable no-restricted-syntax -- mock-unit layout constants are physical canvas coordinates (see design-system/landscape/mock/MockStage.tsx) */
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { MockBox, MockCard, MockChip, MockPanel, MockText } from '@/design-system/landscape';
import { v3 } from '@/design-system/theme/colors';
import { NUM_WORDS } from '@/domain/games/numWords';
import { STAR_STEP } from '@/domain/progress/stars';
import type { TalkiCategory, TalkiSettings, WordStats } from '@/domain/types';
import { display, plain } from '@/domain/vocabulary/niqqud';
import { homeHref } from '@/domain/navigation/routes';
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
import { COUNT_ROUNDS, countChips, countReducer, countResult, initCount, setupCountRound } from './countReducer';

export interface CountScreenProps {
  catId: string | null;
  seed?: number;
}

function initialCount(category: TalkiCategory, stats: Record<string, WordStats>, settings: TalkiSettings, seed?: number) {
  return initCount({ category, stats, settings, rnd: makeRnd(seed) });
}

export function CountScreen({ catId, seed }: CountScreenProps) {
  const goBack = useGoBack();
  const push = useGuardedPush();
  const session = useGameSession({ gameId: 'count', requestedCatId: catId });

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
        title="🔢 כמה יש?"
        chips={[]}
        done={false}
        result={{ score: 0, total: COUNT_ROUNDS }}
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

  return <CountPlay key={`${session.category.id}:${session.epoch}`} category={session.category} session={session} seed={seed} />;
}

function CountPlay({
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
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<number | null>(null);
  const spoken = useRef<number | null>(null);
  const completeFired = useRef(false);
  const [state, dispatch] = useReducer(countReducer, undefined, () => initialCount(category, stats, settings, seed));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { __talkiCountN?: number }).__talkiCountN = state.n;
    }
  }, [state.n]);

  useEffect(() => {
    if (state.done) return;
    if (spoken.current === state.round) return;
    spoken.current = state.round;
    void wordVoiceService.say(category.id, `כַּמָּה ${state.it.word} יֵשׁ?`, { core: true });
  }, [state.done, state.round, state.it.word, category.id]);

  useEffect(() => {
    if (state.done && !completeFired.current) {
      completeFired.current = true;
      session.audio.complete();
    }
  }, [state.done, session.audio]);

  const answer = useCallback(
    (n: number) => {
      if (!session.tryLock()) return;
      const ok = n === state.n;
      dispatch({ type: 'ANSWER', n });
      setFeedback(n);
      if (ok) {
        session.audio.correct();
        void wordVoiceService.say(category.id, `${plain(NUM_WORDS[state.n] ?? '')} ${plain(state.it.word)}`, {
          core: true,
        });
        void markLearned(category.id, state.it.word).then((r) => {
          if (r.added && r.size % STAR_STEP === 0) setCelebrate(`${r.size} מילים!`);
        });
        session.schedule(1300, () => {
          const next = setupCountRound(
            { category, stats, settings, rnd: makeRnd(seed) },
            state.round + 1,
            state.score + 1,
          );
          dispatch({ type: 'ADVANCE', next });
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
    [session, state.n, state.it.word, state.round, state.score, category, stats, settings, seed, markLearned, setCelebrate],
  );

  const replayPrompt = useCallback(() => {
    void wordVoiceService.say(category.id, `כַּמָּה ${state.it.word} יֵשׁ?`, { core: true });
  }, [category.id, state.it.word]);
  const n = state.n;
  const pic = Math.min(COUNT.picMax, Math.floor(COUNT.stage.width / n) - 10);

  return (
    <GameShell
      title="כמה יש? 🔢"
      chips={countChips(state)}
      done={state.done}
      result={countResult(state)}
      onBack={goBack}
      onReplay={session.restart}
      onHome={() => push(homeHref)}
      toast={session.toast}
      onDismissToast={session.dismissToast}
      celebrateMessage={celebrate}
      onDismissCelebrate={() => setCelebrate(null)}
      layout="free"
      scene="count"
    >
      <MockBox testID={testIds.count.root} left={0} top={0} width={1688} height={697} />
      <MockChip testID={testIds.game.chip(1)} label={`${state.score} ⭐`} {...COUNT.score} />
      <MockChip testID={testIds.game.chip(0)} label={`סיבוב ${state.round + 1}/5`} {...COUNT.round} />
      <MockBox
        testID="count-replay"
        left={268}
        top={257}
        width={148}
        height={140}
      >
        <Pressable accessibilityRole="button" accessibilityLabel="להשמיע שוב" onPress={replayPrompt} style={StyleSheet.absoluteFill} />
      </MockBox>
      <MockPanel {...COUNT.titleBanner} radius={52} style={styles.banner}>
        <MockText testID={testIds.game.headerTitle} size={COUNT.titleSize}>
          🔢 כמה יש?
        </MockText>
      </MockPanel>
      <MockPanel {...COUNT.promptBanner} radius={40} style={styles.banner}>
        <MockText size={COUNT.promptSize} weight="regular">
          {`כמה ${display(state.it.word, settings.niqqud)} יש כאן?`}
        </MockText>
      </MockPanel>
      <MockBox testID={testIds.count.stage} {...COUNT.stage} style={styles.stage}>
        {Array.from({ length: n }, (_, i) => (
          <MockBox key={i} left={0} top={0} width={pic} height={COUNT.stage.height} style={styles.pic}>
            <WordArt word={state.it} size="100%" />
          </MockBox>
        ))}
      </MockBox>
      {state.options.map((opt, index) => (
        <MockCard
          key={`${state.round}:${opt}`}
          testID={testIds.count.option(index)}
          accessibilityLabel={String(opt)}
          onPress={() => answer(opt)}
          radius={56}
          {...COUNT.options[index]}
          width={COUNT.optionW}
          height={COUNT.optionH}
          style={feedback === opt ? (opt === state.n ? styles.ok : styles.bad) : undefined}
        >
          <MockText size={COUNT.optionSize}>{String(opt)}</MockText>
        </MockCard>
      ))}
    </GameShell>
  );
}

/** Count composition in mock units (mock "ChatGPT Image …-3"). */
const COUNT = {
  score: { left: 251, top: 190, width: 125, height: 72 },
  round: { left: 471, top: 187, width: 175, height: 76 },
  titleBanner: { left: 646, top: 140, width: 418, height: 98 },
  titleSize: 72,
  promptBanner: { left: 624, top: 247, width: 440, height: 83 },
  promptSize: 40,
  stage: { left: 500, top: 360, width: 690, height: 210 },
  picMax: 200,
  optionW: 376,
  optionH: 112,
  optionSize: 78,
  options: [{ left: 1064, top: 592 }, { left: 658, top: 592 }, { left: 248, top: 592 }],
} as const;

const styles = StyleSheet.create({
  banner: { alignItems: 'center', justifyContent: 'center' },
  stage: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  pic: { position: 'relative', left: 0, top: 0, alignItems: 'center', justifyContent: 'center' },
  ok: { borderColor: v3.green500, borderWidth: 3 },
  bad: { borderColor: v3.pink500, borderWidth: 3 },
});
