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

interface Btn { left: number; top: number; w: number; h: number; r: number }
export interface MockHeaderGeometry {
  music: Btn;
  logo: { left: number; top: number; w: number };
  back?: Btn;
  points: Btn;
  home?: Btn;
}

/** Detail mocks (1688 x 790 interior). */
export const MOCK_HEADER: MockHeaderGeometry = {
  music: { left: 38, top: 18, w: 98, h: 89, r: 28 },
  logo: { left: 708, top: 20, w: 263 },
  back: { left: 1299, top: 22, w: 80, h: 82, r: 26 },
  points: { left: 1393, top: 18, w: 146, h: 86, r: 40 },
  home: { left: 1554, top: 22, w: 95, h: 86, r: 28 },
};

/** Games hub mock (1730 x 785 interior). */
export const HEADER_GAMES: MockHeaderGeometry = {
  music: { left: 33, top: 17, w: 90, h: 86, r: 28 },
  logo: { left: 720, top: 28, w: 277 },
  points: { left: 1380, top: 25, w: 138, h: 83, r: 41 },
  home: { left: 1592, top: 18, w: 91, h: 92, r: 30 },
};

/** Practice hub mock (1609 x 816 interior). */
export const HEADER_PRACTICE: MockHeaderGeometry = {
  music: { left: 30, top: 20, w: 98, h: 94, r: 30 },
  logo: { left: 652, top: 38, w: 292 },
  points: { left: 1297, top: 33, w: 157, h: 75, r: 38 },
  home: { left: 1465, top: 31, w: 105, h: 79, r: 32 },
};

/** Rewards mock (1820 x 746 interior). */
export const HEADER_REWARDS: MockHeaderGeometry = {
  music: { left: 37, top: 16, w: 100, h: 95, r: 30 },
  logo: { left: 767, top: 20, w: 268 },
  points: { left: 1462, top: 20, w: 151, h: 84, r: 42 },
  home: { left: 1635, top: 13, w: 100, h: 97, r: 32 },
};

const INK = '#2A0F6E';

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
  geometry?: MockHeaderGeometry;
  /** testID of the points control (defaults to `${testID}-points`). */
  pointsTestID?: string;
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
  geometry = MOCK_HEADER,
  pointsTestID,
}: MockHeaderProps) {
  const { u } = useMockUnits();
  const hold = useParentHold(onBrandLongPress);
  const m = geometry;
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
          <Image source={uiIcons.music} style={{ width: 0.7 * Math.min(m.music.w, m.music.h) * u, height: 0.7 * Math.min(m.music.w, m.music.h) * u }} resizeMode="contain" />
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

      {onBack && m.back ? (
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
            <Image source={uiIcons.chevron} style={{ width: 0.32 * m.back.w * u, height: 0.49 * m.back.h * u }} resizeMode="contain" />
          </LandscapeTouchSurface>
        </View>
      ) : null}

      <View style={place(m.points.left, m.points.top)}>
        <LandscapeTouchSurface
          testID={pointsTestID ?? `${testID}-points`}
          accessibilityLabel={`${points} נקודות שנצברו${onPointsPress ? ' — פתח פרסים' : ''}`}
          onPress={onPointsPress}
          width={m.points.w * u}
          height={m.points.h * u}
          borderRadius={m.points.r * u}
          surfaceStyle={[...surface, styles.points, { gap: 0.12 * m.points.h * u }]}
        >
          <Image source={uiIcons.star} style={{ width: 0.58 * m.points.h * u, height: 0.58 * m.points.h * u }} resizeMode="contain" />
          <Text style={{ fontFamily: fontFamily.body.extrabold, fontSize: 0.4 * m.points.h * u, color: INK, writingDirection: 'ltr' }}>{points}</Text>
        </LandscapeTouchSurface>
      </View>

      {onHome && m.home ? (
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
            <Image source={homeGlyph} style={{ width: 0.46 * m.home.w * u, height: 0.45 * m.home.w * u }} resizeMode="contain" />
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
