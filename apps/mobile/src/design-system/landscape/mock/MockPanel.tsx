/**
 * The cream storybook panel the detail mocks share: warm cream fill, thin gold
 * rim, soft lift. Sized and placed in mock units.
 */
/* eslint-disable no-restricted-syntax */
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { useMockUnits } from './MockStage';

export const mockPanel = {
  fill: '#FDF6E6',
  rim: '#E8C471',
  ink: '#2A0F6E',
} as const;

export interface MockBoxProps {
  left: number;
  top: number;
  width: number;
  height: number;
  radius?: number;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
  /** Makes the box a button. */
  onPress?: () => void;
  accessibilityLabel?: string;
}

/** Absolutely placed box in mock units. */
export function MockBox({ left, top, width, height, radius, children, style, testID, pointerEvents, onPress, accessibilityLabel }: MockBoxProps) {
  const { u } = useMockUnits();
  const Box = onPress ? Pressable : View;
  return (
    <Box
      testID={testID}
      pointerEvents={pointerEvents ?? (onPress ? 'auto' : 'box-none')}
      {...(onPress ? { onPress, accessibilityRole: 'button' as const, accessibilityLabel } : {})}
      style={[
        { position: 'absolute', left: left * u, top: top * u, width: width * u, height: height * u, borderRadius: radius ? radius * u : undefined },
        style,
      ]}
    >
      {children}
    </Box>
  );
}

export function MockPanel({ radius = 30, style, children, ...box }: MockBoxProps) {
  const { u } = useMockUnits();
  return (
    <MockBox
      {...box}
      radius={radius}
      style={[
        styles.panel,
        { borderWidth: Math.max(1.5, 7 * u), shadowOffset: { width: 0, height: 8 * u }, shadowRadius: 18 * u },
        style,
      ]}
    >
      {children}
    </MockBox>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: mockPanel.fill,
    borderColor: mockPanel.rim,
    shadowColor: '#6B4A12',
    shadowOpacity: 0.22,
    elevation: 6,
  },
});
