/**
 * Mock-parity stage for the redesigned detail screens (games, parent, cards).
 *
 * The approved mocks are drawn on a 1688 × 790 screen with a 93-unit ad band at
 * the bottom, so the usable art stage is 1688 × 697 "mock units". This component
 * measures the real stage, picks one scale `u` (dp per mock unit, width- or
 * height-limited so proportions are never distorted) and exposes it through
 * context. Children are positioned in mock units inside a centred canvas, so
 * every offset/size in a screen reads straight off the mock.
 *
 * The painted world fills the whole stage with a cover crop anchored to the top
 * (the mock composition), never stretched.
 *
 * Canvas positioning is physical (the mock is a fixed Hebrew composition), hence
 * the `left`/`right` lint exemptions in this folder.
 */
/* eslint-disable no-restricted-syntax */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View, type ImageSourcePropType, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

import { Image } from 'expo-image';

import { landscapeBackgrounds } from '../../assets';
import { LandscapeScreen } from '../LandscapeScreen';
import { LandscapeWorldBackground } from '../LandscapeWorldBackground';

export const MOCK_W = 1688;
/** Stage height above the ad band (hubs / parent, which reserve a banner). */
export const MOCK_STAGE_H = 697;
/** Full mock screen height (gameplay, practice, category and cards carry no banner). */
export const MOCK_FULL_H = 790;

export interface MockUnits {
  /** dp per mock unit. */
  u: number;
  /** Canvas box in dp (centred in the stage). */
  width: number;
  height: number;
  /** Real stage in dp. */
  stageW: number;
  stageH: number;
}

const MockUnitsContext = createContext<MockUnits>({ u: 0.5, width: MOCK_W / 2, height: MOCK_STAGE_H / 2, stageW: MOCK_W / 2, stageH: MOCK_STAGE_H / 2 });

export function useMockUnits(): MockUnits {
  return useContext(MockUnitsContext);
}

export function computeMockUnits(stageW: number, stageH: number, basisH: number = MOCK_FULL_H): MockUnits {
  const u = Math.max(0.01, Math.min(stageW / MOCK_W, stageH / basisH));
  return { u, width: MOCK_W * u, height: basisH * u, stageW, stageH };
}

export interface MockStageProps {
  children: ReactNode;
  testID?: string;
  /** Overrides the default detail world art. */
  backgroundSource?: number;
  /** This screen's own painted scene, drawn inside the canvas at mock scale. */
  scene?: ImageSourcePropType;
  /** The route reserves a banner strip: the stage is only the 697-unit art above it. */
  withAd?: boolean;
  /** Where the cover crop is anchored (default: top-centre, the mock framing). */
  focal?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
}

export function MockStage({ children, testID, backgroundSource, scene, withAd = false, focal, style }: MockStageProps) {
  const [box, setBox] = useState({ w: MOCK_W / 2, h: MOCK_STAGE_H / 2 });
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox((b) => (b.w === width && b.h === height ? b : { w: width, h: height }));
  }, []);
  const units = useMemo(() => computeMockUnits(box.w, box.h, withAd ? MOCK_STAGE_H : MOCK_FULL_H), [box.w, box.h, withAd]);

  return (
    <LandscapeScreen testID={testID} edgesHandledByShell style={StyleSheet.flatten(style)}>
      <View style={styles.fill} onLayout={onLayout}>
        <LandscapeWorldBackground
          source={backgroundSource ?? landscapeBackgrounds.detail}
          world="detail"
          deviceClass="phone"
          focal={focal ?? { x: 0.5, y: 0 }}
          testID={testID ? `${testID}-bg` : undefined}
        />
        <MockUnitsContext.Provider value={units}>
          <View
            pointerEvents="box-none"
            style={{ position: 'absolute', top: 0, left: (box.w - units.width) / 2, width: units.width, height: units.height }}
          >
            {scene ? (
              <Image
                source={scene}
                pointerEvents="none"
                style={{ position: 'absolute', left: 0, top: 0, width: units.width, height: units.width * (790 / MOCK_W) }}
                contentFit="fill"
                accessibilityIgnoresInvertColors
              />
            ) : null}
            {children}
          </View>
        </MockUnitsContext.Provider>
      </View>
    </LandscapeScreen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden' },
});
