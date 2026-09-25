import { Image } from 'expo-image';
import { StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';

import {
  focalToContentPosition,
  landscapeBgFocalFor,
  landscapeBgZoomFor,
  type FocalPoint,
  type LandscapeWorldId,
} from './backgrounds';
import type { DeviceClass } from '../responsive/breakpoints';
import { physicalInline } from '../rtl/logical';

export interface LandscapeWorldBackgroundProps {
  source: ImageSourcePropType;
  world: LandscapeWorldId;
  deviceClass: DeviceClass;
  /** Override the registered focal point when a screen needs a custom crop. */
  focal?: FocalPoint;
  /** Override the registered zoom when a screen needs a tighter framing. */
  zoom?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Full-bleed world layer: cover crop, never stretch.
 *
 * Two controls, both registered per world in `backgrounds.ts`:
 *
 *  • **focal** — where the cover crop is anchored, applied through
 *    expo-image's `contentPosition`, so phone 16:9 and tablet 4:3 keep the
 *    story focus rather than dead-centring the frame.
 *  • **zoom** — how much tighter than cover the art is framed. The image box
 *    is `zoom×` the layer in both axes and then panned by the same focal
 *    fraction, which is algebraically the same as cropping a `1/zoom` window
 *    of the source at that focal point. Home needs it: the source art places
 *    its hero tree centre-frame, and the approved composition reads with the
 *    tree at the inline start and the castle at the end.
 *
 * Cover still does the fitting, so the art is never stretched (AGENTS.md
 * non-negotiable 17) — zoom only changes which part of it is on screen.
 */
export function LandscapeWorldBackground({
  source,
  world,
  deviceClass,
  focal,
  zoom,
  style,
  testID,
}: LandscapeWorldBackgroundProps) {
  const point = focal ?? landscapeBgFocalFor(world, deviceClass);
  const z = Math.max(1, zoom ?? landscapeBgZoomFor(world, deviceClass));
  const over = (z - 1) * 100;
  // Physical bitmap pan, not an RTL layout offset — the world does not
  // mirror with text direction. The box is `z × 100%` wide, so a left offset
  // of `-over·x` leaves a right offset of `-over·(1 − x)`.
  const pan = physicalInline(`${-over * point.x}%`, `${-over * (1 - point.x)}%`);
  return (
    <View testID={testID} pointerEvents="none" style={[styles.fill, style]}>
      <Image
        source={source}
        style={[
          styles.image,
          {
            width: `${z * 100}%`,
            height: `${z * 100}%`,
            insetInlineStart: pan.start as `${number}%`,
            top: `${-over * point.y}%`,
          },
        ]}
        contentFit="cover"
        contentPosition={focalToContentPosition(point)}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});
