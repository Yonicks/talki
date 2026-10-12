/* eslint-disable no-restricted-syntax -- mock-unit layout constants are physical canvas coordinates */
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ToastHost } from '@/components/shell';
import { landscapeScenes } from '@/design-system/assets';
import {
  HEADER_REWARDS,
  LandscapePageIndicator,
  MockBox,
  MockHeader,
  MockStage,
  MockText,
  mockInk,
  useMockUnits,
  type MockDesign,
} from '@/design-system/landscape';
import { fontFamily } from '@/design-system/theme/typography';
import { stickerImage } from '@/domain/rewards/stickerArt';
import { filterStickers, stickerCounter, stickerFilterKeys } from '@/domain/rewards/stickerFilters';
import { stickerUnlocked } from '@/domain/rewards/stickers';
import type { CategoryId } from '@/domain/types';
import { getCat } from '@/domain/vocabulary/allCats';
import { plain } from '@/domain/vocabulary/niqqud';
import { wordGridPages } from '@/domain/vocabulary/wordGridPages';
import { useGoBack } from '@/hooks/useGoBack';
import { useParentBrand } from '@/hooks/useParentBrand';
import { useProgressStore } from '@/state/progressStore';
import { useSettingsStore } from '@/state/settingsStore';
import { testIds } from '@/testing/testIds';

/** Rewards mock interior (1820 x 746) with its 90-unit test-ad band. */
const DESIGN: MockDesign = { w: 1820, h: 746, adH: 90 };

const REWARDS = {
  title: { left: 640, top: 130, width: 530, height: 66 },
  subtitle: { left: 700, top: 192, width: 410, height: 40 },
  counter: { left: 700, top: 228, width: 410, height: 34 },
  bar: { left: 635, top: 255, width: 545, height: 30 },
  filters: { left: 268, top: 296, width: 1282, height: 76 },
  grid: { left: 168, top: 400, width: 1480, height: 244 },
  tileW: 120,
  rows: [
    // Tile lefts (mock x - 45) and tops (mock y - 42), first sticker at the physical right.
    { top: 405, h: 108, lefts: [1517, 1380, 1245, 1113, 980, 847, 712, 583, 448, 310, 173] },
    { top: 528, h: 110, lefts: [1385, 1247, 1115, 980, 847, 715, 583, 447, 307, 173] },
  ],
} as const;

/** Sticker tiles per page: the mock's eleven + ten; the rest of the 24 sit on page two. */
const PAGE_SIZE = REWARDS.rows[0].lefts.length + REWARDS.rows[1].lefts.length;

