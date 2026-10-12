/**
 * Detail-screen header drawn to the mock: music button at the physical left,
 * Talki lockup centred (the 900 ms parent-gate hold), back / points / home at
 * the physical right. Positions are mock units (see MockStage).
 */
/* eslint-disable no-restricted-syntax */
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { brand, brandAspect, uiIcons } from '../../assets';
import { shadowCard } from '../../theme/shadows';
import { fontFamily } from '../../theme/typography';
import { useParentHold } from '@/features/shell/useParentHold';
import { testIds } from '@/testing/testIds';

import { LandscapeTouchSurface } from '../LandscapeTouchSurface';
import { useMockUnits } from './MockStage';

const homeGlyph = require('../../../../assets/v3/ui/talki-mock-home.png') as ImageSourcePropType;

export const MOCK_HEADER = {
  music: { left: 38, top: 18, w: 98, h: 89, r: 28 },
  logo: { left: 708, top: 20, w: 263 },
  back: { left: 1299, top: 22, w: 80, h: 82, r: 26 },
  points: { left: 1393, top: 18, w: 146, h: 86, r: 40 },
  home: { left: 1554, top: 22, w: 95, h: 86, r: 28 },
  ink: '#2A0F6E',
} as const;

export interface MockHeaderProps {
  points: number;
  musicOn: boolean;
  onToggleMusic: () => void;
  onBack?: () => void;
  onHome?: () => void;
  onPointsPress?: () => void;
  onBrandLongPress?: () => void;
  onBrandShortPress?: () => void;
  testID?: string;
  backTestID?: string;
}

export function MockHeader({
  points,
  musicOn,
  onToggleMusic,
  onBack,
  onHome,
  onPointsPress,
  onBrandLongPress,
  onBrandShortPress,
  testID = 'mock-header',
  backTestID,
}: MockHeaderProps) {
  const { u } = useMockUnits();
  const hold = useParentHold(onBrandLongPress);
  const m = MOCK_HEADER;
  const surface = [styles.surface, shadowCard];
  const place = (left: number, top: number) => ({ position: 'absolute' as const, left: left * u, top: top * u });

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill} testID={testID}>
      <View style={place(m.music.left, m.music.top)}>
        <LandscapeTouchSurface
          testID="topbar-music"
          accessibilityLabel={musicOn ? 'כבה מוזיקה' : 'הפעל מוזיקה'}
          onPress={onToggleMusic}
          width={m.music.w * u}
          height={m.music.h * u}
          borderRadius={m.music.r * u}
          surfaceStyle={[...surface, styles.center, !musicOn && styles.dim]}
        >
          <Image source={uiIcons.music} style={{ width: 62 * u, height: 62 * u }} resizeMode="contain" />
        </LandscapeTouchSurface>
      </View>

      <View style={place(m.logo.left, m.logo.top)}>
        <LandscapeTouchSurface
          testID={testIds.parent.button}
          accessibilityLabel="מסך הורים (לחיצה ארוכה)"
          onPressIn={(e) => hold.onPressIn(e.nativeEvent.pageX, e.nativeEvent.pageY)}
          onTouchMove={(e) => {
            const t = e.nativeEvent.touches[0];
            if (t) hold.onTouchMove(t.pageX, t.pageY);
          }}
          onPressOut={hold.onPressOut}
          onPress={() => {
            if (!hold.didFire()) onBrandShortPress?.();
          }}
          width={m.logo.w * u}
          height={(m.logo.w / brandAspect.lockup) * u}
        >
          <View testID="topbar-brand" pointerEvents="none" style={styles.fill}>
            <Image source={brand.logoMark} style={styles.fill} resizeMode="contain" />
          </View>
        </LandscapeTouchSurface>
      </View>

      {onBack ? (
        <View style={place(m.back.left, m.back.top)}>
          <LandscapeTouchSurface
            testID={backTestID ?? testIds.game.headerBack}
            accessibilityLabel="חזרה"
            onPress={onBack}
            width={m.back.w * u}
            height={m.back.h * u}
            borderRadius={m.back.r * u}
            surfaceStyle={[...surface, styles.center]}
          >
            <Image source={uiIcons.chevron} style={{ width: 26 * u, height: 40 * u }} resizeMode="contain" />
          </LandscapeTouchSurface>
        </View>
      ) : null}

      <View style={place(m.points.left, m.points.top)}>
        <LandscapeTouchSurface
          testID={`${testID}-points`}
          accessibilityLabel={`${points} נקודות שנצברו${onPointsPress ? ' — פתח פרסים' : ''}`}
          onPress={onPointsPress}
          width={m.points.w * u}
          height={m.points.h * u}
          borderRadius={m.points.r * u}
          surfaceStyle={[...surface, styles.points, { gap: 10 * u }]}
        >
          <Image source={uiIcons.star} style={{ width: 48 * u, height: 48 * u }} resizeMode="contain" />
          <Text style={{ fontFamily: fontFamily.body.extrabold, fontSize: 32 * u, color: m.ink, writingDirection: 'ltr' }}>{points}</Text>
        </LandscapeTouchSurface>
      </View>

      {onHome ? (
        <View style={place(m.home.left, m.home.top)}>
          <LandscapeTouchSurface
            testID="mock-header-home"
            accessibilityLabel="חזרה לדף הבית"
            onPress={onHome}
            width={m.home.w * u}
            height={m.home.h * u}
            borderRadius={m.home.r * u}
            surfaceStyle={[...surface, styles.center]}
          >
            <Image source={homeGlyph} style={{ width: 44 * u, height: 43 * u }} resizeMode="contain" />
          </LandscapeTouchSurface>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  surface: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(120, 90, 170, 0.12)' },
  center: { alignItems: 'center', justifyContent: 'center' },
  dim: { opacity: 0.6 },
  points: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
