/**
 * One command: refresh the published screenshot sets (docs/screenshots).
 * Run before every merge to master (AGENTS.md "Screenshots before merging").
 *
 *   npm run screenshots              # Chrome (Pixel 9) + Android emulator
 *   npm run screenshots -- chrome    # only the Chrome set
 *   npm run screenshots -- android   # only the Android set
 *
 * Needs Metro on :8081 (`npm run mobile:web`); Android also needs a booted
 * emulator with the dev client. Close other heavy apps first: captures are
 * serial, but a starved machine times out the page waits.
 */
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';

const base = process.env.TALKI_URL ?? 'http://localhost:8081';
const want = process.argv.slice(2).filter((a) => a === 'chrome' || a === 'android');
const kinds = want.length ? want : ['chrome', 'android'];
const here = path.resolve('tools/home-fidelity');

const up = await fetch(base).then((r) => r.ok).catch(() => false);
if (!up) {
  console.error(`screenshots: nothing is serving ${base}. Start it with: npm run mobile:web`);
  process.exit(1);
}

function run(label, args, env = {}) {
  console.log(`\n== ${label}`);
  const r = spawnSync(args[0], args.slice(1), { stdio: 'inherit', env: { ...process.env, ...env } });
  if (r.status !== 0) {
    console.error(`screenshots: "${label}" failed (exit ${r.status}); published set left untouched.`);
    process.exit(r.status ?? 1);
  }
}

if (kinds.includes('chrome')) {
  rmSync(path.resolve('artifacts/device/pixel-9'), { recursive: true, force: true });
  run('Chrome sweep (Pixel 9)', ['node', path.join(here, 'device-sweep.mjs'), 'all'], { TALKI_DEVICES: 'pixel-9' });
}
if (kinds.includes('android')) {
  run('Android sweep', ['node', path.join(here, 'android-sweep.mjs')]);
}
run('Publish latest sets', ['python3', path.join(here, 'publish_screenshots.py'), ...kinds]);
console.log('\nscreenshots: done. Commit docs/screenshots/ with the merge.');
