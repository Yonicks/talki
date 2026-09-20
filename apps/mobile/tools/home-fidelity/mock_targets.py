"""Extract the Android Home mock's chrome geometry into mock-pixel targets.

Prints one JSON object of named boxes (x0, y0, x1, y1, inclusive pixels of the
1843 x 853 mock). `pixel_report.mjs` compares the DOM rects of the running app
against these. Thresholds are tuned to the mock's white-on-white surfaces, so
treat every box as +-1 px (soft shadows blur every edge by about a pixel).

Usage: python tools/home-fidelity/mock_targets.py [image.png] [> targets.json]
"""
import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
MOCK = os.path.join(HERE, '..', '..', 'assets', 'v3', 'mocks', 'mock_home_android_1843x853.png')


def box_of(mask, win, pick='largest', min_area=60):
    x0, y0, x1, y1 = win
    sub = mask[y0:y1, x0:x1]
    lab, n = ndimage.label(sub)
    if n == 0:
        return None
    sizes = ndimage.sum(sub, lab, range(1, n + 1))
    k = int(np.argmax(sizes)) + 1
    if sizes[k - 1] < min_area:
        return None
    ys, xs = np.where(lab == k)
    return [int(xs.min() + x0), int(ys.min() + y0), int(xs.max() + x0), int(ys.max() + y0)]


def union_box(mask, win, min_area=1):
    x0, y0, x1, y1 = win
    ys, xs = np.where(mask[y0:y1, x0:x1])
    if len(xs) < min_area:
        return None
    return [int(xs.min() + x0), int(ys.min() + y0), int(xs.max() + x0), int(ys.max() + y0)]


def extract(path):
    a = np.asarray(Image.open(path).convert('RGB').crop((0, 0, 1843, 853))).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = (0.299 * r + 0.587 * g + 0.114 * b)
    white = (r >= 240) & (g >= 240) & (b >= 240)
    filled = ndimage.binary_fill_holes(ndimage.binary_closing(white, iterations=3))
    # The mock has a faint light halo above the hero card and header pill; a
    # stricter white keeps those out of the boxes (captures are unaffected).
    white_strict = (r >= 249) & (g >= 249) & (b >= 249)
    filled_strict = ndimage.binary_fill_holes(ndimage.binary_closing(white_strict, iterations=3))
    dark = lum < 95            # indigo text / glyph strokes
    yellow = (r > 205) & (g > 150) & (b < 130)

    t = {}
    t['music'] = box_of(filled_strict, (20, 15, 200, 150))
    t['profile'] = box_of(filled_strict, (1480, 15, 1625, 150))
    t['pill'] = box_of(filled_strict, (1626, 15, 1835, 150))
    t['panel'] = box_of(filled_strict, (600, 130, 1460, 560))
    t['arrowEnd'] = box_of(filled_strict, (1690, 585, 1843, 745))     # physical right
    t['arrowStart'] = box_of(filled_strict, (0, 585, 150, 745))       # physical left

    # Header glyphs (dark strokes / yellow star) inside their buttons.
    t['musicGlyph'] = union_box((r > 90) & (r < 190) & (b > 150) & (g < 110), (43, 32, 140, 120), 30)
    t['profileGlyph'] = union_box(dark | ((b > 120) & (r < 130) & (g < 100)), (1512, 36, 1606, 116), 30)
    t['pillStar'] = union_box(yellow, (1636, 34, 1730, 118), 30)
    t['pillText'] = union_box(dark, (1720, 34, 1800, 118), 30)

    # Hero panel content.
    t['thumbArt'] = box_of(~(lum > 236), (1060, 160, 1425, 520), min_area=5000)
    cta_mask = (b > 130) & (r > 60) & (r < 175) & (g < 115) & (b - g > 60)
    t['cta'] = box_of(ndimage.binary_fill_holes(ndimage.binary_closing(cta_mask, iterations=6)),
                      (640, 395, 1075, 520), min_area=3000)
    cta = t['cta']
    if cta:
        t['ctaCircle'] = box_of(filled & (np.arange(1843)[None, :] > cta[0]) & (np.arange(1843)[None, :] < cta[0] + 130),
                                (cta[0] + 2, cta[1] + 2, cta[0] + 130, cta[3] - 1), min_area=400)

    # Text lines: rows of dark pixels between the panel's copy-column edges.
    lines = []
    copy = dark[:, 690:1050]
    row_has = copy[150:400].any(axis=1)
    y = 150
    start = None
    for i, v in enumerate(row_has):
        if v and start is None:
            start = i
        elif (not v) and start is not None:
            if i - start >= 6:
                ys = slice(150 + start, 150 + i)
                xs = np.where(dark[ys, 650:1075].any(axis=0))[0]
                lines.append([int(xs.min() + 650), 150 + start, int(xs.max() + 650), 150 + i - 1])
            start = None
    t['textLines'] = lines
    # Named ink boxes (title excludes the star mark that sits beside it).
    t['eyebrowText'] = union_box(dark, (690, 175, 1060, 214), 40)
    t['titleText'] = union_box(dark, (690, 215, 968, 296), 200)
    t['subtitleText'] = union_box(dark, (690, 296, 1060, 336), 100)
    t['ctaLabel'] = union_box((r > 235) & (g > 235) & (b > 235), (830, 432, 1000, 482), 200)
    labels_ink = []
    for x0 in (134, 334, 533, 730, 927, 1124, 1319, 1516):
        labels_ink.append(union_box(dark, (x0 + 10, 730, x0 + 182, 780), 60))
    t['labelInk'] = labels_ink
    t['titleStar'] = union_box(yellow, (930, 195, 1075, 300), 60)

    # Progress row: track + fill (everything non-white right of the count).
    t['progressTrack'] = box_of(lum < 232, (745, 335, 1062, 410), min_area=800)
    t['progressCount'] = union_box(dark, (655, 336, 764, 408), 20)

    # Cards (8): white frame components in the strip band.
    band = filled.copy()
    band[:540] = False
    band[800:] = False
    band[:, :130] = False
    band[:, 1712:] = False
    lab, n = ndimage.label(band)
    cards = []
    for k in range(1, n + 1):
        ys, xs = np.where(lab == k)
        w, h = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
        if 150 < w < 230 and 190 < h < 260:
            cards.append([int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())])
    t['cards'] = sorted(cards, key=lambda c: c[0])
    # Label band: the white run that ends at the card's bottom edge, mid-card.
    labels = []
    for c in t['cards']:
        cx = (c[0] + c[2]) // 2
        colw = white[c[1]:c[3] + 1, cx]
        end = len(colw) - 1
        while end > 0 and not colw[end]:
            end -= 1
        s = end
        while s > 0 and colw[s - 1]:
            s -= 1
        labels.append([c[0], c[1] + s, c[2], c[1] + end])
    t['cardLabels'] = labels
    return t


if __name__ == '__main__':
    import sys
    print(json.dumps(extract(sys.argv[1] if len(sys.argv) > 1 else MOCK)))
