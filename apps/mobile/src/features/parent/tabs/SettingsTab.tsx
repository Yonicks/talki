import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TalkiButton, TalkiCard, TalkiText } from '@/design-system/components';
import { mockInk, useMockUnits } from '@/design-system/landscape';
import { fontFamily } from '@/design-system/theme/typography';
import { v3 } from '@/design-system/theme/colors';
import { RESET_CONFIRM_TEXT, RESET_DELETES_TEXT, RESET_KEEPS_TEXT } from '@/domain/parent/progressReset';
import { formatStorageInfo, readStorageInfo } from '@/services/storage/readStorageInfo';
import { audioEngine } from '@/services/audio';
import { useProgressStore } from '@/state/progressStore';
import { useSettingsStore } from '@/state/settingsStore';
import { testIds } from '@/testing/testIds';

import { BackupPanel } from '../components/BackupPanel';

const RATES = [
  { v: 0.6, label: 'איטי' },
  { v: 0.85, label: 'רגיל' },
  { v: 1, label: 'מהיר' },
] as const;
const VOLS = [
  { v: 0.25, label: 'שקט' },
  { v: 0.5, label: 'בינוני' },
  { v: 0.85, label: 'חזק' },
] as const;

const PRIVACY = 'https://yonicks.github.io/talki/privacy.html';

export function SettingsTab() {
  const { settings, patchSettings } = useSettingsStore();
  const resetProgress = useProgressStore((s) => s.resetProgress);
  const [confirming, setConfirming] = useState(false);
  const [storageLine, setStorageLine] = useState<string | null>(null);

  useEffect(() => {
    void readStorageInfo().then((info) => setStorageLine(formatStorageInfo(info)));
  }, []);

  const toggle = (key: 'niqqud' | 'sounds' | 'effects' | 'music' | 'voice') => {
    const next = !settings[key];
    void patchSettings({ [key]: next });
    if (key === 'music') audioEngine.setMusicEnabled(next);
    if (key === 'sounds') audioEngine.setSfxEnabled(next);
  };

  return (
    <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled" style={styles.fill}>
      <TalkiCard style={flatCard}>
        <View style={styles.topRow}>
          <View style={styles.seg}>
            {RATES.map((r) => (
              <Seg
                key={r.v}
                testID={testIds.parent.settingsRate(r.v)}
                label={r.label}
                on={settings.rate === r.v}
                onPress={() => void patchSettings({ rate: r.v })}
              />
            ))}
          </View>
          <View style={styles.headBlock}>
            <Heading>הקראה והצגה</Heading>
            <Sub>מהירות דיבור</Sub>
          </View>
        </View>
        <Toggle
          testID={testIds.parent.settingsNiqqud}
          label="ניקוד"
          on={settings.niqqud}
          onPress={() => toggle('niqqud')}
        />
        <Toggle
          testID={testIds.parent.settingsMusic}
          label="מוזיקת רקע"
          on={settings.music}
          onPress={() => toggle('music')}
        />
        <Sub>עוצמת המוזיקה</Sub>
        <View style={styles.seg}>
          {VOLS.map((r) => (
            <Seg
              key={r.v}
              testID={testIds.parent.settingsMusicVol(r.v)}
              label={r.label}
              on={settings.musicVol === r.v}
              onPress={() => {
                void patchSettings({ musicVol: r.v });
                audioEngine.setMusicVolumeMultiplier(r.v);
              }}
            />
          ))}
        </View>
        <Toggle
          testID={testIds.parent.settingsSounds}
          label="צלילי פידבק"
          on={settings.sounds}
          onPress={() => toggle('sounds')}
        />
        <Toggle
          testID={testIds.parent.settingsVoice}
          label="הוראות קוליות"
          on={settings.voice}
          onPress={() => toggle('voice')}
        />
        <Toggle
          testID={testIds.parent.settingsEffects}
          label="קונפטי ואנימציות"
          on={settings.effects}
          onPress={() => toggle('effects')}
        />
      </TalkiCard>

      <TalkiCard style={flatCard}>
        <BackupPanel />
      </TalkiCard>

      <TalkiCard style={flatCard}>
        <Heading>פרטיות</Heading>
        <TalkiText color={v3.textSecondary}>
          אין חשבון ואין שרת. מילים והקלטות נשארות במכשיר. בגרסת החנות מוצג באנר מודעות לילדים (לא מותאם אישית).
        </TalkiText>
        <TalkiButton label="מדיניות פרטיות" variant="ghost" onPress={() => void Linking.openURL(PRIVACY)} />
        {storageLine ? (
          <TalkiText testID={testIds.parent.settingsStorage} color={v3.textSecondary}>
            {storageLine}
          </TalkiText>
        ) : null}
      </TalkiCard>

      <TalkiCard style={flatCard}>
        <Heading>איפוס</Heading>
        <TalkiText color={v3.textSecondary}>מוחק מדבקות וסטטיסטיקות בלבד</TalkiText>
        {confirming ? (
          <View style={styles.confirm}>
            <TalkiText>{RESET_CONFIRM_TEXT}</TalkiText>
            <TalkiText>{RESET_DELETES_TEXT}</TalkiText>
            <TalkiText>{RESET_KEEPS_TEXT}</TalkiText>
            <TalkiButton
              testID={testIds.parent.settingsResetConfirm}
              label="אישור איפוס"
              onPress={() => {
                void resetProgress();
                setConfirming(false);
              }}
            />
          </View>
        ) : (
          <TalkiButton
            testID={testIds.parent.settingsReset}
            label="איפוס"
            variant="secondary"
            onPress={() => setConfirming(true)}
          />
        )}
      </TalkiCard>
    </ScrollView>
  );
}

