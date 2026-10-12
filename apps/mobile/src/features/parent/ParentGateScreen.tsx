/* eslint-disable no-restricted-syntax -- mock-unit layout constants are physical canvas coordinates */
import { useMemo, useReducer, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ToastHost } from '@/components/shell';
import { landscapeScenes } from '@/design-system/assets';
import { MockBox, MockCard, MockHeader, MockPrimary, MockStage, MockText } from '@/design-system/landscape';
import { homeHref } from '@/domain/navigation/routes';
import { useProgressStore } from '@/state/progressStore';
import { useSettingsStore } from '@/state/settingsStore';
import { gateReducer, initGate } from '@/domain/parent/gate';
import { makeRnd } from '@/features/games/shell/e2eSeed';
import { testIds } from '@/testing/testIds';


const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'ok'] as const;

/**
 * Parent gate — landscape (Phase 27). Challenge semantics unchanged
 * (gateReducer / initGate). Layout is a short-height row: prompt | keypad.
 */
export function ParentGateScreen({ onUnlocked }: { onUnlocked: () => void }) {
  const router = useRouter();
  const learned = useProgressStore((st) => st.learned);
  const { settings, toggleMusic } = useSettingsStore();
  const params = useLocalSearchParams<{ seed?: string }>();
  const seedParam = params.seed != null ? Number(params.seed) : undefined;
  const rnd = useMemo(() => makeRnd(Number.isFinite(seedParam) ? seedParam : undefined), [seedParam]);
  const [state, dispatch] = useReducer(gateReducer, undefined, () => initGate(rnd));
  const [toast, setToast] = useState<string | null>(null);

  const onKey = (k: (typeof KEYS)[number]) => {
    if (k === 'clear') {
      dispatch({ type: 'CLEAR' });
      return;
    }
    if (k === 'ok') {
      const nextSum = state.question.sum;
      if (Number(state.input) === nextSum) {
        dispatch({ type: 'OK' });
        onUnlocked();
      } else {
        dispatch({ type: 'OK' });
        setToast('לא נכון, נסו שוב');
      }
      return;
    }
    dispatch({ type: 'DIGIT', n: k });
  };

  const { a, b } = state.question;
  const display = `${a} × ${b} = ${state.input || '?'}`;

  return (
    <MockStage testID={testIds.parent.root} withAd scene={landscapeScenes.gate}>
      <MockHeader
        points={learned.size}
        musicOn={settings.music}
        onToggleMusic={() => void toggleMusic()}
        onBack={() => router.back()}
        onHome={() => router.replace(homeHref)}
        testID="parent-gate-header"
      />
      {PHYSICAL.map((ki, i) => {
        const k = KEYS[ki]!;
        const label = k === 'clear' ? '⌫' : k === 'ok' ? '✓' : k;
        const id =
          k === 'clear' ? testIds.parent.gateClear : k === 'ok' ? testIds.parent.gateOk : testIds.parent.gateKey(k);
        const place = { left: GATE.colLefts[i % 3]!, top: GATE.rowTops[Math.floor(i / 3)]!, width: GATE.keyW, height: GATE.keyH };
        // Physical order: 1 2 3 / 4 5 6 / 7 8 9 / ✓ 0 ⌫, left to right.
        const ordered = k;
        if (ordered === 'ok') {
          return <MockPrimary key={ordered} testID={id} label="✓" onPress={() => onKey('ok')} size={64} {...place} />;
        }
        return (
          <MockCard key={ordered} testID={id} accessibilityLabel={label} onPress={() => onKey(ordered)} radius={34} {...place}>
            <MockText size={ordered === 'clear' ? 56 : 54}>{ordered === 'clear' ? '⌫' : ordered}</MockText>
          </MockCard>
        );
      })}
      <MockBox {...GATE.lock} pointerEvents="none">
        <MockText size={74}>🔒</MockText>
      </MockBox>
      <MockBox {...GATE.title} pointerEvents="none">
        <MockText size={58} color="#3B1A7C">
          מסך הורים
        </MockText>
      </MockBox>
      <MockBox {...GATE.subtitle} pointerEvents="none">
        <MockText size={29} weight="regular" color="#5A4690">
          כדי להיכנס, פתרו את התרגיל
        </MockText>
      </MockBox>
      <MockBox {...GATE.question} radius={42} style={styles.pill}>
        <MockText testID={testIds.parent.gateQuestion} size={68} color="#2E1170">
          {display}
        </MockText>
      </MockBox>
      <MockBox
        testID={testIds.parent.gateBack}
        accessibilityLabel="חזרה לאפליקציה"
        onPress={() => router.back()}
        {...GATE.back}
        style={styles.center}
      >
        <MockText size={28} weight="regular" color="#4A2E88">
          חזרה לאפליקציה
        </MockText>
      </MockBox>
      <ToastHost message={toast} onHide={() => setToast(null)} testID={testIds.parent.toast} />
    </MockStage>
  );
}

/** Gate composition in mock units (mock "ChatGPT Image …-1"); the panel is baked into the scene. */
const GATE = {
  colLefts: [412, 540, 668],
  rowTops: [187, 301, 414, 527],
  keyW: 112,
  keyH: 110,
  lock: { left: 1000, top: 172, width: 180, height: 100 },
  title: { left: 940, top: 272, width: 300, height: 76 },
  subtitle: { left: 900, top: 346, width: 380, height: 44 },
  question: { left: 867, top: 405, width: 443, height: 115 },
  back: { left: 960, top: 580, width: 260, height: 48 },
} as const;

/** Display slot -> key, in the order the mock draws them (left to right, top to bottom). */
const PHYSICAL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 10, 9] as const;

const styles = StyleSheet.create({
  pill: { backgroundColor: '#EFE5F5', alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
