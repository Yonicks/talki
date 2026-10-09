/**
 * Android sweep (dev tool): one screenshot of every screen on the running
 * Android emulator/device, by deep link + `adb screencap`.
 *
 * Needs: an emulator/device booted with the dev client installed, Metro
 * running on :8081 (`npm run mobile:web` also serves the native bundle).
 *
 *   node tools/home-fidelity/android-sweep.mjs
 *
 * Output: artifacts/android/<screen>.png (git-ignored; `publish_screenshots.py`
 * compresses the latest set into docs/screenshots/android).
 *
 * Env: ADB, TALKI_ANDROID_PKG (default com.yonicks.talki), TALKI_SETTLE_MS.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { SCREENS } from './screens.mjs';

const OUT = path.resolve('artifacts/android');
const PKG = process.env.TALKI_ANDROID_PKG ?? 'com.yonicks.talki';
const ADB = process.env.ADB ?? path.join(process.env.ANDROID_HOME ?? `${process.env.HOME}/Android/Sdk`, 'platform-tools/adb');
const SETTLE_MS = Number(process.env.TALKI_SETTLE_MS ?? 8000); // cold start: bundle + fonts + splash
const MAX_WAIT_MS = Number(process.env.TALKI_MAX_WAIT_MS ?? 20000);
/** An undrawn window screencaps to ~20 KB of PNG; every real screen is >100 KB. */
const MIN_DRAWN_BYTES = 60 * 1024;
const TOAST_TEXT = 'Open debugger to view warnings';

const adb = (...args) => execFileSync(ADB, args, { maxBuffer: 64 * 1024 * 1024 });
const shell = (cmd) => adb('shell', cmd).toString();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const die = (msg) => { console.error(`android-sweep: ${msg}`); process.exit(1); };

const devices = adb('devices').toString().split('\n').slice(1).filter((l) => /\tdevice$/.test(l));
if (devices.length !== 1) die(`expected exactly one adb device, found ${devices.length}. Boot the emulator first.`);
if (!shell(`pm list packages ${PKG}`).includes(PKG)) die(`${PKG} is not installed on the device (npm run mobile:android).`);
const metro = await fetch('http://localhost:8081/status').then((r) => r.text()).catch(() => '');
if (!metro.includes('running')) die('Metro is not running on :8081 (npm run mobile:web).');
adb('reverse', 'tcp:8081', 'tcp:8081');

const [, widthStr] = shell('wm size').match(/(\d+)x\d+/) ?? [];
const screenWidth = Number(widthStr) || 2424;

/** Dump the UI tree; returns the XML text. */
function uiDump() {
  // Constantly animating screens (bubbles) make uiautomator fail with "could not
  // get idle state"; clear the file first so a failed dump never reuses a stale one.
  try {
    shell('rm -f /sdcard/talki-ui.xml; uiautomator dump /sdcard/talki-ui.xml');
    return adb('exec-out', 'cat', '/sdcard/talki-ui.xml').toString();
  } catch {
    return '';
  }
}

/** Dev builds pop a LogBox "warnings" toast over the bottom of the screen; close it before the shot. */
function dismissToast() {
  const xml = uiDump();
  if (xml.includes('Unable to load script')) die('the app shows "Unable to load script" — Metro/adb reverse problem.');
  const node = xml.match(new RegExp(`<node[^>]*text="[^"]*${TOAST_TEXT}[^"]*"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`));
  if (!node) return false;
  const y = Math.round((Number(node[2]) + Number(node[4])) / 2);
  shell(`input tap ${Math.round(screenWidth * 0.0345)} ${y}`);
  return true;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const report = { device: devices[0].split('\t')[0], screens: {} };

for (const sc of SCREENS) {
  // intro=0 keeps a cold start from replaying the opening sequence.
  const sep = sc.path.includes('?') ? '&' : '?';
  const link = `talki://${sc.path.replace(/^\//, '')}${sep}intro=0`;
  // A fresh process per screen: one long-lived process balloons to ~1.4 GB on the
  // emulator (full-size picture bitmaps), Android starts reclaiming memory, and
  // pictures silently stop drawing. It also means a screen can never be reached
  // "from" the previous one (the parent gate swallowed the next deep link).
  let png;
  let hadToast = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    shell(`am force-stop ${PKG}`);
    shell(`am start -W -a android.intent.action.VIEW -d '${link}' ${PKG}`);
    await sleep(SETTLE_MS);
    // Dev builds stream every picture from Metro on first use, so wait until two
    // consecutive captures are identical. Animated screens (bubbles) never settle
    // and are taken after MAX_WAIT_MS.
    png = adb('exec-out', 'screencap', '-p');
    for (let waited = 0; waited < MAX_WAIT_MS; waited += 1000) {
      await sleep(1000);
      const next = adb('exec-out', 'screencap', '-p');
      const same = next.equals(png);
      png = next;
      if (same && png.length >= MIN_DRAWN_BYTES) break;
    }
    hadToast = dismissToast();
    if (hadToast) {
      await sleep(600);
      png = adb('exec-out', 'screencap', '-p');
    }
    if (png.length >= MIN_DRAWN_BYTES) break;
    console.log(`  ${sc.name}: attempt ${attempt} captured an undrawn (black) window, relaunching`);
  }
  if (png.length < MIN_DRAWN_BYTES) die(`${sc.name} never drew after 3 launches; not publishing a black image.`);
  writeFileSync(path.join(OUT, `${sc.name}.png`), png);
  report.screens[sc.name] = { bytes: png.length, toastDismissed: hadToast };
  console.log(`  ${sc.name.padEnd(20)} ${(png.length / 1024).toFixed(0)} KB${hadToast ? '  (dismissed warnings toast)' : ''}`);
}

writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
console.log(`android-sweep: ${SCREENS.length} screens -> ${OUT}`);
