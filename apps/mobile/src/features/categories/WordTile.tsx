import { Image, Pressable, StyleSheet, View } from 'react-native';

import { uiIcons } from '@/design-system/assets';
import { TalkiPill, TalkiText } from '@/design-system/components';
import { landscapeTokens, LANDSCAPE_MIN_TOUCH } from '@/design-system/landscape';
import { useLandscapeLayout } from '@/design-system/responsive/useLandscapeLayout';
import { radii } from '@/design-system/theme/radii';
import { shadowCard } from '@/design-system/theme/shadows';
import { v2, v3 } from '@/design-system/theme/colors';
import { display } from '@/domain/vocabulary/niqqud';
import { wordImage } from '@/domain/vocabulary/wordImage';
import type { TalkiWord } from '@/domain/types';
import { testIds } from '@/testing/testIds';

export interface WordTileProps {
  word: TalkiWord;
  index: number;
  niqqudEnabled: boolean;
  learned: boolean;
  onPress: () => void;
}

/**
 * Landscape word tile (Phase 23). Speaks via caller `onPress` (PLAIN form);
 * niqqud only affects display. Art uses contain (never stretch). Touch floor
 * ≥48 via layout cell + min sizes from landscape tokens.
 */
export function WordTile({ word, index, niqqudEnabled, learned, onPress }: WordTileProps) {
  const layout = useLandscapeLayout();
  const tokens = landscapeTokens(layout.deviceClass, layout.uiScale);
  const label = display(word.word, niqqudEnabled);
  const art = tokens.wordArtSize;

  return (
    <Pressable
      testID={testIds.category.word(index)}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.card,
        shadowCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.speakerBadge}>
        <Image source={uiIcons.speaker} style={styles.speakerIcon} resizeMode="contain" />
      </View>
      {/* Label before art: RTL row auto-mirrors child order (first child
          lands at the physical right), so this reads label-right /
          icon-left, matching the mock's horizontal word pill. */}
      <TalkiText
        weight="extrabold"
        align="center"
        numberOfLines={2}
        style={[styles.label, { fontSize: tokens.wordLabelSize }]}
      >
        {label}
      </TalkiText>
      {word.photo ? (
        <Image source={{ uri: word.photo }} style={{ width: art, height: art }} resizeMode="contain" />
      ) : wordImage(word) ? (
        <Image source={wordImage(word)} style={{ width: art, height: art }} resizeMode="contain" />
      ) : (
        <TalkiText style={[styles.emoji, { fontSize: Math.round(art * 0.85) }]}>{word.emoji}</TalkiText>
      )}
      {learned ? (
        <View style={styles.badge}>
          <TalkiPill label="★" color={v3.gold500} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: LANDSCAPE_MIN_TOUCH,
    minHeight: LANDSCAPE_MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingInline: 10,
    paddingBlock: 6,
    borderRadius: radii.card,
    borderWidth: 3,
    borderColor: v2.line,
    backgroundColor: v2.paper,
  },
  pressed: {
    transform: [{ translateY: 2 }],
  },
  emoji: {
    textAlign: 'center',
  },
  label: {
    flexShrink: 1,
  },
  badge: {
    position: 'absolute',
    insetInlineEnd: 4,
    top: 4,
  },
  /** Floating circular chip, top corner — the mock's prominent speaker
   *  badge in place of the old flat inline glyph. */
  speakerBadge: {
    position: 'absolute',
    insetInlineStart: -6,
    top: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: v3.purple100,
    borderWidth: 1.5,
    borderColor: v2.paper,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  speakerIcon: {
    width: 14,
    height: 14,
  },
});
