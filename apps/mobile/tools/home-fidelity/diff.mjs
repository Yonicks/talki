/**
 * Overlay + difference report between a captured Home stage and the v3 mock.
 *
 * Writes <name>-overlay.png (50/50 blend) and <name>-diff.png (abs diff,
 * amplified) next to the capture, and prints a coarse per-band difference
 * score so a regression in one region of the composition is visible as a
 * number rather than only by eye.
 *
 * Usage: node tools/home-fidelity/diff.mjs <capturedStage.png>
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const target = process.argv[2];
if (!target) {
  console.error('usage: node tools/home-fidelity/diff.mjs <capturedStage.png>');
  process.exit(1);
}
const py = path.resolve('tools/home-fidelity/diff.py');
execFileSync('python3', [py, target], { stdio: 'inherit' });
