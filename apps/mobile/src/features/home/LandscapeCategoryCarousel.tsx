import { useCallback, useRef } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import {
  brand,
  categoryArt,
  categoryCardBackgrounds,
  categoryIcons,
  uiIcons,
} from '@/design-system/assets';
import {
  HOME_LAYOUT,
  LandscapeCategoryCard,
  homeStripMetrics,
  type HomeMetrics,
} from '@/design-system/landscape';
import { forwardChevronRotation, isRTL } from '@/design-system/rtl/logical';
import { shadowCard } from '@/design-system/theme/shadows';
import type { CategoryId, TalkiCategory } from '@/domain/types';
import { plain } from '@/domain/vocabulary/niqqud';
import { testIds } from '@/testing/testIds';

export interface LandscapeCategoryCarouselProps {
  metrics: HomeMetrics;
  categories: TalkiCategory[];
  onOpen: (id: CategoryId) => void;
}

function categoryImage(id: CategoryId) {
  if (id === 'mine') return brand.starMark;
  return categoryArt[id] ?? categoryIcons[id];
}

/**
 * The v3 Home category carousel: one row of large illustrated cards flanked
 * by two circular chevron buttons, anchored to the bottom of the stage.
 *
 * Card width, height and gap come from `homeStripMetrics()`, which solves
 * them against the real stage width so the mock's eight cards fit any
 * landscape viewport without a measure-then-reflow pass (and therefore
 * without the ad-load layout shift a post-`onLayout` sizing pass would
 * cause).
 *
 * The row is still a real horizontal ScrollView, not a page swap, so every
 * category — including the synthetic `mine` — stays attached and reachable
 * by touch as well as by the arrows (AGENTS.md non-negotiable 21). The
 * arrows page by exactly the number of cards that fit.
 */
export function LandscapeCategoryCarousel({
  metrics,
  categories,
  onOpen,
}: LandscapeCategoryCarouselProps) {
  const { s } = metrics;
  const c = HOME_LAYOUT.strip;
  const strip = homeStripMetrics(metrics);
  const scroller = useRef<ScrollView>(null);
  const offset = useRef(0);
  // Horizontal scroll offsets are signed differently across RTL surfaces
  // (RTL Chrome counts leftwards from 0 as negative; native reports a
  // positive offset). Start from the platform's usual convention and flip
  // once if a page press produced no movement, so the arrows self-correct
  // instead of silently clamping at the edge.
  const endSign = useRef(Platform.OS === 'web' && isRTL() ? -1 : 1);

  const pageWidth = strip.perPage * (strip.cardWidth + strip.gap);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    offset.current = e.nativeEvent.contentOffset.x;
  }, []);

  const page = useCallback(
    (step: 1 | -1) => {
      const before = offset.current;
      const target = before + endSign.current * step * pageWidth;
      scroller.current?.scrollTo({ x: target, y: 0, animated: true });
      setTimeout(() => {
        if (Math.abs(offset.current - before) < 1) {
          endSign.current *= -1;
          scroller.current?.scrollTo({
            x: before + endSign.current * step * pageWidth,
            y: 0,
            animated: true,
          });
        }
      }, 400);
    },
    [pageWidth],
  );

  const arrow = {
    width: strip.arrowSize,
    height: strip.arrowSize,
    borderRadius: strip.arrowSize / 2,
  };
  const chevron = {
    height: s(c.chevronHeight),
    width: s(c.chevronHeight) * CHEVRON_ASPECT,
  };

  return (
    <View
      style={[
        styles.band,
        {
          top: strip.top,
          height: strip.cardHeight,
          gap: strip.arrowGap,
        },
      ]}
    >
      <CarouselArrow
        testID="home-categories-prev"
        label="הקטגוריות הקודמות"
        rotation={forwardChevronRotation()}
        box={arrow}
        chevron={chevron}
        lift={s(c.arrowLift)}
        nudge={(isRTL() ? 1 : -1) * s(c.chevronNudge)}
        onPress={() => page(-1)}
      />

      <View style={[styles.strip, { width: strip.stripWidth }]}>
        <ScrollView
          ref={scroller}
          testID={testIds.home.sectionCategories}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[styles.content, { gap: strip.gap }]}
        >
          {categories.map((cat, index) => (
            <LandscapeCategoryCard
              key={cat.id}
              testID={testIds.home.category(cat.id)}
              title={plain(cat.title)}
              image={categoryImage(cat.id)}
              background={categoryCardBackgrounds[index % categoryCardBackgrounds.length]}
              width={strip.cardWidth}
              height={strip.cardHeight}
              labelSize={s(c.labelSize)}
              onPress={() => onOpen(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      <CarouselArrow
        testID="home-categories-next"
        label="הקטגוריות הבאות"
        rotation={forwardChevronRotation() === '0deg' ? '180deg' : '0deg'}
        box={arrow}
        chevron={chevron}
        lift={s(c.arrowLift)}
        nudge={(isRTL() ? -1 : 1) * s(c.chevronNudge)}
        onPress={() => page(1)}
      />
    </View>
  );
}

/** `talki-chevron-left.png` is 162 × 256. */
const CHEVRON_ASPECT = 162 / 256;

function CarouselArrow({
  testID,
  label,
  rotation,
  box,
  chevron,
  lift,
  nudge,
  onPress,
}: {
  testID: string;
  label: string;
  rotation: string;
  box: { width: number; height: number; borderRadius: number };
  chevron: { width: number; height: number };
  /** dp the circle sits above the card row's centre line (the mock's). */
  lift: number;
  /** dp the chevron sits toward the physical right (negative = left): the mock
   *  offsets it in the direction it points, so it reads optically centred. */
  nudge: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.arrow, shadowCard, box, { top: -lift }, pressed && styles.pressed]}
    >
      <Image
        source={uiIcons.chevron}
        accessibilityIgnoresInvertColors
        style={[chevron, { transform: [{ translateX: nudge }, { rotate: rotation }] }]}
        resizeMode="contain"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    insetInlineStart: 0,
    insetInlineEnd: 0,
    flexDirection: 'row',
    alignItems: 'center',
    // Arrow · strip · arrow is one group, centred: on a wider phone the spare
    // width is calm margin on both sides, never a clipped extra card.
    justifyContent: 'center',
    zIndex: 30,
  },
  strip: {
    minWidth: 0,
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pressed: { transform: [{ translateY: 2 }] },
});
