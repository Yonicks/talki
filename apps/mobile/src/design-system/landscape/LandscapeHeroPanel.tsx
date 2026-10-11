import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  Image,
  Text,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { brand } from '@/design-system/assets';
import { TalkiText } from '@/design-system/components';
import { shadowFloating, shadowSm } from '@/design-system/theme/shadows';
import { fontFamily } from '@/design-system/theme/typography';
import { heroCard, homeMock } from './homeColors';
import { HOME_LAYOUT, useHomeMetrics, type HomeMetrics } from './homeLayout';
import { LandscapeProgress } from './LandscapeProgress';
import { LandscapeTouchSurface } from './LandscapeTouchSurface';

export interface LandscapeHeroPanelProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  progress?: number;
  progressLabel?: string;
  /** Small caption under the progress bar naming the active category
   *  (e.g. "קטגוריית חיות"), real data from the caller — never shown when
   *  `progress` is omitted (the fresh/no-progress state has no category yet). */
  progressCaption?: string;
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
  progressCaption,
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
  // Explicit px, not `width: '100%'` + `aspectRatio: 1`: Yoga on Android
  // (Fabric) can skip the aspectRatio pass on first layout and collapse
  // the image to zero size, leaving only the `thumbnailBackground` cover
  // fill visible underneath (see `LandscapeCategoryCard`'s `imageSize`,
  // which hit the same bug first).
  // 0.8, not 1.0: the mock's cat sits well inside the frame with visible
  // lavender gradient around it, not filling it edge to edge.
  const thumbArtSize = (s(h.thumbWidth) - 2 * s(h.thumbFrame)) * 0.8;
  const borderWidth = s(BORDER_THICKNESS);
  const innerRadius = Math.max(0, s(h.radius) - borderWidth);

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

      {/* Layered halo behind the card — a wide, faint ambient wash and a
          tighter, slightly stronger ring closer to the rim. Plain
          translucent fills, not native blurred shadows (Android ignores
          `shadowColor`/blur radius entirely; see theme/shadows.ts). */}
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            backgroundColor: heroCard.glowAmbient,
            width: s(h.width) + s(GLOW_AMBIENT_SPREAD) * 2,
            height: panelHeight + s(GLOW_AMBIENT_SPREAD) * 2,
            borderRadius: s(h.radius) + s(GLOW_AMBIENT_SPREAD),
            top: -s(GLOW_AMBIENT_SPREAD),
            insetInlineStart: -s(GLOW_AMBIENT_SPREAD),
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            backgroundColor: heroCard.glowNear,
            width: s(h.width) + s(GLOW_NEAR_SPREAD) * 2,
            height: panelHeight + s(GLOW_NEAR_SPREAD) * 2,
            borderRadius: s(h.radius) + s(GLOW_NEAR_SPREAD),
            top: -s(GLOW_NEAR_SPREAD),
            insetInlineStart: -s(GLOW_NEAR_SPREAD),
          },
        ]}
      />

      {/* Gradient border frame: an outer pink→lavender→purple→cream
          LinearGradient padded out by `borderWidth`, with the actual card
          surface clipped inside it — a "gradient border" is not a React
          Native style primitive, so the border itself is drawn as a filled
          shape the inner content sits on top of. */}
      <LinearGradient
        testID={testID ? `${testID}-panel` : undefined}
        colors={[heroCard.borderA, heroCard.borderB, heroCard.borderC, heroCard.borderD]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.borderFrame,
          shadowFloating,
          {
            width: s(h.width),
            height: panelHeight,
            borderRadius: s(h.radius),
            padding: borderWidth,
            boxShadow: `0 ${s(4)}px ${s(12)}px rgba(114, 44, 115, 0.18)`,
          },
        ]}
      >
        <View
          style={[
            styles.panel,
            {
              borderRadius: innerRadius,
              paddingInlineStart: s(h.padInlineStart),
              paddingInlineEnd: s(h.padInlineEnd),
              gap: s(h.columnGap),
            },
          ]}
        >
          <LinearGradient
            colors={[heroCard.fillA, heroCard.fillB, heroCard.fillC, heroCard.fillD]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View pointerEvents="none" style={[styles.innerHighlight, { borderRadius: innerRadius }]} />

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
                <LinearGradient
                  colors={[heroCard.thumbA, heroCard.thumbB, heroCard.thumbC]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
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
                  style={{ width: thumbArtSize, height: thumbArtSize }}
                  resizeMode="contain"
                />
              </View>
              {/* Small category badge, overlapping the thumbnail's bottom-end
                  corner (physical bottom-right in RTL) like the mock's paw
                  tag — the brand star mark, not an invented per-category
                  glyph (AGENTS.md 19: no fabricated placeholder art). */}
              <View
                style={[
                  styles.thumbBadge,
                  shadowSm,
                  {
                    width: s(36),
                    height: s(36),
                    borderRadius: s(18),
                    bottom: s(3),
                    insetInlineStart: s(3),
                  },
                ]}
              >
                <Image
                  source={brand.starMark}
                  accessibilityIgnoresInvertColors
                  style={{ width: '62%', height: '62%' }}
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
                  fontFamily: fontFamily.heading.bold,
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
              gap={s(h.progressGap)}
              labelSize={s(h.progressLabelSize)}
              labelWidth={s(h.progressLabelWidth)}
              style={{ marginTop: s(h.gapSubtitleProgress), alignSelf: 'flex-start', marginInlineStart: s(h.progressPillInset) }}
            />
          ) : null}

          {progress !== undefined && progressCaption ? (
            <TalkiText
              weight="bold"
              align="end"
              color={homeMock.captionMuted}
              numberOfLines={1}
              style={{
                fontFamily: fontFamily.heading.bold,
                fontSize: s(11),
                lineHeight: s(15),
                marginTop: s(4),
                marginInlineStart: s(h.progressPillInset),
                alignSelf: 'flex-end',
                marginInlineEnd: s(h.copyWidth - h.progressPillWidth - h.progressPillInset),
              }}
            >
              {progressCaption}
            </TalkiText>
          ) : null}

          {children}

          {/* In-flow CTA: only the fresh/no-progress state renders it here
              (sized to the copy column). The returning state's CTA is wider
              than the copy column and not flush to its edges (pixel-measured
              off the reference), so it renders as a panel-level sibling
              below, positioned absolutely instead of flowing in this
              column. */}
          {ctaLabel && progress === undefined ? (
            <HeroCta
              h={h}
              s={s}
              ctaLabel={ctaLabel}
              onCtaPress={onCtaPress}
              testID={resolvedCtaTestID}
              width={s(h.copyWidth)}
              style={{ marginTop: s(h.gapProgressCta) }}
            />
          ) : null}
        </View>

        {/* Panel-level sibling of `copyCol` (not `row`-level): its
            `insetInlineEnd`/`top` are measured relative to the card itself,
            which is narrower than `row` (`row` also reserves space for the
            mascot) — positioning this outside the panel would offset it by
            that gap. */}
        {ctaLabel && progress !== undefined ? (
          <HeroCta
            h={h}
            s={s}
            ctaLabel={ctaLabel}
            onCtaPress={onCtaPress}
            testID={resolvedCtaTestID}
            width={s(h.ctaWidth)}
            style={{
              position: 'absolute',
              top: s(h.ctaTop),
              insetInlineEnd: s(h.ctaInsetEnd),
              zIndex: 4,
            }}
          />
        ) : null}
        </View>
      </LinearGradient>

      {/* Four-point highlights outside the card's clipping surface. */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.sparkleLayer]}>
        <CardSparkle size={s(22)} style={{ top: panelHeight - s(52), insetInlineStart: s(h.width) - s(48) }} />
        <CardSparkle size={s(24)} style={{ top: panelHeight - s(43), insetInlineStart: s(53) }} />
        <CardSparkle size={s(30)} style={{ top: -s(8), insetInlineStart: s(h.width) - s(18) }} />
      </View>
    </View>
  );
}

