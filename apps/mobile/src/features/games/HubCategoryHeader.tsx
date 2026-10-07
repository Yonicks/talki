import { ScrollView, StyleSheet, View } from 'react-native';

import { LandscapeTitle } from '@/design-system/landscape';
import { useLandscapeLayout } from '@/design-system/responsive/useLandscapeLayout';
import type { GameCatChips } from '@/domain/games/gameCatChips';
import type { CategoryId } from '@/domain/types';

import { GameCatChipRow } from './GameCatChipRow';

/** Keep category selection reachable without spending a separate card row. */
export function HubCategoryHeader({ title, subtitle, testID, chips, current, onSelect, testIDFactory }: {
  title: string;
  subtitle: string;
  testID: string;
  chips: GameCatChips | null;
  current: CategoryId | null;
  onSelect: (id: CategoryId) => void;
  testIDFactory?: (id: string) => string;
}) {
  const layout = useLandscapeLayout();
  const tablet = layout.deviceClass === 'tablet' || layout.deviceClass === 'largeTablet';
  return (
    <View style={[styles.header, tablet && styles.tablet]}>
      <LandscapeTitle
        testID={testID}
        title={title}
        subtitle={tablet ? subtitle : undefined}
        style={styles.title}
      />
      {chips ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories} contentContainerStyle={styles.categoryContent}>
          <GameCatChipRow chips={chips} current={current} onSelect={onSelect} nowrap testIDFactory={testIDFactory} />
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingInline: 12, minHeight: 48 },
  tablet: { gap: 24, paddingInline: 24 },
  title: { flexShrink: 0, maxWidth: '42%' },
  categories: { flex: 1, minWidth: 0, maxHeight: 48 },
  categoryContent: { alignItems: 'center', paddingInline: 2 },
});
