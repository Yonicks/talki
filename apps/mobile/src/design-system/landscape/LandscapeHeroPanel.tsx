import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { TalkiText } from '@/design-system/components';
import { shadowCard, shadowFloating, shadowSm } from '@/design-system/theme/shadows';
import { fontFamily } from '@/design-system/theme/typography';
import { v3 } from '@/design-system/theme/colors';
import { homeMock } from './homeColors';
import { HOME_LAYOUT, useHomeMetrics, type HomeMetrics } from './homeLayout';
import { LandscapeProgress } from './LandscapeProgress';
import { LandscapeTouchSurface } from './LandscapeTouchSurface';

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
 * mock (see `homeLayout.ts`, where each number is written as mock pixels).
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
  const { s } = m;
  const h = HOME_LAYOUT.hero;
  const resolvedCtaTestID = ctaTestID ?? (testID ? `${testID}-cta` : undefined);
  const panelHeight = s(h.height);
  // The mock's returning card is a fixed stack; the fresh welcome has longer
  // copy and no progress row, so its subtitle may take two lines.
  const roomy = progress === undefined;
  // Title shrinks (down to `TITLE_FLOOR` of the mock size) rather than spilling
  // out of the card: "רגשות" keeps the mock's 44 dp, "צבעים וצורות" does not.
  const titleRoom =
    s(h.copyWidth) - (titleMark ? s(h.titleStarSize) + s(h.titleGap) : 0) - s(h.titleGroupShift);
  const titleSize = fitTextSize(title, s(h.titleSize), titleRoom, TITLE_FLOOR);

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
        testID={testID ? `${testID}-panel` : undefined}
        style={[
          styles.panel,
          shadowFloating,
          {
            width: s(h.width),
            height: panelHeight,
            borderRadius: s(h.radius),
            paddingInlineStart: s(h.padInlineStart),
            paddingInlineEnd: s(h.padInlineEnd),
            gap: s(h.columnGap),
          },
        ]}
      >
        {thumbnail ? (
          <View
            testID={testID ? `${testID}-thumb` : undefined}
            style={[
              styles.thumbFrame,
              shadowSm,
              {
                width: s(h.thumbWidth),
                height: s(h.thumbHeight),
                marginTop: s(h.thumbTop),
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

        <View
          style={[
            styles.copyCol,
            {
              width: s(h.copyWidth),
              marginTop: s(h.padTop),
              height: s(h.height - h.padTop - h.padBottom),
              // The returning card is a fixed stack drawn top-down; the fresh
              // welcome (no eyebrow / progress) is centred in the same space.
              justifyContent: progress !== undefined ? 'flex-start' : 'center',
            },
          ]}
        >
          <View
            style={{
              width: s(h.textBlockWidth),
              marginInlineStart: s(h.textBlockInset),
              alignItems: 'center',
            }}
          >
            {eyebrow ? (
              <TalkiText
                weight="bold"
                align="center"
                color={homeMock.ink}
                style={{
                  fontFamily: fontFamily.heading.extrabold,
                  fontSize: s(h.eyebrowSize),
                  lineHeight: s(h.eyebrowBox),
                  height: s(h.eyebrowBox),
                  marginTop: -s(h.eyebrowLift),
                  // Centred text: end padding (physical left in RTL) nudges it right.
                  paddingInlineEnd: s(h.eyebrowShift),
                }}
              >
                {eyebrow}
              </TalkiText>
            ) : null}

            <View
              style={[
                styles.titleRow,
                { marginTop: s(h.gapEyebrowTitle), height: s(h.titleRow), gap: s(h.titleGap), paddingInlineEnd: s(h.titleGroupShift) },
              ]}
            >
              {titleMark ? (
                // The mark's artwork has transparent padding, so it is drawn in a
                // larger box centred on a slot of the mock's *visible* size.
                <View style={{ width: s(h.titleStarSize), height: s(h.titleStarSize) }}>
                  <Image
                    source={titleMark}
                    accessibilityIgnoresInvertColors
                    style={{
                      position: 'absolute',
                      width: s(h.titleStarBox),
                      height: s(h.titleStarBox),
                      top: (s(h.titleStarSize) - s(h.titleStarBox)) / 2,
                      insetInlineStart: (s(h.titleStarSize) - s(h.titleStarBox)) / 2,
                    }}
                    resizeMode="contain"
                  />
                </View>
              ) : null}
              <TalkiText
                weight="extrabold"
                align="center"
                color={homeMock.ink}
                numberOfLines={1}
                style={{
                  fontFamily: fontFamily.heading.bold,
                  fontSize: titleSize,
                  lineHeight: titleSize * 1.2,
                  marginTop: s(h.titleTextDrop),
                }}
              >
                {title}
              </TalkiText>
            </View>

            {subtitle ? (
              <TalkiText
                weight="bold"
                align="center"
                color={homeMock.ink}
                numberOfLines={roomy ? 2 : 1}
                style={{
                  fontFamily: fontFamily.heading.extrabold,
                  marginTop: s(h.gapTitleSubtitle),
                  fontSize: s(h.subtitleSize),
                  lineHeight: s(h.subtitleBox),
                  // One fixed line in the mock's stack; up to two when roomy.
                  height: roomy ? undefined : s(h.subtitleBox),
                  // Start padding (physical right in RTL) nudges it left.
                  paddingInlineStart: s(h.subtitleShift),
                }}
              >
                {subtitle}
              </TalkiText>
            ) : null}
          </View>

          {progress !== undefined ? (
            <LandscapeProgress
              value={progress}
              label={progressLabel}
              layout="inline"
              height={s(h.progressTrackHeight)}
              pillHeight={s(h.progressPillHeight)}
              pillWidth={s(h.progressPillWidth)}
              padCount={s(h.progressPadCount)}
              padTrack={s(h.progressPadTrack)}
              gap={s(h.progressGap)}
              labelSize={s(h.progressLabelSize)}
              style={{ marginTop: s(h.gapSubtitleProgress), alignSelf: 'flex-start', marginInlineStart: s(h.progressPillInset) }}
            />
          ) : null}

          {children}

          {ctaLabel ? (
            <View style={{ marginTop: s(h.gapProgressCta) }}>
              <LandscapeTouchSurface
                testID={resolvedCtaTestID}
                accessibilityLabel={ctaLabel}
                onPress={onCtaPress}
                width={s(h.copyWidth)}
                height={s(h.ctaHeight)}
                borderRadius={s(h.ctaHeight) / 2}
                // The disc sits 2 px in from the rim at top/bottom but ~4.5 px in
                // at its own end: padding on the disc's side of the row.
                surfaceStyle={[styles.cta, shadowCard, { paddingInlineEnd: s(h.ctaPlayInset) }]}
              >
                <LinearGradient
                  colors={[homeMock.ctaTop, homeMock.ctaBottom]}
                  style={StyleSheet.absoluteFill}
                />
                <View pointerEvents="none" style={[styles.ctaGloss, { height: s(1.2), insetInline: s(22) }]} />
                <TalkiText
                  weight="extrabold"
                  align="center"
                  color="#fff"
                  numberOfLines={1}
                  style={[
                    styles.ctaLabel,
                    {
                      fontFamily: fontFamily.heading.medium,
                      fontSize: s(h.ctaLabelSize),
                      lineHeight: s(h.ctaLabelSize * 1.3),
                      // The mock sits the label slightly left of the free space
                      // between the disc and the CTA's end (start padding =
                      // physical right in RTL).
                      paddingInlineStart: s(h.ctaLabelShift),
                      paddingTop: s(h.ctaLabelDrop),
                    },
                  ]}
                >
                  {ctaLabel}
                </TalkiText>
                <View
                  style={[
                    styles.ctaIconWrap,
                    shadowSm,
                    {
                      width: s(h.ctaPlaySize),
                      height: s(h.ctaPlaySize),
                      borderRadius: s(h.ctaPlaySize) / 2,
                    },
                  ]}
                >
                  <PlayTriangle size={s(h.ctaPlaySize) * 0.4} />
                </View>
              </LandscapeTouchSurface>
            </View>
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
        borderLeftColor: homeMock.play,
        borderTopWidth: size * 0.6,
        borderTopColor: 'transparent',
        borderBottomWidth: size * 0.6,
        borderBottomColor: 'transparent',
        marginInlineStart: size * 0.22,
      }}
    />
  );
}

/** Mean advance of Rubik Bold's Hebrew, in em (measured off "רגשות" at 44 dp). */
const TITLE_ADVANCE = 0.56;
/** Smallest a long hero title may shrink to, as a fraction of the mock size. */
const TITLE_FLOOR = 0.45;

/**
 * Largest size at which `text` still fits one line of `room` dp.
 * `adjustsFontSizeToFit` is native-only (react-native-web ignores it), so the
 * fit is derived arithmetically and works on every platform.
 */
function fitTextSize(text: string, base: number, room: number, floor: number): number {
  if (room <= 0) return base;
  const needed = room / Math.max(1, text.length * TITLE_ADVANCE);
  return Math.max(base * floor, Math.min(base, needed));
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
    top: 0,
    insetInlineStart: 0,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: homeMock.surface,
    flexShrink: 0,
  },
  thumbFrame: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(60, 40, 110, 0.08)',
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
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    // Soft rim like the mock: a firm dark edge only along the bottom, a faint
    // one at the ends, and none on top where the gloss line sits.
    borderTopWidth: 0,
    borderBottomWidth: 1.6,
    borderStartWidth: 1,
    borderEndWidth: 1,
    borderColor: homeMock.ctaRimSide,
    borderBottomColor: homeMock.ctaRim,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  ctaGloss: {
    position: 'absolute',
    top: 1,
    borderRadius: 999,
    backgroundColor: homeMock.ctaHighlight,
    opacity: 0.4,
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
});