function CardSparkle({ size, style }: { size: number; style: StyleProp<ViewStyle> }) {
  return (
    <View accessible={false} style={[styles.sparkle, { width: size, height: size }, style]}>
      <View style={{ position: 'absolute', top: size * 0.32, insetInlineStart: size * 0.32, width: size * 0.36, height: size * 0.36, borderRadius: size, backgroundColor: 'rgba(255, 87, 38, 0.16)', boxShadow: `0 0 ${size * 0.3}px ${size * 0.12}px rgba(255, 71, 35, 0.55)` }} />
      <HeroGlyph glyph="sparkle" size={size} color="#FFB655" blur={size * 0.18} />
      <HeroGlyph glyph="sparkle" size={size} color="#FFB641" blur={size * 0.12} scale={0.85} />
      <HeroGlyph glyph="sparkle" size={size} color="#FFFDDD" blur={size * 0.065} scale={0.76} />
    </View>
  );
}

function HeroGlyph({ glyph, size, color, blur = 0, scale = 1 }: {
  glyph: 'play' | 'sparkle'; size: number; color: string; blur?: number; scale?: number;
}) {
  return <Text accessible={false} aria-hidden style={{ position: 'absolute', width: size, height: size, fontFamily: 'TalkiHeroIcons', fontSize: size, lineHeight: size, includeFontPadding: false, textAlign: 'center', color, transform: [{ scale }], textShadowColor: color, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: blur }}>{glyph === 'play' ? '\uE001' : '\uE002'}</Text>;
}

