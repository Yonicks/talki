"""Fit corner radii of the Android Home chrome (dev tool).

For each surface, the boundary of its bright fill along the rows just below its
top edge is compared with the arc of a circle of radius r, and the r with the
smallest squared error wins. Works on the mock and on any same-size capture.

Usage: python tools/home-fidelity/radii.py [image.png]
"""
import os
import sys

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
MOCK = os.path.join(HERE, '..', '..', 'assets', 'v3', 'mocks', 'mock_home_android_1843x853.png')
PX_PER_DP = 1843 / 900

# name -> (x0, y0, x1) : true top-left corner and right edge, mock px.
SURFACES = {
    'panel':   (630.5, 152.5, 1423.0),
    'music':   (43.0, 32.0, 139.5),
    'profile': (1507.0, 32.0, 1610.5),
    'pill':    (1635.0, 32.0, 1803.0),
    'card[7]': (1515.5, 548.0, 1707.0),
    'arrowEnd': (1718.0, 613.0, 1821.5),
}


def boundary(lum, x0, y0, x1, r_max=70, thr=205, left=True):
    pts = []
    for d in range(1, r_max):
        y = int(round(y0 + d))
        if left:
            seg = lum[y, int(x0):int(x0) + r_max + 20] > thr
            idx = np.where(seg)[0]
            if len(idx):
                pts.append((d, idx[0] - (x0 - int(x0))))
        else:
            seg = lum[y, int(x1) - r_max - 20:int(x1) + 1] > thr
            idx = np.where(seg)[0]
            if len(idx):
                pts.append((d, (r_max + 20) - idx[-1] - (x1 - int(x1))))
    return pts


def fit(pts):
    best, best_e = None, 1e18
    for r in np.arange(8, 75, 0.5):
        e, n = 0.0, 0
        for d, o in pts:
            if d > r:
                continue
            model = r - np.sqrt(max(r * r - (r - d) ** 2, 0.0))
            e += (model - o) ** 2
            n += 1
        if n >= 5 and e / n < best_e:
            best, best_e = r, e / n
    return best, best_e


def main() -> None:
    path = sys.argv[1] if len(sys.argv) > 1 else MOCK
    lum = np.asarray(Image.open(path).convert('L').crop((0, 0, 1843, 853))).astype(int)
    print(f'# {os.path.basename(path)}   radius: px -> dp   (fit error in px)')
    for name, (x0, y0, x1) in SURFACES.items():
        rs = []
        for left in (True, False):
            r, e = fit(boundary(lum, x0, y0, x1, left=left))
            if r:
                rs.append((r, e))
        if rs:
            r = float(np.mean([v[0] for v in rs]))
            e = float(np.mean([v[1] for v in rs]))
            print(f'  {name:9s} r ~ {r:5.1f}px  ({r / PX_PER_DP:5.1f}dp)   err {e:4.2f}   sides {[round(v[0], 1) for v in rs]}')
        else:
            print(f'  {name:9s} no fit')


if __name__ == '__main__':
    main()
