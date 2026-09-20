import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent, type StyleProp, type ViewStyle } from 'react-native';

import { LANDSCAPE_MIN_TOUCH } from './tokens';

export interface LandscapeTouchSurfaceProps {
  /** Drawn size in dp — exactly what the mock shows, even below 48 dp. */
  width: number;
  height: number;
  borderRadius?: number;
  /** Extra style for the drawn surface (background, border, shadow, layout of children). */
  surfaceStyle?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  onPress?: (e: GestureResponderEvent) => void;
  onPressIn?: (e: GestureResponderEvent) => void;
  onPressOut?: (e: GestureResponderEvent) => void;
  onTouchMove?: (e: GestureResponderEvent) => void;
  children?: ReactNode;
}

/**
 * A control whose *drawn* size follows the mock while its *tappable* box never
 * drops under `LANDSCAPE_MIN_TOUCH` (AGENTS.md non-negotiable 16).
 *
 * The outer `Pressable` (carrying the `testID`, so the touch audits measure
 * it) is padded out to the floor on whichever axis is short; equal negative
 * margins give the slack back to layout, so neighbours are positioned as if
 * only the drawn surface existed. The surface never shifts: it is centred in
 * the box.
 */
export function LandscapeTouchSurface({
  width,
  height,
  borderRadius,
  surfaceStyle,
  testID,
  accessibilityLabel,
  onPress,
  onPressIn,
  onPressOut,
  onTouchMove,
  children,
}: LandscapeTouchSurfaceProps) {
  const boxW = Math.max(width, LANDSCAPE_MIN_TOUCH);
  const boxH = Math.max(height, LANDSCAPE_MIN_TOUCH);
  const slackX = (boxW - width) / 2;
  const slackY = (boxH - height) / 2;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchMove={onTouchMove}
      style={[
        styles.box,
        { width: boxW, height: boxH, marginHorizontal: -slackX, marginVertical: -slackY },
      ]}
    >
      {({ pressed }) => (
        <View
          style={[
            { width, height, borderRadius },
            surfaceStyle,
            pressed && styles.pressed,
          ]}
        >
          {children}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  pressed: { transform: [{ translateY: 2 }] },
});
