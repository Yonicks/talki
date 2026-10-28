import { afterEach, describe, expect, it, vi } from 'vitest';

const KEYS = [
  'ADMOB_ANDROID_APP_ID',
  'ADMOB_IOS_APP_ID',
  'EXPO_PUBLIC_ADMOB_BANNER_ID_ANDROID',
  'EXPO_PUBLIC_ADMOB_BANNER_ID_IOS',
  'TALKI_REQUIRE_REAL_ADS',
] as const;

const REAL: Record<(typeof KEYS)[number], string> = {
  ADMOB_ANDROID_APP_ID: 'ca-app-pub-1111111111111111~2222222222',
  ADMOB_IOS_APP_ID: 'ca-app-pub-1111111111111111~3333333333',
  EXPO_PUBLIC_ADMOB_BANNER_ID_ANDROID: 'ca-app-pub-1111111111111111/4444444444',
  EXPO_PUBLIC_ADMOB_BANNER_ID_IOS: 'ca-app-pub-1111111111111111/5555555555',
  TALKI_REQUIRE_REAL_ADS: '1',
};

async function loadConfig(env: Partial<Record<(typeof KEYS)[number], string>>) {
  for (const k of KEYS) delete process.env[k];
  Object.assign(process.env, env);
  vi.resetModules();
  return (await import('../../app.config')).default;
}

function adPlugin(config: Awaited<ReturnType<typeof loadConfig>>) {
  const entry = (config.plugins ?? []).find((p) => Array.isArray(p) && p[0] === 'react-native-google-mobile-ads');
  return (entry as [string, { androidAppId: string; iosAppId: string }])[1];
}

afterEach(() => {
  for (const k of KEYS) delete process.env[k];
});

describe('app.config.ts AdMob wiring', () => {
  it('uses Google sample app ids when nothing is configured', async () => {
    const plugin = adPlugin(await loadConfig({}));
    expect(plugin.androidAppId).toBe('ca-app-pub-3940256099942544~3347511713');
    expect(plugin.iosAppId).toBe('ca-app-pub-3940256099942544~1458002511');
  });

  it('puts each platform’s own app id into the plugin', async () => {
    const plugin = adPlugin(await loadConfig(REAL));
    expect(plugin.androidAppId).toBe(REAL.ADMOB_ANDROID_APP_ID);
    expect(plugin.iosAppId).toBe(REAL.ADMOB_IOS_APP_ID);
  });

  it('refuses a store build with missing or sample ids', async () => {
    await expect(loadConfig({ TALKI_REQUIRE_REAL_ADS: '1' })).rejects.toThrow(/ADMOB_ANDROID_APP_ID.*ADMOB_IOS_APP_ID/);
    await expect(
      loadConfig({ ...REAL, EXPO_PUBLIC_ADMOB_BANNER_ID_IOS: 'ca-app-pub-3940256099942544/2934735716' }),
    ).rejects.toThrow(/EXPO_PUBLIC_ADMOB_BANNER_ID_IOS/);
  });

  it('accepts a store build when all four ids are real', async () => {
    await expect(loadConfig(REAL)).resolves.toBeTruthy();
  });
});
