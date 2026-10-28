import { describe, expect, it } from 'vitest';

import {
  AD_ENV,
  TEST_ANDROID_APP_ID,
  TEST_BANNER_UNIT_ID,
  TEST_IOS_APP_ID,
  TEST_IOS_BANNER_UNIT_ID,
  assertRealAdIds,
  isGoogleSampleId,
  missingRealAdIds,
  resolveAppId,
  resolveBannerUnitId,
} from '@/services/ads/adIds';

const REAL = {
  appAndroid: 'ca-app-pub-1111111111111111~2222222222',
  appIos: 'ca-app-pub-1111111111111111~3333333333',
  bannerAndroid: 'ca-app-pub-1111111111111111/4444444444',
  bannerIos: 'ca-app-pub-1111111111111111/5555555555',
};

describe('AdMob id resolution', () => {
  it('falls back to the matching Google sample per platform', () => {
    expect(resolveBannerUnitId('android', {})).toBe(TEST_BANNER_UNIT_ID);
    expect(resolveBannerUnitId('ios', {})).toBe(TEST_IOS_BANNER_UNIT_ID);
    expect(resolveBannerUnitId(undefined, {})).toBe(TEST_BANNER_UNIT_ID);
    expect(resolveAppId('android', {})).toBe(TEST_ANDROID_APP_ID);
    expect(resolveAppId('ios', {})).toBe(TEST_IOS_APP_ID);
  });

  it('uses each platform’s own real id and never the other platform’s', () => {
    expect(resolveBannerUnitId('android', REAL)).toBe(REAL.bannerAndroid);
    expect(resolveBannerUnitId('ios', REAL)).toBe(REAL.bannerIos);
    expect(resolveBannerUnitId('ios', { bannerAndroid: REAL.bannerAndroid })).toBe(TEST_IOS_BANNER_UNIT_ID);
    expect(resolveAppId('android', REAL)).toBe(REAL.appAndroid);
    expect(resolveAppId('ios', REAL)).toBe(REAL.appIos);
  });

  it('treats an empty value or a pasted Google sample as not set', () => {
    expect(resolveBannerUnitId('android', { bannerAndroid: '' })).toBe(TEST_BANNER_UNIT_ID);
    expect(resolveBannerUnitId('ios', { bannerIos: TEST_BANNER_UNIT_ID })).toBe(TEST_IOS_BANNER_UNIT_ID);
    expect(isGoogleSampleId(TEST_IOS_APP_ID)).toBe(true);
    expect(isGoogleSampleId(REAL.bannerIos)).toBe(false);
  });
});

describe('store build guard', () => {
  it('lists every id that is missing or still a sample', () => {
    expect(missingRealAdIds({})).toEqual([
      AD_ENV.appAndroid,
      AD_ENV.appIos,
      AD_ENV.bannerAndroid,
      AD_ENV.bannerIos,
    ]);
    expect(missingRealAdIds({ ...REAL, bannerIos: TEST_IOS_BANNER_UNIT_ID })).toEqual([AD_ENV.bannerIos]);
    expect(missingRealAdIds(REAL)).toEqual([]);
  });

  it('throws naming the missing variables, and passes with all four real ids', () => {
    expect(() => assertRealAdIds({ ...REAL, appIos: undefined })).toThrow(/ADMOB_IOS_APP_ID/);
    expect(() => assertRealAdIds({})).toThrow(/never commit real ids/);
    expect(() => assertRealAdIds(REAL)).not.toThrow();
  });
});
