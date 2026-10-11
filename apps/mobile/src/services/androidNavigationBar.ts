import { Platform } from 'react-native';
import { NavigationBar } from 'expo-navigation-bar';

/**
 * Hides Android's system navigation bar so the locked-landscape stage runs
 * edge to edge, matching the mock (`docs/design/landscape/reference/home.png`)
 * instead of leaving the nav bar's reserved inset as a bare black strip
 * between the stage and the ad banner. Android's edge-to-edge model (SDK 57+)
 * still lets the user reveal it with an edge swipe. The one and only call
 * site is `app/_layout.tsx`, mirroring `orientationService.lockLandscape()`.
 */
export async function hideAndroidNavigationBar(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    NavigationBar.setHidden(true);
  } catch {
    /* best-effort: older/unsupported devices simply keep the system bar */
  }
}
