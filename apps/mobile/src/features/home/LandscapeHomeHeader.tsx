import { Image, Pressable, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { brand, navIcons, practiceIcons, uiIcons } from '@/design-system/assets';
import { HOME_LAYOUT, ProfileGlyph, type HomeMetrics } from '@/design-system/landscape';
import { TalkiText } from '@/design-system/components';
import { shadowCard } from '@/design-system/theme/shadows';
import { v3 } from '@/design-system/theme/colors';
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
 * Two controls the mock does not draw are kept here deliberately: the
 * Practice and Games hub entries. They are Home's only route to those hubs
 * (AGENTS.md non-negotiable 6 — never drop a feature because a mock omits
 * it) and they keep `testIds.nav.sideStart` / `sideEnd`, so the navigation
 * contract every hub spec asserts is unchanged. They sit beside the music
 * button, the least loaded corner of the composition.
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
  const { s, touch } = metrics;
  const h = HOME_LAYOUT.header;
  const brandHold = useParentHold(onBrandLongPress);
  const profileHold = useParentHold(onBrandLongPress);

  const buttonSize = {
    width: Math.max(touch(h.buttonWidth), touch(h.buttonHeight)),
    height: touch(h.buttonHeight),
    borderRadius: s(h.buttonRadius),
  };
  const iconSize = s(h.iconSize);
  const gap = s(h.gap);

  return (
    <>
      <View
        pointerEvents="box-none"
        style={[
          styles.band,
          { top: s(h.top), paddingInline: s(h.padInline), height: touch(h.buttonHeight) },
        ]}
      >
        {/* Inline start (physical right in Hebrew): reward pill, profile. */}
        <View style={[styles.group, { gap }]}>
          <Pressable
            testID={testIds.nav.rewards}
            onPress={onPointsPress}
            accessibilityRole="button"
            accessibilityLabel={`${points} נקודות שנצברו — פתח פרסים`}
            style={({ pressed }) => [
              styles.surface,
              shadowCard,
              styles.pill,
              buttonSize,
              { width: Math.max(touch(h.pillWidth), touch(h.buttonHeight)), gap: s(6) },
              pressed && styles.pressed,
            ]}
          >
            {/* Mock order, left → right: star then count. In an RTL row the
                first child renders rightmost, so the count comes first. */}
            <TalkiText
              weight="extrabold"
              color={v3.textPrimary}
              style={{ fontSize: s(h.pillTextSize), writingDirection: 'ltr' }}
            >
              {points}
            </TalkiText>
            <Image
              source={uiIcons.star}
              style={{ width: s(h.pillStarSize), height: s(h.pillStarSize) }}
              resizeMode="contain"
            />
          </Pressable>

          <Pressable
            testID="home-header-profile"
            accessibilityRole="button"
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
            style={({ pressed }) => [
              styles.surface,
              shadowCard,
              buttonSize,
              pressed && styles.pressed,
            ]}
          >
            <ProfileGlyph size={iconSize} />
          </Pressable>
        </View>

        {/* Inline end (physical left in Hebrew): hub entries, then music. */}
        <View style={[styles.group, { gap }]}>
          <HeaderIconButton
            testID={testIds.nav.sideEnd}
            icon={navIcons.games}
            label="משחקים"
            onPress={onGamesPress}
            box={buttonSize}
            iconSize={iconSize}
          />
          <HeaderIconButton
            testID={testIds.nav.sideStart}
            icon={practiceIcons.bubble}
            label="תרגול דיבור"
            onPress={onPracticePress}
            box={buttonSize}
            iconSize={iconSize}
          />
          <HeaderIconButton
            testID="topbar-music"
            icon={uiIcons.music}
            label={musicOn ? 'כבה מוזיקה' : 'הפעל מוזיקה'}
            onPress={onToggleMusic}
            box={buttonSize}
            iconSize={iconSize}
            active={musicOn}
          />
        </View>
      </View>

      <View pointerEvents="box-none" style={[styles.brandSlot, { top: s(h.logoTop) }]}>
        <Pressable
          testID={testIds.parent.button}
          accessibilityRole="button"
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
          style={{
            width: s(h.logoWidth),
            height: touch(h.logoWidth / LOGO_ASPECT),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            testID="topbar-brand"
            pointerEvents="none"
            style={{ width: s(h.logoWidth), height: s(h.logoWidth) / LOGO_ASPECT }}
          >
            <Image source={brand.logoMark} style={styles.fill} resizeMode="contain" />
          </View>
        </Pressable>
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
  box,
  iconSize,
  active = false,
}: {
  testID: string;
  icon: ImageSourcePropType;
  label: string;
  onPress: () => void;
  box: { width: number; height: number; borderRadius: number };
  iconSize: number;
  active?: boolean;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.surface,
        shadowCard,
        box,
        active && styles.active,
        pressed && styles.pressed,
      ]}
    >
      <Image source={icon} style={{ width: iconSize, height: iconSize }} resizeMode="contain" />
    </Pressable>
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
    backgroundColor: v3.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pill: {
    flexDirection: 'row',
  },
  active: {
    backgroundColor: v3.purple050,
  },
  pressed: {
    transform: [{ translateY: 2 }],
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