function Heading({ children }: { children: string }) {
  const { u } = useMockUnits();
  return <Text style={{ fontFamily: fontFamily.body.extrabold, fontSize: 44 * u, color: mockInk, writingDirection: 'rtl', textAlign: 'left' }}>{children}</Text>;
}

function Sub({ children }: { children: string }) {
  const { u } = useMockUnits();
  return <Text style={{ fontFamily: fontFamily.body.extrabold, fontSize: 31 * u, color: mockInk, writingDirection: 'rtl', textAlign: 'left' }}>{children}</Text>;
}

function Seg({
  label,
  on,
  onPress,
  testID,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
  testID: string;
}) {
  const { u } = useMockUnits();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[styles.segBtn, on && styles.segOn, { minWidth: 120 * u, minHeight: 74 * u, borderRadius: 34 * u }]}
    >
      <Text style={{ fontFamily: on ? fontFamily.body.extrabold : fontFamily.body.regular, fontSize: 30 * u, color: mockInk, writingDirection: 'rtl' }}>{label}</Text>
    </Pressable>
  );
}

function Toggle({
  label,
  on,
  onPress,
  testID,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
  testID: string;
}) {
  const { u } = useMockUnits();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      onPress={onPress}
      style={[styles.toggle, { minHeight: 86 * u }]}
    >
      <Text style={{ fontFamily: fontFamily.body.extrabold, fontSize: 31 * u, color: mockInk, writingDirection: 'rtl' }}>{label}</Text>
      <View style={[styles.sw, on && styles.swOn, { width: 118 * u, height: 62 * u, borderRadius: 31 * u }]}>
        <View style={[styles.knob, { width: 52 * u, height: 52 * u, borderRadius: 26 * u }, on ? { start: 5 * u } : { end: 5 * u }]} />
      </View>
    </Pressable>
  );
}

/** Settings cards sit directly on the cream card the scene paints. */
const flatCard = { backgroundColor: 'transparent', borderWidth: 0, shadowOpacity: 0, elevation: 0 } as const;

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pad: { padding: 16, gap: 12, paddingBlockEnd: 32 },
  seg: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBlock: 8 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headBlock: { alignItems: 'flex-start' },
  segBtn: {
    minHeight: 48,
    paddingInline: 12,
    borderWidth: 2,
    borderColor: '#EEDDB8',
    backgroundColor: '#FFFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segOn: { backgroundColor: '#F1E8FF', borderColor: '#8A55EA' },
  toggle: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBlock: 4,
    borderTopWidth: 1,
    borderTopColor: '#F0E2C4',
  },
  sw: { backgroundColor: '#EBDDBE', justifyContent: 'center' },
  swOn: { backgroundColor: '#7B3FE4' },
  knob: { position: 'absolute', backgroundColor: '#FFFFFF' },
  confirm: { gap: 8, marginBlockStart: 8 },
});