function FilterChips({ active, onChange }: { active: 'all' | CategoryId; onChange: (key: 'all' | CategoryId) => void }) {
  const { u } = useMockUnits();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.chipRow}>
      {stickerFilterKeys().map((key) => {
        const label = key === 'all' ? 'הכל' : plain(getCat(key)?.title ?? key);
        const on = active === key;
        return (
          <Pressable
            key={key}
            testID={testIds.stickers.filter(key)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(key)}
            style={[
              styles.chip,
              on && styles.chipOn,
              { minHeight: 67 * u, paddingHorizontal: 40 * u, borderRadius: 34 * u, marginEnd: 15 * u },
            ]}
          >
            <Text style={{ fontFamily: fontFamily.body.bold, fontSize: 26 * u, color: mockInk, writingDirection: 'rtl' }}>{label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/**
 * Rewards / stickers, drawn to the Sticker Meadow mock: painted scene with the
 * panel baked in, live title, counter, progress bar, filter chips and a
 * twelve-by-two sticker tile grid. All 24 stickers fit one page; filters narrow it.
 */
export function StickersScreen() {
  const goBack = useGoBack();
  const { learned, custom } = useProgressStore();
  const { settings, toggleMusic } = useSettingsStore();
  const parent = useParentBrand();
  const [filter, setFilter] = useState<'all' | CategoryId>('all');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageScope, setPageScope] = useState(filter);

  const items = filterStickers(filter);
  const pages = useMemo(() => wordGridPages(items, PAGE_SIZE), [items]);

  if (pageScope !== filter) {
    setPageScope(filter);
    setPageIndex(0);
  }

  const safePage = Math.min(pageIndex, Math.max(0, pages.length - 1));
  const activePage = pages[safePage] ?? [];
  const baseIndex = safePage * PAGE_SIZE;
  const total = 24;
  const collected = Number.parseInt(stickerCounter(learned, custom), 10) || 0;
  const g = REWARDS;

  return (
    <MockStage testID={testIds.stickers.root} design={DESIGN} withAd scene={landscapeScenes.rewards}>
      <MockHeader
        geometry={HEADER_REWARDS}
        testID="landscape-rewards-topbar"
        points={learned.size}
        musicOn={settings.music}
        onToggleMusic={() => void toggleMusic()}
        backTestID={testIds.stickers.back}
        onHome={goBack}
        onBrandLongPress={parent.onBrandLongPress}
        onBrandShortPress={parent.onBrandShortPress}
      />
      <ToastHost message={parent.toast} onHide={parent.dismissToast} testID={testIds.parent.toast} />

      <MockBox {...g.title} pointerEvents="none">
        <MockText size={44} color="#2C0F6F">
          ⭐ המדבקות שלי ⭐
        </MockText>
      </MockBox>
      <MockBox {...g.subtitle} pointerEvents="none">
        <MockText size={29} weight="regular" color="#8D82A4">
          כל מילה חדשה — עוד מדבקה!
        </MockText>
      </MockBox>
      <MockBox {...g.counter} pointerEvents="none">
        <MockText size={26} weight="bold">
          <Text testID={testIds.stickers.counter}>{stickerCounter(learned, custom)}</Text>!
        </MockText>
      </MockBox>
      <MockBox {...g.bar} radius={15} style={styles.track} pointerEvents="none">
        <View style={[styles.fill, { width: `${Math.max(4, Math.min(100, (collected / total) * 100))}%` }]} />
      </MockBox>

      <MockBox {...g.filters} pointerEvents="box-none">
        <FilterChips active={filter} onChange={setFilter} />
      </MockBox>

      <MockBox {...g.grid} pointerEvents="box-none">
        <StickerTiles items={activePage} baseIndex={baseIndex} learned={learned} custom={custom} />
      </MockBox>
      {pages.length > 1 ? (
        <MockBox left={700} top={648} width={420} height={50} pointerEvents="box-none" style={styles.dots}>
          <LandscapePageIndicator
            testID={testIds.stickers.pageIndicator}
            pageCount={pages.length}
            activeIndex={safePage}
            onSelect={setPageIndex}
          />
        </MockBox>
      ) : null}
    </MockStage>
  );
}

function StickerTiles({
  items,
  baseIndex,
  learned,
  custom,
}: {
  items: ReturnType<typeof filterStickers>;
  baseIndex: number;
  learned: ReadonlySet<string>;
  custom: Parameters<typeof stickerUnlocked>[2];
}) {
  const { u } = useMockUnits();
  const g = REWARDS;
  return (
    <>
      {items.map((s, i) => {
        const index = baseIndex + i;
        const on = stickerUnlocked(s, learned, custom);
        const src = stickerImage(s);
        const row = i < g.rows[0].lefts.length ? 0 : 1;
        const col = row === 0 ? i : i - g.rows[0].lefts.length;
        const spec = g.rows[row]!;
        return (
          <View
            key={`${s.img}-${index}`}
            testID={testIds.stickers.item(index)}
            accessibilityRole="image"
            accessibilityState={{ disabled: !on }}
            accessibilityLabel={s.word ?? s.img}
            style={[
              styles.tile,
              on ? styles.tileOn : styles.tileOff,
              {
                // RTL reading order: the first sticker sits at the physical right.
                left: (spec.lefts[col]! - 168) * u,
                top: (spec.top - 400) * u,
                width: g.tileW * u,
                height: spec.h * u,
                borderRadius: 26 * u,
              },
            ]}
          >
            {src ? <Image source={src} style={{ width: 78 * u, height: 78 * u, opacity: on ? 1 : 0.55 }} resizeMode="contain" /> : null}
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  chipRow: { alignItems: 'center', flexDirection: 'row' },
  chip: {
    backgroundColor: '#FFFDF7',
    borderWidth: 1,
    borderColor: '#EFE3CF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipOn: { backgroundColor: '#EFE4FF', borderColor: '#7B3FE4', borderWidth: 3 },
  track: { backgroundColor: '#F3ECFA', borderWidth: 2, borderColor: '#E3D6F1', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#A77AF0', borderRadius: 15 },
  dots: { alignItems: 'center', justifyContent: 'center' },
  tile: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  tileOn: {
    backgroundColor: '#FFFBF3',
    borderColor: '#F3E3C4',
    shadowColor: '#8A6A1A',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  tileOff: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderStyle: 'dashed',
    opacity: 0.6,
  },
});