/**
 * The hero's premium CTA pill — halo rings, the two-layer gradient surface,
 * gloss and bottom-shadow overlays, the play disc. Factored out of
 * `LandscapeHeroPanel` so it can render at two different sizes/positions:
 * in-flow (sized to the copy column, fresh/no-progress state) or as an
 * absolutely-positioned panel sibling (wider, not flush to the copy
 * column — the returning state, pixel-measured off the reference).
 */
function HeroCta({
  h,
  s,
  ctaLabel,
  onCtaPress,
  testID,
  width,
  style,
}: {
  h: typeof HOME_LAYOUT.hero;
  s: HomeMetrics['s'];
  ctaLabel: string;
  onCtaPress?: () => void;
  testID?: string;
  width: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ borderRadius: s(h.ctaHeight) / 2, boxShadow: `0 ${s(2)}px ${s(7)}px rgba(222, 64, 228, 0.40)` }, style]}>
      {/* Outer pink halo, two rings (inner near-white, outer pink) — the
          "without it the button looks flat" glow. Sibling of the touch
          surface, not a shadow prop: Android drops `shadowColor` entirely
          (theme/shadows.ts), so a coloured glow has to be a plain painted
          ring to show up there. */}
      <View
        pointerEvents="none"
        style={[
          styles.ctaHalo,
          {
            backgroundColor: heroCard.ctaHaloOuter,
            width: width + s(CTA_HALO_OUTER) * 2,
            height: s(h.ctaHeight) + s(CTA_HALO_OUTER) * 2,
            borderRadius: (s(h.ctaHeight) + s(CTA_HALO_OUTER) * 2) / 2,
            top: -s(CTA_HALO_OUTER),
            insetInlineStart: -s(CTA_HALO_OUTER),
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.ctaHalo,
          {
            backgroundColor: heroCard.ctaHaloMid,
            width: width + s(CTA_HALO_INNER) * 2,
            height: s(h.ctaHeight) + s(CTA_HALO_INNER) * 2,
            borderRadius: (s(h.ctaHeight) + s(CTA_HALO_INNER) * 2) / 2,
            top: -s(CTA_HALO_INNER),
            insetInlineStart: -s(CTA_HALO_INNER),
          },
        ]}
      />
      <LandscapeTouchSurface
        testID={testID}
        accessibilityLabel={ctaLabel}
        onPress={onCtaPress}
        width={width}
        height={s(h.ctaHeight)}
        borderRadius={s(h.ctaHeight) / 2}
        pressedScale={0.97}
        // The disc sits 2 px in from the rim at top/bottom but ~4.5 px in
        // at its own end: padding on the disc's side of the row.
        surfaceStyle={[
          styles.cta,
          { gap: s(12), borderColor: heroCard.ctaHaloInner, borderWidth: s(1.5) },
        ]}
      >
        {/* Two separate gradient effects, stacked: a horizontal colour
            sweep for variation, then a vertical gloss overlay for the
            glossy, raised, three-dimensional look. */}
        <LinearGradient
          colors={[heroCard.ctaSweepA, heroCard.ctaSweepB, heroCard.ctaSweepC, heroCard.ctaSweepD, heroCard.ctaSweepE]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[heroCard.ctaGlossTop, heroCard.ctaGlossMid, 'transparent', heroCard.ctaGlossLow, heroCard.ctaGlossBottom]}
          locations={[0, 0.18, 0.38, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={[styles.ctaGloss, { height: s(1.2), insetInline: s(22) }]} />
        {/* Faint inset bottom shadow (spec: `inset 0 -4px 6px`) — no RN
            inset-shadow primitive, so a short vertical fade pinned to the
            bottom edge fakes it. */}
        <LinearGradient
          pointerEvents="none"
          colors={['transparent', heroCard.ctaGlossBottom]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.ctaBottomShadow, { height: s(h.ctaHeight) * 0.3 }]}
        />
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
            {
              width: s(h.ctaPlaySize),
              height: s(h.ctaPlaySize),
              borderRadius: s(h.ctaPlaySize) / 2,
            },
          ]}
        >
          <HeroGlyph glyph="play" size={s(h.ctaPlaySize)} color="#DCC8FF" blur={s(1.3)} />
          <HeroGlyph glyph="play" size={s(h.ctaPlaySize)} color="#FFFFFF" scale={0.9} />
        </View>
      </LandscapeTouchSurface>
    </View>
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

