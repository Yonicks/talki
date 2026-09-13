import { StyleSheet, View } from 'react-native';

import { v3 } from '../theme/colors';

export interface ProfileGlyphProps {
  /** Glyph box edge, in dp. Every part is derived from it. */
  size: number;
  color?: string;
}

/**
 * The v3 Home mock's parent/settings mark: a purple outline person with a
 * small gear badge at the shoulder.
 *
 * Drawn from real views rather than shipped as a raster because no such
 * asset exists in `assets/v2|v3` (the nearest, `uiIcons.settings`, is a
 * solid blue gear with no figure) and AGENTS.md non-negotiable 18 wants
 * interactive chrome to stay real components. Every measurement is a
 * fraction of `size`, so it stays crisp at any `HomeMetrics` scale.
 */
export function ProfileGlyph({ size, color = v3.purple600 }: ProfileGlyphProps) {
  const stroke = Math.max(1.5, size * 0.085);
  const head = size * 0.36;
  const shoulders = size * 0.62;
  const gear = size * 0.4;
  const tooth = Math.max(1.5, gear * 0.17);

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <View
        style={{
          width: head,
          height: head,
          borderRadius: head / 2,
          borderWidth: stroke,
          borderColor: color,
          marginTop: size * 0.04,
        }}
      />
      <View
        style={{
          width: shoulders,
          height: shoulders * 0.52,
          borderTopLeftRadius: shoulders / 2,
          borderTopRightRadius: shoulders / 2,
          borderWidth: stroke,
          borderBottomWidth: 0,
          borderColor: color,
          marginTop: size * 0.06,
        }}
      />
      {/* Gear badge, mock-placed at the figure's inline end / lower corner. */}
      <View
        style={[
          styles.gear,
          {
            width: gear,
            height: gear,
            borderRadius: gear / 2,
            borderWidth: stroke,
            borderColor: color,
            backgroundColor: '#fff',
            insetInlineEnd: -size * 0.06,
          },
        ]}
      >
        {GEAR_TEETH.map((rotate) => (
          <View
            key={rotate}
            style={[
              styles.tooth,
              {
                width: tooth,
                height: gear + tooth * 2,
                backgroundColor: color,
                borderRadius: tooth / 2,
                transform: [{ rotate: `${rotate}deg` }],
              },
            ]}
          />
        ))}
        <View
          style={{
            width: gear * 0.34,
            height: gear * 0.34,
            borderRadius: gear * 0.17,
            backgroundColor: '#fff',
            borderWidth: Math.max(1, stroke * 0.7),
            borderColor: color,
          }}
        />
      </View>
    </View>
  );
}

const GEAR_TEETH = [0, 60, 120];

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  gear: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tooth: {
    position: 'absolute',
  },
});
