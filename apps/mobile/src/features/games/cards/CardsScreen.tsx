/* eslint-disable no-restricted-syntax -- mock-unit layout constants are physical canvas coordinates (see design-system/landscape/mock/MockStage.tsx) */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

import { MockBox, MockCard, MockPrimary, MockText } from '@/design-system/landscape';
import { homeHref } from '@/domain/navigation/routes';
import { display } from '@/domain/vocabulary/niqqud';
import { useGoBack } from '@/hooks/useGoBack';
import { useGuardedPush } from '@/hooks/useGuardedPush';
import { wordVoiceService } from '@/services/voice';
import { useProgressStore } from '@/state/progressStore';
import { useSettingsStore } from '@/state/settingsStore';
import { testIds } from '@/testing/testIds';

import { GameShell } from '../shell/GameShell';
import { WordArt } from '../shell/WordArt';
import { useGameSession } from '../shell/useGameSession';
import { clampCardIndex, stepCardIndex } from './cardsNav';
import { useCardSwipe } from './useCardSwipe';

export interface CardsScreenProps {
  catId: string | null;
  seed?: number;
}

export function CardsScreen({ catId }: CardsScreenProps) {
  const goBack = useGoBack();
  const push = useGuardedPush();
  const router = useRouter();
  const session = useGameSession({ gameId: 'cards', requestedCatId: catId, mode: 'browse' });
  const settings = useSettingsStore((s) => s.settings);
  const markLearned = useProgressStore((s) => s.markLearned);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (session.failed) {
      const t = setTimeout(() => router.replace(homeHref), 400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [session.failed, router]);

  const items = useMemo(() => session.category?.items ?? [], [session.category]);
  const safeIndex = clampCardIndex(index, items.length);
  const current = items[safeIndex];

  const go = useCallback(
    (delta: -1 | 1) => {
      if (!session.category || items.length === 0) return;
      const next = stepCardIndex(safeIndex, delta, items.length);
      setIndex(next);
      const word = items[next]!.word;
      void markLearned(session.category.id, word);
      void wordVoiceService.say(session.category.id, word);
    },
    [session.category, items, safeIndex, markLearned],
  );

  const say = useCallback(() => {
    if (!session.category || !current) return;
    void wordVoiceService.say(session.category.id, current.word);
  }, [session.category, current]);

  const swipe = useCardSwipe(go);

  const title = session.category ? `🖼️ ${session.category.title}` : '🖼️ כרטיסיות';
  const counter = items.length ? `${safeIndex + 1}/${items.length}` : '0/0';

  return (
    <GameShell
      title={title}
      chips={[counter]}
      done={false}
      result={{ score: 0, total: 0 }}
      onBack={goBack}
      onReplay={session.restart}
      onHome={() => push(homeHref)}
      toast={session.toast}
      onDismissToast={session.dismissToast}
      celebrateMessage={null}
      onDismissCelebrate={() => undefined}
      scoring={false}
      chipTestIDs={[testIds.cards.counter]}
      layout="free"
      scene="cards"
    >
      <MockBox testID={testIds.cards.counter} {...CARDS.counter} pointerEvents="none">
        <MockText size={CARDS.counterSize} weight="bold">
          {counter}
        </MockText>
      </MockBox>
      <MockBox {...CARDS.category}>
        <MockText testID={testIds.game.headerTitle} size={CARDS.categorySize}>
          {session.category ? `🖼️ ${session.category.title}` : '🖼️ כרטיסיות'}
        </MockText>
      </MockBox>
      {current ? (
        <>
          <GestureDetector gesture={swipe}>
            <MockBox testID={testIds.cards.word} accessibilityLabel="השמעת המילה" onPress={say} {...CARDS.panel} />
          </GestureDetector>
          <MockBox testID={testIds.cards.root} {...CARDS.art} pointerEvents="none" style={styles.art}>
            <WordArt word={current} size="100%" />
          </MockBox>
          <MockBox {...CARDS.word} pointerEvents="none">
            <MockText size={CARDS.wordSize} color={CARDS.wordInk}>
              {display(current.word, settings.niqqud)}
            </MockText>
          </MockBox>
        </>
      ) : null}
      <MockCard testID={testIds.cards.prev} accessibilityLabel="הקודם" onPress={() => go(-1)} radius={40} {...CARDS.prev}>
        <MockText size={CARDS.btnSize}>הקודם</MockText>
      </MockCard>
      <MockPrimary testID={testIds.cards.say} label="שוב" onPress={say} size={CARDS.btnSize} {...CARDS.say} />
      <MockCard testID={testIds.cards.next} accessibilityLabel="הבא" onPress={() => go(1)} radius={40} {...CARDS.next}>
        <MockText size={CARDS.btnSize}>הבא</MockText>
      </MockCard>
      <MockBox {...CARDS.hint}>
        <MockText size={CARDS.hintSize} weight="regular">
          לחצו על שוב כדי לשמוע את המילה שוב.
        </MockText>
      </MockBox>
    </GameShell>
  );
}

/** Cards composition in mock units (mock "ChatGPT Image …-5"). */
const CARDS = {
  counter: { left: 705, top: 112, width: 107, height: 66 },
  counterSize: 32,
  category: { left: 822, top: 116, width: 150, height: 58 },
  categorySize: 36,
  panel: { left: 362, top: 185, width: 960, height: 441 },
  art: { left: 689, top: 207, width: 300, height: 300 },
  word: { left: 640, top: 494, width: 405, height: 106 },
  wordSize: 78,
  wordInk: '#4B1E8E',
  prev: { left: 956, top: 640, width: 190, height: 88 },
  say: { left: 752, top: 640, width: 176, height: 88 },
  next: { left: 542, top: 640, width: 186, height: 88 },
  btnSize: 34,
  hint: { left: 600, top: 743, width: 500, height: 38 },
  hintSize: 28,
} as const;

const styles = StyleSheet.create({
  art: { alignItems: 'center', justifyContent: 'center' },
});
