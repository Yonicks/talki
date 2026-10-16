/**
 * Small drawn parts shared by the detail mocks: stat chip, cream card, lavender
 * action button and the heading/body type. All sizes are mock units; each takes
 * the unit scale from context so parents only pass mock numbers.
 */
/* eslint-disable no-restricted-syntax */
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { fontFamily } from '../../theme/typography';
import { useMockUnits } from './MockStage';
import { LANDSCAPE_MIN_TOUCH } from '../tokens';

function touchBox(left: number, top: number, width: number, height: number, u: number) {
  const w = Math.max(LANDSCAPE_MIN_TOUCH, width * u);
  const h = Math.max(LANDSCAPE_MIN_TOUCH, height * u);
  return { left: left * u - (w - width * u) / 2, top: top * u - (h - height * u) / 2, width: w, height: h };
}

export const mockInk = '#2B0E6B';

export interface MockTextProps {
  children: ReactNode;
  /** Font size in mock units. */
  size: number;
  weight?: 'regular' | 'bold' | 'extrabold';
  color?: string;
  align?: 'left' | 'center' | 'right';
  testID?: string;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
}

export function MockText({ children, size, weight = 'extrabold', color = mockInk, align = 'center', testID, numberOfLines, style }: MockTextProps) {
  const { u } = useMockUnits();
  return (
    <Text
      testID={testID}
      numberOfLines={numberOfLines}
      style={[{ fontFamily: fontFamily.body[weight], fontSize: size * u, lineHeight: size * 1.25 * u, color, textAlign: align, writingDirection: 'rtl' }, style]}
    >
      {children}
    </Text>
  );
}

export interface MockChipProps {
  label: string;
  left: number;
  top: number;
  width: number;
  height?: number;
  tint?: 'cream' | 'lavender';
  testID?: string;
  size?: number;
}

/** Rounded stat pill (question counter, score, streak). */
export function MockChip({ label, left, top, width, height = 62, tint = 'cream', testID, size = 31 }: MockChipProps) {
  const { u } = useMockUnits();
  return (
    <View
      testID={testID}
      style={[
        styles.chip,
        tint === 'lavender' ? styles.chipLavender : styles.chipCream,
        { position: 'absolute', left: left * u, top: top * u, width: width * u, height: height * u, borderRadius: (height / 2) * u },
      ]}
    >
      <Text numberOfLines={1} style={{ fontFamily: fontFamily.body.bold, fontSize: size * u, color: mockInk, writingDirection: 'rtl' }}>
        {label}
      </Text>
    </View>
  );
}

export interface MockCardProps {
  left: number;
  top: number;
  width: number;
  height: number;
  radius?: number;
  onPress?: () => void;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/** White-cream rounded card with a warm hairline rim (answer cards, tiles). */
export function MockCard({ left, top, width, height, radius = 32, onPress, testID, accessibilityLabel, style, children }: MockCardProps) {
  const { u } = useMockUnits();
  const box = [
    styles.card,
    { position: 'absolute' as const, left: left * u, top: top * u, width: width * u, height: height * u, borderRadius: radius * u, borderWidth: Math.max(1, 2.5 * u) },
    style,
  ];
  if (!onPress) {
    return (
      <View testID={testID} style={box}>
        {children}
      </View>
    );
  }
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={[box, touchBox(left, top, width, height, u)]}>
      {children}
    </Pressable>
  );
}

export interface MockActionProps {
  label: string;
  icon?: ImageSourcePropType;
  left: number;
  top: number;
  width: number;
  height: number;
  onPress: () => void;
  testID?: string;
  /** `side`: icon beside the label; `stack`: icon above it. */
  direction?: 'side' | 'stack';
  radius?: number;
  size?: number;
}

/** Lavender action button (replay sound / next). */
export function MockAction({ label, icon, left, top, width, height, onPress, testID, direction = 'side', radius = 32, size = 30 }: MockActionProps) {
  const { u } = useMockUnits();
  const iconSize = (direction === 'stack' ? 84 : 96) * u;
  const iconEl = icon ? <Image source={icon} style={{ width: iconSize, height: iconSize }} resizeMode="contain" /> : null;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.action,
        {
          position: 'absolute',
          ...touchBox(left, top, width, height, u),
          borderRadius: radius * u,
          borderWidth: Math.max(1, 2.5 * u),
          flexDirection: direction === 'stack' ? 'column' : 'row',
          gap: 8 * u,
        },
      ]}
    >
      {direction === 'stack' && iconEl}
      <Text style={{ fontFamily: fontFamily.body.extrabold, fontSize: size * u, color: mockInk, writingDirection: 'rtl' }}>{label}</Text>
      {direction === 'side' && iconEl}
    </Pressable>
  );
}

export interface MockPrimaryProps {
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  onPress: () => void;
  testID?: string;
  size?: number;
}

/** Filled purple call-to-action button (white label). */
export function MockPrimary({ label, left, top, width, height, onPress, testID, size = 46 }: MockPrimaryProps) {
  const { u } = useMockUnits();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.primary,
        { position: 'absolute', ...touchBox(left, top, width, height, u), borderRadius: Math.min(width, height) * 0.36 * u, borderWidth: Math.max(1, 3 * u) },
      ]}
    >
      <LinearGradient colors={['#9B5DF2', '#6A2DD1']} style={[StyleSheet.absoluteFill, { borderRadius: Math.min(width, height) * 0.36 * u }]} />
      <Text style={{ fontFamily: fontFamily.body.extrabold, fontSize: size * u, color: '#FFFFFF', writingDirection: 'rtl' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: '#7B3FE4',
    borderColor: '#A982F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4B1FA0',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  chip: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  chipCream: { backgroundColor: '#FFFBF1', borderColor: '#F0DDB0' },
  chipLavender: { backgroundColor: '#EFE6FB', borderColor: '#DCCBF3' },
  card: {
    backgroundColor: '#FFFCF4',
    borderColor: '#F3DDA4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8A6A1A',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  action: {
    backgroundColor: '#EFE5FC',
    borderColor: '#DCCBF3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B3FBF',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
});
