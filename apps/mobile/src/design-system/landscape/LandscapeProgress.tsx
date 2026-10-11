import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { TalkiText } from '@/design-system/components';
import { v2, v3 } from '@/design-system/theme/colors';
import { fontFamily } from '@/design-system/theme/typography';
import { heroCard, homeMock } from './homeColors';

export type LandscapeProgressLayout = 'below' | 'inline';

export interface LandscapeProgressProps {
  /** 0..1 */
  value: number;
  label?: string;
  /**
   * `below` (default) — the original landscape bar with its count under the
   * track, used by the category/word screens.
   * `inline` — the redesigned Home hero treatment: a bare recessed track
   * (no pill chrome) with the count as plain text after its physical end.
   */
  layout?: LandscapeProgressLayout;
  /** Track thickness (dp). Defaults to the historical 12. */
  height?: number;
  /** `inline` only — outer white pill height (dp). */
  pillHeight?: number;
  /** `inline` only — outer white pill width (dp); omit to fill the parent. */
  pillWidth?: number;
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
 * that is what the redesigned Home hero draws: track on the physical left
 * (fill growing rightwards), count after it on the physical right. Plain
 * `row` achieves this under forced RTL — a row's first child sits at the
 * physical *start* (right) under RTL, so the label (first in JSX) lands
 * right and the track (second) lands left. The count itself is a digit
 * pair that reads LTR regardless.
 */
export function LandscapeProgress({
  value,
  label,
  layout = 'below',
  height,
  pillHeight,
  pillWidth,
  gap,
  labelWidth,
  labelSize,
  testID,
  style,
}: LandscapeProgressProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const trackHeight = height ?? 12;
  const countSize = labelWidth && label
    ? Math.min(labelSize ?? 13, labelWidth / (label.length * 0.64))
    : labelSize ?? 13;

  if (layout === 'inline') {
    return (
      <View
        testID={testID}
        style={[
          styles.pill,
          {
            height: pillHeight ?? trackHeight + 14,
            width: pillWidth,
            gap: gap ?? trackHeight * 0.4,
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
              fontSize: countSize,
              lineHeight: countSize * 1.3,
              width: labelWidth,
              writingDirection: 'ltr',
            }}
          >
            {label}
          </TalkiText>
        ) : null}
        <View
          style={[styles.track, styles.inlineTrack, { height: trackHeight, flex: pillWidth ? 1 : undefined }]}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
        >
          <LinearGradient
            colors={[heroCard.trackTop, heroCard.trackBottom]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={[heroCard.fillGlossTop, heroCard.fillGlossMid, heroCard.fillGlossLow, heroCard.fillGlossBottom]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.fill, { width: `${clamped * 100}%` }]}
          />
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: 999, borderWidth: trackHeight * 0.095, borderColor: '#FFFFFF' }]} />
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
    // Plain `row`: under forced RTL a row's first child (the count) sits at
    // the physical start (right), so the track (second child) lands at the
    // physical left — see the component doc block. No background/shadow —
    // the redesigned card has no white pill chrome, just a bare track.
    flexDirection: 'row',
    alignItems: 'center',
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
    borderWidth: 0,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  flatFill: { backgroundColor: v3.purple600 },
  label: { fontSize: 12, alignSelf: 'flex-end' },
});
