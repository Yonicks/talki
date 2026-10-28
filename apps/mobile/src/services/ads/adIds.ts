/**
 * AdMob id resolution, kept free of react-native and expo imports so that both
 * `app.config.ts` (plain Node) and the Tier 1 unit tests can import it.
 *
 * AdMob app ids and banner unit ids are issued per platform: an Android unit id
 * is rejected on iOS and vice versa. Real values are supplied through the EAS
 * environment and never committed (only Google's published samples are).
 */

export type AdPlatform = 'android' | 'ios';

/** Google's published sample banner units. */
export const TEST_BANNER_UNIT_ID = 'ca-app-pub-3940256099942544/6300978111';
export const TEST_IOS_BANNER_UNIT_ID = 'ca-app-pub-3940256099942544/2934735716';
/** Google's published sample app ids. */
export const TEST_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
export const TEST_IOS_APP_ID = 'ca-app-pub-3940256099942544~1458002511';

/** Environment variable names. Banner ids are `EXPO_PUBLIC_` so Metro inlines them. */
export const AD_ENV = {
  appAndroid: 'ADMOB_ANDROID_APP_ID',
  appIos: 'ADMOB_IOS_APP_ID',
  bannerAndroid: 'EXPO_PUBLIC_ADMOB_BANNER_ID_ANDROID',
  bannerIos: 'EXPO_PUBLIC_ADMOB_BANNER_ID_IOS',
} as const;

export interface AdIds {
  appAndroid?: string;
  appIos?: string;
  bannerAndroid?: string;
  bannerIos?: string;
}

export function isGoogleSampleId(id: string): boolean {
  return id.startsWith('ca-app-pub-3940256099942544');
}

function real(id: string | undefined): string | undefined {
  return id && id.length > 0 && !isGoogleSampleId(id) ? id : undefined;
}

/** The unit id the banner should use: the platform's real id, else Google's sample. */
export function resolveBannerUnitId(platform: AdPlatform | undefined, ids: AdIds): string {
  if (platform === 'ios') return real(ids.bannerIos) ?? TEST_IOS_BANNER_UNIT_ID;
  return real(ids.bannerAndroid) ?? TEST_BANNER_UNIT_ID;
}

/** The native AdMob app id for the manifest / Info.plist. */
export function resolveAppId(platform: AdPlatform, ids: AdIds): string {
  if (platform === 'ios') return real(ids.appIos) ?? TEST_IOS_APP_ID;
  return real(ids.appAndroid) ?? TEST_ANDROID_APP_ID;
}

/** Names of the env vars that are unset or still hold a Google sample. */
export function missingRealAdIds(ids: AdIds): string[] {
  const missing: string[] = [];
  if (!real(ids.appAndroid)) missing.push(AD_ENV.appAndroid);
  if (!real(ids.appIos)) missing.push(AD_ENV.appIos);
  if (!real(ids.bannerAndroid)) missing.push(AD_ENV.bannerAndroid);
  if (!real(ids.bannerIos)) missing.push(AD_ENV.bannerIos);
  return missing;
}

/**
 * Store builds must not ship Google's sample ids. `app.config.ts` calls this
 * when `TALKI_REQUIRE_REAL_ADS=1` (set only by the `production` EAS profile),
 * so a missing secret fails the build instead of shipping test ads.
 */
export function assertRealAdIds(ids: AdIds): void {
  const missing = missingRealAdIds(ids);
  if (missing.length > 0) {
    throw new Error(
      `TALKI_REQUIRE_REAL_ADS=1 but these AdMob ids are missing or still Google samples: ${missing.join(', ')}. ` +
        'Set them as EAS environment variables (never commit real ids).',
    );
  }
}
