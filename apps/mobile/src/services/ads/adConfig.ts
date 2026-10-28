/**
 * Child-safety flags ported VERBATIM from index.html 4105-4124.
 * These are not library defaults — they are the shipping children's-app
 * configuration. Do not "improve" them from AdMob docs.
 */
import { isGoogleSampleId, resolveBannerUnitId, type AdPlatform } from './adIds';

export const CHILD_SAFETY_FLAGS = {
  tagForChildDirectedTreatment: true,
  maxAdContentRating: 'General',
  npa: true,
  adSize: 'ADAPTIVE_BANNER',
  position: 'BOTTOM_CENTER',
  margin: 0,
} as const;

export { TEST_BANNER_UNIT_ID, TEST_IOS_BANNER_UNIT_ID } from './adIds';

export const AD_FALLBACK_PX = 50;

/** `process.env.EXPO_OS` is inlined by Expo at build time; undefined under Node (unit tests). */
function currentAdPlatform(): AdPlatform | undefined {
  const os = process.env.EXPO_OS;
  return os === 'android' || os === 'ios' ? os : undefined;
}

/**
 * Real unit ids come from the EAS environment, one per platform
 * (`EXPO_PUBLIC_ADMOB_BANNER_ID_ANDROID` / `_IOS`). The references must stay
 * literal `process.env.EXPO_PUBLIC_*` so Metro can inline them.
 * Never commit a real ca-app-pub-… id that is not the Google sample.
 */
export function bannerUnitId(platform: AdPlatform | undefined = currentAdPlatform()): string {
  return resolveBannerUnitId(platform, {
    bannerAndroid: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID_ANDROID,
    bannerIos: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID_IOS,
  });
}

export function isTestBannerId(id: string = bannerUnitId()): boolean {
  return isGoogleSampleId(id);
}

export const AD_REQUEST_LOG_PREFIX = 'Talki AdMob request';

export function formatAdRequestLog(): string {
  return `${AD_REQUEST_LOG_PREFIX} ${JSON.stringify({
    tagForChildDirectedTreatment: CHILD_SAFETY_FLAGS.tagForChildDirectedTreatment,
    maxAdContentRating: CHILD_SAFETY_FLAGS.maxAdContentRating,
    npa: CHILD_SAFETY_FLAGS.npa,
    adSize: CHILD_SAFETY_FLAGS.adSize,
    position: CHILD_SAFETY_FLAGS.position,
    margin: CHILD_SAFETY_FLAGS.margin,
    adId: bannerUnitId(),
  })}`;
}
