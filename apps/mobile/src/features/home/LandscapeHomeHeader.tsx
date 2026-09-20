import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { brand, navIcons, practiceIcons, uiIcons } from '@/design-system/assets';
import { TalkiText } from '@/design-system/components';
import {
  HOME_LAYOUT,
  LandscapeTouchSurface,
  ProfileGlyph,
  homeMock,
  type HomeMetrics,
} from '@/design-system/landscape';
import { shadowCard } from '@/design-system/theme/shadows';
import { fontFamily } from '@/design-system/theme/typography';
import { useParentHold } from '@/features/shell/useParentHold';
import { testIds } from '@/testing/testIds';

export interface LandscapeHomeHeaderProps {
  metrics: HomeMetrics;
  points: number;
  musicOn: boolean;
  onToggleMusic: () => void;
  onPointsPress: () => void;
  onPracticePress: () => void;
  onGamesPress: () => void;
  onBrandLongPress?: () => void;
  onBrandShortPress?: () => void;
}

/**
 * Home's top chrome, laid out to the v3 mock rather than to the generic
 * `LandscapeTopBar` (which still serves Games / Practice / Rewards /
 * Parent). The mock's chrome is a fixed art-directed band: a points pill and
 * a profile button at the inline start, the Talki lockup centred and much
 * larger than the shared top bar's, and a music button at the inline end.
 *
 * Every button is drawn at the mock's size, which for the header is 43 dp
 * tall — under the 48 dp child touch floor — so each one goes through
 * `LandscapeTouchSurface`: the drawn surface matches the mock pixel for pixel
 * while the tappable box keeps the floor.
 *
 * Two controls the mock does not draw are kept here deliberately: the
 * Practice and Games hub entries. They are Home's only route to those hubs
 * (AGENTS.md non-negotiable 6 — never drop a feature because a mock omits
 * it) and they keep `testIds.nav.sideStart` / `sideEnd`, so the navigation
 * contract every hub spec asserts is unchanged. They sit beside the music
 * button, the least loaded corner of the composition, drawn in the same
 * chrome so they read as part of one set.
 *
 * The brand lockup and the profile button share the 900 ms parent-gate hold
 * (`useParentHold`); a short tap on either raises the "long press" toast, so
 * adding the mock's profile button does not open a new ungated route into
 * the Parent Center.
 */
