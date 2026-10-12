import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { TalkiButton, TalkiHeading, TalkiText } from '@/design-system/components';
import { v3 } from '@/design-system/theme/colors';
import { homeHref } from '@/domain/navigation/routes';
import { testIds } from '@/testing/testIds';

import { ParentGateScreen } from './ParentGateScreen';
import { ParentShell } from './ParentShell';
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

function TabPill({ id, label, on, onPress }: { id: TabId; label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      testID={testIds.parent.tab(id)}
      accessibilityRole="tab"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={({ pressed }) => [styles.tab, on && styles.tabOn, pressed && styles.tabPressed]}
    >
      <TalkiText weight={on ? 'extrabold' : 'semibold'} color={on ? v3.purple900 : v3.textPrimary} style={styles.tabLabel}>{label}</TalkiText>
    </Pressable>
  );
}

/**
 * Adult workspace: fixed header and tabs, with one bounded scrolling tab.
 * The parent route is ad-free so reading and forms use the full safe viewport.
 */
export function ParentScreen() {
  const { unlocked, unlock } = useParentLock();
  const [tab, setTab] = useState<TabId>('settings');
  const router = useRouter();

  if (!unlocked) {
    return <ParentGateScreen onUnlocked={unlock} />;
  }

  return (
    <ParentShell
      testID={testIds.parent.root}
      header={
        <View style={styles.header}>
          <TalkiHeading level={2}>מסך הורים</TalkiHeading>
          <TalkiButton
            testID={testIds.parent.gateBack}
            label="חזרה לילדים"
            variant="secondary"
            onPress={() => router.canGoBack() ? router.back() : router.replace(homeHref)}
          />
        </View>
      }
      tabs={
        <View style={styles.tabs}>
          {TABS.map(([id, label]) => (
            <TabPill key={id} id={id} label={label} on={tab === id} onPress={() => setTab(id)} />
          ))}
        </View>
      }
    >
        <View testID="parent-tab-content" style={styles.fill}>
          {tab === 'settings' ? <SettingsTab /> : null}
          {tab === 'record' ? <RecordTab /> : null}
          {tab === 'words' ? <WordsTab /> : null}
          {tab === 'report' ? <ReportTab /> : null}
          {tab === 'method' ? <MethodTab /> : null}
        </View>
    </ParentShell>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, minHeight: 0, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingInline: 20, paddingBlock: 8 },
  tabs: { flexDirection: 'row', gap: 8, paddingInline: 20, paddingBlockEnd: 8, borderBottomWidth: 1, borderBottomColor: v3.borderSoft },
  tab: { flex: 1, minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: v3.surface, borderWidth: 2, borderColor: v3.borderSoft, borderRadius: 14, paddingInline: 8 },
  tabLabel: { fontSize: 17, lineHeight: 24 },
  tabOn: { backgroundColor: v3.purple100, borderColor: v3.purple600 },
  tabPressed: { opacity: 0.8 },
});
