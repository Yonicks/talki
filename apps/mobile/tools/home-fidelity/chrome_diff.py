"""Masked pixel diff of the Home chrome against the Android mock (dev tool).

Illustrations (background scene, mascot, category/hero art, header glyph art)
are different drawings from the mock's, so a whole-image diff mostly measures
artwork. This scores only the UI that is code: header surfaces, the hero card's
white plate, progress, CTA, category frames and label plates, and the arrows.
Each region is compared inside its own mock box, with art holes masked out.

Prints mean absolute error (0-255 per channel) per region and writes:
  <capture>-chrome-diff.png    abs-difference heatmap of the masked regions
  <capture>-chrome-overlay.png 50/50 blend, for eyeballing alignment

Usage: python tools/home-fidelity/chrome_diff.py <capture-stage.png>
"""
import os
import sys

import numpy as np
from PIL import Image

from mock_targets import MOCK, extract

# name -> list of (x0, y0, x1, y1) boxes in mock px; art holes listed in HOLES.
REGIONS = {
    'header buttons': [(43, 32, 140, 120), (1507, 32, 1611, 120), (1635, 32, 1803, 120)],
    'hero plate': [(631, 153, 1423, 524)],
    'hero copy (text+progress)': [(661, 175, 1058, 400)],
    'hero CTA': [(661, 411, 1058, 502)],
    'arrows': [(21, 613, 124, 717), (1718, 613, 1822, 717)],
}
# Boxes inside the above that are illustration and must not count.
HOLES = {
    'hero plate': [(1074, 163, 1402, 513), (975, 205, 1050, 285)],
    'hero copy (text+progress)': [(975, 205, 1050, 285)],
}


def main() -> None:
    cap = sys.argv[1]
    mock = np.asarray(Image.open(MOCK).convert('RGB').crop((0, 0, 1843, 853))).astype(int)
    img = np.asarray(Image.open(cap).convert('RGB').crop((0, 0, 1843, 853))).astype(int)
    diff = np.abs(mock - img)
    used = np.zeros(mock.shape[:2], bool)

    def region_mask(name, boxes):
        m = np.zeros(mock.shape[:2], bool)
        for x0, y0, x1, y1 in boxes:
            m[y0:y1, x0:x1] = True
        for x0, y0, x1, y1 in HOLES.get(name, []):
            m[y0:y1, x0:x1] = False
        return m

    print(f'{"region":28s} {"MAE":>6s}   {"% px off by >40":>16s}')
    total, n = 0.0, 0
    for name, boxes in REGIONS.items():
        m = region_mask(name, boxes)
        used |= m
        mae = diff[m].mean()
        bad = (diff[m].max(axis=1) > 40).mean() * 100
        print(f'{name:28s} {mae:6.1f}   {bad:15.1f}%')
        total += diff[m].sum()
        n += diff[m].size

    # Category cards: frame + label plate only (the art fills the middle).
    cards = extract(cap)['cards'][:8]
    mcards = extract(MOCK)['cards'][:8]
    frame_err, frame_px, label_err, label_px = 0.0, 0, 0.0, 0
    for c in mcards:
        x0, y0, x1, y1 = c
        ring = np.zeros(mock.shape[:2], bool)
        ring[y0:y1 + 1, x0:x1 + 1] = True
        ring[y0 + 12:y1 - 60, x0 + 12:x1 - 11] = False   # art window
        ring[y1 - 60:y1 - 8, x0 + 12:x1 - 11] = False    # label interior (text)
        frame_err += diff[ring].sum()
        frame_px += ring.sum() * 3
        lab = np.zeros(mock.shape[:2], bool)
        lab[y1 - 60:y1 - 8, x0 + 12:x1 - 11] = True
        label_err += diff[lab].sum()
        label_px += lab.sum() * 3
        used |= ring | lab
    print(f'{"card frames (8)":28s} {frame_err / frame_px:6.1f}')
    print(f'{"card labels (8, with text)":28s} {label_err / label_px:6.1f}')
    total += frame_err + label_err
    n += frame_px + label_px
    print(f'{"CHROME OVERALL":28s} {total / n:6.1f}')

    whole = diff.mean()
    print(f'{"(whole image, incl. art)":28s} {whole:6.1f}   <- dominated by different illustrations')

    stem = os.path.splitext(cap)[0]
    heat = np.zeros(mock.shape, np.uint8)
    heat[used] = np.clip(diff[used].max(axis=1, keepdims=True) * 3, 0, 255).repeat(3, axis=1).astype(np.uint8)
    Image.fromarray(heat).save(f'{stem}-chrome-diff.png')
    Image.blend(Image.fromarray(mock.astype(np.uint8)), Image.fromarray(img.astype(np.uint8)), 0.5).save(f'{stem}-chrome-overlay.png')
    print(f'\nwrote {stem}-chrome-diff.png / -chrome-overlay.png')


if __name__ == '__main__':
    main()