export function LandscapeHomeHeader({
  metrics,
  points,
  musicOn,
  onToggleMusic,
  onPointsPress,
  onPracticePress,
  onGamesPress,
  onBrandLongPress,
  onBrandShortPress,
}: LandscapeHomeHeaderProps) {
  const { s } = metrics;
  const h = HOME_LAYOUT.header;
  const brandHold = useParentHold(onBrandLongPress);
  const profileHold = useParentHold(onBrandLongPress);

  const height = s(h.height);
  const radius = s(h.radius);
  const gap = s(h.gap);
  const surface = [styles.surface, shadowCard];

  return (
    <>
      <View
        pointerEvents="box-none"
        style={[
          styles.band,
          {
            top: s(h.top),
            height,
            paddingInlineStart: s(h.padInlineStart),
            paddingInlineEnd: s(h.padInlineEnd),
          },
        ]}
      >
        {/* Inline start (physical right in Hebrew): reward pill, profile. */}
        <View style={[styles.group, { gap }]}>
          <LandscapeTouchSurface
            testID={testIds.nav.rewards}
            accessibilityLabel={`${points} נקודות שנצברו — פתח פרסים`}
            onPress={onPointsPress}
            width={s(h.pillWidth)}
            height={height}
            borderRadius={radius}
            surfaceStyle={[
              ...surface,
              styles.pill,
              // RTL row: the count is the first child and sits at the physical right.
              { paddingInlineStart: s(h.pillPadCount), paddingInlineEnd: s(h.pillPadStar), gap: s(h.pillGap) },
            ]}
          >
            {/* Mock order, left → right: star then count. In an RTL row the
                first child renders rightmost, so the count comes first. */}
            <TalkiText
              weight="extrabold"
              color={homeMock.ink}
              style={{
                fontFamily: fontFamily.body.extrabold,
                fontSize: s(h.pillTextSize),
                lineHeight: s(h.pillTextSize * 1.25),
                marginTop: s(h.pillTextDrop),
                writingDirection: 'ltr',
              }}
            >
              {points}
            </TalkiText>
            <Image
              source={uiIcons.star}
              style={{ width: s(h.pillStarSize), height: s(h.pillStarSize), margin: -s(h.pillStarSize) * 0.12 }}
              resizeMode="contain"
            />
          </LandscapeTouchSurface>

          <LandscapeTouchSurface
            testID="home-header-profile"
            accessibilityLabel="הורים והגדרות (לחיצה ארוכה)"
            onPressIn={(e) => profileHold.onPressIn(e.nativeEvent.pageX, e.nativeEvent.pageY)}
            onTouchMove={(e) => {
              const t = e.nativeEvent.touches[0];
              if (t) profileHold.onTouchMove(t.pageX, t.pageY);
            }}
            onPressOut={profileHold.onPressOut}
            onPress={() => {
              if (!profileHold.didFire()) onBrandShortPress?.();
            }}
            width={s(h.profileWidth)}
            height={height}
            borderRadius={radius}
            surfaceStyle={surface}
          >
            <View style={{ transform: [{ translateX: s(h.profileIconNudge.x) }, { translateY: s(h.profileIconNudge.y) }] }}>
              <ProfileGlyph size={s(h.profileIconSize)} />
            </View>
          </LandscapeTouchSurface>
        </View>

        {/* Inline end (physical left in Hebrew): hub entries, then music. */}
        <View style={[styles.group, { gap }]}>
          <HeaderIconButton
            testID={testIds.nav.sideEnd}
            icon={navIcons.games}
            label="משחקים"
            onPress={onGamesPress}
            width={s(h.musicWidth)}
            height={height}
            radius={radius}
            iconSize={s(h.musicIconSize)}
            nudge={{ x: s(h.musicIconNudge.x), y: s(h.musicIconNudge.y) }}
          />
          <HeaderIconButton
            testID={testIds.nav.sideStart}
            icon={practiceIcons.bubble}
            label="תרגול דיבור"
            onPress={onPracticePress}
            width={s(h.musicWidth)}
            height={height}
            radius={radius}
            iconSize={s(h.musicIconSize)}
            nudge={{ x: s(h.musicIconNudge.x), y: s(h.musicIconNudge.y) }}
          />
          <HeaderIconButton
            testID="topbar-music"
            icon={uiIcons.music}
            label={musicOn ? 'כבה מוזיקה' : 'הפעל מוזיקה'}
            onPress={onToggleMusic}
            width={s(h.musicWidth)}
            height={height}
            radius={radius}
            iconSize={s(h.musicIconSize)}
            nudge={{ x: s(h.musicIconNudge.x), y: s(h.musicIconNudge.y) }}
            dimmed={!musicOn}
          />
        </View>
      </View>

      <View pointerEvents="box-none" style={[styles.brandSlot, { top: s(h.logoTop) }]}>
        <LandscapeTouchSurface
          testID={testIds.parent.button}
          accessibilityLabel="מסך הורים (לחיצה ארוכה)"
          onPressIn={(e) => brandHold.onPressIn(e.nativeEvent.pageX, e.nativeEvent.pageY)}
          onTouchMove={(e) => {
            const t = e.nativeEvent.touches[0];
            if (t) brandHold.onTouchMove(t.pageX, t.pageY);
          }}
          onPressOut={brandHold.onPressOut}
          onPress={() => {
            if (!brandHold.didFire()) onBrandShortPress?.();
          }}
          // The lockup is also the parent gate, so its press box keeps the
          // 48 dp floor (AGENTS.md non-negotiable 16). Only the box grows —
          // the artwork inside stays at the asset's true aspect and centres,
          // so the wordmark is never letterboxed or stretched.
          width={s(h.logoWidth)}
          height={s(h.logoWidth) / LOGO_ASPECT}
        >
          <View testID="topbar-brand" pointerEvents="none" style={styles.fill}>
            <Image source={brand.logoMark} style={styles.fill} resizeMode="contain" />
          </View>
        </LandscapeTouchSurface>
      </View>
    </>
  );
}

/** `talki-logo-mark.png` is 440 × 136 with no transparent padding. */
const LOGO_ASPECT = 440 / 136;

function HeaderIconButton({
  testID,
  icon,
  label,
  onPress,
  width,
  height,
  radius,
  iconSize,
  nudge,
  dimmed = false,
}: {
  testID: string;
  icon: ImageSourcePropType;
  label: string;
  onPress: () => void;
  width: number;
  height: number;
  radius: number;
  iconSize: number;
  /** Physical dp offset of the glyph inside its button (the mock's art is not centred). */
  nudge: { x: number; y: number };
  dimmed?: boolean;
}) {
  return (
    <LandscapeTouchSurface
      testID={testID}
      accessibilityLabel={label}
      onPress={onPress}
      width={width}
      height={height}
      borderRadius={radius}
      surfaceStyle={[styles.surface, shadowCard]}
    >
      <Image
        source={icon}
        style={{
          width: iconSize,
          height: iconSize,
          opacity: dimmed ? 0.45 : 1,
          transform: [{ translateX: nudge.x }, { translateY: nudge.y }],
        }}
        resizeMode="contain"
      />
    </LandscapeTouchSurface>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    insetInlineStart: 0,
    insetInlineEnd: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 30,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  surface: {
    backgroundColor: homeMock.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
  },
  brandSlot: {
    position: 'absolute',
    insetInlineStart: 0,
    insetInlineEnd: 0,
    alignItems: 'center',
    zIndex: 25,
  },
  fill: {
    width: '100%',
    height: '100%',
  },
});