/** Flat (unscaled mock px) spread of the card's two outer glow rings. */
const GLOW_AMBIENT_SPREAD = 14;
const GLOW_NEAR_SPREAD = 7;
/** Flat (unscaled mock px) thickness of the gradient border frame. */
const BORDER_THICKNESS = 3.5;
/** Flat (unscaled mock px) spread of the CTA's two outer glow rings. */
const CTA_HALO_OUTER = 5;
const CTA_HALO_INNER = 2.5;

const styles = StyleSheet.create({
  row: {
    position: 'relative',
    flexShrink: 0,
  },
  mascot: {
    position: 'absolute',
    zIndex: 1,
  },
  borderFrame: {
    // The gradient border frame — absolutely positioned like the old flat
    // `panel` was; its `padding` (`borderWidth` in the render fn) is the
    // border thickness, with `panel` filling the rest.
    position: 'absolute',
    top: 0,
    insetInlineStart: 0,
    zIndex: 2,
  },
  panel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    zIndex: 1,
  },
  innerHighlight: {
    position: 'absolute',
    top: 1,
    bottom: 1,
    insetInlineStart: 1,
    insetInlineEnd: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
  },
  sparkleLayer: {
    // Painted above `borderFrame` (zIndex 2): a sibling layer, not a panel
    // child, so it must out-rank the card explicitly or the opaque surface
    // paints over it despite sitting at identical screen coordinates.
    zIndex: 3,
  },
  sparkle: {
    position: 'absolute',
  },
  thumbFrame: {
    backgroundColor: heroCard.thumbA,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    flexShrink: 0,
  },
  thumbClip: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbBadge: {
    position: 'absolute',
    backgroundColor: heroCard.badgeFill,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
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
  ctaHalo: {
    position: 'absolute',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ctaGloss: {
    position: 'absolute',
    top: 1,
    borderRadius: 999,
    backgroundColor: homeMock.ctaHighlight,
    opacity: 0.4,
  },
  ctaBottomShadow: {
    position: 'absolute',
    bottom: 0,
    insetInlineStart: 0,
    insetInlineEnd: 0,
  },
  ctaIconWrap: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ctaLabel: {
    flexShrink: 1,
  },
});
