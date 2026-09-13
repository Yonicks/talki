import type { ReactNode } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { TalkiText } from '@/design-system/components';
import { shadowCard, shadowFloating } from '@/design-system/theme/shadows';
import { v2, v3 } from '@/design-system/theme/colors';
import { HOME_LAYOUT, homeHeroPanelHeight, useHomeMetrics, type HomeMetrics } from './homeLayout';
import { LandscapeProgress } from './LandscapeProgress';

export interface LandscapeHeroPanelProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  progress?: number;
  progressLabel?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  /** Defaults to `${testID}-cta` when testID is set. */
  ctaTestID?: string;
  /** Yellow Talki mascot, drawn beside the panel on the scenic side. */
  mascot?: ImageSourcePropType;
  /** Small character star beside the category title (v3 mock). */
  titleMark?: ImageSourcePropType;
  /** Category artwork inside the panel's end-side thumbnail frame. */
  thumbnail?: ImageSourcePropType;
  /** Scenic fill cover-cropped behind `thumbnail`, matching the strip cards. */
  thumbnailBackground?: ImageSourcePropType;
  /** Injected so Home and the dev shell share one metric source. */
  metrics?: HomeMetrics;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  children?: ReactNode;
}

/**
 * The v3 Home hero: the yellow mascot standing on the scenic side of a large
 * white "continue learning" card. Every dimension comes from
 * `HOME_LAYOUT.hero` / `HOME_LAYOUT.mascot`, i.e. straight from the approved
 * mock (see `features/home/homeLayout.ts` for the measurement table).
 *
 * The whole element is one fixed-proportion row box so the caller can place
 * it as a single unit; the mascot and the card are positioned inside it
 * rather than flexed, because the mock deliberately lets the mascot's feet
 * drop below the card's bottom edge.
 *
 * Everything inside the card — copy, progress, CTA — stays inside the card
 * (mock requirement): there is no floating progress box and no CTA below the
 * panel.
 */
