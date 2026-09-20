import { StyleSheet, View } from 'react-native';

import { isRTL } from '../rtl/logical';
import { homeMock } from './homeColors';

export interface ProfileGlyphProps {
  /** Glyph box edge, in dp. Every part is derived from it. */
  size: number;
  color?: string;
}

/**
 * The v3 Home mock's parent/settings mark: a deep-indigo outline person with
 * a small solid gear badge at the lower right.
 *
 * Drawn from real views rather than shipped as a raster because no such
 * asset exists in `assets/v2|v3` (the nearest, `uiIcons.settings`, is a
 * solid blue gear with no figure) and AGENTS.md non-negotiable 18 wants
 * interactive chrome to stay real components. Every measurement is a
 * fraction of `size` (proportions read off the mock's 52 × 54 px glyph), so
 * it stays crisp at any `HomeMetrics` scale.
 */
export function ProfileGlyph({ size, color = homeMock.glyph }: ProfileGlyphProps) {
  const stroke = Math.max(1.5, size * 0.085);
  const head = size * 0.44;
  const shoulderW = size * 0.78;
  const shoulderH = size * 0.4;
  const gear = size * 0.42;
  const tooth = gear * 0.2;
  const hub = gear * 0.62;
  const hole = gear * 0.26;

  // A drawing, not text: parts are placed by physical offset from the left so
  // the gear always sits at the lower right, whatever the locale. (react-native-web
  // resolves logical insets from its own locale, so a CSS `direction` cannot pin this.)
  // The mock's figure sits ~0.11 of its width right of the box's left edge.
  const fromLeft = (x: number) => {
    const at = x + size * 0.11;
    return isRTL() ? { insetInlineEnd: at } : { insetInlineStart: at };
  };

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.abs,
          {
            width: head,
            height: head,
            borderRadius: head / 2,
            borderWidth: stroke,
            borderColor: color,
            ...fromLeft(size * 0.2),
            top: 0,
          },
        ]}
      />
      <View
        style={[
          styles.abs,
          {
            width: shoulderW,
            height: shoulderH,
            borderTopStartRadius: shoulderW / 2,
            borderTopEndRadius: shoulderW / 2,
            borderWidth: stroke,
            borderBottomWidth: 0,
            borderColor: color,
            ...fromLeft(0),
            top: size * 0.5,
          },
        ]}
      />
      {/* Gear badge, mock-placed at the figure's lower right. A white halo
          cuts the shoulder arc where the two overlap, as the mock does. */}
      <View
        style={[
          styles.abs,
          styles.gear,
          {
            width: gear + stroke * 2,
            height: gear + stroke * 2,
            borderRadius: (gear + stroke * 2) / 2,
            ...fromLeft(size - gear - stroke * 2 + size * 0.02),
            top: size - gear - stroke * 2 + size * 0.02,
          },
        ]}
      >
        {GEAR_TEETH.map((rotate) => (
          <View
            key={rotate}
            style={[
              styles.abs,
              {
                width: tooth,
                height: gear,
                backgroundColor: color,
                borderRadius: tooth / 2,
                transform: [{ rotate: `${rotate}deg` }],
              },
            ]}
          />
        ))}
        <View
          style={{
            width: hub,
            height: hub,
            borderRadius: hub / 2,
            backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={{ width: hole, height: hole, borderRadius: hole / 2, backgroundColor: '#fff' }} />
        </View>
      </View>
    </View>
  );
}

const GEAR_TEETH = [0, 45, 90, 135];

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  gear: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
