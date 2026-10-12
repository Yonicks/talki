/**
 * Hub activity card drawn to the Games / Practice mocks: white rim with a soft
 * violet glow, full-bleed art, and a cream label plate along the bottom edge.
 */
/* eslint-disable no-restricted-syntax */
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { fontFamily } from '../../theme/typography';
import { mockInk } from './MockParts';
import { useMockUnits } from './MockStage';

export interface MockHubCardProps {
  left: number;
  top: number;
  width: number;
  height: number;
  title: string;
  image?: ImageSourcePropType;
  onPress: () => void;
  testID?: string;
  /** Plate insets inside the frame, in mock units. */
  plate?: { inStart: number; inEnd: number; bottom: number; height: number };
  radius?: number;
  titleSize?: number;
}

const DEFAULT_PLATE = { inStart: 32, inEnd: 37, bottom: 15, height: 58 };

export function MockHubCard({
  left,
  top,
  width,
  height,
  title,
  image,
  onPress,
  testID,
  plate = DEFAULT_PLATE,
  radius = 38,
  titleSize = 34,
}: MockHubCardProps) {
  const { u } = useMockUnits();
  const rim = Math.max(2, 7 * u);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.frame,
        {
          position: 'absolute',
          left: left * u,
          top: top * u,
          width: width * u,
          height: height * u,
          borderRadius: radius * u,
          borderWidth: rim,
          shadowRadius: 14 * u,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[StyleSheet.absoluteFill, { borderRadius: (radius - 6) * u, overflow: 'hidden' }]}>
        {image ? <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityIgnoresInvertColors /> : null}
      </View>
      <View
        style={[
          styles.plate,
          {
            left: (plate.inStart - 7) * u,
            right: (plate.inEnd - 7) * u,
            bottom: (plate.bottom - 7) * u,
            height: plate.height * u,
            borderRadius: (plate.height / 2) * u,
          },
        ]}
      >
        <Text numberOfLines={1} style={{ fontFamily: fontFamily.body.extrabold, fontSize: titleSize * u, color: mockInk, writingDirection: 'rtl' }}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F6EAFB',
    shadowColor: '#C77DF0',
    shadowOpacity: 0.65,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  pressed: { transform: [{ translateY: 2 }] },
  plate: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCF6EA',
    borderWidth: 1,
    borderColor: '#EFE2C6',
  },
});
