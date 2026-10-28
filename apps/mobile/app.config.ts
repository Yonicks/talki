import type { ExpoConfig } from 'expo/config';

/* Production id matches capacitor.config.ts so the two builds can never be
   installed side by side under different identities during cutover. The dev
   client uses a distinct id so it can be installed next to a release build. */
const IS_DEV = process.env.APP_VARIANT === 'development';

/* AdMob ids come from the EAS environment (names and rules: src/services/ads/adIds.ts,
   docs/migration/phase-13-compliance.md). Expo's config loader cannot import other
   TypeScript files, so the small amount of logic it needs is repeated here and
   covered by tests/unit/app-config-ads.test.ts. Without the variables the build
   uses Google's sample ids; the `production` EAS profile sets TALKI_REQUIRE_REAL_ADS=1,
   which turns a missing or sample id into a build error. */
const SAMPLE_ADMOB_PREFIX = 'ca-app-pub-3940256099942544';
const realAdId = (id: string | undefined): string | undefined =>
  id && !id.startsWith(SAMPLE_ADMOB_PREFIX) ? id : undefined;

const ANDROID_ADMOB_APP_ID = realAdId(process.env.ADMOB_ANDROID_APP_ID);
const IOS_ADMOB_APP_ID = realAdId(process.env.ADMOB_IOS_APP_ID);

if (process.env.TALKI_REQUIRE_REAL_ADS === '1') {
  const missing = [
    ['ADMOB_ANDROID_APP_ID', ANDROID_ADMOB_APP_ID],
    ['ADMOB_IOS_APP_ID', IOS_ADMOB_APP_ID],
    ['EXPO_PUBLIC_ADMOB_BANNER_ID_ANDROID', realAdId(process.env.EXPO_PUBLIC_ADMOB_BANNER_ID_ANDROID)],
    ['EXPO_PUBLIC_ADMOB_BANNER_ID_IOS', realAdId(process.env.EXPO_PUBLIC_ADMOB_BANNER_ID_IOS)],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length > 0) {
    throw new Error(
      `TALKI_REQUIRE_REAL_ADS=1 but these AdMob ids are missing or still Google samples: ${missing.join(', ')}. ` +
        'Set them as EAS environment variables (never commit real ids).',
    );
  }
}

const PRODUCTION_APP_ID = 'com.yonicks.talki';
const DEVELOPMENT_APP_ID = 'com.yonicks.talki.dev';

const config: ExpoConfig = {
  name: IS_DEV ? 'Talki (Dev)' : 'Talki',
  slug: 'talki',
  version: '1.0.0',
  /* 'landscape' (not 'default' or 'portrait'): Phase 4 replaced the legacy
     app-wide portrait lock (index.html 4088-4090, and this same field
     previously) with a per-route runtime policy — only games and practice
     were landscape. Phase 17 (docs/migration/phase-17-report.md) replaced
     that per-route policy with a single app-wide contract: the whole
     product, child and parent, is landscape-only now (AGENTS.md
     "LANDSCAPE REDESIGN NON-NEGOTIABLES" #1). Baking that into the native
     manifest/Info.plist here means the OS itself never offers a portrait
     frame; `orientationService.lockLandscape()` (called once at boot,
     app/_layout.tsx) is the runtime belt to this manifest-level suspenders
     — it is also the only mechanism that has any effect on Expo web, which
     does not read this field. */
  orientation: 'landscape',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'talki',
  ios: {
    bundleIdentifier: IS_DEV ? DEVELOPMENT_APP_ID : PRODUCTION_APP_ID,
    supportsTablet: true,
    infoPlist: {
      NSMicrophoneUsageDescription:
        'Talki uses the microphone so a parent can record their own voice for words, and for speech practice. / Talki משתמשת במיקרופון כדי שההורה יוכל להקליט את קולו למילים ולתרגול דיבור.',
      NSCameraUsageDescription:
        'Talki uses the camera only when a parent adds a photo for a custom word. / Talki משתמשת במצלמה רק כשההורה מוסיף תמונה למילה אישית.',
      NSPhotoLibraryUsageDescription:
        'Talki uses the photo library only when a parent picks a picture for a custom word. / Talki משתמשת בספריית התמונות רק כשההורה בוחר תמונה למילה אישית.',
    },
  },
  android: {
    package: IS_DEV ? DEVELOPMENT_APP_ID : PRODUCTION_APP_ID,
    adaptiveIcon: {
      backgroundColor: '#7C4CD6',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    permissions: ['android.permission.RECORD_AUDIO', 'android.permission.CAMERA'],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-image',
    'expo-sqlite',
    'expo-font',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FFF6E4',
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Talki uses the photo library only when a parent picks a picture for a custom word. / Talki משתמשת בספריית התמונות רק כשההורה בוחר תמונה למילה אישית.',
        cameraPermission:
          'Talki uses the camera only when a parent adds a photo for a custom word. / Talki משתמשת במצלמה רק כשההורה מוסיף תמונה למילה אישית.',
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: ANDROID_ADMOB_APP_ID ?? 'ca-app-pub-3940256099942544~3347511713',
        iosAppId: IOS_ADMOB_APP_ID ?? 'ca-app-pub-3940256099942544~1458002511',
      },
    ],
    [
      'expo-audio',
      {
        microphonePermission:
          'Talki uses the microphone so a parent can record their own voice for words, and for speech practice. / Talki משתמשת במיקרופון כדי שההורה יוכל להקליט את קולו למילים ולתרגול דיבור.',
      },
    ],
    [
      'expo-speech-recognition',
      {
        microphonePermission:
          'Talki uses the microphone so a parent can record their own voice for words, and for speech practice. / Talki משתמשת במיקרופון כדי שההורה יוכל להקליט את קולו למילים ולתרגול דיבור.',
        speechRecognitionPermission:
          'Talki uses speech recognition for the "Say it!" game. / Talki משתמשת בזיהוי דיבור למשחק "תגידי את זה".',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    // Set only for the GitHub Pages web export, which is hosted at a
    // subpath rather than the origin root (.github/workflows/test-and-deploy.yml).
    baseUrl: process.env.TALKI_WEB_BASE_URL,
  },
  extra: {
    splashBackground: '#FFF6E4',
    statusBarBackground: '#FFF8EA',
  },
};

export default config;
