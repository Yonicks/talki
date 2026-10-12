/* eslint-disable no-restricted-syntax -- mock-unit layout constants are physical canvas coordinates (see design-system/landscape/mock/MockStage.tsx) */
import { StyleSheet, Text, View } from 'react-native';

import { TalkiText } from '@/design-system/components';
import { MockCard, useMockUnits } from '@/design-system/landscape';
import { fontFamily } from '@/design-system/theme/typography';
import { v3 } from '@/design-system/theme/colors';
import { display } from '@/domain/vocabulary/niqqud';
import { testIds } from '@/testing/testIds';

import { WordArt } from '../shell/WordArt';
import type { MemoryCard as MemoryCardModel } from './memoryReducer';

const TAN = '#E6CDA3';

/** Closed-card face: tan "?" with two four-point sparkles, as in the mock. */
function ClosedFace() {
  const { u } = useMockUnits();
  const spark = (left: number, top: number, size: number) => (
    <Text style={{ position: 'absolute', left: left * u, top: top * u, fontSize: size * u, color: TAN, lineHeight: size * 1.1 * u }}>✦</Text>
  );
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={{ fontFamily: fontFamily.body.extrabold, fontSize: 92 * u, lineHeight: 110 * u, color: TAN }}>?</Text>
      </View>
      {spark(36, 82, 34)}
      {spark(140, 66, 24)}
    </View>
  );
}

export function MemoryCard({
  card,
  niqqud,
  onPress,
  placement,
}: {
  card: MemoryCardModel;
  niqqud: boolean;
  onPress: () => void;
  /** Mock-unit box (see MockStage). */
  placement: { left: number; top: number; width: number; height: number };
}) {
  const shown = card.open || card.matched;
  return (
    <MockCard
      {...placement}
      radius={34}
      testID={testIds.memory.card(card.idx)}
      accessibilityLabel={shown ? display(card.it.word, niqqud) : 'סגור'}
      onPress={onPress}
      style={[styles.card, shown && styles.open, card.matched && styles.matched]}
    >
      {shown ? (
        card.kind === 'pic' ? (
          <WordArt word={card.it} size="78%" />
        ) : (
          <TalkiText weight="extrabold" align="center">
            {display(card.it.word, niqqud)}
          </TalkiText>
        )
      ) : (
        <ClosedFace />
      )}
    </MockCard>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FBF3E2', borderColor: '#F4E5C4' },
  center: { alignItems: 'center', justifyContent: 'center' },
  open: { backgroundColor: '#FFFFFF', borderColor: v3.purple200, borderWidth: 3 },
  matched: { borderColor: v3.green500, borderWidth: 3 },
});
