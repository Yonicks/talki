import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { TalkiText } from '@/design-system/components';
import { shadowSm } from '@/design-system/theme/shadows';
import { v2, v3 } from '@/design-system/theme/colors';
import { fontFamily } from '@/design-system/theme/typography';
import { homeMock } from './homeColors';

export type LandscapeProgressLayout = 'below' | 'inline';

export interface LandscapeProgressProps {
  /** 0..1 */
  value: number;
  label?: string;
  /**
   * `below` (default) — the original landscape bar with its count under the
   * track, used by the category/word screens.
   * `inline` — the v3 Home hero treatment: a white pill holding the count at
   * the physical start and a recessed track filling the rest.
   */
  layout?: LandscapeProgressLayout;
  /** Track thickness (dp). Defaults to the historical 12. */
  height?: number;
  /** `inline` only — outer white pill height (dp). */
  pillHeight?: number;
  /** `inline` only — outer white pill width (dp); omit to fill the parent. */
  pillWidth?: number;
  /** `inline` only — padding (dp) left of the count / right of the track (the
   *  row is physically left-to-right, so these are not logical start/end). */
  padCount?: number;
  padTrack?: number;
  /** `inline` only — gap (dp) between the count and the track. */
  gap?: number;
  /** `inline` only — fixed width (dp) of the count's box; omit to size to the text. */
  labelWidth?: number;
  labelSize?: number;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Child-facing landscape progress bar — purple fill on a recessed track.
 *
 * The `inline` variant runs physically left-to-right even in Hebrew, because
 * that is what the approved v3 Home mock draws (count on the left, fill
 * growing rightwards). `row-reverse` is what pins both: under RTL it lays a
 * row out starting from the physical left. The count itself is a digit pair
 * that reads LTR regardless.
 */
export function LandscapeProgress({
  value,
  label,
  layout = 'below',
  height,
  pillHeight,
  pillWidth,
  padCount,
  padTrack,
  gap,
  labelWidth,
  labelSize,
  testID,
  style,
}: LandscapeProgressProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const trackHeight = height ?? 12;

  if (layout === 'inline') {
    return (
      <View
        testID={testID}
        style={[
          styles.pill,
          shadowSm,
          {
            height: pillHeight ?? trackHeight + 14,
            width: pillWidth,
            borderRadius: 999,
            // Row is physically LTR (row-reverse under RTL): the count side is
            // the physical left = inline end, the track side the right.
            paddingInlineEnd: padCount ?? trackHeight * 0.6,
            paddingInlineStart: padTrack ?? trackHeight * 0.6,
            gap: gap ?? trackHeight * 0.8,
          },
          style,
        ]}
      >
        {label ? (
          <TalkiText
            weight="extrabold"
            color={homeMock.ink}
            style={{
              fontFamily: fontFamily.heading.extrabold,
              fontSize: labelSize ?? 13,
              lineHeight: (labelSize ?? 13) * 1.3,
              width: labelWidth,
              writingDirection: 'ltr',
            }}
          >
            {label}
          </TalkiText>
        ) : null}
        <View
          style={[styles.track, styles.inlineTrack, { height: trackHeight }]}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
        >
          <LinearGradient
            colors={[homeMock.fillTop, homeMock.fillBottom]}
            style={[styles.fill, { width: `${clamped * 100}%` }]}
          />
        </View>
      </View>
    );
  }

  return (
    <View testID={testID} style={[styles.wrap, style]}>
      <View
        style={[styles.track, { height: trackHeight }]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      >
        <View style={[styles.fill, styles.flatFill, { width: `${clamped * 100}%` }]} />
      </View>
      {label ? (
        <TalkiText weight="bold" color={v3.textSecondary} style={styles.label}>
          {label}
        </TalkiText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  pill: {
    // Physical LTR: the mock's count sits on the left and the fill grows
    // rightwards — see the component doc block.
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  track: {
    borderRadius: 999,
    backgroundColor: v3.purple100,
    borderWidth: 1,
    borderColor: v2.line,
    overflow: 'hidden',
  },
  inlineTrack: {
    flex: 1,
    flexDirection: 'row-reverse',
    backgroundColor: homeMock.track,
    borderWidth: 0,
    borderTopWidth: 1,
    borderTopColor: homeMock.trackEdge,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  flatFill: { backgroundColor: v3.purple600 },
  label: { fontSize: 12, alignSelf: 'flex-end' },
});