export function LandscapeHeroPanel({
  eyebrow,
  title,
  subtitle,
  progress,
  progressLabel,
  ctaLabel,
  onCtaPress,
  ctaTestID,
  mascot,
  titleMark,
  thumbnail,
  thumbnailBackground,
  metrics,
  style,
  testID,
  children,
}: LandscapeHeroPanelProps) {
  const fallback = useHomeMetrics();
  const m = metrics ?? fallback;
  const { s, touch } = m;
  const h = HOME_LAYOUT.hero;
  const resolvedCtaTestID = ctaTestID ?? (testID ? `${testID}-cta` : undefined);

  const copyWidth = s(h.width) - 2 * s(h.padding) - s(h.thumbWidth) - s(h.columnGap);
  const panelHeight = homeHeroPanelHeight(m);

  return (
    <View
      testID={testID}
      style={[styles.row, { width: s(h.rowWidth), height: panelHeight }, style]}
    >
      {mascot ? (
        <Image
          source={mascot}
          accessibilityIgnoresInvertColors
          style={[
            styles.mascot,
            {
              top: s(HOME_LAYOUT.mascot.top),
              insetInlineStart: s(HOME_LAYOUT.mascot.insetStart),
              width: s(HOME_LAYOUT.mascot.width),
              height: s(HOME_LAYOUT.mascot.width / MASCOT_ASPECT),
            },
          ]}
          resizeMode="contain"
        />
      ) : null}

      <View
        style={[
          styles.panel,
          shadowFloating,
          {
            top: s(h.top),
            width: s(h.width),
            minHeight: panelHeight,
            borderRadius: s(h.radius),
            padding: s(h.padding),
            gap: s(h.columnGap),
          },
        ]}
      >
        {thumbnail ? (
          <View
            style={[
              styles.thumbFrame,
              shadowCard,
              {
                width: s(h.thumbWidth),
                height: s(h.thumbHeight),
                borderRadius: s(h.thumbRadius),
                padding: s(h.thumbFrame),
              },
            ]}
          >
            <View style={[styles.thumbClip, { borderRadius: s(h.thumbRadius - h.thumbFrame) }]}>
              {thumbnailBackground ? (
                <Image
                  source={thumbnailBackground}
                  accessibilityIgnoresInvertColors
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
              ) : null}
              <Image
                source={thumbnail}
                accessibilityIgnoresInvertColors
                style={styles.thumbArt}
                resizeMode="contain"
              />
            </View>
          </View>
        ) : null}

        <View style={[styles.copyCol, { width: copyWidth, marginTop: s(h.padTop) }]}>
          {eyebrow ? (
            <TalkiText
              weight="semibold"
              align="center"
              color={v3.textHeading}
              style={{ fontSize: s(h.eyebrowSize), lineHeight: s(h.eyebrowLine) }}
            >
              {eyebrow}
            </TalkiText>
          ) : null}

          <View style={[styles.titleRow, { marginTop: s(h.gapTitle), height: s(h.titleLine), gap: s(6) }]}>
            {titleMark ? (
              <Image
                source={titleMark}
                accessibilityIgnoresInvertColors
                style={{ width: s(h.titleStarSize), height: s(h.titleStarSize) }}
                resizeMode="contain"
              />
            ) : null}
            <TalkiText
              weight="extrabold"
              align="center"
              color={v3.purple900}
              numberOfLines={1}
              style={{ fontSize: s(h.titleSize), lineHeight: s(h.titleLine) }}
            >
              {title}
            </TalkiText>
          </View>

          {subtitle ? (
            <TalkiText
              weight="bold"
              align="center"
              color={v3.textHeading}
              numberOfLines={1}
              style={{
                marginTop: s(h.gapSubtitle),
                fontSize: s(h.subtitleSize),
                lineHeight: s(h.subtitleLine),
              }}
            >
              {subtitle}
            </TalkiText>
          ) : null}

          {progress !== undefined ? (
            <LandscapeProgress
              value={progress}
              label={progressLabel}
              layout="inline"
              height={s(h.progressTrackHeight)}
              pillHeight={s(h.progressPillHeight)}
              labelSize={s(h.progressLabelSize)}
              style={{ marginTop: s(h.gapProgress) }}
            />
          ) : null}

          {children}

          {ctaLabel ? (
            <Pressable
              testID={resolvedCtaTestID}
              onPress={onCtaPress}
              accessibilityRole="button"
              accessibilityLabel={ctaLabel}
              style={({ pressed }) => [
                styles.cta,
                shadowCard,
                {
                  marginTop: s(h.gapCta),
                  height: touch(h.ctaHeight),
                  paddingInline: s(6),
                },
                pressed && styles.pressed,
              ]}
            >
              <TalkiText
                weight="extrabold"
                align="center"
                color="#fff"
                numberOfLines={1}
                style={[styles.ctaLabel, { fontSize: s(h.ctaLabelSize) }]}
              >
                {ctaLabel}
              </TalkiText>
              <View
                style={[
                  styles.ctaIconWrap,
                  {
                    width: s(h.ctaPlaySize),
                    height: s(h.ctaPlaySize),
                    borderRadius: s(h.ctaPlaySize) / 2,
                  },
                ]}
              >
                <PlayTriangle size={s(h.ctaPlaySize) * 0.44} />
              </View>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/**
 * The mock's CTA glyph: a solid purple play triangle in the white circle.
 * Drawn with the standard border trick rather than shipped as art — no
 * play-arrow asset exists in `assets/v2|v3`, and the chevron that stood in
 * for it read as a "next" caret, not "play".
 */
function PlayTriangle({ size }: { size: number }) {
  return (
    <View
      style={{
        width: 0,
        height: 0,
        // Physical triangle geometry, not an RTL layout edge: the play mark
        // points the same way in every text direction.
        // eslint-disable-next-line no-restricted-syntax
        borderLeftWidth: size,
        // eslint-disable-next-line no-restricted-syntax
        borderLeftColor: v3.purple600,
        borderTopWidth: size * 0.6,
        borderTopColor: 'transparent',
        borderBottomWidth: size * 0.6,
        borderBottomColor: 'transparent',
        marginInlineStart: size * 0.22,
      }}
    />
  );
}

/** `talki-hero-star.webp` is 640 × 618 edge-to-edge (no transparent margin). */
const MASCOT_ASPECT = 640 / 618;

const styles = StyleSheet.create({
  row: {
    position: 'relative',
    flexShrink: 0,
  },
  mascot: {
    position: 'absolute',
    zIndex: 1,
  },
  panel: {
    position: 'absolute',
    insetInlineStart: 0,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: v3.surfaceSoft,
    borderWidth: 2,
    borderColor: '#fff',
    flexShrink: 0,
  },
  thumbFrame: {
    backgroundColor: '#fff',
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumbClip: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: v3.purple050,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbArt: {
    // The category art is square; the mock's thumbnail frame is portrait, so
    // fitting the art to the frame's *width* leaves it floating in a band of
    // empty scenery. Oversizing it past the frame width and letting the clip
    // trim the corners fills the frame the way the mock draws it, without
    // cropping into the character's head.
    width: '116%',
    aspectRatio: 1,
  },
  copyCol: {
    flexShrink: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    borderRadius: 999,
    backgroundColor: v3.purple600,
    borderWidth: 2,
    borderColor: v2.grapeDark,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaIconWrap: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ctaLabel: {
    flex: 1,
  },
  pressed: { transform: [{ translateY: 2 }] },
});
