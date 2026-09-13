import { Image as ExpoImage } from 'expo-image';
import { Image, Pressable, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { TalkiText } from '@/design-system/components';
import { shadowCard } from '@/design-system/theme/shadows';
import { v3 } from '@/design-system/theme/colors';
import { useLandscapeLayout } from '@/design-system/responsive/useLandscapeLayout';
import { HOME_LAYOUT } from './homeLayout';
import { landscapeTokens } from './tokens';

export interface LandscapeCategoryCardProps {
  title: string;
  image?: ImageSourcePropType;
  /** Scenic fill cover-cropped behind the character art (v3 mock). */
  background?: ImageSourcePropType;
  onPress?: () => void;
  /** Explicit card box, in dp. Home passes its mock-derived metric; other
   *  callers fall back to the shared landscape tokens. */
  width?: number;
  height?: number;
  labelSize?: number;
  testID?: string;
}

/**
 * Category strip card, drawn to the v3 Home mock: a white rounded frame, a
 * scenic photo filling the whole interior, the category's character art on
 * top of it, and a white rounded label pill floating over the artwork's
 * lower edge (not a separate footer band).
 */
export function LandscapeCategoryCard({
  title,
  image,
  background,
  onPress,
  width,
  height,
  labelSize,
  testID,
}: LandscapeCategoryCardProps) {
  const layout = useLandscapeLayout();
  const tokens = landscapeTokens(layout.deviceClass, layout.uiScale);
  const w = Math.max(48, width ?? tokens.categoryCardWidth);
  const h = Math.max(48, height ?? tokens.categoryCardHeight);
  const c = HOME_LAYOUT.strip;
  // Card chrome scales with the card so a tablet keeps the mock's ratios.
  const unit = w / c.cardWidth;
  const pad = c.cardPadding * unit;
  const radius = c.cardRadius * unit;
  const labelHeight = c.labelHeight * unit;
  const fontSize = fitLabelSize(title, labelSize ?? c.labelSize * unit, w - 2 * pad - pad * 1.2);

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.card,
        shadowCard,
        { width: w, height: h, borderRadius: radius, padding: pad },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.art, { borderRadius: radius - pad }]}>
        {background ? (
          <ExpoImage
            source={background}
            accessibilityIgnoresInvertColors
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            // The scenic fills are tall portraits; a centred cover crop keeps
            // only sky. Anchoring low in the source keeps the mock's
            // horizon-plus-meadow band inside the card.
            // eslint-disable-next-line no-restricted-syntax -- expo-image contentPosition is a physical bitmap anchor
            contentPosition={{ top: '68%', left: '50%' }}
          />
        ) : null}
        {image ? (
          <Image
            source={image}
            accessibilityIgnoresInvertColors
            style={[styles.image, { marginBottom: labelHeight * 0.55 }]}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholder} />
        )}
        <View
          style={[
            styles.label,
            {
              height: labelHeight,
              borderRadius: labelHeight / 2,
              insetInlineStart: pad,
              insetInlineEnd: pad,
              bottom: pad,
              paddingInline: pad * 0.6,
            },
          ]}
        >
          <TalkiText
            weight="extrabold"
            align="center"
            color={v3.purple900}
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ fontSize }}
          >
            {title}
          </TalkiText>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Mean advance width of the rounded Hebrew display face, as a fraction of
 * the font size, measured off `plain()` category titles in `TalkiText`'s
 * extrabold weight.
 */
const HEBREW_ADVANCE = 0.55;

/**
 * Largest size at which `title` still fits one line of `available` dp.
 *
 * `adjustsFontSizeToFit` is a native-only prop — react-native-web ignores
 * it, so on the web build the mock's longest label ("צבעים וצורות")
 * ellipsised instead of shrinking. Deriving the size arithmetically fits on
 * both platforms and leaves every shorter label at the mock's 13 dp.
 */
function fitLabelSize(title: string, base: number, available: number): number {
  if (available <= 0) return base;
  const needed = available / Math.max(1, title.length * HEBREW_ADVANCE);
  return Math.max(base * 0.72, Math.min(base, needed));
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    backgroundColor: '#fff',
    flexShrink: 0,
  },
  pressed: { transform: [{ translateY: 2 }] },
  art: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: v3.blue100,
  },
  /** Square art in a portrait card — sized off the card width, as the mock draws it. */
  image: { width: '96%', aspectRatio: 1 },
  placeholder: {
    width: '60%',
    height: '60%',
    borderRadius: 12,
    backgroundColor: v3.purple200,
  },
  label: {
    position: 'absolute',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
