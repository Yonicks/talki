import { Image, StyleSheet } from 'react-native';

import { TalkiText } from '@/design-system/components';
import { MockCard } from '@/design-system/landscape';
import { v3 } from '@/design-system/theme/colors';
import { plain } from '@/domain/vocabulary/niqqud';
import { wordImage } from '@/domain/vocabulary/wordImage';
import type { TalkiWord } from '@/domain/types';
import { testIds } from '@/testing/testIds';

export type QuizOptionFeedback = 'idle' | 'correct' | 'wrong';

export interface QuizOptionProps {
  word: TalkiWord;
  index: number;
  feedback: QuizOptionFeedback;
  onPress: () => void;
  /** Mock-unit box (see MockStage). */
  placement: { left: number; top: number; width: number; height: number };
}

/**
 * index.html `.opt` (2575-2576) — picture only, no printed word. The
 * accessibility label is the plain form so a screen reader (and the
 * Playwright burst helper) can find the option that matches the prompt.
 */
export function QuizOption({ word, index, feedback, onPress, placement }: QuizOptionProps) {
  const art = word.photo ? { uri: word.photo } : wordImage(word);
  const feedbackId =
    feedback === 'correct' ? testIds.quiz.optionCorrect : feedback === 'wrong' ? testIds.quiz.optionWrong : undefined;

  return (
    <MockCard
      {...placement}
      testID={testIds.quiz.option(index)}
      accessibilityLabel={plain(word.word)}
      onPress={onPress}
      style={feedback === 'correct' ? styles.correct : feedback === 'wrong' ? styles.wrong : undefined}
    >
      {feedbackId ? <TalkiText testID={feedbackId} style={styles.srOnly} /> : null}
      {art ? (
        <Image source={art} style={styles.art} resizeMode="contain" />
      ) : (
        <TalkiText style={styles.emoji}>{word.emoji}</TalkiText>
      )}
    </MockCard>
  );
}

const styles = StyleSheet.create({
  correct: { borderColor: v3.green500, borderWidth: 3 },
  wrong: { borderColor: v3.pink500, borderWidth: 3 },
  art: { width: '84%', height: '84%' },
  emoji: { fontSize: 48 },
  srOnly: { position: 'absolute', width: 1, height: 1, overflow: 'hidden' },
});
