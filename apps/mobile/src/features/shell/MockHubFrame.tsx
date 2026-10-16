/**
 * Shared frame for the Games / Practice hubs drawn to their mocks: the hub's own
 * painted scene, the mock header (music, Talki lockup, points -> Rewards, home),
 * and the Home <-> Games <-> Practice side arrows, which the mocks omit but the
 * app keeps (AGENTS.md: never drop a feature because a mock leaves it out).
 */
import type { ReactNode } from 'react';

import { landscapeScenes } from '@/design-system/assets';
import {
  HEADER_GAMES,
  HEADER_PRACTICE,
  LandscapeSideNav,
  MockBox,
  MockHeader,
  MockStage,
  type MockDesign,
  type MockHeaderGeometry,
} from '@/design-system/landscape';
import { gamesMenuHref, homeHref, practiceMenuHref, rewardsHref } from '@/domain/navigation/routes';
import { useGuardedPush } from '@/hooks/useGuardedPush';
import { useGuardedReplace } from '@/hooks/useGuardedReplace';
import { useGoHome } from '@/hooks/useGoHome';
import { testIds } from '@/testing/testIds';

export type MockHubId = 'games' | 'practice';

interface HubSpec {
  design: MockDesign;
  header: MockHeaderGeometry;
  scene: keyof typeof landscapeScenes;
  /** Vertical centre of the side arrows, in mock units. */
  arrowY: number;
  start: { label: string; href: typeof homeHref | typeof practiceMenuHref | typeof gamesMenuHref };
  end: { label: string; href: typeof homeHref | typeof practiceMenuHref | typeof gamesMenuHref };
}

export const HUB_SPEC: Record<MockHubId, HubSpec> = {
  games: {
    design: { w: 1730, h: 785, adH: 92 },
    header: HEADER_GAMES,
    scene: 'games',
    arrowY: 330,
    start: { label: 'בית', href: homeHref },
    end: { label: 'תרגול דיבור', href: practiceMenuHref },
  },
  practice: {
    design: { w: 1609, h: 816, adH: 83 },
    header: HEADER_PRACTICE,
    scene: 'practice',
    arrowY: 330,
    start: { label: 'בית', href: homeHref },
    end: { label: 'משחקים', href: gamesMenuHref },
  },
};

export interface MockHubFrameProps {
  hub: MockHubId;
  testID?: string;
  points: number;
  musicOn: boolean;
  onToggleMusic: () => void;
  onBrandLongPress?: () => void;
  onBrandShortPress?: () => void;
  /** Hides the Home/Games <-> Practice side-arrow lanes for this screen. */
  hideSideNav?: boolean;
  children: ReactNode;
}

export function MockHubFrame({
  hub,
  testID,
  points,
  musicOn,
  onToggleMusic,
  onBrandLongPress,
  onBrandShortPress,
  hideSideNav = false,
  children,
}: MockHubFrameProps) {
  const spec = HUB_SPEC[hub];
  const push = useGuardedPush();
  const replace = useGuardedReplace();
  const goHome = useGoHome();

  return (
    <MockStage testID={testID} design={spec.design} withAd scene={landscapeScenes[spec.scene]}>
      <MockHeader
        geometry={spec.header}
        testID="landscape-hub-topbar"
        pointsTestID={testIds.nav.rewards}
        points={points}
        musicOn={musicOn}
        onToggleMusic={onToggleMusic}
        onPointsPress={() => push(rewardsHref)}
        onHome={goHome}
        onBrandLongPress={onBrandLongPress}
        onBrandShortPress={onBrandShortPress}
      />
      {children}
      {hideSideNav ? null : (
        <>
          <MockBox left={spec.design.w - 130} top={spec.arrowY - 60} width={120} height={150}>
            <LandscapeSideNav
              testID={testIds.nav.sideStart}
              label={spec.start.label}
              direction="backward"
              onPress={() => replace(spec.start.href)}
            />
          </MockBox>
          <MockBox left={10} top={spec.arrowY - 60} width={120} height={150}>
            <LandscapeSideNav
              testID={testIds.nav.sideEnd}
              label={spec.end.label}
              direction="forward"
              onPress={() => replace(spec.end.href)}
            />
          </MockBox>
        </>
      )}
    </MockStage>
  );
}
