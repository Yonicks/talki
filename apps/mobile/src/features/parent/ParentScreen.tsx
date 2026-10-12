/* eslint-disable no-restricted-syntax -- mock-unit layout constants are physical canvas coordinates */
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { landscapeScenes } from '@/design-system/assets';
import { MockBox, MockHeader, MockStage, MockText, mockInk, useMockUnits } from '@/design-system/landscape';
import { fontFamily } from '@/design-system/theme/typography';
import { homeHref } from '@/domain/navigation/routes';
import { useProgressStore } from '@/state/progressStore';
import { useSettingsStore } from '@/state/settingsStore';
import { testIds } from '@/testing/testIds';

import { ParentGateScreen } from './ParentGateScreen';
import { MethodTab } from './tabs/MethodTab';
import { RecordTab } from './tabs/RecordTab';
import { ReportTab } from './tabs/ReportTab';
import { SettingsTab } from './tabs/SettingsTab';
import { WordsTab } from './tabs/WordsTab';
import { useParentLock } from './useParentLock';

const TABS = [
  ['settings', 'הגדרות'],
  ['record', 'הקלטות'],
  ['words', 'מילים שלי'],
  ['report', 'דוח'],
  ['method', 'השיטה'],
] as const;

type TabId = (typeof TABS)[number][0];

/** Parent Center composition in mock units (mock "ChatGPT Image …-2"); panel and card are baked into the scene. */
const CENTER = {
  title: { left: 693, top: 164, width: 300, height: 70 },
  back: { left: 1236, top: 178, width: 96, height: 48 },
  tabTop: 237,
  tabH: 73,
  tabs: [
    { left: 1195, width: 150 },
    { left: 1040, width: 145 },
    { left: 872, width: 158 },
    { left: 748, width: 114 },
    { left: 598, width: 140 },
  ],
  content: { left: 350, top: 345, width: 990, height: 352 },
} as const;

function TabPill({ id, label, on, spec, onPress }: { id: TabId; label: string; on: boolean; spec: { left: number; width: number }; onPress: () => void }) {
  const { u } = useMockUnits();
  return (
    <Pressable
      testID={testIds.parent.tab(id)}
      accessibilityRole="tab"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[
        styles.tab,
        on && styles.tabOn,
        {
          position: 'absolute',
          left: spec.left * u,
          top: CENTER.tabTop * u,
          width: spec.width * u,
          height: CENTER.tabH * u,
          borderRadius: 34 * u,
        },
      ]}
    >
      <Text style={{ fontFamily: on ? fontFamily.body.extrabold : fontFamily.body.regular, fontSize: 31 * u, color: mockInk, writingDirection: 'rtl' }}>{label}</Text>
    </Pressable>
  );
}

/**
 * Parent Center host, drawn to the mock. Gate -> unlocked tabs; one tab mounted at
 * a time. The tab content scrolls inside the cream card the scene paints.
 */
export function ParentScreen() {
  const { unlocked, unlock } = useParentLock();
  const [tab, setTab] = useState<TabId>('settings');
  const router = useRouter();
  const learned = useProgressStore((s) => s.learned);
  const { settings, toggleMusic } = useSettingsStore();

  if (!unlocked) {
    return <ParentGateScreen onUnlocked={unlock} />;
  }

  return (
    <MockStage testID={testIds.parent.root} withAd scene={landscapeScenes.parent}>
      <MockHeader
        points={learned.size}
        musicOn={settings.music}
        onToggleMusic={() => void toggleMusic()}
        onBack={() => router.back()}
        onHome={() => router.replace(homeHref)}
        testID="parent-center-header"
      />
      <MockBox {...CENTER.title} pointerEvents="none">
        <MockText size={52} color="#3B1A7C">
          מסך הורים
        </MockText>
      </MockBox>
      <MockBox testID={testIds.parent.gateBack} accessibilityLabel="חזרה" onPress={() => router.back()} {...CENTER.back} style={styles.center}>
        <MockText size={30} weight="regular" color="#3B1A7C">
          חזרה
        </MockText>
      </MockBox>
      {TABS.map(([id, label], i) => (
        <TabPill key={id} id={id} label={label} on={tab === id} spec={CENTER.tabs[i]!} onPress={() => setTab(id)} />
      ))}
      <MockBox {...CENTER.content}>
        <View style={styles.fill}>
          {tab === 'settings' ? <SettingsTab /> : null}
          {tab === 'record' ? <RecordTab /> : null}
          {tab === 'words' ? <WordsTab /> : null}
          {tab === 'report' ? <ReportTab /> : null}
          {tab === 'method' ? <MethodTab /> : null}
        </View>
      </MockBox>
    </MockStage>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, minHeight: 0 },
  center: { alignItems: 'center', justifyContent: 'center' },
  tab: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFBF1', borderWidth: 2, borderColor: '#EEDDB8' },
  tabOn: { backgroundColor: '#F1E8FF', borderColor: '#8A55EA', borderWidth: 3 },
});
