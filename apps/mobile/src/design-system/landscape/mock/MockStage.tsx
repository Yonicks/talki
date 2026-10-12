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

export interface MockDesign {
  /** Mock screen interior in its own pixels. */
  w: number;
  h: number;
  /** Height of the mock's test-ad band (hubs / parent only). */
  adH?: number;
}

/** The 1688 x 790 phone-screen interior the detail mocks share. */
export const DETAIL_DESIGN: MockDesign = { w: MOCK_W, h: MOCK_FULL_H, adH: MOCK_FULL_H - MOCK_STAGE_H };

export interface MockUnits {
  /** dp per mock unit. */
  u: number;
  designW: number;
  designH: number;
  /** Canvas box in dp (centred in the stage). */
  width: number;
  height: number;
  /** Real stage in dp. */
  stageW: number;
  stageH: number;
}

const MockUnitsContext = createContext<MockUnits>({ u: 0.5, designW: MOCK_W, designH: MOCK_FULL_H, width: MOCK_W / 2, height: MOCK_FULL_H / 2, stageW: MOCK_W / 2, stageH: MOCK_FULL_H / 2 });

export function useMockUnits(): MockUnits {
  return useContext(MockUnitsContext);
}

export function computeMockUnits(stageW: number, stageH: number, design: MockDesign = DETAIL_DESIGN, withAd = false): MockUnits {
  const basisH = withAd ? design.h - (design.adH ?? 0) : design.h;
  const u = Math.max(0.01, Math.min(stageW / design.w, stageH / basisH));
  return { u, designW: design.w, designH: design.h, width: design.w * u, height: design.h * u, stageW, stageH };
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
  /** Mock interior this screen was drawn on (defaults to the detail mocks' 1688 x 790). */
  design?: MockDesign;
  /** Where the cover crop is anchored (default: top-centre, the mock framing). */
  focal?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
}

export function MockStage({ children, testID, backgroundSource, scene, withAd = false, design = DETAIL_DESIGN, focal, style }: MockStageProps) {
  const [box, setBox] = useState({ w: MOCK_W / 2, h: MOCK_STAGE_H / 2 });
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox((b) => (b.w === width && b.h === height ? b : { w: width, h: height }));
  }, []);
  const units = useMemo(() => computeMockUnits(box.w, box.h, design, withAd), [box.w, box.h, design, withAd]);

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
                style={{ position: 'absolute', left: 0, top: 0, width: units.width, height: units.height }}
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
